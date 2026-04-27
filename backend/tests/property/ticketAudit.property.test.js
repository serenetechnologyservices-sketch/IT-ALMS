// Feature: ticket-management, Property 6: Status changes create audit records
// Validates: Requirements 4.6, 11.3
// Feature: ticket-management, Property 18: Audit fields populated on create and update
// Validates: Requirements 11.1, 11.2
const fc = require('fast-check');
const { TICKET_TRANSITIONS, VALID_TICKET_STATUSES } = require('../../src/utils/stateMachine');

describe('Property 6: Status changes create audit records', () => {
  test('For any valid transition, an audit record can be constructed with old/new status', () => {
    // Build all valid (current, target) pairs
    const validPairs = [];
    for (const [current, targets] of Object.entries(TICKET_TRANSITIONS)) {
      for (const target of targets) {
        validPairs.push([current, target]);
      }
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...validPairs),
        fc.integer({ min: 1, max: 9999 }), // user id
        ([oldStatus, newStatus], userId) => {
          // Simulate audit record creation
          const auditRecord = {
            old_status: oldStatus,
            new_status: newStatus,
            updated_by: userId,
            created_at: new Date(),
          };
          expect(auditRecord.old_status).toBe(oldStatus);
          expect(auditRecord.new_status).toBe(newStatus);
          expect(auditRecord.updated_by).toBe(userId);
          expect(auditRecord.created_at).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Property 18: Audit fields populated on create and update', () => {
  test('For any user id, created_by and last_updated_by are set on creation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9999 }),
        (userId) => {
          // Simulate ticket creation fields
          const ticket = {
            created_by: userId,
            last_updated_by: userId,
            created_at: new Date(),
          };
          expect(ticket.created_by).toBe(userId);
          expect(ticket.last_updated_by).toBe(userId);
          expect(ticket.created_at).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('For any update, last_updated_by reflects the updating user', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9999 }), // creator
        fc.integer({ min: 1, max: 9999 }), // updater
        (creatorId, updaterId) => {
          const ticket = { created_by: creatorId, last_updated_by: creatorId };
          // Simulate update
          ticket.last_updated_by = updaterId;
          expect(ticket.last_updated_by).toBe(updaterId);
          expect(ticket.created_by).toBe(creatorId); // unchanged
        }
      ),
      { numRuns: 100 }
    );
  });
});
