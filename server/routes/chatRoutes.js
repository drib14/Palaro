const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const { chatRules, validate } = require('../middleware/validate');

router.get('/:room', authenticate, getMessages);
router.post('/:room', authenticate, chatRules, validate, sendMessage);

module.exports = router;
