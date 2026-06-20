const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Auto-seed if collections are empty
    const Game = require('../models/Game');
    const Achievement = require('../models/Achievement');

    try {
      const gameCount = await Game.countDocuments();
      if (gameCount === 0) {
        console.log('🔄 Game collection empty. Auto-seeding default games...');
        const { filipinoGames } = require('../utils/gameData');
        await Game.insertMany(filipinoGames);
        console.log('✅ Auto-seeded default games!');
      }
    } catch (err) {
      console.error('⚠️ Auto-seeding games failed:', err.message);
    }

    try {
      const achievementCount = await Achievement.countDocuments();
      if (achievementCount === 0) {
        console.log('🔄 Achievement collection empty. Auto-seeding default achievements...');
        await Achievement.create([
          {
            name: 'First Step',
            description: 'Play your first traditional Filipino childhood game on Palaro.',
            icon: '🏃',
            tier: 'bronze',
            xpReward: 100,
            criteria: { type: 'games-played', target: 1 },
            category: 'gaming',
          },
          {
            name: 'Street Game Veteran',
            description: 'Play 10 games in total across any childhood games.',
            icon: '🎒',
            tier: 'silver',
            xpReward: 300,
            criteria: { type: 'games-played', target: 10 },
            category: 'gaming',
          },
          {
            name: 'Sungka Enthusiast',
            description: 'Win 5 games of Sungka.',
            icon: '🐚',
            tier: 'silver',
            xpReward: 250,
            criteria: { type: 'games-won', target: 5, gameSlug: 'sungka' },
            category: 'gaming',
          },
          {
            name: 'Undefeated Runner',
            description: 'Win 5 matches of Patintero.',
            icon: '⚡',
            tier: 'silver',
            xpReward: 250,
            criteria: { type: 'games-won', target: 5, gameSlug: 'patintero' },
            category: 'gaming',
          },
          {
            name: 'Nostalgia Historian',
            description: 'Read the historical origin and rules of 5 different games in your collection book.',
            icon: '📖',
            tier: 'silver',
            xpReward: 200,
            criteria: { type: 'collection', target: 5 },
            category: 'collection',
          },
          {
            name: 'Memory Keeper',
            description: 'Post a childhood game story on the Memory Wall.',
            icon: '💭',
            tier: 'bronze',
            xpReward: 100,
            criteria: { type: 'social', target: 1 },
            category: 'social',
          },
          {
            name: 'Barangay Challenger',
            description: 'Contribute to a community-wide challenge.',
            icon: '🤝',
            tier: 'bronze',
            xpReward: 150,
            criteria: { type: 'special', target: 1 },
            category: 'community',
          },
          {
            name: 'Family Gathering',
            description: 'Create or join a Family Group on Palaro.',
            icon: '🏡',
            tier: 'bronze',
            xpReward: 150,
            criteria: { type: 'social', target: 1 },
            category: 'family',
          }
        ]);
        console.log('✅ Auto-seeded default achievements!');
      }
    } catch (err) {
      console.error('⚠️ Auto-seeding achievements failed:', err.message);
    }

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
