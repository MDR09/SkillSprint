import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [50, 'Team name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Team description cannot be more than 500 characters']
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'removed'],
      default: 'active'
    }
  }],
  challenges: [{
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'active', 'completed'],
      default: 'registered'
    }
  }],
  maxMembers: {
    type: Number,
    default: 5,
    min: [2, 'Team must have at least 2 members'],
    max: [10, 'Team cannot have more than 10 members']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  statistics: {
    totalChallenges: {
      type: Number,
      default: 0
    },
    completedChallenges: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    averageRank: {
      type: Number,
      default: 0
    }
  },
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
})

// Virtual for current member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.filter(member => member.status === 'active').length
})

// Pre-save middleware to generate invite code
teamSchema.pre('save', function(next) {
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  }
  next()
})

// Instance method to add member
teamSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  )
  
  if (existingMember) {
    if (existingMember.status === 'removed') {
      existingMember.status = 'active'
      existingMember.joinedAt = new Date()
    } else {
      throw new Error('User is already a member of this team')
    }
  } else {
    if (this.memberCount >= this.maxMembers) {
      throw new Error('Team has reached maximum member limit')
    }
    
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
      status: 'active'
    })
  }
  
  return this.save()
}

// Instance method to remove member
teamSchema.methods.removeMember = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  )
  
  if (!member) {
    throw new Error('User is not a member of this team')
  }
  
  if (member.role === 'leader') {
    throw new Error('Cannot remove team leader')
  }
  
  member.status = 'removed'
  return this.save()
}

// Instance method to change leadership
teamSchema.methods.transferLeadership = function(newLeaderId) {
  const newLeader = this.members.find(member => 
    member.user.toString() === newLeaderId.toString() && member.status === 'active'
  )
  
  if (!newLeader) {
    throw new Error('New leader must be an active member of the team')
  }
  
  // Update old leader
  const oldLeader = this.members.find(member => member.role === 'leader')
  if (oldLeader) {
    oldLeader.role = 'member'
  }
  
  // Update new leader
  newLeader.role = 'leader'
  this.leader = newLeaderId
  
  return this.save()
}

// Instance method to join challenge
teamSchema.methods.joinChallenge = function(challengeId) {
  const existingChallenge = this.challenges.find(c => 
    c.challenge.toString() === challengeId.toString()
  )
  
  if (existingChallenge) {
    throw new Error('Team is already registered for this challenge')
  }
  
  this.challenges.push({
    challenge: challengeId,
    joinedAt: new Date(),
    status: 'registered'
  })
  
  this.statistics.totalChallenges += 1
  return this.save()
}

// Static method to find teams by invite code
teamSchema.statics.findByInviteCode = function(inviteCode) {
  return this.findOne({ 
    inviteCode: inviteCode.toUpperCase(),
    'settings.isActive': true,
    'settings.allowInvites': true
  })
}

// Indexes for performance (inviteCode is already indexed due to unique: true)
teamSchema.index({ leader: 1 })
teamSchema.index({ 'members.user': 1 })
teamSchema.index({ isPublic: 1, 'settings.isActive': 1 })

const Team = mongoose.model('Team', teamSchema)

export default Team
