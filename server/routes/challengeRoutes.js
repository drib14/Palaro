const express = require('express');
const router = express.Router();
const {
  getAllChallenges,
  getActiveChallenges,
  contributeToChallenge,
} = require('../controllers/challengeController');
const { authenticate } = require('../middleware/auth');

router.get('/', getAllChallenges);
router.get('/active', getActiveChallenges);
router.post('/:id/contribute', authenticate, contributeToChallenge);

module.exports = router;
