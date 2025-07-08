import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and mock data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is not available, return mock data
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      const url = error.config.url
      const method = error.config.method?.toUpperCase()
      
      // Mock challenge endpoints
      if (method === 'GET' && url.includes('/challenges/')) {
        const challengeId = url.split('/challenges/')[1]?.split('/')[0]
        if (challengeId && mockChallenges[challengeId]) {
          return Promise.resolve({
            data: {
              success: true,
              data: mockChallenges[challengeId]
            }
          })
        }
      }
      
      if (method === 'GET' && url === '/challenges') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              challenges: Object.values(mockChallenges),
              total: Object.keys(mockChallenges).length,
              page: 1,
              limit: 10
            }
          }
        })
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
