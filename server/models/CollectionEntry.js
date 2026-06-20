const mongoose = require('mongoose');

const collectionEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    gameSlug: {
      type: String,
      required: true,
    },
    unlocked: {
      type: Boolean,
      default: false,
    },
    firstPlayedAt: Date,
    totalTimesPlayed: {
      type: Number,
      default: 0,
    },
    readHistory: {
      type: Boolean,
      default: false,
    },
    readRules: {
      type: Boolean,
      default: false,
    },
    discoveredVariations: [{
      type: String,
    }],
    personalBestScore: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

collectionEntrySchema.index({ userId: 1, gameId: 1 }, { unique: true });
collectionEntrySchema.index({ userId: 1 });

module.exports = mongoose.model('CollectionEntry', collectionEntrySchema);
