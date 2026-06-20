const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'diamond', 'legendary'],
      default: 'bronze',
    },
    xpReward: {
      type: Number,
      default: 100,
    },
    criteria: {
      type: {
        type: String,
        enum: ['games-played', 'games-won', 'streak', 'collection', 'social', 'special'],
      },
      target: Number,
      gameSlug: String,
    },
    category: {
      type: String,
      enum: ['gaming', 'social', 'collection', 'community', 'festival', 'family'],
      default: 'gaming',
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
    unlocksItem: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Achievement', achievementSchema);
