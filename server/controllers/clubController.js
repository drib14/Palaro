const BarangayClub = require('../models/BarangayClub');
const User = require('../models/User');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res, next) => {
  try {
    const { province, type, sortBy = 'totalPoints', limit = 20, page = 1 } = req.query;
    const filter = {};
    if (province) filter.province = province;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;
    const clubs = await BarangayClub.find(filter)
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('leader', 'username avatar');

    const total = await BarangayClub.countDocuments(filter);

    res.json({
      success: true,
      clubs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a specific club details
// @route   GET /api/clubs/:id
// @access  Public
const getClubById = async (req, res, next) => {
  try {
    const club = await BarangayClub.findById(req.params.id)
      .populate('leader', 'username avatar')
      .populate('members.userId', 'username avatar level xp')
      .populate('officers', 'username avatar')
      .populate('tournaments.gameId', 'name slug');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Barangay Club not found' });
    }

    res.json({ success: true, club });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Private
const createClub = async (req, res, next) => {
  try {
    const { name, description, type, province, isPublic } = req.body;

    // Check if name is taken
    const existing = await BarangayClub.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Club name already taken' });
    }

    const club = new BarangayClub({
      name,
      description,
      type,
      province,
      isPublic,
      leader: req.user._id,
      members: [{ userId: req.user._id, role: 'leader' }],
    });

    await club.save();

    res.status(201).json({ success: true, club });
  } catch (err) {
    next(err);
  }
};

// @desc    Join a club
// @route   POST /api/clubs/:id/join
// @access  Private
const joinClub = async (req, res, next) => {
  try {
    const club = await BarangayClub.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Check if already a member
    const isMember = club.members.some(m => m.userId.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member of this club' });
    }

    // Check member limits
    if (club.members.length >= club.maxMembers) {
      return res.status(400).json({ success: false, message: 'Club is already full' });
    }

    club.members.push({ userId: req.user._id, role: 'member' });
    await club.save();

    res.json({ success: true, message: 'Successfully joined the club', club });
  } catch (err) {
    next(err);
  }
};

// @desc    Leave a club
// @route   POST /api/clubs/:id/leave
// @access  Private
const leaveClub = async (req, res, next) => {
  try {
    const club = await BarangayClub.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (club.leader.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Leaders cannot leave. You must transfer leadership or delete the club' });
    }

    const index = club.members.findIndex(m => m.userId.toString() === req.user._id.toString());
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'Not a member of this club' });
    }

    club.members.splice(index, 1);
    
    // Also remove from officers if present
    club.officers = club.officers.filter(o => o.toString() !== req.user._id.toString());

    await club.save();

    res.json({ success: true, message: 'Successfully left the club', club });
  } catch (err) {
    next(err);
  }
};

// @desc    Create tournament in club
// @route   POST /api/clubs/:id/tournaments
// @access  Private (Leader/Officer only)
const createTournament = async (req, res, next) => {
  try {
    const club = await BarangayClub.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isAuthorized = club.leader.toString() === req.user._id.toString() || 
                         club.officers.some(o => o.toString() === req.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage tournaments' });
    }

    const { name, gameId, startDate, endDate } = req.body;

    club.tournaments.push({
      name,
      gameId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'upcoming',
      participants: [],
    });

    await club.save();

    res.status(201).json({ success: true, message: 'Tournament created successfully', club });
  } catch (err) {
    next(err);
  }
};

// @desc    Join a tournament in club
// @route   POST /api/clubs/:id/tournaments/:tournamentId/join
// @access  Private
const joinTournament = async (req, res, next) => {
  try {
    const club = await BarangayClub.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isMember = club.members.some(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Must be a member of the club to join their tournament' });
    }

    const tournament = club.tournaments.id(req.params.tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.status !== 'upcoming' && tournament.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Tournament registration closed' });
    }

    const isParticipant = tournament.participants.some(p => p.toString() === req.user._id.toString());
    if (isParticipant) {
      return res.status(400).json({ success: false, message: 'Already participating in this tournament' });
    }

    tournament.participants.push(req.user._id);
    await club.save();

    res.json({ success: true, message: 'Successfully joined tournament', club });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getClubs,
  getClubById,
  createClub,
  joinClub,
  leaveClub,
  createTournament,
  joinTournament,
};
