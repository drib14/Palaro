const express = require('express');
const router = express.Router();
const {
  getAllAchievements,
  getUserAchievements,
  unlockAchievement,
} = require('../controllers/achievementController');
const { authenticate } = require('../middleware/auth');

router.get('/', getAllAchievements);
router.get('/me', authenticate, getUserAchievements);
router.post('/unlock/:id', authenticate, unlockAchievement);

module.exports = router;
