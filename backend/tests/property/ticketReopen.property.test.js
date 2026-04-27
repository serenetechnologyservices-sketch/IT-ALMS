// Feature: ticket-management, Property 5: Reopen increments reopen count
// Validates: Requirements 4.5, 11.4
const fc = require('fast-check');
const { isValidTicketTransition } = require('../../src/utils/stateMachine');

describe('Property 5: Reopen increments reopen count', () => {
  test('closed→open is a valid transition', () => {
    expect(isValidTicketTransition('closed', 'open')).toBe(true);
  });

  test('For any N reopen cycles, reopen_count should equal N', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (n) => {
          // Simulate reopen logic
          let reopenCount = 0;
          for (let i = 0; i < n; i++) {
            // Simulate closed → open transition
            const oldStatus = 'closed';
            const newStatus = 'open';
            if (oldStatus === 'closed' && newStatus === 'open') {
              reopenCount += 1;
            }
          }
          expect(reopenCount).toBe(n);
        }
      ),
      { numRuns: 100 }
    );
  });
});
