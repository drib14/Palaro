const mongoose = require('mongoose');

const communityChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
    },
    gameSlug: String,
    targetCount: {
      type: Number,
      required: true,
    },
    currentCount: {
      type: Number,
      default: 0,
    },
    reward: {
      type: {
        type: String,
        enum: ['xp', 'item', 'badge', 'title'],
      },
      value: mongoose.Schema.Types.Mixed,
      description: String,
    },
    deadline: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    contributors: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      username: String,
      contributions: Number,
    }],
  },
  {
    timestamps: true,
  }
);

communityChallengeSchema.index({ isActive: 1 });
communityChallengeSchema.index({ deadline: 1 });

module.exports = mongoose.model('CommunityChallenge', communityChallengeSchema);
