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

export const getCampaigns = async (filters = {}) => {
  const response = await axiosInstance.get('/api/campaigns', { params: filters });
  return response.data;
};

export const getMatchingCampaigns = async () => {
  const response = await axiosInstance.get('/api/campaigns/matching');
  return response.data;
};

export const getCampaignById = async (id) => {
  const response = await axiosInstance.get(`/api/campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (campaignData) => {
  const response = await axiosInstance.post('/api/campaigns', campaignData);
  return response.data;
};

export const updateCampaign = async (id, campaignData) => {
  const response = await axiosInstance.put(`/api/campaigns/${id}`, campaignData);
  return response.data;
};

export const updateCampaignStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/api/campaigns/${id}/status`, { status });
  return response.data;
};

export const getMyCampaigns = async () => {
  const response = await axiosInstance.get('/api/campaigns/my');
  return response.data;
};

export const deleteCampaign = async (id) => {
  const response = await axiosInstance.delete(`/api/campaigns/${id}`);
  return response.data;
};

export const getROIEstimate = async (id) => {
  const response = await axiosInstance.get(`/api/campaigns/${id}/roi-estimate`);
  return response.data;
};
