const rateLimit = require('express-rate-limit');

// Per-IP login rate limiter: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
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
