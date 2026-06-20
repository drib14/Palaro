const express = require('express');
const router = express.Router();
const { getMyCharacter, customizeCharacter, unlockItem, getCharacterByUsername } = require('../controllers/characterController');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, getMyCharacter);
router.put('/customize', authenticate, customizeCharacter);
router.post('/unlock', authenticate, unlockItem);
router.get('/:username', getCharacterByUsername);

module.exports = router;
