const { AssetRequest, Approval, User, Inventory, Notification } = require('../models');

const VALID_TRANSITIONS = {
  pending_manager: { approved: 'pending_admin', rejected: 'rejected' },
  pending_admin: { approved: 'approved', rejected: 'rejected' },
};

exports.process = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body;
    if (!['approved', 'rejected'].includes(action)) return res.status(400).json({ success: false, error: 'Action must be approved or rejected.' });

    const request = await AssetRequest.findByPk(id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' });

    const transitions = VALID_TRANSITIONS[request.status];
    if (!transitions) return res.status(400).json({ success: false, error: `Cannot process request in ${request.status} status.` });

    const newStatus = transitions[action];
    const level = request.status === 'pending_manager' ? 'manager' : 'admin';

    await Approval.create({ request_id: id, approver_id: req.user.id, level, action, comments });
    await request.update({ status: newStatus });

    // Notify requester
    await Notification.create({
      user_id: request.user_id, title: `Request ${action}`,
      message: `Your ${request.request_type} request has been ${action} by ${req.user.role}`,
      type: 'approval', reference_type: 'request', reference_id: request.id,
    });

    // If approved by admin and it's a new_asset request, reserve inventory
    if (newStatus === 'approved' && request.request_type === 'new_asset' && request.catalog_id) {
      const inv = await Inventory.findOne({ where: { catalog_id: request.catalog_id } });
      if (inv && inv.available > 0) {
        await inv.update({ available: inv.available - 1, reserved: inv.reserved + 1 });
      }
    }

    res.json({ success: true, data: request });
  } catch (err) { next(err); }
};
