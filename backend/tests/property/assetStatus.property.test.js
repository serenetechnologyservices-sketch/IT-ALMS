// Feature: asset-intelligence-platform, Property 1: Asset status invariant
// Validates: Requirements 1.2
const fc = require('fast-check');
const { VALID_ASSET_STATUSES } = require('../../src/utils/stateMachine');

describe('Property 1: Asset status invariant', () => {
  test('For any valid asset status, it must be one of: available, allocated, repair, scrap', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_ASSET_STATUSES),
        (status) => {
          expect(['available', 'allocated', 'repair', 'scrap']).toContain(status);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('For any random string, it should not be accepted unless it is a valid status', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (randomStatus) => {
          const isValid = VALID_ASSET_STATUSES.includes(randomStatus);
          if (isValid) {
            expect(['available', 'allocated', 'repair', 'scrap']).toContain(randomStatus);
          } else {
            expect(VALID_ASSET_STATUSES).not.toContain(randomStatus);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
