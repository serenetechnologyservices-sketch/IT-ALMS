// Feature: ticket-management, Property 9: Total effort calculation
// Validates: Requirements 5.4, 5.5
const fc = require('fast-check');
const { calculateEffortHours } = require('../../src/utils/effortCalculation');

describe('Property 9: Total effort calculation', () => {
  test('For any start < end, effort equals (end - start) in hours rounded to 2 decimals', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1577836800000, max: 1893456000000 }), // 2020-01-01 to 2030-01-01 in ms
        fc.integer({ min: 1, max: 720 }), // offset in minutes (up to 30 days)
        (startMs, offsetMinutes) => {
          const start = new Date(startMs);
          const end = new Date(startMs + offsetMinutes * 60 * 1000);
          const result = calculateEffortHours(start, end);
          const expected = Math.round((offsetMinutes / 60) * 100) / 100;
          expect(result).toBeCloseTo(expected, 2);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Returns null when end <= start', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1577836800000, max: 1893456000000 }),
        fc.integer({ min: 0, max: 10000 }),
        (endMs, offsetMinutes) => {
          const end = new Date(endMs);
          const start = new Date(endMs + offsetMinutes * 60 * 1000);
          const result = calculateEffortHours(start, end);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Returns null when either argument is missing', () => {
    expect(calculateEffortHours(null, new Date())).toBeNull();
    expect(calculateEffortHours(new Date(), null)).toBeNull();
    expect(calculateEffortHours(undefined, undefined)).toBeNull();
  });
});
