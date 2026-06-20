const Game = require('../models/Game');
const { filipinoGames } = require('../utils/gameData');

const seedGames = async () => {
  try {
    // Delete existing games
    await Game.deleteMany({});
    console.log('🗑️ Deleted existing games');

    // Insert new games
    const seeded = await Game.insertMany(filipinoGames);
    console.log(`✅ Seeded ${seeded.length} games into the database`);
  } catch (err) {
    console.error('❌ Error seeding games:', err.message);
    throw err;
  }
};

module.exports = seedGames;
