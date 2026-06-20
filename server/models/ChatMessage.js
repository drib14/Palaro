const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderUsername: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      enum: ['global', 'game', 'club', 'private', 'playground'],
      default: 'global',
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['text', 'system', 'emote', 'game-invite'],
      default: 'text',
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ room: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
