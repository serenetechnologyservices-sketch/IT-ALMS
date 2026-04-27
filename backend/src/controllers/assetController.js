const { v4: uuidv4 } = require('uuid');
const { Asset, AssetCategory, Vendor, AssetHistory, AssetAllocation, User } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category_id, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category_id) where.category_id = category_id;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const offset = (page - 1) * limit;
    const { count, rows } = await Asset.findAndCountAll({
      where, offset, limit: +limit, order: [['id', 'DESC']],
      include: [
        { model: AssetCategory, as: 'category', attributes: ['id', 'name'] },
        { model: Vendor, as: 'vendor', attributes: ['id', 'name'] },
      ],
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Vendor, as: 'vendor' },
        { model: AssetAllocation, as: 'allocations', include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }] },
      ],
    });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });
    res.json({ success: true, data: asset });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, category_id, serial_number, configuration, purchase_date, purchase_cost, salvage_value, useful_life_years, vendor_id } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Asset name is required.' });

    const qr_code = uuidv4();
    const agent_id = 'AGT-' + uuidv4().split('-')[0].toUpperCase();
    const asset = await Asset.create({
      name, category_id, serial_number, configuration, purchase_date, purchase_cost,
      salvage_value: salvage_value || 0, useful_life_years: useful_life_years || 5,
      vendor_id, status: 'available', qr_code, agent_id,
    });

    await AssetHistory.create({
      asset_id: asset.id, event_type: 'created', description: `Asset "${name}" created`, performed_by: req.user.id,
    });

    res.status(201).json({ success: true, data: asset });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });

    const { name, category_id, serial_number, configuration, purchase_date, purchase_cost, salvage_value, useful_life_years, vendor_id, status } = req.body;
    await asset.update({ name, category_id, serial_number, configuration, purchase_date, purchase_cost, salvage_value, useful_life_years, vendor_id, status });
    res.json({ success: true, data: asset });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });
    await asset.destroy();
    res.json({ success: true, message: 'Asset deleted.' });
  } catch (err) { next(err); }
};

exports.timeline = async (req, res, next) => {
  try {
    const history = await AssetHistory.findAll({
      where: { asset_id: req.params.id },
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'performer', attributes: ['id', 'full_name'] }],
    });
    res.json({ success: true, data: history });
  } catch (err) { next(err); }
};

exports.categories = async (req, res, next) => {
  try {
    const cats = await AssetCategory.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
};
