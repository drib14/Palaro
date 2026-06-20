import { useEffect } from 'react';
import useCharacterStore from '../store/characterStore';
import useAuthStore from '../store/authStore';

const useCharacter = () => {
  const { isAuthenticated } = useAuthStore();
  const {
    character,
    wardrobe,
    isLoading,
    error,
    fetchCharacter,
    saveCharacter,
    setLocalCustomization,
    fetchWardrobe,
  } = useCharacterStore();

  useEffect(() => {
    if (isAuthenticated && !character && !isLoading) {
      fetchCharacter();
      fetchWardrobe();
    }
  }, [isAuthenticated, character, isLoading, fetchCharacter, fetchWardrobe]);

  return {
    character,
    wardrobe,
    isLoading,
    error,
    saveCharacter,
    setLocalCustomization,
  };
};

export default useCharacter;
