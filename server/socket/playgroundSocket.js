// Track playground states in-memory: { [userId]: { socketId, username, x, y, character, lastActive } }
const playgroundPlayers = new Map();

const registerPlaygroundHandlers = (io, socket, connectedUsers) => {
  
  // Join Virtual Playground
  socket.on('playground:join', ({ x = 100, y = 100, character }) => {
    console.log(`🏰 Playground: ${socket.username} joined the playground at (${x}, ${y})`);
    
    // Save state
    playgroundPlayers.set(socket.userId, {
      userId: socket.userId,
      socketId: socket.id,
      username: socket.username,
      x,
      y,
      character, // customization config object (gender, skinTone, shirt, pants, etc)
      lastActive: new Date(),
    });

    // Join playground socket room
    socket.join('playground');

    // Send the list of current players to the joining player
    const currentPlayers = Array.from(playgroundPlayers.values());
    socket.emit('playground:users_list', currentPlayers);

    // Broadcast the new player's presence to all existing players
    socket.to('playground').emit('playground:user_joined', {
      userId: socket.userId,
      username: socket.username,
      socketId: socket.id,
      x,
      y,
      character,
    });
  });

  // Handle position updates
  socket.on('playground:move', ({ x, y, direction }) => {
    const player = playgroundPlayers.get(socket.userId);
    if (player) {
      player.x = x;
      player.y = y;
      player.direction = direction;
      player.lastActive = new Date();

      // Broadcast position update to all other playground players
      socket.to('playground').emit('playground:user_moved', {
        userId: socket.userId,
        x,
        y,
        direction,
      });
    }
  });

  // Handle proximity / instant chat bubbles
  socket.on('playground:bubble', ({ message }) => {
    if (!message || message.trim() === '') return;
    
    // Broadcast speech bubble
    socket.to('playground').emit('playground:bubble_received', {
      userId: socket.userId,
      username: socket.username,
      message: message.trim(),
    });
  });

  // Leave playground
  socket.on('playground:leave', () => {
    console.log(`🏰 Playground: ${socket.username} left the playground`);
    socket.leave('playground');
    playgroundPlayers.delete(socket.userId);

    // Broadcast player exit
    socket.to('playground').emit('playground:user_left', {
      userId: socket.userId,
    });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    if (playgroundPlayers.has(socket.userId)) {
      playgroundPlayers.delete(socket.userId);
      socket.to('playground').emit('playground:user_left', {
        userId: socket.userId,
      });
    }
  });
};

module.exports = registerPlaygroundHandlers;
