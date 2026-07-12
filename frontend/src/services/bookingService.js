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

export const getAllBookings = async () => {
  try {
    const response = await api.get('/api/v1/bookings')
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getBooking = async (bookingId) => {
  try {
    const response = await api.get(`/api/v1/bookings/${bookingId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getResourceBookings = async (resourceId) => {
  try {
    const response = await api.get(`/api/v1/bookings/resource/${resourceId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const createBooking = async (data) => {
  try {
    const response = await api.post('/api/v1/bookings', data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const rescheduleBooking = async (bookingId, data) => {
  try {
    const response = await api.put(`/api/v1/bookings/${bookingId}/reschedule`, data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.post(`/api/v1/bookings/${bookingId}/cancel`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export default api
