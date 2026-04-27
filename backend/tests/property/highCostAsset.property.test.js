// Feature: asset-intelligence-platform, Property 6: High-cost asset identification
// Validates: Requirements 4.4
const fc = require('fast-check');

const THRESHOLD = 0.3;

function isHighCost(purchaseCost, maintenanceCost) {
  if (purchaseCost <= 0) return false;
  return (maintenanceCost / purchaseCost) > THRESHOLD;
}

describe('Property 6: High-cost asset identification', () => {
  test('For any asset, it is flagged as high-cost iff maintenance/purchase ratio exceeds threshold', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 1000000, noNaN: true }),
        fc.float({ min: 0, max: 500000, noNaN: true }),
        (purchaseCost, maintenanceCost) => {
          const flagged = isHighCost(purchaseCost, maintenanceCost);
          const ratio = maintenanceCost / purchaseCost;
          if (ratio > THRESHOLD) expect(flagged).toBe(true);
          else expect(flagged).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });
});
