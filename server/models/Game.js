const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    filipinoName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    history: {
      type: String,
      default: '',
    },
    rules: {
      type: String,
      default: '',
    },
    origin: {
      type: String,
      default: 'Philippines',
    },
    variations: [{
      name: String,
      description: String,
      region: String,
    }],
    type: {
      type: String,
      enum: ['2d', '3d'],
      required: true,
    },
    modes: [{
      type: String,
      enum: ['pvp', 'pvc', 'practice', 'tournament'],
    }],
    minPlayers: {
      type: Number,
      default: 1,
    },
    maxPlayers: {
      type: Number,
      default: 2,
    },
    category: {
      type: String,
      enum: ['outdoor', 'indoor', 'board', 'physical', 'strategy', 'dexterity'],
      default: 'outdoor',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    xpReward: {
      win: { type: Number, default: 100 },
      loss: { type: Number, default: 25 },
      draw: { type: Number, default: 50 },
    },
    totalPlayed: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOfflinePlayable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

gameSchema.index({ name: 1 }, { unique: true });
gameSchema.index({ slug: 1 }, { unique: true });
gameSchema.index({ type: 1 });
gameSchema.index({ category: 1 });

module.exports = mongoose.model('Game', gameSchema);
