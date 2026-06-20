const mongoose = require('mongoose');
const User = require('../server/models/User');
const Game = require('../server/models/Game');

console.log('User schema indexes:');
console.log(JSON.stringify(User.schema.indexes(), null, 2));

console.log('Game schema indexes:');
console.log(JSON.stringify(Game.schema.indexes(), null, 2));

process.exit(0);
