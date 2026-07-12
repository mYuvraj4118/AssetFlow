import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const getErrorMessage = (error) => {
  return (
    error.response?.data?.detail ||
    error.message ||
    'Something went wrong. Please try again.'
  )
}

export const getMaintenanceRequests = async () => {
  try {
    const response = await api.get('/api/v1/maintenance')
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMaintenanceRequest = async (requestId) => {
  try {
    const response = await api.get(`/api/v1/maintenance/${requestId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const createMaintenanceRequest = async (data) => {
  try {
    const response = await api.post('/api/v1/maintenance', data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const approveMaintenanceRequest = async (requestId, data) => {
  try {
    const response = await api.post(`/api/v1/maintenance/${requestId}/approve`, data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const rejectMaintenanceRequest = async (requestId, data) => {
  try {
    const response = await api.post(`/api/v1/maintenance/${requestId}/reject`, data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const assignTechnician = async (requestId, data) => {
  try {
    const response = await api.post(`/api/v1/maintenance/${requestId}/assign-technician`, data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const startMaintenance = async (requestId) => {
  try {
    const response = await api.post(`/api/v1/maintenance/${requestId}/start`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const resolveMaintenance = async (requestId, data) => {
  try {
    const response = await api.post(`/api/v1/maintenance/${requestId}/resolve`, data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export default api
