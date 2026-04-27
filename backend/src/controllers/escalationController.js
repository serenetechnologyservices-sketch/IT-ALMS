const { Ticket, TicketEscalation, Notification } = require('../models');

exports.escalate = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });
    const { escalation_level, escalation_reason, escalated_to } = req.body;
    if (![1, 2, 3].includes(escalation_level)) {
      return res.status(400).json({ success: false, error: 'Escalation level must be 1, 2, or 3.' });
    }
    if (!escalated_to) return res.status(400).json({ success: false, error: 'Escalated-to user is required.' });
    const esc = await TicketEscalation.create({
      ticket_id: ticket.id, escalation_level, escalation_reason,
      escalated_to, escalated_by: req.user.id,
    });
    // Notify target
    await Notification.create({
      user_id: escalated_to, title: 'Ticket Escalated',
      message: `Ticket #${ticket.id} escalated to level ${escalation_level}`,
      type: 'ticket', reference_type: 'ticket', reference_id: ticket.id,
    });
    await ticket.update({ last_updated_by: req.user.id });
    res.status(201).json({ success: true, data: esc });
  } catch (err) { next(err); }
};

exports.listEscalations = async (req, res, next) => {
  try {
    const escalations = await TicketEscalation.findAll({
      where: { ticket_id: req.params.id },
      order: [['created_at', 'ASC']],
    });
    res.json({ success: true, data: escalations });
  } catch (err) { next(err); }
};
