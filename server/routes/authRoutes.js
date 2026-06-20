const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/refresh', refreshAccessToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
