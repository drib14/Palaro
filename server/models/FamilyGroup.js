const mongoose = require('mongoose');

const familyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    children: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    familyXP: {
      type: Number,
      default: 0,
    },
    familyLevel: {
      type: Number,
      default: 1,
    },
    achievements: [{
      achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement',
      },
      unlockedAt: Date,
    }],
    gamesPlayedTogether: {
      type: Number,
      default: 0,
    },
    inviteCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

familyGroupSchema.index({ parent: 1 });
familyGroupSchema.index({ inviteCode: 1 }, { unique: true });

module.exports = mongoose.model('FamilyGroup', familyGroupSchema);
