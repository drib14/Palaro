const express = require('express');
const router = express.Router();
const {
  getFamilyGroup,
  createFamilyGroup,
  joinFamilyGroup,
  leaveFamilyGroup,
} = require('../controllers/familyController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getFamilyGroup);
router.post('/', authenticate, createFamilyGroup);
router.post('/join', authenticate, joinFamilyGroup);
router.post('/leave', authenticate, leaveFamilyGroup);

module.exports = router;
