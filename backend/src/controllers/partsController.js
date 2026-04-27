const { Ticket, TicketPart } = require('../models');

exports.addPart = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });
    const { part_name, quantity, cost, status } = req.body;
    if (!part_name) return res.status(400).json({ success: false, error: 'Part name is required.' });
    const part = await TicketPart.create({
      ticket_id: ticket.id, part_name, quantity: quantity || 1,
      cost: cost || 0, status: status || 'pending', updated_by: req.user.id,
    });
    res.status(201).json({ success: true, data: part });
  } catch (err) { next(err); }
};

exports.listParts = async (req, res, next) => {
  try {
    const parts = await TicketPart.findAll({ where: { ticket_id: req.params.id }, order: [['created_at', 'DESC']] });
    res.json({ success: true, data: parts });
  } catch (err) { next(err); }
};

exports.updatePartStatus = async (req, res, next) => {
  try {
    const part = await TicketPart.findOne({ where: { id: req.params.pid, ticket_id: req.params.id } });
    if (!part) return res.status(404).json({ success: false, error: 'Part not found.' });
    const { status } = req.body;
    if (!['used', 'pending', 'returned'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid part status.' });
    }
    await part.update({ status, updated_by: req.user.id });
    res.json({ success: true, data: part });
  } catch (err) { next(err); }
};
