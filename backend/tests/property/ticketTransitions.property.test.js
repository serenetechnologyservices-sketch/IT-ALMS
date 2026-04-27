// Feature: ticket-management, Property 4: Status transition correctness
// Validates: Requirements 4.2, 4.3, 4.4
const fc = require('fast-check');
const { isValidTicketTransition, VALID_TICKET_STATUSES, TICKET_TRANSITIONS } = require('../../src/utils/stateMachine');

describe('Property 4: Status transition correctness', () => {
  test('For any (current, target) pair, transition accepted iff target is in allowed list', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_TICKET_STATUSES),
        fc.constantFrom(...VALID_TICKET_STATUSES),
        (current, target) => {
          const result = isValidTicketTransition(current, target);
          const allowed = TICKET_TRANSITIONS[current] || [];
          expect(result).toBe(allowed.includes(target));
        }
      ),
      { numRuns: 200 }
    );
  });

  test('New statuses on_hold, awaiting_parts, completed are in VALID_TICKET_STATUSES', () => {
    expect(VALID_TICKET_STATUSES).toContain('on_hold');
    expect(VALID_TICKET_STATUSES).toContain('awaiting_parts');
    expect(VALID_TICKET_STATUSES).toContain('completed');
  });

  test('Existing transitions preserved: open→assigned, assigned→in_progress, in_progress→waiting, waiting→in_progress, resolved→closed', () => {
    expect(isValidTicketTransition('open', 'assigned')).toBe(true);
    expect(isValidTicketTransition('assigned', 'in_progress')).toBe(true);
    expect(isValidTicketTransition('in_progress', 'waiting')).toBe(true);
    expect(isValidTicketTransition('waiting', 'in_progress')).toBe(true);
    expect(isValidTicketTransition('resolved', 'closed')).toBe(true);
  });

  test('New transitions: in_progress→on_hold, on_hold→in_progress, closed→open', () => {
    expect(isValidTicketTransition('in_progress', 'on_hold')).toBe(true);
    expect(isValidTicketTransition('in_progress', 'awaiting_parts')).toBe(true);
    expect(isValidTicketTransition('in_progress', 'completed')).toBe(true);
    expect(isValidTicketTransition('on_hold', 'in_progress')).toBe(true);
    expect(isValidTicketTransition('awaiting_parts', 'in_progress')).toBe(true);
    expect(isValidTicketTransition('completed', 'closed')).toBe(true);
    expect(isValidTicketTransition('closed', 'open')).toBe(true);
  });
});
