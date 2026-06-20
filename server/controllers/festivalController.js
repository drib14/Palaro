const FestivalEvent = require('../models/FestivalEvent');
const User = require('../models/User');

// @desc    Get all festival events
// @route   GET /api/festivals
// @access  Public
const getAllFestivals = async (req, res, next) => {
  try {
    const festivals = await FestivalEvent.find({}).sort({ startDate: 1 });
    res.json({ success: true, festivals });
  } catch (err) {
    next(err);
  }
};

// @desc    Get active festival event
// @route   GET /api/festivals/active
// @access  Public
const getActiveFestivals = async (req, res, next) => {
  try {
    const now = new Date();
    // Find active festivals OR festivals where current date is between start and end
    const festivals = await FestivalEvent.find({
      $or: [
        { isActive: true },
        { startDate: { $lte: now }, endDate: { $gte: now } }
      ]
    });
    res.json({ success: true, festivals });
  } catch (err) {
    next(err);
  }
};

// @desc    Join a festival event
// @route   POST /api/festivals/:id/join
// @access  Private
const joinFestival = async (req, res, next) => {
  try {
    const festival = await FestivalEvent.findById(req.params.id);
    if (!festival) {
      return res.status(404).json({ success: false, message: 'Festival event not found' });
    }

    const isParticipant = festival.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (isParticipant) {
      return res.status(400).json({ success: false, message: 'Already participating in this festival event' });
    }

    festival.participants.push({
      userId: req.user._id,
      progress: 0,
      completed: false,
    });

    await festival.save();

    res.json({ success: true, message: 'Successfully joined festival event', festival });
  } catch (err) {
    next(err);
  }
};

// @desc    Update progress on a festival challenge
// @route   POST /api/festivals/:id/progress
// @access  Private
const updateFestivalProgress = async (req, res, next) => {
  try {
    const { challengeIndex, increment = 1 } = req.body;
    const festival = await FestivalEvent.findById(req.params.id);
    
    if (!festival) {
      return res.status(404).json({ success: false, message: 'Festival not found' });
    }

    const participant = festival.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(400).json({ success: false, message: 'You must join this festival first' });
    }

    // Update challenge progress if applicable
    if (festival.challenges && festival.challenges[challengeIndex]) {
      const challenge = festival.challenges[challengeIndex];
      challenge.currentCount += increment;
      
      // Calculate overall progress based on challenges completion
      let totalTarget = 0;
      let totalCurrent = 0;
      
      festival.challenges.forEach(ch => {
        totalTarget += ch.targetCount || 1;
        totalCurrent += Math.min(ch.currentCount || 0, ch.targetCount || 1);
      });

      participant.progress = Math.round((totalCurrent / totalTarget) * 100);
      
      if (participant.progress >= 100 && !participant.completed) {
        participant.completed = true;
        
        // Award rewards to user
        const user = await User.findById(req.user._id);
        festival.rewards.forEach(rew => {
          if (rew.type === 'xp') {
            user.xp += parseInt(rew.value) || 0;
          }
        });
        await user.save();
      }

      await festival.save();
    }

    res.json({ success: true, festival });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllFestivals,
  getActiveFestivals,
  joinFestival,
  updateFestivalProgress,
};
