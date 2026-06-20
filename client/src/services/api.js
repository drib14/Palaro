import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // critical for sending cookies/refresh tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add access token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage/zustand store directly to avoid circular dependency
    const token = localStorage.getItem('palaro_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle token refresh on 401 response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to fetch new access token using refresh token cookie
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        
        if (res.data.success && res.data.data?.accessToken) {
          const newToken = res.data.data.accessToken;
          localStorage.setItem('palaro_token', newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Re-run original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token expired or invalid, log out user
        console.error('Refresh token failed:', refreshError);
        localStorage.removeItem('palaro_token');
        // Redirect to login if window is available
        if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
