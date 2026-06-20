const CommunityChallenge = require('../models/CommunityChallenge');
const User = require('../models/User');

// @desc    Get all community challenges
// @route   GET /api/challenges
// @access  Public
const getAllChallenges = async (req, res, next) => {
  try {
    const challenges = await CommunityChallenge.find({}).sort({ deadline: 1 });
    res.json({ success: true, challenges });
  } catch (err) {
    next(err);
  }
};

// @desc    Get active community challenges
// @route   GET /api/challenges/active
// @access  Public
const getActiveChallenges = async (req, res, next) => {
  try {
    const now = new Date();
    const challenges = await CommunityChallenge.find({
      isActive: true,
      deadline: { $gte: now },
      isCompleted: false,
    });
    res.json({ success: true, challenges });
  } catch (err) {
    next(err);
  }
};

// @desc    Contribute progress to a challenge
// @route   POST /api/challenges/:id/contribute
// @access  Private
const contributeToChallenge = async (req, res, next) => {
  try {
    const { count = 1 } = req.body;
    const challenge = await CommunityChallenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (!challenge.isActive || challenge.isCompleted || challenge.deadline < new Date()) {
      return res.status(400).json({ success: false, message: 'Challenge is inactive or expired' });
    }

    challenge.currentCount += count;

    // Manage contributors
    const contributor = challenge.contributors.find(
      c => c.userId.toString() === req.user._id.toString()
    );

    if (contributor) {
      contributor.contributions += count;
    } else {
      challenge.contributors.push({
        userId: req.user._id,
        username: req.user.username,
        contributions: count,
      });
    }

    // Check if challenge is completed
    if (challenge.currentCount >= challenge.targetCount) {
      challenge.isCompleted = true;
      challenge.isActive = false;
      
      // Award reward to all contributors
      if (challenge.reward && challenge.reward.type === 'xp') {
        const contributorIds = challenge.contributors.map(c => c.userId);
        await User.updateMany(
          { _id: { $in: contributorIds } },
          { $inc: { xp: challenge.reward.value } }
        );
      }
    }

    await challenge.save();

    res.json({ success: true, challenge });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllChallenges,
  getActiveChallenges,
  contributeToChallenge,
};
