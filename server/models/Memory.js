const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    gameSlug: String,
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    province: String,
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    likeCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

memorySchema.index({ gameId: 1, createdAt: -1 });
memorySchema.index({ userId: 1 });
memorySchema.index({ likeCount: -1 });

module.exports = mongoose.model('Memory', memorySchema);
