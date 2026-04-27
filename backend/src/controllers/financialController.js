const { Asset, AssetCategory } = require('../models');
const sequelize = require('../config/database');

function computeFinancials(asset) {
  const cost = parseFloat(asset.purchase_cost) || 0;
  const salvage = parseFloat(asset.salvage_value) || 0;
  const life = asset.useful_life_years || 5;
  const maint = parseFloat(asset.maintenance_cost) || 0;

  const annualDepreciation = life > 0 ? (cost - salvage) / life : 0;
  const purchaseDate = new Date(asset.purchase_date || new Date());
  const yearsSince = (new Date() - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);
  const currentValue = Math.max(0, cost - (annualDepreciation * yearsSince));

  return {
    purchase_cost: cost,
    salvage_value: salvage,
    useful_life_years: life,
    annual_depreciation: Math.round(annualDepreciation * 100) / 100,
    years_since_purchase: Math.round(yearsSince * 10) / 10,
    current_value: Math.round(currentValue * 100) / 100,
    maintenance_cost: maint,
    total_cost_of_ownership: Math.round((cost + maint) * 100) / 100,
  };
}

exports.assetFinancials = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }],
    });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });
    const financials = computeFinancials(asset);
    res.json({ success: true, data: { asset_id: asset.id, asset_name: asset.name, category: asset.category?.name, ...financials } });
  } catch (err) { next(err); }
};

exports.summary = async (req, res, next) => {
  try {
    const assets = await Asset.findAll({ where: { status: ['available', 'allocated', 'repair'] } });
    let totalPurchase = 0, totalCurrent = 0, totalMaintenance = 0, totalDepreciation = 0;
    assets.forEach(a => {
      const f = computeFinancials(a);
      totalPurchase += f.purchase_cost;
      totalCurrent += f.current_value;
      totalMaintenance += f.maintenance_cost;
      totalDepreciation += f.annual_depreciation * f.years_since_purchase;
    });
    res.json({
      success: true,
      data: {
        total_assets: assets.length,
        total_purchase_cost: Math.round(totalPurchase * 100) / 100,
        total_current_value: Math.round(totalCurrent * 100) / 100,
        total_depreciation: Math.round(totalDepreciation * 100) / 100,
        total_maintenance_cost: Math.round(totalMaintenance * 100) / 100,
      },
    });
  } catch (err) { next(err); }
};
