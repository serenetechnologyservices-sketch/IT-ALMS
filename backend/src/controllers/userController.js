const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role_id, status } = req.query;
    const where = {};
    if (search) where[Op.or] = [{ full_name: { [Op.like]: `%${search}%` } }, { username: { [Op.like]: `%${search}%` } }];
    if (role_id) where.role_id = role_id;
    if (status) where.status = status;
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where, offset, limit: +limit, order: [['id', 'DESC']],
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name'] },
        { model: User, as: 'manager', attributes: ['id', 'full_name'] },
      ],
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }, { model: User, as: 'manager', attributes: ['id', 'full_name'] }],
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { username, password, full_name, email, role_id, manager_id, department } = req.body;
    if (!username || !password || !full_name || !role_id) {
      return res.status(400).json({ success: false, error: 'Username, password, full name, and role are required.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash, full_name, email, role_id, manager_id, department });
    res.status(201).json({ success: true, data: { id: user.id, username: user.username, full_name: user.full_name, role_id: user.role_id } });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    const { full_name, email, role_id, manager_id, department, status, password } = req.body;
    const updates = { full_name, email, role_id, manager_id, department, status };
    if (password) updates.password = await bcrypt.hash(password, 10);
    await user.update(updates);
    res.json({ success: true, data: { id: user.id, username: user.username, full_name: user.full_name } });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    await user.destroy();
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
};
