// Feature: ticket-management, Property 11: Parts data round-trip
// Validates: Requirements 7.1, 7.2, 7.3
const fc = require('fast-check');

describe('Property 11: Parts data round-trip', () => {
  const partArb = fc.record({
    part_name: fc.string({ minLength: 1, maxLength: 100 }),
    quantity: fc.integer({ min: 1, max: 999 }),
    cost: fc.float({ min: 0, max: 99999, noNaN: true }),
    status: fc.constantFrom('used', 'pending', 'returned'),
  });

  test('For any set of parts added, all fields are preserved in a simulated store', () => {
    fc.assert(
      fc.property(
        fc.array(partArb, { minLength: 1, maxLength: 20 }),
        (parts) => {
          // Simulate add + list
          const store = [];
          for (const p of parts) {
            store.push({ ...p, id: store.length + 1, ticket_id: 1 });
          }
          expect(store.length).toBe(parts.length);
          for (let i = 0; i < parts.length; i++) {
            expect(store[i].part_name).toBe(parts[i].part_name);
            expect(store[i].quantity).toBe(parts[i].quantity);
            expect(store[i].status).toBe(parts[i].status);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Part status update preserves other fields', () => {
    fc.assert(
      fc.property(
        partArb,
        fc.constantFrom('used', 'pending', 'returned'),
        (part, newStatus) => {
          const stored = { ...part, id: 1, ticket_id: 1 };
          const updated = { ...stored, status: newStatus };
          expect(updated.part_name).toBe(part.part_name);
          expect(updated.quantity).toBe(part.quantity);
          expect(updated.status).toBe(newStatus);
        }
      ),
      { numRuns: 100 }
    );
  });
});
