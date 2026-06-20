const Game = require('../models/Game');
const GameSession = require('../models/GameSession');
const User = require('../models/User');
const Province = require('../models/Province');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all games
// @route   GET /api/games
// @access  Public
const getAllGames = async (req, res, next) => {
  try {
    const { type, category, mode, search } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (mode) filter.modes = mode;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const games = await Game.find(filter).sort({ name: 1 });
    res.json({ success: true, data: { games, total: games.length } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get game by slug
// @route   GET /api/games/:slug
// @access  Public
const getGameBySlug = async (req, res, next) => {
  try {
    const game = await Game.findOne({ slug: req.params.slug });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }
    res.json({ success: true, data: { game } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create game session
// @route   POST /api/games/session
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const { gameSlug, mode, aiDifficulty } = req.body;

    const game = await Game.findOne({ slug: gameSlug });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }

    const roomId = `${gameSlug}-${uuidv4().slice(0, 8)}`;
    const players = [{
      userId: req.userId,
      username: req.user.username,
      score: 0,
      isReady: true,
      isAI: false,
    }];

    // Add AI player for PVC mode
    if (mode === 'pvc') {
      players.push({
        username: 'Palaro Bot',
        score: 0,
        isReady: true,
        isAI: true,
        aiDifficulty: aiDifficulty || 'medium',
      });
    }

    const session = await GameSession.create({
      gameId: game._id,
      gameSlug,
      mode,
      players,
      roomId,
      status: mode === 'pvc' ? 'in-progress' : 'waiting',
      startedAt: mode === 'pvc' ? new Date() : undefined,
    });

    res.status(201).json({ success: true, data: { session } });
  } catch (error) {
    next(error);
  }
};

// @desc    Join game session
// @route   POST /api/games/session/:roomId/join
// @access  Private
const joinSession = async (req, res, next) => {
  try {
    const session = await GameSession.findOne({ roomId: req.params.roomId, status: 'waiting' });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or already started.' });
    }

    const game = await Game.findById(session.gameId);
    if (session.players.length >= game.maxPlayers) {
      return res.status(400).json({ success: false, message: 'Game is full.' });
    }

    // Check if already in session
    const alreadyJoined = session.players.some((p) => p.userId?.toString() === req.userId.toString());
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: 'Already in this session.' });
    }

    session.players.push({
      userId: req.userId,
      username: req.user.username,
      score: 0,
      isReady: false,
      isAI: false,
    });

    await session.save();
    res.json({ success: true, data: { session } });
  } catch (error) {
    next(error);
  }
};

// @desc    End game session
// @route   POST /api/games/session/:roomId/end
// @access  Private
const endSession = async (req, res, next) => {
  try {
    const { winnerId, scores } = req.body;
    const session = await GameSession.findOne({ roomId: req.params.roomId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Update scores
    if (scores) {
      scores.forEach(({ playerId, score }) => {
        const player = session.players.find((p) => p.userId?.toString() === playerId || p.username === playerId);
        if (player) player.score = score;
      });
    }

    // Set winner
    if (winnerId) {
      const winner = session.players.find((p) => p.userId?.toString() === winnerId || p.username === winnerId);
      if (winner) {
        session.winner = { userId: winner.userId, username: winner.username };
      }
    }

    session.status = 'completed';
    session.endedAt = new Date();
    session.duration = Math.round((session.endedAt - session.startedAt) / 1000);
    await session.save();

    // Award XP
    if (!session.xpAwarded) {
      const game = await Game.findById(session.gameId);
      for (const player of session.players) {
        if (player.isAI || !player.userId) continue;
        const isWinner = session.winner?.userId?.toString() === player.userId.toString();
        const xpGain = isWinner ? game.xpReward.win : game.xpReward.loss;

        const user = await User.findById(player.userId);
        if (user) {
          user.xp += xpGain;
          user.totalGamesPlayed += 1;
          if (isWinner) user.totalWins += 1;
          user.updateLevel();
          user.updateNostalgiaTier();
          await user.save({ validateBeforeSave: false });

          // Update province points
          if (user.province && isWinner) {
            await Province.findOneAndUpdate(
              { name: user.province },
              { $inc: { totalPoints: game.xpReward.win, weeklyPoints: game.xpReward.win, monthlyPoints: game.xpReward.win } },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
        }
      }

      // Update game total played
      game.totalPlayed += 1;
      await game.save();

      session.xpAwarded = true;
      await session.save();
    }

    res.json({ success: true, data: { session } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get game session history for user
// @route   GET /api/games/history
// @access  Private
const getGameHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const sessions = await GameSession.find({
      'players.userId': req.userId,
      status: 'completed',
    })
      .sort({ endedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('gameId', 'name slug thumbnail type');

    res.json({ success: true, data: { sessions } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllGames, getGameBySlug, createSession, joinSession, endSession, getGameHistory };
