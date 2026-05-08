const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { register, login, logout, forgotPassword, getMe, updateProfile, getUsers, approveUser, rejectUser } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

const softAuthenticate = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.json({ authenticated: false });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.json({ authenticated: false });
  }
};

// ── Middleware: Admin-only guard ──
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

// Public routes
router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/me', softAuthenticate, getMe);

// Authenticated routes
router.put('/update-profile', authenticate, updateProfile);

// ── Admin-only routes ──
router.get('/users',            authenticate, requireAdmin, getUsers);
router.post('/approve/:id',     authenticate, requireAdmin, approveUser);
router.delete('/users/:id',     authenticate, requireAdmin, rejectUser);

module.exports = router;
