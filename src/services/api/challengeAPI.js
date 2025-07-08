import api from './index'

const challengeAPI = {
  // Get all challenges with filters and pagination
  getAllChallenges: (params) => api.get('/challenges', { params }),
  
  // Get challenge by ID
  getChallengeById: (id) => api.get(`/challenges/${id}`),
  
  // Create new challenge (organizer only)
  createChallenge: (challengeData) => api.post('/challenges', challengeData),
  
  // Update challenge (organizer only)
  updateChallenge: (id, challengeData) => api.put(`/challenges/${id}`, challengeData),
  
  // Delete challenge (organizer only)
  deleteChallenge: (id) => api.delete(`/challenges/${id}`),
  
  // Join challenge
  joinChallenge: (id) => api.post(`/challenges/${id}/join`),
  
  // Leave challenge
  leaveChallenge: (id) => api.post(`/challenges/${id}/leave`),
  
  // Get challenge participants
  getChallengeParticipants: (id) => api.get(`/challenges/${id}/participants`),
  
  // Get my challenges
  getMyChallenges: () => api.get('/challenges/my'),
  
  // Get created challenges (organizer)
  getCreatedChallenges: () => api.get('/challenges/created'),
  
  // Search challenges
  searchChallenges: (query) => api.get('/challenges/search', { params: { q: query } }),
  
  // Get challenge categories
  getCategories: () => api.get('/challenges/categories'),
  
  // Get featured challenges
  getFeaturedChallenges: () => api.get('/challenges/featured'),
}

export default challengeAPI
