import axios from 'axios';

export const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true 
});

// Add request interceptor to include token from localStorage as fallback
api.interceptors.request.use(
  (config) => {
    // If no Authorization header is set, try to get token from localStorage
    if (!config.headers.Authorization) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Log the error but don't redirect automatically
      // Let the components handle authentication errors
      console.log('Axios: 401 Unauthorized response received');
      console.log('Axios: Response data:', error.response?.data);
      console.log('Axios: Request config:', error.config);
    }
    return Promise.reject(error);
  }
);
