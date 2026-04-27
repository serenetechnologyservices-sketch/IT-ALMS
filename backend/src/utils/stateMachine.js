/**
 * Approval workflow valid transitions.
 */
const APPROVAL_TRANSITIONS = {
  pending_manager: { approved: 'pending_admin', rejected: 'rejected' },
  pending_admin: { approved: 'approved', rejected: 'rejected' },
};

/**
 * Ticket status valid transitions.
 */
const TICKET_TRANSITIONS = {
  open: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['waiting', 'on_hold', 'awaiting_parts', 'resolved', 'completed'],
  waiting: ['in_progress'],
  on_hold: ['in_progress'],
  awaiting_parts: ['in_progress'],
  resolved: ['closed'],
  completed: ['closed'],
  closed: ['open'],
};

const VALID_ASSET_STATUSES = ['available', 'allocated', 'repair', 'scrap'];

const VALID_TICKET_STATUSES = ['open', 'assigned', 'in_progress', 'waiting', 'on_hold', 'awaiting_parts', 'completed', 'resolved', 'closed'];

function isValidApprovalTransition(currentStatus, action) {
  const transitions = APPROVAL_TRANSITIONS[currentStatus];
  if (!transitions) return false;
  return action in transitions;
}

function getApprovalNextStatus(currentStatus, action) {
  const transitions = APPROVAL_TRANSITIONS[currentStatus];
  if (!transitions || !(action in transitions)) return null;
  return transitions[action];
}

function isValidTicketTransition(currentStatus, newStatus) {
  const allowed = TICKET_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

module.exports = {
  APPROVAL_TRANSITIONS, TICKET_TRANSITIONS, VALID_ASSET_STATUSES, VALID_TICKET_STATUSES,
  isValidApprovalTransition, getApprovalNextStatus, isValidTicketTransition,
};
