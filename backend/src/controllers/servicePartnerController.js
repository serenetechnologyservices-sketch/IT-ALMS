const { ServicePartner, ServiceEngineer } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const rows = await ServicePartner.findAll({ order: [['name', 'ASC']], include: [{ model: ServiceEngineer, as: 'engineers', attributes: ['id', 'name'] }] });
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try { const p = await ServicePartner.create(req.body); res.status(201).json({ success: true, data: p }); } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const p = await ServicePartner.findByPk(req.params.id);
    if (!p) return res.status(404).json({ success: false, error: 'Partner not found.' });
    await p.update(req.body); res.json({ success: true, data: p });
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    const p = await ServicePartner.findByPk(req.params.id);
    if (!p) return res.status(404).json({ success: false, error: 'Partner not found.' });
    await p.destroy(); res.json({ success: true, message: 'Partner deleted.' });
  } catch (err) { next(err); }
};
