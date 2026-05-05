import axios from 'axios';

// Dev: omit VITE_API_URL — use relative `/api` so Vite proxies to the backend (vite.config.ts).
// If you set VITE_API_URL to an absolute URL, the browser calls it directly (CORS + host must be up).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Interceptor to add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sophix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle common errors (like unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sophix_token');
      // Potential redirect to login can be handled by the context/router
    }
    return Promise.reject(error);
  }
);

export default api;
