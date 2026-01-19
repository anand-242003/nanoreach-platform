import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const signupAPI = async (userData) => {
  const response = await axiosInstance.post('/auth/signup', userData);
  return response.data;
};

export const loginAPI = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

export const getMeAPI = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const getVerificationStatusAPI = async () => {
  const response = await axiosInstance.get('/auth/verification-status');
  return response.data;
};
