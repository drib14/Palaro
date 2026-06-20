const Character = require('../models/Character');

// @desc    Get user character
// @route   GET /api/characters/me
// @access  Private
const getMyCharacter = async (req, res, next) => {
  try {
    let character = await Character.findOne({ userId: req.userId });
    if (!character) {
      character = await Character.create({
        userId: req.userId,
        gender: req.user.gender === 'female' ? 'female' : 'male',
      });
    }
    res.json({ success: true, data: { character } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update character customization
// @route   PUT /api/characters/customize
// @access  Private
const customizeCharacter = async (req, res, next) => {
  try {
    const allowedFields = [
      'skinTone', 'hairstyle', 'hairColor', 'eyes', 'eyeColor',
      'shirt', 'shirtColor', 'pants', 'pantsColor', 'shoes', 'shoesColor',
      'accessories', 'hat', 'expression',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const character = await Character.findOneAndUpdate(
      { userId: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!character) {
      return res.status(404).json({ success: false, message: 'Character not found.' });
    }

    res.json({ success: true, data: { character } });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock customization item
// @route   POST /api/characters/unlock
// @access  Private
const unlockItem = async (req, res, next) => {
  try {
    const { category, itemId } = req.body;
    const validCategories = ['hairstyles', 'shirts', 'pants', 'shoes', 'accessories', 'hats'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid item category.' });
    }

    const character = await Character.findOneAndUpdate(
      { userId: req.userId },
      { $addToSet: { [`unlockedItems.${category}`]: itemId } },
      { new: true }
    );

    if (!character) {
      return res.status(404).json({ success: false, message: 'Character not found.' });
    }

    res.json({ success: true, data: { character } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get character by username
// @route   GET /api/characters/:username
// @access  Public
const getCharacterByUsername = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const character = await Character.findOne({ userId: user._id });
    if (!character) {
      return res.status(404).json({ success: false, message: 'Character not found.' });
    }

    res.json({ success: true, data: { character } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyCharacter, customizeCharacter, unlockItem, getCharacterByUsername };
