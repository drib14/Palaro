const FamilyGroup = require('../models/FamilyGroup');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Get user's family group
// @route   GET /api/family
// @access  Private
const getFamilyGroup = async (req, res, next) => {
  try {
    // Find family where user is either parent or one of children
    const family = await FamilyGroup.findOne({
      $or: [
        { parent: req.user._id },
        { 'children.userId': req.user._id }
      ]
    })
    .populate('parent', 'username avatar level gender')
    .populate('children.userId', 'username firstName lastName avatar level gender');

    if (!family) {
      return res.json({ success: true, family: null });
    }

    res.json({ success: true, family });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a family group
// @route   POST /api/family
// @access  Private
const createFamilyGroup = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Check if user already has a family
    const existing = await FamilyGroup.findOne({
      $or: [
        { parent: req.user._id },
        { 'children.userId': req.user._id }
      ]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already in a family group' });
    }

    // Generate unique 6-character invite code
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const family = new FamilyGroup({
      name,
      parent: req.user._id,
      children: [],
      inviteCode,
    });

    await family.save();

    // Link user to family
    req.user.familyGroup = family._id;
    await req.user.save();

    res.status(201).json({ success: true, family });
  } catch (err) {
    next(err);
  }
};

// @desc    Join family group using invite code
// @route   POST /api/family/join
// @access  Private
const joinFamilyGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    const family = await FamilyGroup.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Invalid invite code' });
    }

    // Check if already in a family
    const existing = await FamilyGroup.findOne({
      $or: [
        { parent: req.user._id },
        { 'children.userId': req.user._id }
      ]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already in a family group' });
    }

    family.children.push({
      userId: req.user._id,
      addedAt: new Date(),
    });

    await family.save();

    // Link user
    req.user.familyGroup = family._id;
    await req.user.save();

    res.json({ success: true, message: 'Successfully joined family group', family });
  } catch (err) {
    next(err);
  }
};

// @desc    Leave family group
// @route   POST /api/family/leave
// @access  Private
const leaveFamilyGroup = async (req, res, next) => {
  try {
    const family = await FamilyGroup.findOne({
      $or: [
        { parent: req.user._id },
        { 'children.userId': req.user._id }
      ]
    });

    if (!family) {
      return res.status(404).json({ success: false, message: 'Family group not found' });
    }

    if (family.parent.toString() === req.user._id.toString()) {
      // If parent leaves, delete the entire family group and unlink children
      const childrenIds = family.children.map(c => c.userId);
      
      await User.updateMany(
        { _id: { $in: [...childrenIds, family.parent] } },
        { $unset: { familyGroup: '' } }
      );

      await FamilyGroup.findByIdAndDelete(family._id);
      return res.json({ success: true, message: 'Family group deleted because the creator left' });
    } else {
      // Child leaving
      family.children = family.children.filter(c => c.userId.toString() !== req.user._id.toString());
      await family.save();

      req.user.familyGroup = undefined;
      await req.user.save();
      
      return res.json({ success: true, message: 'Successfully left family group' });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFamilyGroup,
  createFamilyGroup,
  joinFamilyGroup,
  leaveFamilyGroup,
};
