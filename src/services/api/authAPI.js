import api from './index'

// Mock user data for demo purposes
const mockUser = {
  id: '1',
  name: 'Demo User',
  username: 'demouser',
  email: 'demo@example.com',
  avatar: null,
  role: 'user',
  stats: {
    totalSolved: 15,
    totalSubmissions: 42,
    totalPoints: 350,
    rank: 156
  },
  createdAt: new Date().toISOString()
}

const authAPI = {
  // User authentication
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials)
    } catch (error) {
      // Mock login for demo
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        const mockToken = 'mock-jwt-token-' + Date.now()
        localStorage.setItem('token', mockToken)
        return {
          data: {
            success: true,
            token: mockToken,
            user: mockUser
          }
        }
      }
      throw error
    }
  },
  
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData)
    } catch (error) {
      // Mock register for demo
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        const mockToken = 'mock-jwt-token-' + Date.now()
        localStorage.setItem('token', mockToken)
        return {
          data: {
            success: true,
            token: mockToken,
            user: { ...mockUser, ...userData }
          }
        }
      }
      throw error
    }
  },
  
  logout: () => api.post('/auth/logout'),
  
  // OAuth authentication
  githubAuth: () => window.location.href = `${api.defaults.baseURL}/auth/github`,
  googleAuth: () => window.location.href = `${api.defaults.baseURL}/auth/google`,
  
  // User profile
  getProfile: async () => {
    try {
      return await api.get('/auth/profile')
    } catch (error) {
      // Handle rate limiting
      if (error.response?.status === 429) {
        console.warn('Rate limit exceeded. Please wait before making more requests.')
        throw new Error('Too many requests from this IP, please try again later.')
      }
      
      // Mock profile for demo
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        return {
          data: {
            success: true,
            user: mockUser
          }
        }
      }
      throw error
    }
  },
  
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Password reset
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  
  // Email verification
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
}

export default authAPI
