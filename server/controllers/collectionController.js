const CollectionEntry = require('../models/CollectionEntry');
const Game = require('../models/Game');

// @desc    Get user's collection book progress
// @route   GET /api/collection
// @access  Private
const getUserCollection = async (req, res, next) => {
  try {
    const entries = await CollectionEntry.find({ userId: req.user._id })
      .populate('gameId', 'name slug thumbnail type modes');

    res.json({ success: true, entries });
  } catch (err) {
    next(err);
  }
};

// @desc    Get or initialize details for a specific game collection entry
// @route   GET /api/collection/:gameSlug
// @access  Private
const getCollectionEntryBySlug = async (req, res, next) => {
  try {
    const { gameSlug } = req.params;

    const game = await Game.findOne({ slug: gameSlug });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    let entry = await CollectionEntry.findOne({
      userId: req.user._id,
      gameId: game._id,
    }).populate('gameId');

    if (!entry) {
      // Lazy initialize
      entry = new CollectionEntry({
        userId: req.user._id,
        gameId: game._id,
        gameSlug: game.slug,
        unlocked: false,
        totalTimesPlayed: 0,
        readHistory: false,
        readRules: false,
        discoveredVariations: [],
      });
      await entry.save();
      // Populate game manually
      entry.gameId = game;
    }

    res.json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

// @desc    Update collection entry (e.g. read rules, read history, discover variation)
// @route   PUT /api/collection/:gameSlug
// @access  Private
const updateCollectionEntry = async (req, res, next) => {
  try {
    const { gameSlug } = req.params;
    const { readRules, readHistory, variation } = req.body;

    const game = await Game.findOne({ slug: gameSlug });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    let entry = await CollectionEntry.findOne({
      userId: req.user._id,
      gameId: game._id,
    });

    if (!entry) {
      entry = new CollectionEntry({
        userId: req.user._id,
        gameId: game._id,
        gameSlug: game.slug,
      });
    }

    if (readRules !== undefined) entry.readRules = readRules;
    if (readHistory !== undefined) entry.readHistory = readHistory;
    
    if (variation && !entry.discoveredVariations.includes(variation)) {
      entry.discoveredVariations.push(variation);
    }

    // Recalculate completion percentage
    // Let's say: readRules = 25%, readHistory = 25%, played at least once = 30%, variations = up to 20%
    let percentage = 0;
    if (entry.readRules) percentage += 25;
    if (entry.readHistory) percentage += 25;
    if (entry.totalTimesPlayed > 0) percentage += 30;
    
    // variations ratio
    const totalVariationsCount = game.variations ? game.variations.length : 1;
    if (totalVariationsCount > 0 && entry.discoveredVariations.length > 0) {
      percentage += Math.min(20, Math.round((entry.discoveredVariations.length / totalVariationsCount) * 20));
    }

    entry.completionPercentage = percentage;
    if (percentage >= 100) {
      entry.unlocked = true;
    }

    await entry.save();

    res.json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserCollection,
  getCollectionEntryBySlug,
  updateCollectionEntry,
};
