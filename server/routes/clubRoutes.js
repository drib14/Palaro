const express = require('express');
const router = express.Router();
const {
  getClubs,
  getClubById,
  createClub,
  joinClub,
  leaveClub,
  createTournament,
  joinTournament,
} = require('../controllers/clubController');
const { authenticate } = require('../middleware/auth');
const { validate, clubRules, tournamentRules } = require('../middleware/validate');

// Public routes
router.get('/', getClubs);
router.get('/:id', getClubById);

// Private routes
router.post('/', authenticate, createClub);
router.post('/:id/join', authenticate, joinClub);
router.post('/:id/leave', authenticate, leaveClub);
router.post('/:id/tournaments', authenticate, createTournament);
router.post('/:id/tournaments/:tournamentId/join', authenticate, joinTournament);

module.exports = router;
