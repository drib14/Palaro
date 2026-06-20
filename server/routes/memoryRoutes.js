const express = require('express');
const router = express.Router();
const { getMemories, createMemory, toggleLike, deleteMemory } = require('../controllers/memoryController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { memoryRules, validate } = require('../middleware/validate');

router.get('/', optionalAuth, getMemories);
router.post('/', authenticate, memoryRules, validate, createMemory);
router.post('/:id/like', authenticate, toggleLike);
router.delete('/:id', authenticate, deleteMemory);

module.exports = router;
