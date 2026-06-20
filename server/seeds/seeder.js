require('dotenv').config();
const mongoose = require('mongoose');
const seedGames = require('./gameSeeder');
const seedAchievements = require('./achievementSeeder');
const connectDB = require('../config/db');

const runSeeders = async () => {
  try {
    console.log('🚀 Starting Database Seeding Process...');
    
    // Connect to database
    await connectDB();

    // Run seeders
    // await seedGames();
    await seedAchievements();

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database seeding failed:', err.message);
    process.exit(1);
  }
};

runSeeders();
