const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    gameSlug: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ['pvp', 'pvc', 'practice', 'tournament'],
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'in-progress', 'completed', 'abandoned', 'draw'],
      default: 'waiting',
    },
    players: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      username: String,
      score: {
        type: Number,
        default: 0,
      },
      isReady: {
        type: Boolean,
        default: false,
      },
      isAI: {
        type: Boolean,
        default: false,
      },
      aiDifficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', null],
        default: null,
      },
    }],
    winner: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      username: String,
    },
    gameState: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    moves: [{
      playerId: String,
      action: String,
      data: mongoose.Schema.Types.Mixed,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    roomId: {
      type: String,
      required: true,
    },
    startedAt: Date,
    endedAt: Date,
    duration: Number, // in seconds
    xpAwarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

gameSessionSchema.index({ roomId: 1 });
gameSessionSchema.index({ gameId: 1, status: 1 });
gameSessionSchema.index({ 'players.userId': 1 });
gameSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);
