import axios from 'axios';

// Resolve backend base url, checking Environment configurations
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request Interceptor: Attach authentication token to outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem('assetflow_user');
    if (savedUser) {
      try {
        const { token } = JSON.parse(savedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // Session corrupt or placeholder format
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global API error catch
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Unauthorized: clear corrupt/expired session and trigger refresh
      localStorage.removeItem('assetflow_user');
      window.location.href = '/login';
    } else if (status === 403) {
      // Forbidden: redirect to role limitation alert
      window.location.href = '/forbidden';
    } else if (status === 500) {
      // Internal Server Error: redirect to service outage layout
      window.location.href = '/server-error';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
