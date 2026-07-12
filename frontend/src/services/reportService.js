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

export const getDashboardKPIs = async () => {
  try {
    const response = await api.get('/api/reports/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAssetUtilization = async () => {
  try {
    const response = await api.get('/api/reports/assets');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getDepartmentAnalytics = async () => {
  try {
    const response = await api.get('/api/reports/departments');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getMaintenanceAnalytics = async () => {
  try {
    const response = await api.get('/api/reports/maintenance');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getBookingAnalytics = async () => {
  try {
    const response = await api.get('/api/reports/bookings');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAuditAnalytics = async () => {
  try {
    const response = await api.get('/api/reports/audits');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getUpcomingRetirement = async () => {
  try {
    const response = await api.get('/api/reports/retirement');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const exportCSV = async (reportType, filters = {}) => {
  try {
    const response = await api.post('/api/reports/export/csv', {
      report_type: reportType,
      filters: filters,
      format: 'csv'
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const exportPDF = async (reportType, filters = {}) => {
  try {
    const response = await api.post('/api/reports/export/pdf', {
      report_type: reportType,
      filters: filters,
      format: 'pdf'
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default api;
