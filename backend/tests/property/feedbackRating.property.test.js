// Feature: ticket-management, Property 12: Feedback rating validation
// Validates: Requirements 8.2
const fc = require('fast-check');
const { isValidFeedbackRating } = require('../../src/utils/ticketValidation');

describe('Property 12: Feedback rating validation', () => {
  test('For any integer 1-5, rating is valid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (rating) => {
          expect(isValidFeedbackRating(rating)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('For any integer outside 1-5, rating is invalid', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: -1000, max: 0 }),
          fc.integer({ min: 6, max: 1000 })
        ),
        (rating) => {
          expect(isValidFeedbackRating(rating)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Null/undefined rating is valid (optional field)', () => {
    expect(isValidFeedbackRating(null)).toBe(true);
    expect(isValidFeedbackRating(undefined)).toBe(true);
  });
});
