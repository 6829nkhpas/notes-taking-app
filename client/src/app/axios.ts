import axios from 'axios';

export const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true 
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stored user data on auth failure
      localStorage.removeItem('user');
      window.location.href = '/signup';
    }
    return Promise.reject(error);
  }
);
