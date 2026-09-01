import api from './axiosConfig';

export const register = (userData) => 
    api.post('/api/auth/signup', userData);

export const login = (credentials) => 
    api.post('/api/auth/login', credentials);

export const logout = () => 
    api.post('/api/auth/logout');