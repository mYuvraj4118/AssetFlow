import apiClient from './axios';

const assetsService = {
  // Fetch all assets with optional filtering
  getAll: async (params = {}) => {
    const response = await apiClient.get('/assets', { params });
    return response.data;
  },

  // Fetch asset details by unique ID
  getById: async (id) => {
    const response = await apiClient.get(`/assets/${id}`);
    return response.data;
  },

  // Create/register a new asset
  create: async (assetData) => {
    const response = await apiClient.post('/assets', assetData);
    return response.data;
  },

  // Update existing asset details
  update: async (id, assetData) => {
    const response = await apiClient.put(`/assets/${id}`, assetData);
    return response.data;
  },

  // Remove asset profile from registry
  delete: async (id) => {
    const response = await apiClient.delete(`/assets/${id}`);
    return response.data;
  }
};

export default assetsService;
