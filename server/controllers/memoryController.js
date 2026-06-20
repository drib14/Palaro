const Memory = require('../models/Memory');

const getMemories = async (req, res, next) => {
  try {
    const { gameSlug, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (gameSlug) filter.gameSlug = gameSlug;

    const memories = await Memory.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Memory.countDocuments(filter);
    res.json({ success: true, data: { memories, total, page: Number(page) } });
  } catch (error) { next(error); }
};

const createMemory = async (req, res, next) => {
  try {
    const Game = require('../models/Game');
    const { content, gameId } = req.body;

    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });

    const memory = await Memory.create({
      userId: req.userId,
      username: req.user.username,
      gameId,
      gameSlug: game.slug,
      content,
      province: req.user.province,
    });

    res.status(201).json({ success: true, data: { memory } });
  } catch (error) { next(error); }
};

const toggleLike = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found.' });

    const userIdStr = req.userId.toString();
    const isLiked = memory.likes.some((id) => id.toString() === userIdStr);

    if (isLiked) {
      memory.likes = memory.likes.filter((id) => id.toString() !== userIdStr);
      memory.likeCount = Math.max(0, memory.likeCount - 1);
    } else {
      memory.likes.push(req.userId);
      memory.likeCount += 1;
    }

    await memory.save();
    res.json({ success: true, data: { memory, liked: !isLiked } });
  } catch (error) { next(error); }
};

const deleteMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found.' });
    if (memory.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await memory.deleteOne();
    res.json({ success: true, message: 'Memory deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getMemories, createMemory, toggleLike, deleteMemory };
