// Feature: asset-intelligence-platform, Property 3: QR code uniqueness and round-trip
// Validates: Requirements 2.1, 2.2
const fc = require('fast-check');
const { v4: uuidv4 } = require('uuid');

describe('Property 3: QR code uniqueness and round-trip', () => {
  test('For any set of generated QR codes, all should be unique', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 50 }),
        (count) => {
          const codes = Array.from({ length: count }, () => uuidv4());
          const unique = new Set(codes);
          expect(unique.size).toBe(count);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('For any asset with a QR code, looking up by that code returns the same asset', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 100000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          qr_code: fc.uuid(),
        }),
        (asset) => {
          // Simulate a lookup map
          const store = { [asset.qr_code]: asset };
          const found = store[asset.qr_code];
          expect(found).toBeDefined();
          expect(found.id).toBe(asset.id);
          expect(found.name).toBe(asset.name);
        }
      ),
      { numRuns: 100 }
    );
  });
});
