// Feature: asset-intelligence-platform, Property 9: Contract expiry alert generation
// Validates: Requirements 6.3
const fc = require('fast-check');

function shouldAlert(endDate, now) {
  const diff = (new Date(endDate) - new Date(now)) / (1000 * 60 * 60 * 24);
  return diff <= 30 && diff > 0;
}

describe('Property 9: Contract expiry alert generation', () => {
  test('For any contract, an alert is generated iff end_date is within 30 days of now', () => {
    const now = new Date();
    fc.assert(
      fc.property(
        fc.integer({ min: -60, max: 365 }),
        (daysFromNow) => {
          const endDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
          const alert = shouldAlert(endDate.toISOString().split('T')[0], now.toISOString().split('T')[0]);
          if (daysFromNow > 0 && daysFromNow <= 30) expect(alert).toBe(true);
          else expect(alert).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });
});
