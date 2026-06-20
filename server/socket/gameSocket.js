const mongoose = require('mongoose');
const GameSession = require('../models/GameSession');
const User = require('../models/User');
const CollectionEntry = require('../models/CollectionEntry');
const Province = require('../models/Province');

const registerGameHandlers = (io, socket, connectedUsers) => {
  // Join game session room
  socket.on('game:join_session', async ({ sessionId }) => {
    try {
      if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
        return socket.emit('game:error', 'Invalid game session ID');
      }
      const session = await GameSession.findById(sessionId);
      if (!session) {
        return socket.emit('game:error', 'Game session not found');
      }

      socket.join(sessionId);
      console.log(`🕹️ Game: User ${socket.username} joined session room ${sessionId}`);
      
      // Let other players in room know a player joined
      socket.to(sessionId).emit('game:player_joined', {
        userId: socket.userId,
        username: socket.username,
      });

      // Send current session details back
      socket.emit('game:session_state', session);
    } catch (err) {
      console.error('Error joining game session:', err);
      socket.emit('game:error', 'Failed to join game session');
    }
  });

  // Handle in-game movement or game action broadcast
  socket.on('game:action', ({ sessionId, action, data }) => {
    // Broadcast action to the opponent in the same session
    socket.to(sessionId).emit('game:action_received', {
      senderId: socket.userId,
      senderUsername: socket.username,
      action,
      data,
    });
  });

  // Handle score updates
  socket.on('game:update_score', async ({ sessionId, score }) => {
    try {
      if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
        return;
      }
      const session = await GameSession.findById(sessionId);
      if (!session) return;

      const player = session.players.find(p => p.userId.toString() === socket.userId.toString());
      if (player) {
        player.score = score;
        await session.save();

        // Broadcast score update to session room
        io.to(sessionId).emit('game:score_updated', {
          userId: socket.userId,
          score,
        });
      }
    } catch (err) {
      console.error('Error updating game score:', err);
    }
  });

  // End game session
  socket.on('game:finish', async ({ sessionId, finalScores, winnerId }) => {
    try {
      if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
        return socket.emit('game:error', 'Invalid game session ID');
      }
      if (winnerId && !mongoose.Types.ObjectId.isValid(winnerId)) {
        winnerId = null;
      }
      const session = await GameSession.findById(sessionId);
      if (!session || session.status === 'completed') return;

      session.status = 'completed';
      session.winner = winnerId || null;
      
      // Update scores if provided
      if (finalScores && Array.isArray(finalScores)) {
        finalScores.forEach(fs => {
          const player = session.players.find(p => p.userId.toString() === fs.userId.toString());
          if (player) player.score = fs.score;
        });
      }

      await session.save();

      // Award XP to winner and participants
      const xpReward = 150; // default winner XP
      const participationXp = 50; // default participation XP

      for (const p of session.players) {
        const user = await User.findById(p.userId);
        if (!user) continue;

        const isWinner = winnerId && p.userId.toString() === winnerId.toString();
        const earnedXp = isWinner ? xpReward : participationXp;
        
        user.xp += earnedXp;
        user.level = Math.floor(user.xp / 1000) + 1; // Recalculate level

        // Add to games played history count
        await user.save();

        // Lazy initialize or update CollectionEntry
        await CollectionEntry.findOneAndUpdate(
          { userId: p.userId, gameId: session.gameId },
          { 
            $inc: { totalTimesPlayed: 1 }, 
            $setOnInsert: { gameSlug: session.gameSlug, unlocked: true },
            $max: { personalBestScore: p.score }
          },
          { upsert: true, new: true }
        );

        // Update Province total points if user has a province
        if (user.province) {
          const pointsGained = isWinner ? 10 : 3;
          await Province.findOneAndUpdate(
            { name: user.province },
            { $inc: { totalPoints: pointsGained, playerCount: 1 } },
            { upsert: true }
          );
        }
      }

      // Notify everyone in the session room of the final outcome
      io.to(sessionId).emit('game:ended', {
        sessionId,
        winnerId,
        players: session.players,
      });

      console.log(`🕹️ Game session ${sessionId} ended. Winner: ${winnerId}`);
    } catch (err) {
      console.error('Error finishing game session:', err);
      socket.emit('game:error', 'Failed to submit final game results');
    }
  });
};

module.exports = registerGameHandlers;
