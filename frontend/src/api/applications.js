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

export const applyToCampaign = async (campaignId, applicationData) => {
  const response = await axiosInstance.post('/api/applications', {
    campaignId,
    ...applicationData,
  });
  return response.data;
};

export const getMyApplications = async (campaignId = null) => {
  const params = campaignId ? { campaignId } : {};
  const response = await axiosInstance.get('/api/applications/my', { params });
  return response.data;
};

export const getCampaignApplications = async (campaignId) => {
  const response = await axiosInstance.get(`/api/applications/campaign/${campaignId}`);
  return response.data;
};

export const reviewApplication = async (applicationId, status, rejectionReason = null) => {
  const response = await axiosInstance.put(`/api/applications/${applicationId}/review`, {
    status,
    rejectionReason,
  });
  return response.data;
};

export const getPendingApplications = async (page = 1, limit = 20) => {
  const response = await axiosInstance.get('/api/applications/pending', {
    params: { page, limit },
  });
  return response.data;
};

export const adminApproveApplication = async (applicationId) => {
  const response = await axiosInstance.put(`/api/applications/${applicationId}/approve`);
  return response.data;
};

export const adminRejectApplication = async (applicationId, reason) => {
  const response = await axiosInstance.put(`/api/applications/${applicationId}/reject`, { reason });
  return response.data;
};

export const getApplicationById = async (applicationId) => {
  const response = await axiosInstance.get(`/api/applications/${applicationId}`);
  return response.data;
};
