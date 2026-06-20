const ChatMessage = require('../models/ChatMessage');

const registerChatHandlers = (io, socket, connectedUsers) => {
  // Join a chat room
  socket.on('chat:join', async (room) => {
    socket.join(room);
    console.log(`💬 User ${socket.username} joined chat room: ${room}`);
    
    // Notify room
    socket.to(room).emit('chat:system_message', {
      content: `${socket.username} joined the chat`,
      timestamp: new Date(),
    });
  });

  // Leave a chat room
  socket.on('chat:leave', (room) => {
    socket.leave(room);
    console.log(`💬 User ${socket.username} left chat room: ${room}`);
    
    socket.to(room).emit('chat:system_message', {
      content: `${socket.username} left the chat`,
      timestamp: new Date(),
    });
  });

  // Handle message sending
  socket.on('chat:send_message', async ({ room, content }) => {
    try {
      if (!content || content.trim() === '') return;

      const message = new ChatMessage({
        sender: socket.userId,
        room,
        content: content.trim(),
        senderUsername: socket.username, // utility field if needed, otherwise query from sender ref
      });

      await message.save();

      // Emit message to everyone in the room
      io.to(room).emit('chat:message', {
        _id: message._id,
        room,
        content: message.content,
        sender: {
          _id: socket.userId,
          username: socket.username,
        },
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error('Error handling socket chat message:', err);
      socket.emit('chat:error', 'Failed to send message');
    }
  });

  // Handle typing indicators
  socket.on('chat:typing', ({ room, isTyping }) => {
    socket.to(room).emit('chat:typing_update', {
      username: socket.username,
      isTyping,
    });
  });
};

module.exports = registerChatHandlers;
