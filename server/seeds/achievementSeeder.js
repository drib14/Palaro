const Achievement = require('../models/Achievement');

const defaultAchievements = [
  {
    name: 'First Step',
    description: 'Play your first traditional Filipino childhood game on Palaro.',
    icon: '🏃',
    tier: 'bronze',
    xpReward: 100,
    criteria: {
      type: 'games-played',
      target: 1,
    },
    category: 'gaming',
  },
  {
    name: 'Street Game Veteran',
    description: 'Play 10 games in total across any childhood games.',
    icon: '🎒',
    tier: 'silver',
    xpReward: 300,
    criteria: {
      type: 'games-played',
      target: 10,
    },
    category: 'gaming',
  },
  {
    name: 'Sungka Enthusiast',
    description: 'Win 5 games of Sungka.',
    icon: '🐚',
    tier: 'silver',
    xpReward: 250,
    criteria: {
      type: 'games-won',
      target: 5,
      gameSlug: 'sungka',
    },
    category: 'gaming',
  },
  {
    name: 'Undefeated Runner',
    description: 'Win 5 matches of Patintero.',
    icon: '⚡',
    tier: 'silver',
    xpReward: 250,
    criteria: {
      type: 'games-won',
      target: 5,
      gameSlug: 'patintero',
    },
    category: 'gaming',
  },
  {
    name: 'Nostalgia Historian',
    description: 'Read the historical origin and rules of 5 different games in your collection book.',
    icon: '📖',
    tier: 'silver',
    xpReward: 200,
    criteria: {
      type: 'collection',
      target: 5,
    },
    category: 'collection',
  },
  {
    name: 'Memory Keeper',
    description: 'Post a childhood game story on the Memory Wall.',
    icon: '💭',
    tier: 'bronze',
    xpReward: 100,
    criteria: {
      type: 'social',
      target: 1,
    },
    category: 'social',
  },
  {
    name: 'Barangay Challenger',
    description: 'Contribute to a community-wide challenge.',
    icon: '🤝',
    tier: 'bronze',
    xpReward: 150,
    criteria: {
      type: 'special',
      target: 1,
    },
    category: 'community',
  },
  {
    name: 'Family Gathering',
    description: 'Create or join a Family Group on Palaro.',
    icon: '🏡',
    tier: 'bronze',
    xpReward: 150,
    criteria: {
      type: 'social',
      target: 1,
    },
    category: 'family',
  },
];

const seedAchievements = async () => {
  try {
    await Achievement.deleteMany({});
    console.log('🗑️ Deleted existing achievements');

    const seeded = await Achievement.insertMany(defaultAchievements);
    console.log(`✅ Seeded ${seeded.length} achievements into the database`);
  } catch (err) {
    console.error('❌ Error seeding achievements:', err.message);
    throw err;
  }
};

module.exports = seedAchievements;
