const { Vendor } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where.name = { [Op.like]: `%${search}%` };
    const offset = (page - 1) * limit;
    const { count, rows } = await Vendor.findAndCountAll({ where, offset, limit: +limit, order: [['id', 'DESC']] });
    res.json({ success: true, data: rows, pagination: { total: count, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found.' });
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found.' });
    await vendor.update(req.body);
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found.' });
    await vendor.destroy();
    res.json({ success: true, message: 'Vendor deleted.' });
  } catch (err) { next(err); }
};
