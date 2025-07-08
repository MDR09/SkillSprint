export const setupSocketIO = (io) => {
  // Real-time leaderboard updates
  const updateLeaderboard = (challengeId, leaderboardData) => {
    io.to(`challenge_${challengeId}`).emit('leaderboard_update', leaderboardData)
  }

  // Real-time submission results
  const broadcastSubmissionResult = (challengeId, submissionResult) => {
    io.to(`challenge_${challengeId}`).emit('submission_result', submissionResult)
  }

  // Challenge status updates
  const broadcastChallengeUpdate = (challengeId, update) => {
    io.to(`challenge_${challengeId}`).emit('challenge_update', update)
  }

  // Admin announcements
  const broadcastAnnouncement = (announcement) => {
    io.emit('announcement', announcement)
  }

  // Team/collaboration features
  const handleTeamCollaboration = (teamId, data) => {
    io.to(`team_${teamId}`).emit('team_update', data)
  }

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.id}`)

    // Join challenge room
    socket.on('join_challenge', (challengeId) => {
      socket.join(`challenge_${challengeId}`)
      socket.challengeId = challengeId
      console.log(`👤 User ${socket.id} joined challenge ${challengeId}`)
      
      // Notify others in the challenge
      socket.to(`challenge_${challengeId}`).emit('user_joined', {
        socketId: socket.id,
        timestamp: new Date()
      })
    })

    // Leave challenge room
    socket.on('leave_challenge', (challengeId) => {
      socket.leave(`challenge_${challengeId}`)
      console.log(`👋 User ${socket.id} left challenge ${challengeId}`)
      
      // Notify others in the challenge
      socket.to(`challenge_${challengeId}`).emit('user_left', {
        socketId: socket.id,
        timestamp: new Date()
      })
    })

    // Join team room for collaboration
    socket.on('join_team', (teamId) => {
      socket.join(`team_${teamId}`)
      socket.teamId = teamId
      console.log(`👥 User ${socket.id} joined team ${teamId}`)
    })

    // Handle real-time code sharing for team challenges
    socket.on('code_update', (data) => {
      if (socket.teamId) {
        socket.to(`team_${socket.teamId}`).emit('code_sync', {
          userId: data.userId,
          code: data.code,
          language: data.language,
          timestamp: new Date()
        })
      }
    })

    // Handle chat messages in challenges
    socket.on('challenge_message', (data) => {
      if (socket.challengeId) {
        io.to(`challenge_${socket.challengeId}`).emit('new_message', {
          userId: data.userId,
          username: data.username,
          message: data.message,
          timestamp: new Date()
        })
      }
    })

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      if (socket.challengeId) {
        socket.to(`challenge_${socket.challengeId}`).emit('user_typing', {
          userId: data.userId,
          username: data.username
        })
      }
    })

    socket.on('typing_stop', (data) => {
      if (socket.challengeId) {
        socket.to(`challenge_${socket.challengeId}`).emit('user_stopped_typing', {
          userId: data.userId
        })
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`)
      
      // Notify challenge participants
      if (socket.challengeId) {
        socket.to(`challenge_${socket.challengeId}`).emit('user_left', {
          socketId: socket.id,
          timestamp: new Date()
        })
      }

      // Notify team members
      if (socket.teamId) {
        socket.to(`team_${socket.teamId}`).emit('team_member_left', {
          socketId: socket.id,
          timestamp: new Date()
        })
      }
    })
  })

  // Expose helper functions
  return {
    updateLeaderboard,
    broadcastSubmissionResult,
    broadcastChallengeUpdate,
    broadcastAnnouncement,
    handleTeamCollaboration
  }
}
