import api from './index.js';

// Discussion APIs
export const discussionAPI = {
  // Get discussions for a challenge
  getChallengeDiscussions: (challengeId, page = 1, limit = 20) => 
    api.get(`/discussions/challenge/${challengeId}`, { params: { page, limit } }),
  
  // Create a new discussion post
  createPost: (challengeId, postData) => 
    api.post(`/discussions/challenge/${challengeId}`, postData),
  
  // Get a specific discussion post
  getPost: (id) => api.get(`/discussions/${id}`),
  
  // Update a discussion post (author only)
  updatePost: (id, updates) => api.put(`/discussions/${id}`, updates),
  
  // Delete a discussion post (author only)
  deletePost: (id) => api.delete(`/discussions/${id}`),
  
  // Like/Unlike a discussion post
  likePost: (id) => api.post(`/discussions/${id}/like`),
  
  // Dislike/Undislike a discussion post
  dislikePost: (id) => api.post(`/discussions/${id}/dislike`),
  
  // Pin/Unpin a discussion post (moderators/admins only)
  pinPost: (id) => api.post(`/discussions/${id}/pin`)
};
