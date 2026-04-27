const { Contract, Vendor, Asset, Notification } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, vendor_id, status } = req.query;
    const where = {};
    if (vendor_id) where.vendor_id = vendor_id;
    if (status) where.status = status;
    const offset = (page - 1) * limit;
    const { count, rows } = await Contract.findAndCountAll({
      where, offset, limit: +limit, order: [['end_date', 'ASC']],
      include: [
        { model: Vendor, as: 'vendor', attributes: ['id', 'name'] },
        { model: Asset, as: 'asset', attributes: ['id', 'name'] },
      ],
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const contract = await Contract.create(req.body);
    res.status(201).json({ success: true, data: contract });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const contract = await Contract.findByPk(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found.' });
    await contract.update(req.body);
    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const contract = await Contract.findByPk(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found.' });
    await contract.destroy();
    res.json({ success: true, message: 'Contract deleted.' });
  } catch (err) { next(err); }
};

exports.expiringAlerts = async (req, res, next) => {
  try {
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const contracts = await Contract.findAll({
      where: { status: 'active', end_date: { [Op.lte]: thirtyDays } },
      include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'name'] }, { model: Asset, as: 'asset', attributes: ['id', 'name'] }],
    });
    res.json({ success: true, data: contracts });
  } catch (err) { next(err); }
};
