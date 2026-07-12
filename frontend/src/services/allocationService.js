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

// ==================== ALLOCATIONS ====================

export const getAllocations = async () => {
  try {
    const response = await api.get('/api/v1/allocations')
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getAllocation = async (allocationId) => {
  try {
    const response = await api.get(
      `/api/v1/allocations/${allocationId}`
    )
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getAssetAllocation = async (assetId) => {
  try {
    const response = await api.get(
      `/api/v1/allocations/asset/${assetId}`
    )
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const createAllocation = async (data) => {
  try {
    const response = await api.post(
      '/api/v1/allocations',
      data
    )
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const requestReturn = async (
  allocationId,
  data
) => {
  try {
    const response = await api.post(
      `/api/v1/allocations/${allocationId}/return-request`,
      data
    )
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const approveReturn = async (
  allocationId,
  data
) => {
  try {
    const response = await api.post(
      `/api/v1/allocations/${allocationId}/approve-return`,
      data
    )
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// ==================== TRANSFERS ====================

export const getTransfers = async () => {
  try {
    const response = await api.get('/api/v1/transfers')
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getTransfer = async (transferId) => {
  try {
    const response = await api.get(
      `/api/v1/transfers/${transferId}`
    )
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const createTransfer = async (data) => {
  try {
    const response = await api.post(
      '/api/v1/transfers',
      data
    )
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const approveTransfer = async (
  transferId,
  data
) => {
  try {
    const response = await api.post(
      `/api/v1/transfers/${transferId}/approve`,
      data
    )
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const rejectTransfer = async (
  transferId,
  data
) => {
  try {
    const response = await api.post(
      `/api/v1/transfers/${transferId}/reject`,
      data
    )
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export default api
