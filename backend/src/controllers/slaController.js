const { SlaMaster, TicketSlaTracking, Ticket, Asset, AssetCategory, ServicePartner, ServiceEngineer, Notification } = require('../models');
const { Op } = require('sequelize');

// ── SLA MASTER CRUD ──
exports.listSla = async (req, res, next) => {
  try {
    const rows = await SlaMaster.findAll({
      where: { status: 'active' },
      include: [{ model: AssetCategory, as: 'category', attributes: ['id', 'name'] }],
      order: [['sla_level', 'ASC'], ['priority', 'ASC']],
    });
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.createSla = async (req, res, next) => {
  try {
    const b = req.body;
    if (!b.priority || !b.response_time_hours || !b.resolution_time_hours) {
      return res.status(400).json({ success: false, error: 'Priority, response time, and resolution time are required.' });
    }
    const sla = await SlaMaster.create(b);
    res.status(201).json({ success: true, data: sla });
  } catch (err) { next(err); }
};

exports.updateSla = async (req, res, next) => {
  try {
    const sla = await SlaMaster.findByPk(req.params.id);
    if (!sla) return res.status(404).json({ success: false, error: 'SLA rule not found.' });
    await sla.update(req.body);
    res.json({ success: true, data: sla });
  } catch (err) { next(err); }
};

exports.deleteSla = async (req, res, next) => {
  try {
    const sla = await SlaMaster.findByPk(req.params.id);
    if (!sla) return res.status(404).json({ success: false, error: 'SLA rule not found.' });
    await sla.destroy();
    res.json({ success: true, message: 'SLA rule deleted.' });
  } catch (err) { next(err); }
};

// ── FIND MATCHING SLA RULE (multi-level: L4 > L3 > L2 > L1 > generic) ──
async function findSlaRule(ticket) {
  const { priority, asset } = ticket;
  const catId = asset?.category_id || null;
  const subcat = ticket.subcategory || null;
  const vendorId = asset?.vendor_id || null;
  const assetId = asset?.id || null;

  // L4: Asset-specific
  if (assetId) {
    const l4 = await SlaMaster.findOne({ where: { priority, asset_id: assetId, sla_level: 'L4', status: 'active' } });
    if (l4) return l4;
  }
  // L3: Subcategory
  if (subcat) {
    const l3 = await SlaMaster.findOne({ where: { priority, subcategory: subcat, sla_level: 'L3', status: 'active' } });
    if (l3) return l3;
  }
  // L2: Category
  if (catId) {
    const l2 = await SlaMaster.findOne({ where: { priority, asset_category_id: catId, sla_level: 'L2', status: 'active' } });
    if (l2) return l2;
  }
  // L1: Vendor
  if (vendorId) {
    const l1 = await SlaMaster.findOne({ where: { priority, vendor_id: vendorId, sla_level: 'L1', status: 'active' } });
    if (l1) return l1;
  }
  // Fallback: generic (no category/vendor/asset)
  let generic = await SlaMaster.findOne({ where: { priority, asset_category_id: null, vendor_id: null, asset_id: null, subcategory: null, status: 'active' } });
  if (!generic) generic = await SlaMaster.findOne({ where: { priority, status: 'active' } });
  return generic;
}

// ── ATTACH SLA ON TICKET ──
exports.attachSla = async (ticketId, partnerId, engineerId) => {
  try {
    const ticket = await Ticket.findByPk(ticketId, { include: [{ model: Asset, as: 'asset' }] });
    if (!ticket) return null;

    const sla = await findSlaRule(ticket);
    if (!sla) return null;

    const now = new Date();
    const responseHrs = parseFloat(sla.response_time_hours);
    const resolutionHrs = parseFloat(sla.resolution_time_hours);
    const ackHrs = sla.acknowledgement_time_hours ? parseFloat(sla.acknowledgement_time_hours) : null;

    const responseDue = new Date(now.getTime() + responseHrs * 3600000);
    const resolutionDue = new Date(now.getTime() + resolutionHrs * 3600000);
    const ackDue = ackHrs ? new Date(now.getTime() + ackHrs * 3600000) : null;

    await TicketSlaTracking.destroy({ where: { ticket_id: ticketId } });

    const tracking = await TicketSlaTracking.create({
      ticket_id: ticketId, sla_master_id: sla.id, assigned_time: now,
      response_due_time: responseDue, resolution_due_time: resolutionDue,
      response_status: 'pending', resolution_status: 'pending',
      acknowledgement_due_time: ackDue, acknowledgement_status: ackHrs ? 'pending' : 'na',
      assigned_partner_id: partnerId || null, assigned_engineer_id: engineerId || null,
    });
    return tracking;
  } catch (err) { console.error('SLA attach error:', err.message); return null; }
};

// ── AUTO-ATTACH SLA ON CREATION (if start_condition = on_creation) ──
exports.autoAttachOnCreation = async (ticketId) => {
  try {
    const ticket = await Ticket.findByPk(ticketId, { include: [{ model: Asset, as: 'asset' }] });
    if (!ticket) return null;
    const sla = await findSlaRule(ticket);
    if (!sla || sla.start_condition !== 'on_creation') return null;
    return exports.attachSla(ticketId, ticket.assigned_partner_id, ticket.assigned_engineer_id);
  } catch (err) { console.error('SLA auto-attach error:', err.message); return null; }
};

// ── PAUSE / RESUME SLA ──
exports.pauseSla = async (ticketId) => {
  try {
    const tracking = await TicketSlaTracking.findOne({ where: { ticket_id: ticketId } });
    if (!tracking || tracking.is_paused) return;
    await tracking.update({ is_paused: true, paused_at: new Date(), pause_count: (tracking.pause_count || 0) + 1 });
  } catch (err) { console.error('SLA pause error:', err.message); }
};

exports.resumeSla = async (ticketId) => {
  try {
    const tracking = await TicketSlaTracking.findOne({ where: { ticket_id: ticketId } });
    if (!tracking || !tracking.is_paused || !tracking.paused_at) return;

    const pausedMs = Date.now() - new Date(tracking.paused_at).getTime();
    const totalPaused = (parseInt(tracking.total_paused_ms) || 0) + pausedMs;

    // Extend due times by paused duration
    const updates = { is_paused: false, paused_at: null, total_paused_ms: totalPaused };
    if (tracking.response_status === 'pending') {
      updates.response_due_time = new Date(new Date(tracking.response_due_time).getTime() + pausedMs);
    }
    if (tracking.resolution_status === 'pending') {
      updates.resolution_due_time = new Date(new Date(tracking.resolution_due_time).getTime() + pausedMs);
    }
    if (tracking.acknowledgement_status === 'pending' && tracking.acknowledgement_due_time) {
      updates.acknowledgement_due_time = new Date(new Date(tracking.acknowledgement_due_time).getTime() + pausedMs);
    }
    await tracking.update(updates);
  } catch (err) { console.error('SLA resume error:', err.message); }
};

// ── UPDATE SLA ON STATUS CHANGE ──
exports.updateSlaOnStatusChange = async (ticketId, newStatus) => {
  try {
    const tracking = await TicketSlaTracking.findOne({
      where: { ticket_id: ticketId },
      include: [{ model: SlaMaster, as: 'slaMaster' }],
    });
    if (!tracking) return;

    const now = new Date();

    // Check if this status should pause the SLA
    const pauseStatuses = tracking.slaMaster?.pause_on_statuses ? tracking.slaMaster.pause_on_statuses.split(',').map(s => s.trim()) : ['waiting', 'on_hold'];
    if (pauseStatuses.includes(newStatus)) {
      await exports.pauseSla(ticketId);
      return;
    }

    // Resume if was paused and moving to active status
    if (tracking.is_paused) {
      await exports.resumeSla(ticketId);
      // Re-fetch after resume
      await tracking.reload();
    }

    // Acknowledgement SLA: met on first assignment
    if (newStatus === 'assigned' && tracking.acknowledgement_status === 'pending') {
      const met = now <= new Date(tracking.acknowledgement_due_time);
      await tracking.update({ acknowledgement_actual_time: now, acknowledgement_status: met ? 'met' : 'breached' });
    }

    // Response SLA: met when ticket moves to in_progress
    if (newStatus === 'in_progress' && tracking.response_status === 'pending') {
      const met = now <= new Date(tracking.response_due_time);
      await tracking.update({ response_actual_time: now, response_status: met ? 'met' : 'breached' });
      if (!met) {
        await Notification.create({
          user_id: 1, title: 'SLA Response Breached',
          message: `Ticket #${ticketId} response SLA breached`, type: 'ticket',
          reference_type: 'ticket', reference_id: ticketId,
        });
      }
    }

    // Resolution SLA: met when resolved/completed/closed
    if (['resolved', 'completed', 'closed'].includes(newStatus) && tracking.resolution_status === 'pending') {
      const met = now <= new Date(tracking.resolution_due_time);
      await tracking.update({ resolution_actual_time: now, resolution_status: met ? 'met' : 'breached' });
      if (!met) {
        await Notification.create({
          user_id: 1, title: 'SLA Resolution Breached',
          message: `Ticket #${ticketId} resolution SLA breached`, type: 'ticket',
          reference_type: 'ticket', reference_id: ticketId,
        });
      }
    }
  } catch (err) { console.error('SLA update error:', err.message); }
};

// ── GET SLA STATUS FOR A TICKET ──
exports.getTicketSla = async (req, res, next) => {
  try {
    const tracking = await TicketSlaTracking.findOne({
      where: { ticket_id: req.params.ticketId },
      include: [{ model: SlaMaster, as: 'slaMaster', include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }] }],
    });
    if (!tracking) return res.json({ success: true, data: null });

    const now = new Date();
    const calc = (status, due) => {
      if (status !== 'pending') return { remaining: null, indicator: status };
      const rem = Math.max(0, (new Date(due) - now) / 60000);
      let ind = 'on_track';
      if (rem <= 0) ind = 'breached';
      else if (rem <= 30) ind = 'near_breach';
      return { remaining: Math.round(rem), indicator: ind };
    };

    const resp = calc(tracking.response_status, tracking.response_due_time);
    const resol = calc(tracking.resolution_status, tracking.resolution_due_time);
    const ack = tracking.acknowledgement_status !== 'na' ? calc(tracking.acknowledgement_status, tracking.acknowledgement_due_time) : { remaining: null, indicator: 'na' };

    res.json({
      success: true,
      data: {
        ...tracking.toJSON(),
        response_remaining_minutes: resp.remaining,
        resolution_remaining_minutes: resol.remaining,
        acknowledgement_remaining_minutes: ack.remaining,
        response_indicator: resp.indicator,
        resolution_indicator: resol.indicator,
        acknowledgement_indicator: ack.indicator,
      },
    });
  } catch (err) { next(err); }
};

// ── SLA REPORTS ──
exports.slaReports = async (req, res, next) => {
  try {
    const { partner_id, engineer_id } = req.query;
    const where = {};
    if (partner_id) where.assigned_partner_id = partner_id;
    if (engineer_id) where.assigned_engineer_id = engineer_id;

    const trackings = await TicketSlaTracking.findAll({
      where,
      include: [
        { model: Ticket, as: 'ticket', attributes: ['id', 'issue_type', 'priority', 'status'] },
        { model: ServicePartner, as: 'partner', attributes: ['id', 'name'] },
        { model: ServiceEngineer, as: 'engineer', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const total = trackings.length;
    const now = new Date();
    const count = (arr, field, val) => arr.filter(t => t[field] === val).length;
    let liveRespBreach = 0, liveResBreach = 0, nearBreach = 0;
    trackings.forEach(t => {
      if (t.response_status === 'pending' && now > new Date(t.response_due_time)) liveRespBreach++;
      if (t.resolution_status === 'pending' && now > new Date(t.resolution_due_time)) liveResBreach++;
      if (t.resolution_status === 'pending') {
        const rem = (new Date(t.resolution_due_time) - now) / 60000;
        if (rem > 0 && rem <= 30) nearBreach++;
      }
    });

    res.json({
      success: true,
      data: {
        total_tracked: total,
        response: { met: count(trackings, 'response_status', 'met'), breached: count(trackings, 'response_status', 'breached') + liveRespBreach, pending: count(trackings, 'response_status', 'pending') - liveRespBreach },
        resolution: { met: count(trackings, 'resolution_status', 'met'), breached: count(trackings, 'resolution_status', 'breached') + liveResBreach, pending: count(trackings, 'resolution_status', 'pending') - liveResBreach },
        acknowledgement: { met: count(trackings, 'acknowledgement_status', 'met'), breached: count(trackings, 'acknowledgement_status', 'breached'), pending: count(trackings, 'acknowledgement_status', 'pending') },
        compliance_pct: total > 0 ? Math.round(((count(trackings, 'response_status', 'met') + count(trackings, 'resolution_status', 'met')) / (total * 2)) * 100) : 100,
        near_breach_count: nearBreach,
        trackings,
      },
    });
  } catch (err) { next(err); }
};

// ── SLA INSIGHTS ──
exports.slaInsights = async (req, res, next) => {
  try {
    const allTrackings = await TicketSlaTracking.findAll({
      include: [
        { model: Ticket, as: 'ticket', include: [{ model: Asset, as: 'asset', include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }] }] },
        { model: ServicePartner, as: 'partner', attributes: ['id', 'name'] },
        { model: ServiceEngineer, as: 'engineer', attributes: ['id', 'name'] },
      ],
    });

    const partnerStats = {}, engineerStats = {}, categoryBreaches = {};
    const now = new Date();
    const likelyBreach = [];

    allTrackings.forEach(t => {
      const pName = t.partner?.name || 'Unassigned';
      const eName = t.engineer?.name || 'Unassigned';
      const cat = t.ticket?.asset?.category?.name || 'Unknown';

      if (!partnerStats[pName]) partnerStats[pName] = { total: 0, met: 0, breached: 0 };
      partnerStats[pName].total++;
      if (t.resolution_status === 'met') partnerStats[pName].met++;
      if (t.resolution_status === 'breached') partnerStats[pName].breached++;

      if (!engineerStats[eName]) engineerStats[eName] = { total: 0, met: 0, breached: 0 };
      engineerStats[eName].total++;
      if (t.resolution_status === 'met') engineerStats[eName].met++;
      if (t.resolution_status === 'breached') engineerStats[eName].breached++;

      if (t.resolution_status === 'breached' || (t.resolution_status === 'pending' && now > new Date(t.resolution_due_time))) {
        categoryBreaches[cat] = (categoryBreaches[cat] || 0) + 1;
      }
      if (t.resolution_status === 'pending') {
        const rem = (new Date(t.resolution_due_time) - now) / 60000;
        if (rem > 0 && rem <= 60) likelyBreach.push({ ticket_id: t.ticket_id, remaining_minutes: Math.round(rem), priority: t.ticket?.priority });
      }
    });

    res.json({
      success: true,
      data: {
        partner_compliance: Object.entries(partnerStats).map(([name, s]) => ({ name, ...s, compliance_pct: s.total > 0 ? Math.round((s.met / s.total) * 100) : 100 })),
        engineer_compliance: Object.entries(engineerStats).map(([name, s]) => ({ name, ...s, compliance_pct: s.total > 0 ? Math.round((s.met / s.total) * 100) : 100 })),
        breaches_by_category: Object.entries(categoryBreaches).map(([category, count]) => ({ category, count })),
        likely_to_breach: likelyBreach,
      },
    });
  } catch (err) { next(err); }
};
