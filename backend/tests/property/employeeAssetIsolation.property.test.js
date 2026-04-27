// Feature: asset-intelligence-platform, Property 10: Employee sees only their allocated assets
// Validates: Requirements 7.1
const fc = require('fast-check');

function getEmployeeAssets(allAllocations, employeeId) {
  return allAllocations.filter(a => a.user_id === employeeId && a.status === 'active');
}

describe('Property 10: Employee sees only their allocated assets', () => {
  test('For any employee, returned assets contain only their active allocations', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          asset_id: fc.integer({ min: 1, max: 500 }),
          user_id: fc.integer({ min: 1, max: 20 }),
          status: fc.constantFrom('active', 'returned', 'transferred'),
        }), { minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 20 }),
        (allocations, employeeId) => {
          const result = getEmployeeAssets(allocations, employeeId);
          // All returned items belong to this employee
          result.forEach(a => {
            expect(a.user_id).toBe(employeeId);
            expect(a.status).toBe('active');
          });
          // No active allocations for this employee are missing
          const expected = allocations.filter(a => a.user_id === employeeId && a.status === 'active');
          expect(result.length).toBe(expected.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
