import api from './index.js';

// Competition APIs
export const competitionAPI = {
  // Create a new competition
  createCompetition: (competitionData) => 
    api.post('/competitions', competitionData),
  
  // Get competitions (public and user's competitions)
  getCompetitions: (params = {}) => 
    api.get('/competitions', { params }),
  
  // Get competition by ID
  getCompetitionById: (id) => 
    api.get(`/competitions/${id}`),
  
  // Send invitation to user
  inviteUser: (competitionId, username) => 
    api.post(`/competitions/${competitionId}/invite`, { username }),
  
  // Respond to invitation
  respondToInvitation: (competitionId, response) => 
    api.post(`/competitions/${competitionId}/invitation/respond`, { response }),
  
  // Join public competition
  joinCompetition: (competitionId) => 
    api.post(`/competitions/${competitionId}/join`),
  
  // Start competition manually (creator only)
  startCompetition: (competitionId) => 
    api.post(`/competitions/${competitionId}/start`),
  
  // Submit solution for competition
  submitSolution: (competitionId, submissionData) => 
    api.post(`/competitions/${competitionId}/submit`, submissionData),
  
  // Auto-submit solution when time expires
  autoSubmitSolution: (competitionId, submissionData) => 
    api.post(`/competitions/${competitionId}/auto-submit`, submissionData),
  
  // End competition (creator or auto when time expires)
  endCompetition: (competitionId) => 
    api.post(`/competitions/${competitionId}/end`),
  
  // Get competition leaderboard
  getLeaderboard: (competitionId) => 
    api.get(`/competitions/${competitionId}/leaderboard`),
  
  // Add chat message
  sendChatMessage: (competitionId, message) => 
    api.post(`/competitions/${competitionId}/chat`, { message }),
  
  // Get user's competitions
  getMyCompetitions: (params = {}) => 
    api.get('/competitions/user/my-competitions', { params }),

  // Delete competition (creator only)
  deleteCompetition: (competitionId) => 
    api.delete(`/competitions/${competitionId}`),

  // Quick challenge friend (create 1v1 competition)
  challengeFriend: (username, challengeId, timeLimit = 60) => 
    api.post('/competitions', {
      title: `1v1 Challenge vs ${username}`,
      type: '1v1',
      challengeId,
      startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Start in 5 minutes
      timeLimit,
      maxParticipants: 2,
      isPublic: false,
      inviteUsername: username
    }),
  
  // Create group competition
  createGroupCompetition: (competitionData) => 
    api.post('/competitions', {
      ...competitionData,
      type: 'group'
    })
};
