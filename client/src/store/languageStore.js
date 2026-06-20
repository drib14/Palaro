import { create } from 'zustand';
import { translations } from '../utils/translations';

const useLanguageStore = create((set, get) => ({
  language: localStorage.getItem('palaro_lang') || 'fil', // 'fil' (Filipino) or 'en' (English)
  
  setLanguage: (lang) => {
    localStorage.setItem('palaro_lang', lang);
    set({ language: lang });
  },

  // Translation helper function
  t: (key) => {
    const lang = get().language;
    const translation = translations[lang]?.[key];
    if (translation) return translation;
    
    // Fallback English
    const fallback = translations['en']?.[key];
    return fallback || key;
  }
}));

export default useLanguageStore;
export { translations };
