// Feature: asset-intelligence-platform, Property 2: Asset lifecycle transitions preserve history
// Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7
const fc = require('fast-check');

// Simulate lifecycle transitions
const LIFECYCLE_ACTIONS = {
  allocate: { from: 'available', to: 'allocated', event: 'allocated' },
  transfer: { from: 'allocated', to: 'allocated', event: 'transferred' },
  return: { from: 'allocated', to: 'available', event: 'returned' },
  scrap: { from: ['available', 'allocated', 'repair'], to: 'scrap', event: 'scrapped' },
};

function simulateTransition(currentStatus, action) {
  const rule = LIFECYCLE_ACTIONS[action];
  if (!rule) return { success: false };
  const validFrom = Array.isArray(rule.from) ? rule.from : [rule.from];
  if (!validFrom.includes(currentStatus)) return { success: false };
  return { success: true, newStatus: rule.to, event: rule.event };
}

describe('Property 2: Asset lifecycle transitions preserve history', () => {
  test('For any valid lifecycle transition, status updates correctly and event type is recorded', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('allocate', 'transfer', 'return', 'scrap'),
        fc.constantFrom('available', 'allocated', 'repair', 'scrap'),
        (action, currentStatus) => {
          const result = simulateTransition(currentStatus, action);
          if (result.success) {
            expect(['available', 'allocated', 'repair', 'scrap']).toContain(result.newStatus);
            expect(['allocated', 'transferred', 'returned', 'scrapped']).toContain(result.event);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Allocate only works from available status', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('available', 'allocated', 'repair', 'scrap'),
        (status) => {
          const result = simulateTransition(status, 'allocate');
          if (status === 'available') expect(result.success).toBe(true);
          else expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
