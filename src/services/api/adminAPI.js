import api from './index'

const adminAPI = {
  // Dashboard stats
  getStats: () => api.get('/admin/stats'),
  
  // User management
  getAllUsers: (page = 1, limit = 20, filters = {}) => 
    api.get('/admin/users', { params: { page, limit, ...filters } }),
  
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Challenge management
  getChallenges: (page = 1, limit = 20, filters = {}) => 
    api.get('/admin/challenges', { params: { page, limit, ...filters } }),
  
  updateChallenge: (id, updates) => api.put(`/admin/challenges/${id}`, updates),
  
  deleteChallenge: (id) => api.delete(`/admin/challenges/${id}`),
  
  // Analytics
  getAnalytics: (period = '7d') => 
    api.get('/admin/analytics', { params: { period } }),
  
  // Reports
  getReports: () => api.get('/admin/reports'),
  
  // Platform settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings)
}

export default adminAPI
