/**
 * Input sanitization middleware.
 * Strips HTML tags and trims strings in req.body.
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObj(req.body);
  }
  next();
}

function sanitizeObj(obj) {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/<[^>]*>/g, '').trim();
    } else if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      sanitizeObj(obj[key]);
    }
  }
}

/**
 * Validate required fields middleware factory.
 * Usage: requireFields('name', 'email')
 */
function requireFields(...fields) {
  return (req, res, next) => {
    const missing = fields.filter(f => !req.body[f] && req.body[f] !== 0 && req.body[f] !== false);
    if (missing.length > 0) {
      return res.status(400).json({ success: false, error: `Missing required fields: ${missing.join(', ')}` });
    }
    next();
  };
}

module.exports = { sanitizeBody, requireFields };
