const { Asset, AssetCategory, Ticket, AssetLog } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

function computeHealthScore(asset, openTicketCount, hasRecentUsage) {
  const now = new Date();
  const purchaseDate = new Date(asset.purchase_date || now);
  const ageYears = (now - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);
  const usefulLife = asset.useful_life_years || 5;
  const purchaseCost = parseFloat(asset.purchase_cost) || 1;
  const maintenanceCost = parseFloat(asset.maintenance_cost) || 0;

  const ageScore = Math.max(0, 100 - (ageYears / usefulLife) * 40);
  const issueScore = Math.max(0, 30 - (openTicketCount * 5));
  const maintScore = Math.max(0, 20 - (maintenanceCost / purchaseCost) * 20);
  const usageScore = hasRecentUsage ? 10 : 5;

  return Math.min(100, Math.max(0, Math.round(ageScore + issueScore + maintScore + usageScore)));
}

exports.healthScore = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.assetId);
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });

    const openTickets = await Ticket.count({ where: { asset_id: asset.id, status: { [Op.notIn]: ['resolved', 'closed'] } } });
    const recentUsage = await AssetLog.count({ where: { asset_id: asset.id, log_type: 'usage', created_at: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } });

    const score = computeHealthScore(asset, openTickets, recentUsage > 0);
    res.json({ success: true, data: { asset_id: asset.id, health_score: score, open_tickets: openTickets, has_recent_usage: recentUsage > 0 } });
  } catch (err) { next(err); }
};

exports.alerts = async (req, res, next) => {
  try {
    const assets = await Asset.findAll({ where: { status: { [Op.ne]: 'scrap' } } });
    const alerts = [];
    for (const asset of assets) {
      const openTickets = await Ticket.count({ where: { asset_id: asset.id, status: { [Op.notIn]: ['resolved', 'closed'] } } });
      const recentUsage = await AssetLog.count({ where: { asset_id: asset.id, log_type: 'usage', created_at: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } });
      const score = computeHealthScore(asset, openTickets, recentUsage > 0);
      if (score < 50) {
        alerts.push({ asset_id: asset.id, asset_name: asset.name, health_score: score, type: 'maintenance_due' });
      }
    }
    res.json({ success: true, data: alerts });
  } catch (err) { next(err); }
};

exports.costInsights = async (req, res, next) => {
  try {
    const assets = await Asset.findAll({
      where: { status: { [Op.ne]: 'scrap' } },
      include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }],
    });
    const highCost = [];
    const underutilized = [];
    const replacements = [];

    for (const asset of assets) {
      const cost = parseFloat(asset.purchase_cost) || 0;
      const maint = parseFloat(asset.maintenance_cost) || 0;
      const ratio = cost > 0 ? maint / cost : 0;

      if (ratio > 0.3) highCost.push({ id: asset.id, name: asset.name, category: asset.category?.name, purchase_cost: cost, maintenance_cost: maint, ratio: Math.round(ratio * 100) });

      const recentUsage = await AssetLog.count({ where: { asset_id: asset.id, log_type: 'usage', created_at: { [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } });
      if (recentUsage === 0 && asset.status === 'available') {
        underutilized.push({ id: asset.id, name: asset.name, category: asset.category?.name, status: asset.status });
      }

      const openTickets = await Ticket.count({ where: { asset_id: asset.id, status: { [Op.notIn]: ['resolved', 'closed'] } } });
      const score = computeHealthScore(asset, openTickets, recentUsage > 0);
      if (score < 30 || ratio > 0.5) {
        replacements.push({ id: asset.id, name: asset.name, health_score: score, cost_ratio: Math.round(ratio * 100) });
      }
    }

    res.json({ success: true, data: { high_maintenance_cost: highCost, underutilized, replacement_suggestions: replacements } });
  } catch (err) { next(err); }
};
