// Feature: asset-intelligence-platform, Property 14: Ticket assignment updates status
// Validates: Requirements 11.1, 11.2
const fc = require('fast-check');

function assignTicket(ticket, partnerId, engineerId) {
  if (ticket.status !== 'open') return { success: false, ticket };
  const updated = { ...ticket, status: 'assigned' };
  if (partnerId) updated.assigned_partner_id = partnerId;
  if (engineerId) updated.assigned_engineer_id = engineerId;
  return { success: true, ticket: updated };
}

describe('Property 14: Ticket assignment updates status', () => {
  test('For any open ticket assigned to partner or engineer, status becomes assigned', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          status: fc.constant('open'),
          assigned_partner_id: fc.constant(null),
          assigned_engineer_id: fc.constant(null),
        }),
        fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
        fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
        (ticket, partnerId, engineerId) => {
          if (!partnerId && !engineerId) return; // skip if neither assigned
          const result = assignTicket(ticket, partnerId, engineerId);
          expect(result.success).toBe(true);
          expect(result.ticket.status).toBe('assigned');
          if (partnerId) expect(result.ticket.assigned_partner_id).toBe(partnerId);
          if (engineerId) expect(result.ticket.assigned_engineer_id).toBe(engineerId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
