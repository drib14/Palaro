const mongoose = require('mongoose');

const festivalEventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    season: {
      type: String,
      enum: ['christmas', 'summer', 'fiesta', 'independence', 'halloween', 'new-year'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    rewards: [{
      name: String,
      type: {
        type: String,
        enum: ['xp', 'item', 'badge', 'title'],
      },
      value: mongoose.Schema.Types.Mixed,
    }],
    challenges: [{
      title: String,
      description: String,
      gameSlug: String,
      targetCount: Number,
      currentCount: {
        type: Number,
        default: 0,
      },
    }],
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      progress: Number,
      completed: Boolean,
    }],
    banner: String,
    theme: {
      primaryColor: String,
      secondaryColor: String,
    },
  },
  {
    timestamps: true,
  }
);

festivalEventSchema.index({ isActive: 1 });
festivalEventSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('FestivalEvent', festivalEventSchema);
