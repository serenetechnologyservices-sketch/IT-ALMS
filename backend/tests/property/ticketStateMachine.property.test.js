// Feature: asset-intelligence-platform, Property 13: Ticket status state machine
// Validates: Requirements 10.2, 10.3, 10.4
const fc = require('fast-check');
const { isValidTicketTransition, VALID_TICKET_STATUSES, TICKET_TRANSITIONS } = require('../../src/utils/stateMachine');

describe('Property 13: Ticket status state machine', () => {
  test('For any current and target status, transition succeeds only if allowed by state machine', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_TICKET_STATUSES),
        fc.constantFrom(...VALID_TICKET_STATUSES),
        (current, target) => {
          const valid = isValidTicketTransition(current, target);
          const allowed = TICKET_TRANSITIONS[current] || [];
          expect(valid).toBe(allowed.includes(target));
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Closed status can only transition to open (reopen)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_TICKET_STATUSES),
        (target) => {
          const result = isValidTicketTransition('closed', target);
          expect(result).toBe(target === 'open');
        }
      ),
      { numRuns: 100 }
    );
  });
});
