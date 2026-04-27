// Feature: asset-intelligence-platform, Property 5: Health score bounds invariant
// Validates: Requirements 4.1
const fc = require('fast-check');
const { computeHealthScore } = require('../../src/utils/healthScore');

describe('Property 5: Health score bounds invariant', () => {
  test('For any combination of inputs, health score is between 0 and 100 inclusive', () => {
    fc.assert(
      fc.property(
        fc.record({
          ageYears: fc.float({ min: 0, max: 30, noNaN: true }),
          usefulLifeYears: fc.integer({ min: 1, max: 20 }),
          openTicketCount: fc.integer({ min: 0, max: 50 }),
          maintenanceCost: fc.float({ min: 0, max: 500000, noNaN: true }),
          purchaseCost: fc.float({ min: 1, max: 1000000, noNaN: true }),
          hasRecentUsage: fc.boolean(),
        }),
        (params) => {
          const score = computeHealthScore(params);
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
          expect(Number.isInteger(score)).toBe(true);
        }
      ),
      { numRuns: 200 }
    );
  });
});
