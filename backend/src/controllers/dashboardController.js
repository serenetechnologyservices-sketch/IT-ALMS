const { Asset, AssetAllocation, AssetCategory, AssetRequest, Approval, Ticket, TicketUpdate,
  Inventory, Catalog, User, Role, Vendor, ServicePartner, ServiceEngineer, Contract, Notification } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');

exports.get = async (req, res, next) => {
  try {
    const role = req.user.role;
    let data = {};

    if (role === 'Employee') {
      // My allocated assets with details
      const myAllocations = await AssetAllocation.findAll({
        where: { user_id: req.user.id, status: 'active' },
        include: [{ model: Asset, as: 'asset', include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }] }],
      });

      // My requests with status breakdown
      const allRequests = await AssetRequest.findAll({ where: { user_id: req.user.id }, order: [['id', 'DESC']] });
      const requestsByStatus = {};
      allRequests.forEach(r => { requestsByStatus[r.status] = (requestsByStatus[r.status] || 0) + 1; });

      // My open tickets
      const myTickets = await Ticket.findAll({
        where: { created_by: req.user.id, status: { [Op.notIn]: ['closed'] } },
        include: [{ model: Asset, as: 'asset', attributes: ['id', 'name'] }],
        order: [['id', 'DESC']],
      });
      const ticketsByStatus = {};
      myTickets.forEach(t => { ticketsByStatus[t.status] = (ticketsByStatus[t.status] || 0) + 1; });

      // Unread notifications
      const unreadNotifs = await Notification.count({ where: { user_id: req.user.id, is_read: false } });

      data = {
        my_assets: myAllocations,
        my_asset_count: myAllocations.length,
        requests: { total: allRequests.length, by_status: requestsByStatus, recent: allRequests.slice(0, 5) },
        tickets: { total: myTickets.length, by_status: ticketsByStatus, recent: myTickets.slice(0, 5) },
        unread_notifications: unreadNotifs,
      };
    }

    else if (role === 'Reporting Manager') {
      // Team members
      const teamUsers = await User.findAll({
        where: { manager_id: req.user.id },
        attributes: ['id', 'full_name', 'department', 'status'],
        include: [{ model: Role, as: 'role', attributes: ['name'] }],
      });
      const teamIds = teamUsers.map(u => u.id);

      // Team asset count
      const teamAllocations = await AssetAllocation.findAll({
        where: { user_id: { [Op.in]: teamIds }, status: 'active' },
        include: [
          { model: Asset, as: 'asset', include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }] },
          { model: User, as: 'user', attributes: ['id', 'full_name'] },
        ],
      });

      // Assets per team member for chart
      const assetsPerMember = {};
      teamAllocations.forEach(a => {
        const name = a.user?.full_name || 'Unknown';
        assetsPerMember[name] = (assetsPerMember[name] || 0) + 1;
      });

      // Pending approvals (manager level)
      const pendingApprovals = await AssetRequest.findAll({
        where: { status: 'pending_manager', user_id: { [Op.in]: teamIds } },
        include: [
          { model: User, as: 'requester', attributes: ['id', 'full_name'] },
          { model: Catalog, as: 'catalogItem', attributes: ['id', 'name'] },
        ],
        order: [['id', 'DESC']],
      });

      // Team tickets
      const teamTickets = await Ticket.findAll({
        where: { created_by: { [Op.in]: teamIds }, status: { [Op.notIn]: ['closed'] } },
      });
      const ticketsByPriority = {};
      teamTickets.forEach(t => { ticketsByPriority[t.priority] = (ticketsByPriority[t.priority] || 0) + 1; });

      data = {
        team_size: teamUsers.length,
        team_members: teamUsers,
        team_asset_count: teamAllocations.length,
        assets_per_member: Object.entries(assetsPerMember).map(([name, count]) => ({ name, count })),
        pending_approvals: { total: pendingApprovals.length, items: pendingApprovals },
        team_tickets: { total: teamTickets.length, by_priority: ticketsByPriority },
      };
    }

    else if (role === 'Admin') {
      // Inventory summary
      const [totalAssets, available, allocated, repair, scrap] = await Promise.all([
        Asset.count(), Asset.count({ where: { status: 'available' } }),
        Asset.count({ where: { status: 'allocated' } }),
        Asset.count({ where: { status: 'repair' } }),
        Asset.count({ where: { status: 'scrap' } }),
      ]);

      // Assets by category
      const assetsByCategory = await Asset.findAll({
        attributes: ['category_id', [fn('COUNT', col('Asset.id')), 'count']],
        include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }],
        group: ['category_id', 'category.id', 'category.name'],
        raw: true, nest: true,
      });

      // Ticket stats
      const allTickets = await Ticket.findAll();
      const ticketsByStatus = {};
      const ticketsByPriority = {};
      allTickets.forEach(t => {
        ticketsByStatus[t.status] = (ticketsByStatus[t.status] || 0) + 1;
        ticketsByPriority[t.priority] = (ticketsByPriority[t.priority] || 0) + 1;
      });

      // Pending approvals
      const pendingManager = await AssetRequest.count({ where: { status: 'pending_manager' } });
      const pendingAdmin = await AssetRequest.count({ where: { status: 'pending_admin' } });
      const approvedRequests = await AssetRequest.count({ where: { status: 'approved' } });
      const rejectedRequests = await AssetRequest.count({ where: { status: 'rejected' } });

      // Expiring contracts (within 30 days)
      const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const expiringContracts = await Contract.findAll({
        where: { status: 'active', end_date: { [Op.lte]: thirtyDays, [Op.gte]: new Date() } },
        include: [{ model: Vendor, as: 'vendor', attributes: ['name'] }],
      });

      // Recent tickets
      const recentTickets = await Ticket.findAll({
        order: [['id', 'DESC']], limit: 5,
        include: [
          { model: Asset, as: 'asset', attributes: ['name'] },
          { model: User, as: 'creator', attributes: ['full_name'] },
        ],
      });

      // Total users
      const totalUsers = await User.count({ where: { status: 'active' } });

      data = {
        inventory: { total: totalAssets, available, allocated, repair, scrap },
        assets_by_category: assetsByCategory.map(a => ({ category: a.category?.name || 'Unknown', count: parseInt(a.count) })),
        tickets: {
          total: allTickets.length,
          by_status: Object.entries(ticketsByStatus).map(([status, count]) => ({ status, count })),
          by_priority: Object.entries(ticketsByPriority).map(([priority, count]) => ({ priority, count })),
          recent: recentTickets,
        },
        approvals: {
          pending_manager: pendingManager, pending_admin: pendingAdmin,
          approved: approvedRequests, rejected: rejectedRequests,
        },
        expiring_contracts: expiringContracts,
        total_users: totalUsers,
      };
    }

    else if (role === 'CIO') {
      const assets = await Asset.findAll({
        where: { status: { [Op.ne]: 'scrap' } },
        include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }],
      });

      let totalPurchase = 0, totalCurrent = 0, totalMaint = 0;
      const healthDist = { good: 0, fair: 0, poor: 0 };
      const costByCategory = {};
      const valueByCategory = {};

      assets.forEach(a => {
        const cost = parseFloat(a.purchase_cost) || 0;
        const salvage = parseFloat(a.salvage_value) || 0;
        const life = a.useful_life_years || 5;
        const years = (new Date() - new Date(a.purchase_date || new Date())) / (365.25 * 24 * 60 * 60 * 1000);
        const dep = life > 0 ? (cost - salvage) / life : 0;
        const cv = Math.max(0, cost - dep * years);
        const maint = parseFloat(a.maintenance_cost) || 0;

        totalPurchase += cost;
        totalCurrent += cv;
        totalMaint += maint;

        const cat = a.category?.name || 'Other';
        costByCategory[cat] = (costByCategory[cat] || 0) + cost;
        valueByCategory[cat] = (valueByCategory[cat] || 0) + cv;

        // Simplified health score
        const ageScore = Math.max(0, 100 - (years / life) * 40);
        const score = Math.min(100, Math.max(0, Math.round(ageScore + 30 + 20 + 5)));
        if (score >= 70) healthDist.good++;
        else if (score >= 40) healthDist.fair++;
        else healthDist.poor++;
      });

      // Asset status distribution
      const [avail, alloc, rep, scr] = await Promise.all([
        Asset.count({ where: { status: 'available' } }),
        Asset.count({ where: { status: 'allocated' } }),
        Asset.count({ where: { status: 'repair' } }),
        Asset.count({ where: { status: 'scrap' } }),
      ]);

      // Monthly depreciation trend (last 12 months)
      const depTrend = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        const monthAssets = assets.filter(a => new Date(a.purchase_date) <= d);
        let monthValue = 0;
        monthAssets.forEach(a => {
          const cost = parseFloat(a.purchase_cost) || 0;
          const salvage = parseFloat(a.salvage_value) || 0;
          const life = a.useful_life_years || 5;
          const years = (d - new Date(a.purchase_date)) / (365.25 * 24 * 60 * 60 * 1000);
          const dep = life > 0 ? (cost - salvage) / life : 0;
          monthValue += Math.max(0, cost - dep * years);
        });
        depTrend.push({ month: monthLabel, value: Math.round(monthValue) });
      }

      data = {
        total_assets: assets.length,
        total_purchase_cost: Math.round(totalPurchase),
        total_current_value: Math.round(totalCurrent),
        total_maintenance_cost: Math.round(totalMaint),
        total_depreciation: Math.round(totalPurchase - totalCurrent),
        health_distribution: [
          { name: 'Good (70+)', value: healthDist.good },
          { name: 'Fair (40-69)', value: healthDist.fair },
          { name: 'Poor (<40)', value: healthDist.poor },
        ],
        status_distribution: [
          { name: 'Available', value: avail },
          { name: 'Allocated', value: alloc },
          { name: 'Repair', value: rep },
          { name: 'Scrap', value: scr },
        ],
        cost_by_category: Object.entries(costByCategory).map(([cat, cost]) => ({ category: cat, purchase: Math.round(cost), current: Math.round(valueByCategory[cat] || 0) })),
        depreciation_trend: depTrend,
      };
    }

    else if (role === 'Service Partner') {
      const partner = await ServicePartner.findOne({ where: { user_id: req.user.id } });
      const where = partner ? { assigned_partner_id: partner.id } : { id: 0 };
      const tickets = await Ticket.findAll({
        where: { ...where, status: { [Op.notIn]: ['closed'] } },
        include: [
          { model: Asset, as: 'asset', attributes: ['id', 'name', 'serial_number'] },
          { model: User, as: 'creator', attributes: ['full_name'] },
        ],
        order: [['id', 'DESC']],
      });
      const byStatus = {};
      const byPriority = {};
      tickets.forEach(t => {
        byStatus[t.status] = (byStatus[t.status] || 0) + 1;
        byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      });
      data = {
        assigned_tickets: tickets,
        total_active: tickets.length,
        by_status: Object.entries(byStatus).map(([s, c]) => ({ status: s, count: c })),
        by_priority: Object.entries(byPriority).map(([p, c]) => ({ priority: p, count: c })),
      };
    }

    else if (role === 'Service Engineer') {
      const eng = await ServiceEngineer.findOne({ where: { user_id: req.user.id } });
      const where = eng ? { assigned_engineer_id: eng.id } : { id: 0 };
      const tickets = await Ticket.findAll({
        where: { ...where, status: { [Op.notIn]: ['closed'] } },
        include: [
          { model: Asset, as: 'asset', attributes: ['id', 'name', 'serial_number'] },
          { model: User, as: 'creator', attributes: ['full_name'] },
        ],
        order: [['id', 'DESC']],
      });
      const byStatus = {};
      const byPriority = {};
      tickets.forEach(t => {
        byStatus[t.status] = (byStatus[t.status] || 0) + 1;
        byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      });
      data = {
        assigned_tickets: tickets,
        total_active: tickets.length,
        by_status: Object.entries(byStatus).map(([s, c]) => ({ status: s, count: c })),
        by_priority: Object.entries(byPriority).map(([p, c]) => ({ priority: p, count: c })),
      };
    }

    res.json({ success: true, data });
  } catch (err) { next(err); }
};
