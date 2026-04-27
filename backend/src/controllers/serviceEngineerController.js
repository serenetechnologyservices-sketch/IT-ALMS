const { ServiceEngineer, ServicePartner } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const rows = await ServiceEngineer.findAll({ order: [['name', 'ASC']], include: [{ model: ServicePartner, as: 'partner', attributes: ['id', 'name'] }] });
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try { const e = await ServiceEngineer.create(req.body); res.status(201).json({ success: true, data: e }); } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const e = await ServiceEngineer.findByPk(req.params.id);
    if (!e) return res.status(404).json({ success: false, error: 'Engineer not found.' });
    await e.update(req.body); res.json({ success: true, data: e });
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    const e = await ServiceEngineer.findByPk(req.params.id);
    if (!e) return res.status(404).json({ success: false, error: 'Engineer not found.' });
    await e.destroy(); res.json({ success: true, message: 'Engineer deleted.' });
  } catch (err) { next(err); }
};
