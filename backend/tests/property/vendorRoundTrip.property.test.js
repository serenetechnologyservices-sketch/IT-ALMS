// Feature: asset-intelligence-platform, Property 8: Vendor and contract data round-trip
// Validates: Requirements 6.1, 6.2
const fc = require('fast-check');

describe('Property 8: Vendor and contract data round-trip', () => {
  test('For any vendor data, serializing then deserializing preserves all fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          contact_person: fc.string({ minLength: 0, maxLength: 100 }),
          email: fc.string({ minLength: 0, maxLength: 100 }),
          phone: fc.string({ minLength: 0, maxLength: 20 }),
          service_type: fc.string({ minLength: 0, maxLength: 50 }),
        }),
        (vendor) => {
          const serialized = JSON.stringify(vendor);
          const deserialized = JSON.parse(serialized);
          expect(deserialized).toEqual(vendor);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('For any contract data, serializing then deserializing preserves all fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          vendor_id: fc.integer({ min: 1, max: 1000 }),
          contract_type: fc.constantFrom('warranty', 'amc'),
          start_date: fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ms => new Date(ms).toISOString().split('T')[0]),
          end_date: fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ms => new Date(ms).toISOString().split('T')[0]),
          description: fc.string({ minLength: 0, maxLength: 200 }),
        }),
        (contract) => {
          const serialized = JSON.stringify(contract);
          const deserialized = JSON.parse(serialized);
          expect(deserialized).toEqual(contract);
        }
      ),
      { numRuns: 100 }
    );
  });
});
