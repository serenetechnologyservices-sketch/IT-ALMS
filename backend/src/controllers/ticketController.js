const { Ticket, TicketUpdate, Asset, User, ServicePartner, ServiceEngineer, Notification,
  TicketAttachment, TicketWorkProgress, TicketPart, TicketAcknowledgement, TicketEscalation } = require('../models');
const { Op } = require('sequelize');
const slaController = require('./slaController');

const { TICKET_TRANSITIONS } = require('../utils/stateMachine');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, asset_id, ticket_type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (asset_id) where.asset_id = asset_id;
    if (ticket_type) where.ticket_type = ticket_type;

    const role = req.user.role;
    if (role === 'Employee') where.created_by = req.user.id;
    if (role === 'Service Partner') {
      const partner = await ServicePartner.findOne({ where: { user_id: req.user.id } });
      if (partner) where.assigned_partner_id = partner.id;
      else where.id = 0;
    }
    if (role === 'Service Engineer') {
      const eng = await ServiceEngineer.findOne({ where: { user_id: req.user.id } });
      if (eng) where.assigned_engineer_id = eng.id;
      else where.id = 0;
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Ticket.findAndCountAll({
      where, offset, limit: +limit, order: [['id', 'DESC']],
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'name', 'serial_number'] },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] },
        { model: ServicePartner, as: 'partner', attributes: ['id', 'name'] },
        { model: ServiceEngineer, as: 'engineer', attributes: ['id', 'name'] },
      ],
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: Asset, as: 'asset' },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] },
        { model: ServicePartner, as: 'partner' },
        { model: ServiceEngineer, as: 'engineer' },
        { model: TicketUpdate, as: 'updates', include: [{ model: User, as: 'updater', attributes: ['id', 'full_name'] }], order: [['created_at', 'DESC']] },
        { model: TicketAttachment, as: 'attachments', order: [['created_at', 'DESC']] },
        { model: TicketWorkProgress, as: 'workProgress', order: [['created_at', 'DESC']] },
        { model: TicketPart, as: 'parts' },
        { model: TicketAcknowledgement, as: 'acknowledgement' },
        { model: TicketEscalation, as: 'escalations', order: [['created_at', 'ASC']] },
      ],
    });
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const b = req.body;
    const ticket_type = b.ticket_type || 'incident';

    // Validate based on type
    if (ticket_type === 'incident') {
      if (!b.description) return res.status(400).json({ success: false, error: 'Description is required.' });
    } else if (ticket_type === 'service_request') {
      if (!b.description || !b.request_type) return res.status(400).json({ success: false, error: 'Description and request type are required.' });
    } else if (ticket_type === 'change_request') {
      if (!b.title || !b.description) return res.status(400).json({ success: false, error: 'Title and description are required.' });
    }

    // Validate asset if provided
    if (b.asset_id) {
      const asset = await Asset.findByPk(b.asset_id);
      if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });
    }

    const ticket = await Ticket.create({
      ticket_type,
      asset_id: b.asset_id || null,
      created_by: req.user.id,
      title: b.title,
      issue_type: b.issue_type,
      description: b.description,
      priority: b.priority || 'medium',
      category: b.category,
      subcategory: b.subcategory,
      problem_type: b.problem_type,
      urgency: b.urgency,
      impact: b.impact,
      assigned_group: b.assigned_group,
      assigned_partner_id: b.assigned_partner_id,
      assigned_engineer_id: b.assigned_engineer_id,
      region: b.region,
      zone: b.zone,
      order_number: b.order_number,
      invoice_number: b.invoice_number,
      complaint_reference: b.complaint_reference,
      contract_id: b.contract_id,
      visit_required: b.visit_required || false,
      // Service Request fields
      request_type: b.request_type,
      requester_id: b.requester_id || req.user.id,
      requested_for: b.requested_for,
      catalog_item_id: b.catalog_item_id,
      quantity: b.quantity,
      configuration_details: b.configuration_details,
      justification: b.justification,
      approval_required: b.approval_required || false,
      new_asset_flag: b.new_asset_flag || false,
      // Change Request fields
      change_type: b.change_type,
      planned_start_date: b.planned_start_date,
      planned_end_date: b.planned_end_date,
      risk_level: b.risk_level,
      impact_analysis: b.impact_analysis,
      rollback_plan: b.rollback_plan,
      implementation_plan: b.implementation_plan,
      affected_assets: b.affected_assets,
      affected_services: b.affected_services,
      last_updated_by: req.user.id,
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });

    const { status, comments } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Status is required.' });

    const allowed = TICKET_TRANSITIONS[ticket.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({ success: false, error: `Cannot transition from ${ticket.status} to ${status}.` });
    }

    const oldStatus = ticket.status;
    const updateFields = { status, last_updated_by: req.user.id };
    // Increment reopen_count on closed → open
    if (oldStatus === 'closed' && status === 'open') {
      updateFields.reopen_count = (ticket.reopen_count || 0) + 1;
    }
    await ticket.update(updateFields);
    await TicketUpdate.create({ ticket_id: ticket.id, updated_by: req.user.id, old_status: oldStatus, new_status: status, comments });

    // Update SLA tracking
    await slaController.updateSlaOnStatusChange(ticket.id, status);

    // Notify creator
    await Notification.create({
      user_id: ticket.created_by, title: 'Ticket Updated',
      message: `Ticket #${ticket.id} status changed to ${status}`, type: 'ticket',
      reference_type: 'ticket', reference_id: ticket.id,
    });

    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

exports.assign = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });
    if (ticket.status === 'closed') return res.status(400).json({ success: false, error: 'Cannot reassign a closed ticket.' });

    const { partner_id, engineer_id } = req.body;
    const updates = { last_updated_by: req.user.id };
    if (partner_id) updates.assigned_partner_id = partner_id;
    if (engineer_id) updates.assigned_engineer_id = engineer_id;
    // Only change status to assigned if currently open
    if (ticket.status === 'open') updates.status = 'assigned';

    const oldStatus = ticket.status;
    await ticket.update(updates);

    const parts = [];
    if (partner_id) parts.push(`partner #${partner_id}`);
    if (engineer_id) parts.push(`engineer #${engineer_id}`);
    const comment = ticket.status === 'open' ? `Assigned to ${parts.join(', ')}` : `Reassigned to ${parts.join(', ')}`;

    await TicketUpdate.create({ ticket_id: ticket.id, updated_by: req.user.id, old_status: oldStatus, new_status: ticket.status, comments: comment });

    // Attach/refresh SLA tracking only on first assignment
    if (oldStatus === 'open') {
      await slaController.attachSla(ticket.id, partner_id, engineer_id);
    }

    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

exports.updateRca = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });
    const { root_cause } = req.body;
    await ticket.update({ root_cause, last_updated_by: req.user.id });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};
