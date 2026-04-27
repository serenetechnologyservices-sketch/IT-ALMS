// Feature: asset-intelligence-platform, Property 11: Marketplace stock status consistency
// Validates: Requirements 8.1, 8.5
const fc = require('fast-check');
const { getStockStatus } = require('../../src/utils/stockStatus');

describe('Property 11: Marketplace stock status consistency', () => {
  test('For any available quantity, stock status is out_of_stock iff available=0, limited iff 1-3, available otherwise', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        (available) => {
          const status = getStockStatus(available);
          if (available === 0) expect(status).toBe('out_of_stock');
          else if (available <= 3) expect(status).toBe('limited');
          else expect(status).toBe('available');
        }
      ),
      { numRuns: 200 }
    );
  });
});
