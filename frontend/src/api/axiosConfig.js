import axios from 'axios';
import { toast } from 'react-toastify';
// import { config as appConfig } from './config';
import {config as appConfig} from '../config';

const api = axios.create({
  baseURL: appConfig.API_URL, // Points to http://localhost:5000
  withCredentials: true,
});

// Request interceptor: Attach token to Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Catch token expiration (401 / 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRoute = requestUrl.includes('/api/auth/login') ||
        requestUrl.includes('/api/auth/signup') ||
        requestUrl.includes('/api/auth/logout');

      // Only redirect if the request wasn't a login/signup attempt itself
      if (!isAuthRoute) {
        // Log the exact failing endpoint to your console for debugging
        console.error(`[Auth Error] ${error.response.status} on route: ${requestUrl}`);

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;