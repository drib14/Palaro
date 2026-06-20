const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, getLeaderboard, searchUsers } = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/leaderboard', getLeaderboard);
router.get('/search', authenticate, searchUsers);
router.get('/:username', optionalAuth, getUserProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
