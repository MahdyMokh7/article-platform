import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================
// Request Interceptor
// ============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================
// Response Interceptor
// ============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    // Handle 401 Unauthorized
    if (response?.status === 401) {
      const token = localStorage.getItem('authToken');
      
      // Only redirect if we had a token (session expired)
      if (token) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        
        // Redirect to login
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          toast.error('Your session has expired. Please login again.');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;