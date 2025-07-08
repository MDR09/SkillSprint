import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(token) {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('Socket connected:', this.socket.id)
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('Socket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Challenge-related events
  joinChallengeRoom(challengeId) {
    if (this.socket) {
      this.socket.emit('join_challenge', challengeId)
    }
  }

  leaveChallengeRoom(challengeId) {
    if (this.socket) {
      this.socket.emit('leave_challenge', challengeId)
    }
  }

  // Leaderboard events
  onLeaderboardUpdate(callback) {
    if (this.socket) {
      this.socket.on('leaderboard_update', callback)
    }
  }

  offLeaderboardUpdate() {
    if (this.socket) {
      this.socket.off('leaderboard_update')
    }
  }

  // Submission events
  onSubmissionUpdate(callback) {
    if (this.socket) {
      this.socket.on('submission_update', callback)
    }
  }

  offSubmissionUpdate() {
    if (this.socket) {
      this.socket.off('submission_update')
    }
  }

  // Notification events
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback)
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('notification')
    }
  }

  // Challenge announcements
  onAnnouncement(callback) {
    if (this.socket) {
      this.socket.on('announcement', callback)
    }
  }

  offAnnouncement() {
    if (this.socket) {
      this.socket.off('announcement')
    }
  }

  // User status events
  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user_joined', callback)
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user_left', callback)
    }
  }

  offUserEvents() {
    if (this.socket) {
      this.socket.off('user_joined')
      this.socket.off('user_left')
    }
  }

  // Competition-related events
  joinCompetition(competitionId) {
    if (this.socket) {
      this.socket.emit('join_competition', competitionId)
    }
  }

  leaveCompetition(competitionId) {
    if (this.socket) {
      this.socket.emit('leave_competition', competitionId)
    }
  }

  sendCompetitionMessage(competitionId, message) {
    if (this.socket) {
      this.socket.emit('competition_message', { competitionId, message })
    }
  }

  onCompetitionMessage(callback) {
    if (this.socket) {
      this.socket.on('competition_message', callback)
    }
  }

  onCompetitionUpdate(callback) {
    if (this.socket) {
      this.socket.on('competition_update', callback)
    }
  }

  onCompetitionStarted(callback) {
    if (this.socket) {
      this.socket.on('competition_started', callback)
    }
  }

  onCompetitionEnded(callback) {
    if (this.socket) {
      this.socket.on('competition_ended', callback)
    }
  }

  onParticipantJoined(callback) {
    if (this.socket) {
      this.socket.on('participant_joined', callback)
    }
  }

  onScoreUpdate(callback) {
    if (this.socket) {
      this.socket.on('score_update', callback)
    }
  }

  onCompetitionInvitation(callback) {
    if (this.socket) {
      this.socket.on('competition_invitation', callback)
    }
  }

  offCompetitionEvents() {
    if (this.socket) {
      this.socket.off('competition_message')
      this.socket.off('competition_update')
      this.socket.off('competition_started')
      this.socket.off('competition_ended')
      this.socket.off('participant_joined')
      this.socket.off('score_update')
      this.socket.off('competition_invitation')
    }
  }

  // Generic event handlers
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.off(event)
      }
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }
}

export default new SocketService()
