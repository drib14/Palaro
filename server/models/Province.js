const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      default: 'National',
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    playerCount: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    weeklyPoints: {
      type: Number,
      default: 0,
    },
    monthlyPoints: {
      type: Number,
      default: 0,
    },
    topPlayers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      username: String,
      points: Number,
    }],
  },
  {
    timestamps: true,
  }
);

provinceSchema.index({ name: 1 }, { unique: true });
provinceSchema.index({ totalPoints: -1 });
provinceSchema.index({ region: 1 });

module.exports = mongoose.model('Province', provinceSchema);
