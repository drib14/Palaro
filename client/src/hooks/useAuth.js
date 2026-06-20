import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
  } = useAuthStore();

  // Initial check on mount
  useEffect(() => {
    if (!isAuthenticated && token) {
      checkAuth();
    }
  }, [isAuthenticated, token, checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };
};

export default useAuth;
