import { useEffect } from 'react';
import useChatStore from '../store/chatStore';
import useSocket from './useSocket';

const useChat = (roomName) => {
  const socket = useSocket();
  const {
    messages,
    room,
    typingUsers,
    isLoading,
    setRoom,
    addMessage,
    addSystemMessage,
    fetchMessages,
    setTyping,
  } = useChatStore();

  useEffect(() => {
    if (!socket || !roomName) return;

    // Set active room and fetch history
    setRoom(roomName);
    fetchMessages(roomName);

    // Join socket room
    socket.emit('chat:join', roomName);

    // Listeners
    socket.on('chat:message', (message) => {
      addMessage(message);
    });

    socket.on('chat:system_message', (msg) => {
      addSystemMessage(msg);
    });

    socket.on('chat:typing_update', ({ username, isTyping }) => {
      setTyping(username, isTyping);
    });

    // Cleanup
    return () => {
      socket.emit('chat:leave', roomName);
      socket.off('chat:message');
      socket.off('chat:system_message');
      socket.off('chat:typing_update');
    };
  }, [socket, roomName, setRoom, fetchMessages, addMessage, addSystemMessage, setTyping]);

  const sendMessage = (content) => {
    if (socket && roomName && content.trim() !== '') {
      socket.emit('chat:send_message', { room: roomName, content });
    }
  };

  const sendTypingStatus = (isTyping) => {
    if (socket && roomName) {
      socket.emit('chat:typing', { room: roomName, isTyping });
    }
  };

  return {
    messages,
    room,
    typingUsers,
    isLoading,
    sendMessage,
    sendTypingStatus,
  };
};

export default useChat;
