import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
  messages: [],
  room: null,
  typingUsers: [],
  isLoading: false,

  setRoom: (room) => {
    set({ room, messages: [], typingUsers: [] });
  },

  addMessage: (message) => {
    set((state) => {
      // Avoid duplicate messages
      const exists = state.messages.some((m) => m._id === message._id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    });
  },

  addSystemMessage: (message) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          _id: `sys-${Date.now()}-${Math.random()}`,
          isSystem: true,
          content: message.content,
          createdAt: message.timestamp || new Date(),
        },
      ],
    }));
  },

  fetchMessages: async (room) => {
    if (!room) return;
    set({ isLoading: true });
    try {
      const res = await api.get(`/chat/${room}`);
      if (res.data.success && res.data.data?.messages) {
        set({ messages: res.data.data.messages, isLoading: false });
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      set({ isLoading: false });
    }
  },

  setTyping: (username, isTyping) => {
    set((state) => {
      const current = [...state.typingUsers];
      if (isTyping && !current.includes(username)) {
        current.push(username);
      } else if (!isTyping) {
        return { typingUsers: current.filter((u) => u !== username) };
      }
      return { typingUsers: current };
    });
  },
}));

export default useChatStore;
