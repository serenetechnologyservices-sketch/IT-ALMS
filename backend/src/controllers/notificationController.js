const { Notification } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: req.user.id }, offset, limit: +limit, order: [['created_at', 'DESC']],
    });
    const unread = await Notification.count({ where: { user_id: req.user.id, is_read: false } });
    res.json({ success: true, data: rows, unread_count: unread, pagination: { total: count, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notif) return res.status(404).json({ success: false, error: 'Notification not found.' });
    await notif.update({ is_read: true });
    res.json({ success: true, data: notif });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
};
