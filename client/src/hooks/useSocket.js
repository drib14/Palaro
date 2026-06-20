import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if authenticated and token exists
    if (!isAuthenticated || !token) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      return;
    }

    // Initialize socket connection if not already created
    if (!socketInstance) {
      console.log('🔌 Connecting to socket server...');
      socketInstance = io(SOCKET_URL, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on('connect', () => {
        console.log('🔌 Socket connected successfully:', socketInstance.id);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('🔌 Socket connection error:', err.message);
      });

      socketInstance.on('disconnect', (reason) => {
        console.warn('🔌 Socket disconnected:', reason);
      });
    }

    socketRef.current = socketInstance;

    // Clean up when the main app loses auth (but do not disconnect on single hook unmounts to keep connection alive)
  }, [isAuthenticated, token]);

  return socketRef.current || socketInstance;
};

export default useSocket;
export { socketInstance };
