const GameSession = require('../models/GameSession');
const Game = require('../models/Game');

// Queues mapped by game slug: { [gameSlug]: Array<{ userId, socketId, username }> }
const queues = {};

const registerMatchmakingHandlers = (io, socket, connectedUsers) => {
  
  socket.on('matchmaking:join', async ({ gameSlug }) => {
    try {
      console.log(`🎮 Matchmaking: ${socket.username} searching for ${gameSlug}`);
      
      const game = await Game.findOne({ slug: gameSlug });
      if (!game) {
        return socket.emit('matchmaking:error', 'Game not found');
      }

      // Initialize queue for game slug if it doesn't exist
      if (!queues[gameSlug]) {
        queues[gameSlug] = [];
      }

      // Check if user is already in queue
      const alreadyInQueue = queues[gameSlug].some(p => p.userId === socket.userId);
      if (alreadyInQueue) {
        return socket.emit('matchmaking:status', { status: 'searching', gameSlug });
      }

      // Add to queue
      const playerInfo = {
        userId: socket.userId,
        username: socket.username,
        socketId: socket.id,
      };
      
      queues[gameSlug].push(playerInfo);
      
      socket.emit('matchmaking:status', { status: 'searching', gameSlug });

      // Matchmaking logic (1v1 matches for simplicity)
      if (queues[gameSlug].length >= 2) {
        const player1 = queues[gameSlug].shift();
        const player2 = queues[gameSlug].shift();

        console.log(`🎯 Match found for ${gameSlug}: ${player1.username} vs ${player2.username}`);

        // Create game session
        const session = new GameSession({
          gameId: game._id,
          gameSlug: gameSlug,
          mode: 'PVP',
          status: 'active',
          players: [
            { userId: player1.userId, score: 0 },
            { userId: player2.userId, score: 0 }
          ],
        });

        await session.save();

        // Notify both players
        io.to(player1.socketId).emit('matchmaking:matched', {
          sessionId: session._id,
          opponent: player2.username,
          gameSlug,
        });

        io.to(player2.socketId).emit('matchmaking:matched', {
          sessionId: session._id,
          opponent: player1.username,
          gameSlug,
        });
      }
    } catch (err) {
      console.error('Matchmaking error:', err);
      socket.emit('matchmaking:error', 'Failed to join matchmaking queue');
    }
  });

  socket.on('matchmaking:leave', ({ gameSlug }) => {
    if (queues[gameSlug]) {
      queues[gameSlug] = queues[gameSlug].filter(p => p.userId !== socket.userId);
      console.log(`🎮 Matchmaking: ${socket.username} left queue for ${gameSlug}`);
      socket.emit('matchmaking:status', { status: 'idle' });
    }
  });

  socket.on('disconnect', () => {
    // Clean up queues on disconnect
    Object.keys(queues).forEach(gameSlug => {
      queues[gameSlug] = queues[gameSlug].filter(p => p.userId !== socket.userId);
    });
  });
};

module.exports = registerMatchmakingHandlers;
