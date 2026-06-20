const express = require('express');
const router = express.Router();
const {
  getUserCollection,
  getCollectionEntryBySlug,
  updateCollectionEntry,
} = require('../controllers/collectionController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getUserCollection);
router.get('/:gameSlug', authenticate, getCollectionEntryBySlug);
router.put('/:gameSlug', authenticate, updateCollectionEntry);

module.exports = router;
