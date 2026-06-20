const express = require('express');
const router = express.Router();
const { getAllGames, getGameBySlug, createSession, joinSession, endSession, getGameHistory } = require('../controllers/gameController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { gameLimiter } = require('../middleware/rateLimiter');

router.get('/', getAllGames);
router.get('/history', authenticate, getGameHistory);
router.get('/:slug', getGameBySlug);
router.post('/session', authenticate, gameLimiter, createSession);
router.post('/session/:roomId/join', authenticate, joinSession);
router.post('/session/:roomId/end', authenticate, endSession);

module.exports = router;
