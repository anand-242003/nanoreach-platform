import axios from 'axios';
import { getAuthToken } from '../lib/authToken';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPendingInfluencers = async (status = 'UNDER_REVIEW') => {
  const response = await axiosInstance.get('/api/admin/verifications/influencers', {
    params: { status },
  });
  return response.data;
};

export const getPendingBrands = async (status = 'UNDER_REVIEW') => {
  const response = await axiosInstance.get('/api/admin/verifications/brands', {
    params: { status },
  });
  return response.data;
};

export const getInfluencerDetails = async (id) => {
  const response = await axiosInstance.get(`/api/admin/verifications/influencers/${id}`);
  return response.data;
};

export const getBrandDetails = async (id) => {
  const response = await axiosInstance.get(`/api/admin/verifications/brands/${id}`);
  return response.data;
};

export const approveInfluencer = async (id, notes = '') => {
  const response = await axiosInstance.post(`/api/admin/verifications/influencers/${id}/approve`, { notes });
  return response.data;
};

export const rejectInfluencer = async (id, notes) => {
  const response = await axiosInstance.post(`/api/admin/verifications/influencers/${id}/reject`, { notes });
  return response.data;
};

export const approveBrand = async (id, notes = '') => {
  const response = await axiosInstance.post(`/api/admin/verifications/brands/${id}/approve`, { notes });
  return response.data;
};

export const rejectBrand = async (id, notes) => {
  const response = await axiosInstance.post(`/api/admin/verifications/brands/${id}/reject`, { notes });
  return response.data;
};
