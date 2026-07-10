import api from './axiosConfig';

/**
 * Authentication API Service
 * Handles user registration, login, profile management
 */

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/users/password', passwordData);
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Ignore errors on logout
  }
};