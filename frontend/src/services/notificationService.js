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

export const getNotifications = async (userId = null) => {
  try {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/api/notifications', { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getUnreadNotifications = async (userId = null) => {
  try {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/api/notifications/unread', { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const markAsRead = async (notifId) => {
  try {
    const response = await api.patch(`/api/notifications/${notifId}/read`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const markAllAsRead = async (userId = null) => {
  try {
    const params = userId ? { user_id: userId } : {};
    const response = await api.patch('/api/notifications/read-all', null, { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteNotification = async (notifId) => {
  try {
    const response = await api.delete(`/api/notifications/${notifId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const clearAllNotifications = async (userId = null) => {
  try {
    const params = userId ? { user_id: userId } : {};
    const response = await api.delete('/api/notifications', { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getActivityLogs = async (filters = {}) => {
  try {
    const params = {};
    if (filters.module) params.module = filters.module;
    if (filters.user) params.user = filters.user;
    if (filters.status) params.action_status = filters.status;

    const response = await api.get('/api/activity-logs', { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await api.get('/api/activity-logs/recent', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default api;
