import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    try {
      const stored = JSON.parse(localStorage.getItem('resq-connect-storage') || '{}');
      const token = stored?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // localStorage parse error, continue without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      try {
        const stored = JSON.parse(localStorage.getItem('resq-connect-storage') || '{}');
        if (stored?.state?.isAuthenticated) {
          localStorage.removeItem('resq-connect-storage');
          window.location.href = '/login?expired=true';
        }
      } catch (e) {}
    }
    // Only log server errors (5xx), not client errors (4xx) which are expected
    if (error.response?.status >= 500) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.status);
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
