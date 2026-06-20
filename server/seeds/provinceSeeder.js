const Province = require('../models/Province');
const { philippineProvinces } = require('../utils/provinces');

const seedProvinces = async () => {
  try {
    await Province.deleteMany({});
    console.log('🗑️ Deleted existing provinces');

    const provincesWithStats = philippineProvinces.map(p => ({
      name: p.name,
      region: p.region,
      totalPoints: 0,
      playerCount: 0,
    }));

    const seeded = await Province.insertMany(provincesWithStats);
    console.log(`✅ Seeded ${seeded.length} provinces into the database`);
  } catch (err) {
    console.error('❌ Error seeding provinces:', err.message);
    throw err;
  }
};

module.exports = seedProvinces;
