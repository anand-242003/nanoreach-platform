import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const getBankDetails = async () => {
  const response = await axiosInstance.get('/api/escrow/bank-details');
  return response.data;
};

export const getMyPendingEscrows = async () => {
  const response = await axiosInstance.get('/api/escrow/my-pending');
  return response.data;
};

export const createEscrow = async (campaignId) => {
  const response = await axiosInstance.post(`/api/escrow/campaigns/${campaignId}/create`);
  return response.data;
};

export const getEscrowStatus = async (campaignId) => {
  const response = await axiosInstance.get(`/api/escrow/campaigns/${campaignId}/status`);
  return response.data;
};

export const confirmPayment = async (campaignId, paymentReference) => {
  const response = await axiosInstance.post(`/api/escrow/campaigns/${campaignId}/confirm-payment`, {
    paymentReference,
  });
  return response.data;
};

export const getPendingEscrows = async () => {
  const response = await axiosInstance.get('/api/escrow/pending');
  return response.data;
};

export const verifyAndFundEscrow = async (escrowId, notes = '') => {
  const response = await axiosInstance.post(`/api/escrow/${escrowId}/verify`, { notes });
  return response.data;
};

export const rejectPayment = async (escrowId, reason) => {
  const response = await axiosInstance.post(`/api/escrow/${escrowId}/reject`, { reason });
  return response.data;
};

export const releaseEscrow = async (escrowId, notes = '') => {
  const response = await axiosInstance.post(`/api/escrow/${escrowId}/release`, { notes });
  return response.data;
};

export const refundEscrow = async (escrowId, reason) => {
  const response = await axiosInstance.post(`/api/escrow/${escrowId}/refund`, { reason });
  return response.data;
};
