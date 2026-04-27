const errorHandler = (err, req, res, next) => {
  // Log error details (not to client)
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} — ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ success: false, error: err.errors.map(e => e.message).join(', ') });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ success: false, error: 'Duplicate entry. Record already exists.' });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ success: false, error: 'Invalid reference. Related record not found.' });
  }
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({ success: false, error: 'Database error. Please try again.' });
  }
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    return res.status(503).json({ success: false, error: 'Database connection unavailable.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired.' });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, error: 'File exceeds maximum size.' });
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }

  // Syntax errors (bad JSON)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Invalid JSON in request body.' });
  }

  // Default
  const status = err.statusCode || err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ success: false, error: message });
};

module.exports = errorHandler;
