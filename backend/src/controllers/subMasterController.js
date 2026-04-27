const { SubMaster } = require('../models');
const { Op } = require('sequelize');

exports.listByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const rows = await SubMaster.findAll({
      where: { type, status: 'active' },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    });
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.listTypes = async (req, res, next) => {
  try {
    const types = await SubMaster.findAll({
      attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('type')), 'type']],
      raw: true,
    });
    res.json({ success: true, data: types.map(t => t.type) });
  } catch (err) { next(err); }
};

exports.listAll = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    const rows = await SubMaster.findAll({ where, order: [['type', 'ASC'], ['sort_order', 'ASC']] });
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { type, name, description, sort_order } = req.body;
    if (!type || !name) return res.status(400).json({ success: false, error: 'Type and name are required.' });
    const item = await SubMaster.create({ type, name, description, sort_order: sort_order || 0 });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await SubMaster.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found.' });
    await item.update(req.body);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await SubMaster.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found.' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) { next(err); }
};
