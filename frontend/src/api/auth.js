import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const signupAPI = async (userData) => {
  const response = await axiosInstance.post('/api/auth/signup', userData);
  return response.data;
};

export const loginAPI = async (credentials) => {
  const response = await axiosInstance.post('/api/auth/login', credentials);
  return response.data;
};

export const googleAuthAPI = async ({ credential, role }) => {
  try {
    const response = await axiosInstance.post('/api/auth/oauth/google', { credential, role });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      const fallback = await axiosInstance.post('/api/auth/google', { credential, role });
      return fallback.data;
    }
    throw error;
  }
};

export const logoutAPI = async () => {
  const response = await axiosInstance.post('/api/auth/logout');
  return response.data;
};

export const getMeAPI = async () => {
  const response = await axiosInstance.get('/api/auth/me');
  return response.data;
};

export const getVerificationStatusAPI = async () => {
  const response = await axiosInstance.get('/api/auth/verification-status');
  return response.data;
};
