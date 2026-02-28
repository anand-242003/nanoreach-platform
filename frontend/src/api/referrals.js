import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const trackClick = async (code) => {
  const response = await axiosInstance.get(`/api/referral/r/${code}`);
  return response.data;
};

export const getMyReferralStats = async () => {
  const response = await axiosInstance.get('/api/referral/my-stats');
  return response.data;
};

export const getCampaignReferralStats = async (campaignId) => {
  const response = await axiosInstance.get(`/api/referral/campaign/${campaignId}/stats`);
  return response.data;
};

export const getReferralLinkInfo = async (code) => {
  const response = await axiosInstance.get(`/api/referral/info/${code}`);
  return response.data;
};

export const trackConversion = async (code, revenue, metadata = {}) => {
  const response = await axiosInstance.post(`/api/referral/${code}/conversion`, {
    revenue,
    metadata,
  });
  return response.data;
};
