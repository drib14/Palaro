import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('palaro_token') || null,
  isAuthenticated: false,
  isLoading: !!localStorage.getItem('palaro_token'),
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('palaro_token', token);
    } else {
      localStorage.removeItem('palaro_token');
    }
    set({ token });
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        get().setToken(res.data.accessToken);
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data.success) {
        get().setToken(res.data.accessToken);
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      get().setToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await api.get('/users/profile');
      if (res.data.success) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      }
    } catch (err) {
      console.warn('CheckAuth profile call failed, clearing token states');
      get().setToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await api.put('/users/profile', profileData);
      if (res.data.success) {
        set({ user: res.data.user });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      return { success: false, error: msg };
    }
  }
}));

export default useAuthStore;
