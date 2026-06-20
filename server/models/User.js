const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Game-related fields
    province: {
      type: String,
      default: '',
    },
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 0,
    },
    totalGamesPlayed: {
      type: Number,
      default: 0,
    },
    totalWins: {
      type: Number,
      default: 0,
    },
    nostalgiaTier: {
      type: String,
      enum: ['Newbie', '90s Kid', 'Early 2000s Kid', 'Tambay Legend', 'Street Game Master'],
      default: 'Newbie',
    },
    achievements: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement',
    }],
    familyGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyGroup',
    },
    barangayClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BarangayClub',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ['player', 'parent', 'admin'],
      default: 'player',
    },
    refreshTokens: [{
      token: String,
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800, // 7 days
      },
    }],
    // Offline sync
    offlineData: {
      lastSyncedAt: Date,
      pendingResults: [{
        gameId: String,
        score: Number,
        timestamp: Date,
      }],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        // Don't expose real names in game context
        delete ret.firstName;
        delete ret.lastName;
        return ret;
      },
    },
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate nostalgia tier from XP
userSchema.methods.updateNostalgiaTier = function () {
  if (this.xp >= 50000) this.nostalgiaTier = 'Street Game Master';
  else if (this.xp >= 20000) this.nostalgiaTier = 'Tambay Legend';
  else if (this.xp >= 8000) this.nostalgiaTier = 'Early 2000s Kid';
  else if (this.xp >= 2000) this.nostalgiaTier = '90s Kid';
  else this.nostalgiaTier = 'Newbie';
};

// Calculate level from XP
userSchema.methods.updateLevel = function () {
  this.level = Math.floor(this.xp / 500) + 1;
};

// Index for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ province: 1 });
userSchema.index({ xp: -1 });
userSchema.index({ level: -1 });

module.exports = mongoose.model('User', userSchema);
