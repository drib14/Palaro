const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('achievements')
      .populate('barangayClub', 'name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { province, avatar } = req.body;
    const updates = {};
    if (province !== undefined) updates.province = province;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, sortBy = 'xp' } = req.query;
    const sortField = sortBy === 'wins' ? 'totalWins' : 'xp';

    const users = await User.find()
      .sort({ [sortField]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('username avatar level xp totalGamesPlayed totalWins nostalgiaTier province gender');

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' },
    })
      .limit(20)
      .select('username avatar level nostalgiaTier province isOnline gender');

    res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateProfile, getLeaderboard, searchUsers };
