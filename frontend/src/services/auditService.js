import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getErrorMessage = (error) => {
  return (
    error.response?.data?.detail ||
    error.message ||
    'Something went wrong. Please try again.'
  );
};

export const getAudits = async () => {
  try {
    const response = await api.get('/api/audits');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAudit = async (auditId) => {
  try {
    const response = await api.get(`/api/audits/${auditId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createAudit = async (data) => {
  try {
    const response = await api.post('/api/audits', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const verifyAsset = async (auditId, assetTag, data) => {
  try {
    const response = await api.post(`/api/audits/${auditId}/verify?asset_tag=${assetTag}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const closeAudit = async (auditId) => {
  try {
    const response = await api.post(`/api/audits/${auditId}/close`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default api;
