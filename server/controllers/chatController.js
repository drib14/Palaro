const ChatMessage = require('../models/ChatMessage');

// @desc    Get messages for a room
// @route   GET /api/chat/:room
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({ room: req.params.room })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, data: { messages: messages.reverse() } });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/chat/:room
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { content, type = 'text', roomType = 'global' } = req.body;

    const message = await ChatMessage.create({
      sender: req.userId,
      senderUsername: req.user.username,
      room: req.params.room,
      roomType,
      content,
      type,
    });

    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage };
