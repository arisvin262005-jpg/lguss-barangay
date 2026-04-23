const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

/**
 * Verify JWT from httpOnly cookie
 */
const authenticate = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Authorize by allowed roles
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied. Required roles: ${allowedRoles.join(', ')}` });
  }
  next();
};

/**
 * Restrict secretary to own barangay only
 */
const ownBarangayOnly = (req, res, next) => {
  const { role, barangay } = req.user || {};
  if (role === ROLES.ADMIN) return next();
  
  const targetBarangay = req.query?.barangay || req.body?.barangay;
  
  if (targetBarangay && targetBarangay !== barangay) {
    return res.status(403).json({ error: 'Access restricted to your own barangay' });
  }
  next();
};

module.exports = { authenticate, authorize, ownBarangayOnly };
