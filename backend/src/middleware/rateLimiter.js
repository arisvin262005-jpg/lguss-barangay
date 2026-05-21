const rateLimit = require('express-rate-limit');
const { DEMO_USERS, normalizeEmail } = require('../config/demoUsers');

const DEMO_EMAILS = new Set(DEMO_USERS.map((u) => normalizeEmail(u.email)));

const isDemoLogin = (req) => DEMO_EMAILS.has(normalizeEmail(req.body?.email));

// Per-IP login rate limiter — demo accounts skipped (capstone defense)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 100,
  skip: (req) => isDemoLogin(req),
  message: {
    error: 'Too many login attempts. Please try again after 15 minutes.',
    lockout: true,
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please slow down.' },
});

module.exports = { loginLimiter, apiLimiter };
