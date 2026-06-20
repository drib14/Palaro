import { create } from 'zustand';
import api from '../services/api';

const defaultCharacter = {
  gender: 'male',
  skinTone: '#E0A96D', // Pinoy brown skin default
  hairstyle: 'hair-default',
  hairColor: '#000000',
  shirt: 'shirt-default',
  pants: 'pants-default',
  shoes: 'shoes-default',
  accessories: 'none',
};

const useCharacterStore = create((set, get) => ({
  character: null,
  wardrobe: [],
  isLoading: true,
  error: null,

  fetchCharacter: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/characters/me');
      if (res.data.success && res.data.character) {
        set({ character: res.data.character, isLoading: false });
      } else {
        // Fallback default
        set({ character: { ...defaultCharacter }, isLoading: false });
      }
    } catch (err) {
      console.warn('Failed to fetch character. Using default values.');
      set({ character: { ...defaultCharacter }, isLoading: false });
    }
  },

  saveCharacter: async (customizationConfig) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put('/characters/me', customizationConfig);
      if (res.data.success) {
        set({ character: res.data.character, isLoading: false });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save character';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  setLocalCustomization: (field, value) => {
    set((state) => ({
      character: {
        ...state.character,
        [field]: value,
      },
    }));
  },

  fetchWardrobe: async () => {
    try {
      // Stub wardrobe list (unlocked items matching standard visual assets)
      const wardrobeItems = [
        { id: 'shirt-default', name: 'Barong Tagalog', category: 'shirt', unlocked: true, price: 0 },
        { id: 'shirt-jersey', name: 'Pinoy Jersey', category: 'shirt', unlocked: true, price: 0 },
        { id: 'shirt-tshirt', name: 'Palaro T-Shirt', category: 'shirt', unlocked: true, price: 0 },
        { id: 'pants-default', name: 'School Slacks', category: 'pants', unlocked: true, price: 0 },
        { id: 'pants-shorts', name: 'Palaro Shorts', category: 'pants', unlocked: true, price: 0 },
        { id: 'shoes-default', name: 'Classic Slippers', category: 'shoes', unlocked: true, price: 0 },
        { id: 'shoes-rubber', name: 'Pinoy Sneakers', category: 'shoes', unlocked: true, price: 0 },
        { id: 'hair-default', name: 'Classic Crop', category: 'hairstyle', unlocked: true, price: 0 },
        { id: 'hair-long', name: 'Ponytail', category: 'hairstyle', unlocked: true, price: 0 },
        { id: 'hair-curly', name: 'Pinoy Wavy', category: 'hairstyle', unlocked: true, price: 0 },
        { id: 'accessory-salakot', name: 'Salakot Hat', category: 'accessories', unlocked: true, price: 100 },
        { id: 'accessory-bandana', name: 'Katipunan Bandana', category: 'accessories', unlocked: true, price: 150 },
      ];
      set({ wardrobe: wardrobeItems });
    } catch (err) {
      console.error('Error fetching wardrobe:', err);
    }
  }
}));

export default useCharacterStore;
export { defaultCharacter };
