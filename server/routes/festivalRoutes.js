const express = require('express');
const router = express.Router();
const {
  getAllFestivals,
  getActiveFestivals,
  joinFestival,
  updateFestivalProgress,
} = require('../controllers/festivalController');
const { authenticate } = require('../middleware/auth');

router.get('/', getAllFestivals);
router.get('/active', getActiveFestivals);
router.post('/:id/join', authenticate, joinFestival);
router.post('/:id/progress', authenticate, updateFestivalProgress);

module.exports = router;
