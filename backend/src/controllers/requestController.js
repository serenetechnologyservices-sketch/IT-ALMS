const { AssetRequest, Approval, User, Catalog, Asset, Notification } = require('../models');
const { Op } = require('sequelize');

exports.create = async (req, res, next) => {
  try {
    const { catalog_id, asset_id, request_type, justification } = req.body;
    if (!request_type || !justification) return res.status(400).json({ success: false, error: 'Request type and justification are required.' });

    const request = await AssetRequest.create({
      user_id: req.user.id, catalog_id, asset_id, request_type, justification, status: 'pending_manager',
    });

    // Notify manager
    const user = await User.findByPk(req.user.id);
    if (user?.manager_id) {
      await Notification.create({
        user_id: user.manager_id, title: 'New Approval Request',
        message: `${user.full_name} submitted a ${request_type} request`, type: 'approval',
        reference_type: 'request', reference_id: request.id,
      });
    }

    res.status(201).json({ success: true, data: request });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    const role = req.user.role;

    if (role === 'Employee') where.user_id = req.user.id;
    else if (role === 'Reporting Manager') where.status = status || 'pending_manager';
    else if (role === 'Admin' && !status) where.status = { [Op.in]: ['pending_admin', 'pending_manager', 'approved', 'rejected'] };
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows } = await AssetRequest.findAndCountAll({
      where, offset, limit: +limit, order: [['id', 'DESC']],
      include: [
        { model: User, as: 'requester', attributes: ['id', 'full_name', 'department'] },
        { model: Catalog, as: 'catalogItem', attributes: ['id', 'name'] },
        { model: Asset, as: 'asset', attributes: ['id', 'name'] },
        { model: Approval, as: 'approvals', include: [{ model: User, as: 'approver', attributes: ['id', 'full_name'] }] },
      ],
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};
