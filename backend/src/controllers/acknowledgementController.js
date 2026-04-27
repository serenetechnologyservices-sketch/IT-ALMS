const { Ticket, TicketAcknowledgement } = require('../models');

exports.submit = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });
    const { signature_data, feedback_rating, closure_confirmed } = req.body;
    if (feedback_rating != null) {
      const rating = parseInt(feedback_rating, 10);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, error: 'Feedback rating must be an integer between 1 and 5.' });
      }
    }
    // Upsert — one acknowledgement per ticket
    let ack = await TicketAcknowledgement.findOne({ where: { ticket_id: ticket.id } });
    if (ack) {
      await ack.update({ signature_data, feedback_rating, closure_confirmed: !!closure_confirmed });
    } else {
      ack = await TicketAcknowledgement.create({
        ticket_id: ticket.id, signature_data,
        feedback_rating, closure_confirmed: !!closure_confirmed,
      });
    }
    res.status(201).json({ success: true, data: ack });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const ack = await TicketAcknowledgement.findOne({ where: { ticket_id: req.params.id } });
    res.json({ success: true, data: ack || null });
  } catch (err) { next(err); }
};
