import api from './index.js';

// Team APIs
export const teamAPI = {
  // Create a new team
  createTeam: (teamData) => api.post('/teams', teamData),
  
  // Get all public teams with pagination
  getPublicTeams: (page = 1, limit = 10) => 
    api.get('/teams', { params: { page, limit } }),
  
  // Get user's teams
  getMyTeams: () => api.get('/teams/my-teams'),
  
  // Get team by ID
  getTeamById: (id) => api.get(`/teams/${id}`),
  
  // Join a team
  joinTeam: (id) => api.post(`/teams/${id}/join`),
  
  // Leave a team
  leaveTeam: (id) => api.post(`/teams/${id}/leave`),
  
  // Update team (creator only)
  updateTeam: (id, updates) => api.put(`/teams/${id}`, updates),
  
  // Remove member (creator only)
  removeMember: (teamId, memberId) => 
    api.delete(`/teams/${teamId}/members/${memberId}`)
};
