const { Server } = require('socket.io');

const initializeSocket = (httpServer) => {
  const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
  
  const io = new Server(httpServer, {
    cors: {
      origin: clientURL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware for socket authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.userId = decoded.userId;
        socket.username = decoded.username;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    } else {
      next(new Error('Authentication required'));
    }
  });

  // Connection tracking
  const connectedUsers = new Map();

  const registerChatHandlers = require('../socket/chatSocket');
  const registerMatchmakingHandlers = require('../socket/matchmakingSocket');
  const registerGameHandlers = require('../socket/gameSocket');
  const registerPlaygroundHandlers = require('../socket/playgroundSocket');

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.username} (${socket.id})`);
    
    // Track connected user
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      username: socket.username,
      connectedAt: new Date(),
    });

    // Broadcast online users count
    io.emit('users:online', connectedUsers.size);

    // Register all module socket handlers
    registerChatHandlers(io, socket, connectedUsers);
    registerMatchmakingHandlers(io, socket, connectedUsers);
    registerGameHandlers(io, socket, connectedUsers);
    registerPlaygroundHandlers(io, socket, connectedUsers);

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.username} - ${reason}`);
      connectedUsers.delete(socket.userId);
      io.emit('users:online', connectedUsers.size);
    });
  });

  return { io, connectedUsers };
};

module.exports = { initializeSocket };
