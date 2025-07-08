import api from './index'

const leaderboardAPI = {
  // Get leaderboard for a specific challenge
  getLeaderboard: async (challengeId, params) => {
    try {
      return await api.get(`/leaderboard/${challengeId}`, { params })
    } catch (error) {
      // Fallback to mock data if API fails
      console.log('Leaderboard API failed, using mock data')
      return {
        data: {
          success: true,
          data: []
        }
      }
    }
  },
  
  // Get global leaderboard
  getGlobalLeaderboard: async (params) => {
    try {
      return await api.get('/leaderboard/global', { params })
    } catch (error) {
      // Fallback to mock data if API fails
      console.log('Global leaderboard API failed, using mock data')
      return {
        data: {
          success: true,
          data: []
        }
      }
    }
  },
  
  // Get user rank in challenge
  getUserRank: async (challengeId, userId) => {
    try {
      return await api.get(`/leaderboard/${challengeId}/user/${userId}`)
    } catch (error) {
      console.log('User rank API failed, using mock data')
      return {
        data: {
          success: true,
          data: { rank: 0, score: 0 }
        }
      }
    }
  },
  
  // Get user's global rank
  getUserGlobalRank: async (userId) => {
    try {
      return await api.get(`/leaderboard/global/user/${userId}`)
    } catch (error) {
      console.log('User global rank API failed, using mock data')
      return {
        data: {
          success: true,
          data: { rank: 0, score: 0 }
        }
      }
    }
  },
  
  // Get leaderboard history
  getLeaderboardHistory: async (challengeId, params) => {
    try {
      return await api.get(`/leaderboard/${challengeId}/history`, { params })
    } catch (error) {
      console.log('Leaderboard history API failed, using mock data')
      return {
        data: {
          success: true,
          data: []
        }
      }
    }
  },
}

export default leaderboardAPI
