const Achievement = require('../models/Achievement');
const User = require('../models/User');

// @desc    Get all achievements list
// @route   GET /api/achievements
// @access  Public
const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({});
    res.json({ success: true, achievements });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's achievements status
// @route   GET /api/achievements/me
// @access  Private
const getUserAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('achievements.achievementId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const allAchievements = await Achievement.find({});
    
    // Map unlocked achievements
    const unlockedIds = user.achievements.map(a => a.achievementId ? a.achievementId._id.toString() : '');
    
    const achievementsProgress = allAchievements.map(ach => {
      const isUnlocked = unlockedIds.includes(ach._id.toString());
      const unlockedInfo = isUnlocked ? user.achievements.find(a => a.achievementId && a.achievementId._id.toString() === ach._id.toString()) : null;
      
      return {
        ...ach.toObject(),
        unlocked: isUnlocked,
        unlockedAt: unlockedInfo ? unlockedInfo.unlockedAt : null,
      };
    });

    res.json({
      success: true,
      achievements: achievementsProgress,
      summary: {
        total: allAchievements.length,
        unlockedCount: user.achievements.length,
        lockedCount: allAchievements.length - user.achievements.length,
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check and trigger direct unlocking of an achievement (manual or custom criteria trigger)
// @route   POST /api/achievements/unlock/:id
// @access  Private
const unlockAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    const user = await User.findById(req.user._id);
    const alreadyUnlocked = user.achievements.some(
      a => a.achievementId && a.achievementId.toString() === achievement._id.toString()
    );

    if (alreadyUnlocked) {
      return res.status(400).json({ success: false, message: 'Achievement already unlocked' });
    }

    // Unlock
    user.achievements.push({
      achievementId: achievement._id,
      unlockedAt: new Date(),
    });

    // Award XP
    user.xp += achievement.xpReward;
    
    // Check level up (simple formula: level = floor(xp / 1000) + 1)
    const newLevel = Math.floor(user.xp / 1000) + 1;
    let leveledUp = false;
    if (newLevel > user.level) {
      user.level = newLevel;
      leveledUp = true;
    }

    await user.save();

    res.json({
      success: true,
      message: `Achievement unlocked: ${achievement.name}!`,
      achievement,
      xpEarned: achievement.xpReward,
      leveledUp,
      currentLevel: user.level,
      currentXp: user.xp,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAchievements,
  getUserAchievements,
  unlockAchievement,
};
