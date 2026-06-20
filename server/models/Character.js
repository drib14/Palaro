const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    skinTone: {
      type: String,
      enum: ['light', 'medium', 'tan', 'brown', 'dark'],
      default: 'medium',
    },
    hairstyle: {
      type: String,
      default: 'default',
    },
    hairColor: {
      type: String,
      default: '#2C1810',
    },
    eyes: {
      type: String,
      default: 'default',
    },
    eyeColor: {
      type: String,
      default: '#3D2B1F',
    },
    shirt: {
      type: String,
      default: 'default-tshirt',
    },
    shirtColor: {
      type: String,
      default: '#1A73E8',
    },
    pants: {
      type: String,
      default: 'default-shorts',
    },
    pantsColor: {
      type: String,
      default: '#2C3E50',
    },
    shoes: {
      type: String,
      default: 'tsinelas', // Filipino slippers
    },
    shoesColor: {
      type: String,
      default: '#E74C3C',
    },
    accessories: [{
      type: String,
    }],
    hat: {
      type: String,
      default: 'none',
    },
    expression: {
      type: String,
      enum: ['happy', 'cool', 'determined', 'friendly', 'fierce'],
      default: 'happy',
    },
    // Unlocked items
    unlockedItems: {
      hairstyles: [{ type: String }],
      shirts: [{ type: String }],
      pants: [{ type: String }],
      shoes: [{ type: String }],
      accessories: [{ type: String }],
      hats: [{ type: String }],
    },
    // Avatar (rendered or uploaded)
    avatarUrl: {
      type: String,
      default: '',
    },
    // Sprite sheet for games
    spriteSheet: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

characterSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Character', characterSchema);
