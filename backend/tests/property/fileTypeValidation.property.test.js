// Feature: ticket-management, Property 7: Attachment file type validation
// Validates: Requirements 2.2
const fc = require('fast-check');
const { isAllowedFileType, ALLOWED_ATTACHMENT_TYPES } = require('../../src/utils/ticketValidation');

describe('Property 7: Attachment file type validation', () => {
  test('For any allowed MIME type, isAllowedFileType returns true', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALLOWED_ATTACHMENT_TYPES),
        (mimeType) => {
          expect(isAllowedFileType(mimeType)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('For any random string not in allowed set, isAllowedFileType returns false', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (mimeType) => {
          if (ALLOWED_ATTACHMENT_TYPES.includes(mimeType)) return; // skip collisions
          expect(isAllowedFileType(mimeType)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Known disallowed types are rejected', () => {
    const disallowed = ['text/plain', 'application/zip', 'video/mp4', 'application/javascript', 'text/html'];
    for (const t of disallowed) {
      expect(isAllowedFileType(t)).toBe(false);
    }
  });
});
