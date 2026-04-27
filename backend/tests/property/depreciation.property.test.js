// Feature: asset-intelligence-platform, Property 7: Depreciation and current value calculation
// Validates: Requirements 5.2, 5.3, 5.5
const fc = require('fast-check');
const { computeDepreciation } = require('../../src/utils/depreciation');

describe('Property 7: Depreciation and current value calculation', () => {
  test('For any asset, annual depreciation = (cost - salvage) / life, and current value >= 0', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1000, max: 1000000, noNaN: true }),
        fc.float({ min: 0, max: 100000, noNaN: true }),
        fc.integer({ min: 1, max: 20 }),
        fc.float({ min: 0, max: 25, noNaN: true }),
        (purchaseCost, salvageValue, usefulLife, yearsSince) => {
          // Ensure salvage <= cost
          const salvage = Math.min(salvageValue, purchaseCost);
          const result = computeDepreciation(purchaseCost, salvage, usefulLife, yearsSince);

          const expectedDep = Math.round(((purchaseCost - salvage) / usefulLife) * 100) / 100;
          expect(result.annualDepreciation).toBeCloseTo(expectedDep, 1);
          expect(result.currentValue).toBeGreaterThanOrEqual(0);

          // Current value should never exceed purchase cost
          expect(result.currentValue).toBeLessThanOrEqual(purchaseCost + 0.01);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('For very old assets, current value floors at zero', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1000, max: 100000, noNaN: true }),
        fc.integer({ min: 1, max: 10 }),
        (cost, life) => {
          const result = computeDepreciation(cost, 0, life, life * 3);
          expect(result.currentValue).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
