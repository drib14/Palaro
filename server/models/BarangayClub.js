const mongoose = require('mongoose');

const barangayClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    type: {
      type: String,
      enum: ['barangay', 'school', 'community'],
      default: 'barangay',
    },
    province: String,
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    officers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    members: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      role: {
        type: String,
        enum: ['member', 'officer', 'leader'],
        default: 'member',
      },
    }],
    maxMembers: {
      type: Number,
      default: 50,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    tournaments: [{
      name: String,
      gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
      },
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming',
      },
      participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    avatar: String,
    banner: String,
  },
  {
    timestamps: true,
  }
);

barangayClubSchema.index({ name: 1 }, { unique: true });
barangayClubSchema.index({ province: 1 });
barangayClubSchema.index({ totalPoints: -1 });

module.exports = mongoose.model('BarangayClub', barangayClubSchema);
