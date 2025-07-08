import mongoose from 'mongoose'

const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    maxlength: 500
  },
  
  type: {
    type: String,
    enum: ['1v1', 'group', 'tournament'],
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'active'],
      default: 'invited'
    },
    score: {
      type: Number,
      default: 0
    },
    submissionTime: Date,
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    }
  }],
  
  maxParticipants: {
    type: Number,
    default: 2,
    min: 2,
    max: 50
  },
  
  timeLimit: {
    type: Number, // in minutes
    default: 60,
    min: 5,
    max: 480 // 8 hours max
  },
  
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    required: true
  },
  
  actualStartTime: Date,
  actualEndTime: Date,
  
  rules: {
    allowedLanguages: [{
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust']
    }],
    maxSubmissions: {
      type: Number,
      default: 10,
      min: 1,
      max: 100
    },
    penaltyPerWrongSubmission: {
      type: Number,
      default: 5 // minutes
    },
    showLeaderboardDuringContest: {
      type: Boolean,
      default: true
    }
  },
  
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  rankings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rank: Number,
    score: Number,
    timeTaken: Number, // in seconds
    submissions: Number
  }],
  
  invitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  
  chatMessages: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true,
      maxlength: 500
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    }
  }],
  
  isPublic: {
    type: Boolean,
    default: false
  },
  
  entryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  
  prizePool: {
    type: Number,
    default: 0,
    min: 0
  },
  
  metadata: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Indexes
competitionSchema.index({ creator: 1, createdAt: -1 })
competitionSchema.index({ 'participants.user': 1 })
competitionSchema.index({ status: 1, startTime: 1 })
competitionSchema.index({ type: 1, isPublic: 1 })

// Virtual for competition duration
competitionSchema.virtual('duration').get(function() {
  return this.endTime - this.startTime
})

// Virtual for active participants
competitionSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => p.status === 'active').length
})

// Pre-save middleware to set endTime based on timeLimit
competitionSchema.pre('save', function(next) {
  if (this.isModified('startTime') || this.isModified('timeLimit')) {
    this.endTime = new Date(this.startTime.getTime() + this.timeLimit * 60 * 1000)
  }
  next()
})

// Instance method to check if competition is active
competitionSchema.methods.isActive = function() {
  return this.status === 'active' && 
         this.actualStartTime && 
         new Date() >= this.actualStartTime &&
         (!this.actualEndTime || new Date() < this.actualEndTime)
}

// Instance method to check if time is up
competitionSchema.methods.isTimeUp = function() {
  if (!this.actualStartTime || !this.timeLimit) return false
  
  const endTime = new Date(this.actualStartTime.getTime() + this.timeLimit * 60 * 1000)
  return new Date() >= endTime
}

// Instance method to check if user can join
competitionSchema.methods.canUserJoin = function(userId) {
  if (this.status !== 'pending') return false
  if (this.participants.length >= this.maxParticipants) return false
  if (this.participants.some(p => p.user.toString() === userId.toString())) return false
  return true
}

// Instance method to start competition
competitionSchema.methods.startCompetition = function() {
  this.status = 'active'
  this.actualStartTime = new Date()
  return this.save()
}

// Instance method to end competition
competitionSchema.methods.endCompetition = function() {
  this.status = 'completed'
  this.actualEndTime = new Date()
  this.calculateRankings()
  return this.save()
}

// Instance method to calculate rankings
competitionSchema.methods.calculateRankings = function() {
  const rankings = this.participants
    .filter(p => p.submission)
    .map(p => ({
      user: p.user,
      score: p.score,
      timeTaken: p.submissionTime ? 
        (p.submissionTime - this.actualStartTime) / 1000 : 
        (this.actualEndTime - this.actualStartTime) / 1000,
      submissions: 1 // This would need to be tracked separately
    }))
    .sort((a, b) => {
      // Sort by score descending, then by time ascending
      if (b.score !== a.score) return b.score - a.score
      return a.timeTaken - b.timeTaken
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))
  
  this.rankings = rankings
  
  // Set winner
  if (rankings.length > 0) {
    this.winner = rankings[0].user
  }
}

// Static method to find competitions for user
competitionSchema.statics.findForUser = function(userId) {
  return this.find({
    $or: [
      { creator: userId },
      { 'participants.user': userId },
      { 'invitations.user': userId }
    ]
  }).populate('creator challenge participants.user winner')
}

// Static method to find active competitions
competitionSchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    actualStartTime: { $lte: new Date() },
    $or: [
      { actualEndTime: { $exists: false } },
      { actualEndTime: { $gt: new Date() } }
    ]
  }).populate('creator challenge participants.user')
}

export default mongoose.model('Competition', competitionSchema)
