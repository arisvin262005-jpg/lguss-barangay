const express = require('express');
const router = express.Router();
const { register, login, logout, forgotPassword, getMe } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, getMe);

module.exports = router;
