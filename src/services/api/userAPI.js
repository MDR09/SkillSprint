import api from './index'

const userAPI = {
  // Search users by username or name
  searchUsers: (query, excludeId) =>
    api.get('/users/search', { params: { q: query, exclude: excludeId } }),

  // Get user profile by ID
  getUserById: (id) => api.get(`/users/${id}`),

  // Get user profile by username
  getUserByUsername: (username) => api.get(`/users/username/${username}`),

  // Get user statistics
  getUserStats: (id) => api.get(`/users/${id}/stats`),

  // Update user profile
  updateProfile: (data) => api.put('/users/profile', data),

  // Follow/unfollow user
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),

  // Get user's followers
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),

  // Get user's following
  getFollowing: (userId) => api.get(`/users/${userId}/following`),

  // Get online users
  getOnlineUsers: () => api.get('/users/online'),

  // Get leaderboard users
  getTopUsers: (params) => api.get('/users/leaderboard', { params })
}

export default userAPI
