import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const createInfluencerProfile = async (formData) => {
  const response = await axiosInstance.post('/api/profile/influencer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateInfluencerProfile = async (formData) => {
  const response = await axiosInstance.put('/api/profile/influencer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createBrandProfile = async (formData) => {
  const response = await axiosInstance.post('/api/profile/brand', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateBrandProfile = async (formData) => {
  const response = await axiosInstance.put('/api/profile/brand', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMyProfile = async () => {
  const response = await axiosInstance.get('/api/profile/me');
  return response.data;
};

export const submitInfluencerOnboarding = async (step, data) => {
  const formData = new FormData();
  
  if (step === 'basic') {
    formData.append('displayName', data.displayName);
    formData.append('location', data.location);
    formData.append('bio', data.bio);
    formData.append('youtubeChannelUrl', data.youtubeChannelUrl);
  } else if (step === 'social') {
    if (data.socialLinks) {
      formData.append('socialLinks', JSON.stringify(data.socialLinks));
    }
  } else if (step === 'documents') {
    if (data.document) {
      formData.append('document', data.document);
    }
    if (data.panNumber) {
      formData.append('panNumber', data.panNumber);
    }
  }
  
  const response = await axiosInstance.post(`/api/influencer/onboarding/${step}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const submitForVerification = async () => {
  const response = await axiosInstance.post('/api/influencer/submit-verification');
  return response.data;
};
