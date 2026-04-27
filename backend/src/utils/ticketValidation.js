/**
 * Validate ticket creation payload. Returns error string or null.
 */
function validateTicketCreate(body) {
  if (!body.asset_id || !body.issue_type || !body.description) {
    return 'Asset, issue type, and description are required.';
  }
  return null;
}

/**
 * Validate feedback rating. Returns true if valid (integer 1-5).
 */
function isValidFeedbackRating(rating) {
  if (rating == null) return true; // optional
  const n = parseInt(rating, 10);
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

/**
 * Check if a MIME type is allowed for ticket attachments.
 */
const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function isAllowedFileType(mimeType) {
  return ALLOWED_ATTACHMENT_TYPES.includes(mimeType);
}

module.exports = { validateTicketCreate, isValidFeedbackRating, isAllowedFileType, ALLOWED_ATTACHMENT_TYPES };
