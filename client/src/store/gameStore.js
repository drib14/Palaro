import { create } from 'zustand';
import api from '../services/api';

const useGameStore = create((set, get) => ({
  games: [],
  activeSession: null,
  matchmakingStatus: 'idle', // 'idle', 'searching', 'matched'
  opponent: null,
  score: 0,
  opponentScore: 0,
  isLoading: false,

  fetchGames: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/games');
      if (res.data.success && res.data.data?.games) {
        set({ games: res.data.data.games, isLoading: false });
      }
    } catch (err) {
      console.error('Failed to load games list:', err);
      set({ isLoading: false });
    }
  },

  setActiveSession: (session) => {
    set({ activeSession: session });
    if (!session) {
      set({ score: 0, opponentScore: 0, opponent: null, matchmakingStatus: 'idle' });
    }
  },

  setMatchmakingStatus: (status) => set({ matchmakingStatus: status }),
  
  setOpponent: (opponent) => set({ opponent }),

  updateScore: (score) => set({ score }),
  
  updateOpponentScore: (opponentScore) => set({ opponentScore }),

  submitGameResult: async (sessionId, finalScore, winnerId) => {
    try {
      const res = await api.post(`/games/sessions/${sessionId}/end`, {
        score: finalScore,
        winnerId,
      });
      return res.data;
    } catch (err) {
      console.error('Failed to submit game result:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to finish game session' };
    }
  }
}));

export default useGameStore;
