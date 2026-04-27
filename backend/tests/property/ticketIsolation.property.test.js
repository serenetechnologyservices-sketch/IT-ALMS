// Feature: asset-intelligence-platform, Property 15: Service role ticket isolation
// Validates: Requirements 11.3, 11.4
const fc = require('fast-check');

function getPartnerTickets(allTickets, partnerId) {
  return allTickets.filter(t => t.assigned_partner_id === partnerId);
}

function getEngineerTickets(allTickets, engineerId) {
  return allTickets.filter(t => t.assigned_engineer_id === engineerId);
}

describe('Property 15: Service role ticket isolation', () => {
  test('For any service partner, only their assigned tickets are returned', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          assigned_partner_id: fc.option(fc.integer({ min: 1, max: 10 }), { nil: null }),
          assigned_engineer_id: fc.option(fc.integer({ min: 1, max: 10 }), { nil: null }),
        }), { minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 10 }),
        (tickets, partnerId) => {
          const result = getPartnerTickets(tickets, partnerId);
          result.forEach(t => expect(t.assigned_partner_id).toBe(partnerId));
          const expected = tickets.filter(t => t.assigned_partner_id === partnerId);
          expect(result.length).toBe(expected.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('For any service engineer, only their assigned tickets are returned', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          assigned_partner_id: fc.option(fc.integer({ min: 1, max: 10 }), { nil: null }),
          assigned_engineer_id: fc.option(fc.integer({ min: 1, max: 10 }), { nil: null }),
        }), { minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 10 }),
        (tickets, engineerId) => {
          const result = getEngineerTickets(tickets, engineerId);
          result.forEach(t => expect(t.assigned_engineer_id).toBe(engineerId));
          const expected = tickets.filter(t => t.assigned_engineer_id === engineerId);
          expect(result.length).toBe(expected.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
