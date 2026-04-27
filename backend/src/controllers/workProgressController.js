const { Ticket, TicketWorkProgress } = require('../models');
const { calculateEffortHours } = require('../utils/effortCalculation');

exports.addWorkProgress = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });

    const { work_notes, customer_comments, technician_name, technician_id,
      visit_date, check_in_time, check_out_time,
      root_cause, resolution_summary, action_taken,
      work_start_time, work_end_time } = req.body;

    const total_effort_hours = calculateEffortHours(work_start_time, work_end_time);

    const entry = await TicketWorkProgress.create({
      ticket_id: ticket.id, work_notes, customer_comments,
      technician_name, technician_id, visit_date, check_in_time, check_out_time,
      root_cause, resolution_summary, action_taken,
      work_start_time, work_end_time, total_effort_hours,
      updated_by: req.user.id,
    });
    await ticket.update({ last_updated_by: req.user.id });
    res.status(201).json({ success: true, data: entry });
  } catch (err) { next(err); }
};

exports.listWorkProgress = async (req, res, next) => {
  try {
    const entries = await TicketWorkProgress.findAll({
      where: { ticket_id: req.params.id },
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: entries });
  } catch (err) { next(err); }
};
