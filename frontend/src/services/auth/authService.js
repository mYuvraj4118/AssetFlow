import apiClient from '../api/axios';

const authService = {
  // Signs user in and receives session details
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  // Creates a member profile
  register: async (name, email, password) => {
    const response = await apiClient.post('/auth/register', { name, email, password });
    return response.data;
  },

  // Requests email validation link
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Verifies account with pin code
  verifyEmail: async (code) => {
    const response = await apiClient.post('/auth/verify-email', { code });
    return response.data;
  },

  // Verifies token during initial session lookups
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

export default authService;
