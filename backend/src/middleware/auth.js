const config = require('../config/env');

/**
 * Middleware to authenticate requests to deployment triggers
 * Checks for x-admin-secret header or Bearer token matching ADMIN_SECRET
 */
const requireAdminSecret = (req, res, next) => {
  if (!config.adminSecret) {
    return res.status(503).json({
      success: false,
      error: 'Server configuration error: ADMIN_SECRET is not configured on the backend.'
    });
  }

  const authHeader = req.headers['authorization'];
  let providedToken = req.headers['x-admin-secret'];

  if (!providedToken && authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7).trim();
  }

  if (!providedToken) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide x-admin-secret header or Bearer token.'
    });
  }

  if (providedToken !== config.adminSecret) {
    return res.status(401).json({
      success: false,
      error: 'Invalid admin secret key. Access denied.'
    });
  }

  next();
};

module.exports = {
  requireAdminSecret
};
