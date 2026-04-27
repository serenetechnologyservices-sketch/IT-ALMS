/**
 * Role-based access control middleware.
 * Usage: roleGuard('Admin', 'CIO') — allows only Admin and CIO roles.
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: 'Access denied. No role information.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

module.exports = roleGuard;
