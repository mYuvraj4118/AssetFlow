import apiClient from './axios';

const departmentsService = {
  // Fetch list of departments
  getAll: async () => {
    const response = await apiClient.get('/departments');
    return response.data;
  },

  // Create a new department grouping
  create: async (deptData) => {
    const response = await apiClient.post('/departments', deptData);
    return response.data;
  },

  // Update department meta information
  update: async (id, deptData) => {
    const response = await apiClient.put(`/departments/${id}`, deptData);
    return response.data;
  },

  // Remove department grouping
  delete: async (id) => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  }
};

export default departmentsService;
