import { useState, useCallback } from 'react';
import useNotification from './useNotification';

const useApi = (apiFunc, options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  // Asynchronously execute the service api function and store states
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'An unexpected API error occurred.';
        setError(message);
        
        // Push notification of the error unless disabled
        if (options.showToastOnError !== false) {
          showNotification(message, 'danger');
        }
        if (options.onError) {
          options.onError(err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, options, showNotification]
  );

  return {
    data,
    loading,
    error,
    execute,
    setData
  };
};

export default useApi;
