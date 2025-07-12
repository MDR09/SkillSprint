import mongoose from 'mongoose'

const testCaseSchema = new mongoose.Schema({
  input: {
    type: mongoose.Schema.Types.Mixed, // Can be object, array, string, number, etc.
    required: true
  },
  expectedOutput: {
    type: mongoose.Schema.Types.Mixed, // Can be object, array, string, number, etc.
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    default: 1
  },
  description: {
    type: String,
    maxlength: [500, 'Test case description cannot be more than 500 characters']
  },
  timeLimit: {
    type: Number, // in seconds, overrides global time limit if specified
    min: [1, 'Time limit must be at least 1 second'],
    max: [60, 'Time limit cannot exceed 60 seconds per test case']
  }
})

const exampleSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    maxlength: [1000, 'Example explanation cannot be more than 1000 characters']
  }
})

const parameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true // e.g., "number", "string", "number[]", "string[]"
  },
  pythonType: {
    type: String // e.g., "int", "str", "List[int]", "List[str]"
  },
  javaType: {
    type: String // e.g., "int", "String", "int[]", "String[]"
  },
  cppType: {
    type: String // e.g., "int", "string", "vector<int>", "vector<string>"
  },
  description: {
    type: String,
    maxlength: [200, 'Parameter description cannot be more than 200 characters']
  }
})

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'Algorithms',
      'Data Structures',
      'Dynamic Programming',
      'Graph Theory',
      'String Manipulation',
      'System Design',
      'Database',
      'Full Stack',
      'Frontend',
      'Backend',
      'Machine Learning',
      'Other'
    ],
    required: true
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    maxlength: [100, 'Organization name cannot be more than 100 characters']
  },
  timeLimit: {
    type: Number, // in minutes
    required: true,
    min: [5, 'Time limit must be at least 5 minutes'],
    max: [480, 'Time limit cannot exceed 8 hours']
  },
  memoryLimit: {
    type: Number, // in MB
    default: 256,
    min: [64, 'Memory limit must be at least 64 MB'],
    max: [1024, 'Memory limit cannot exceed 1024 MB']
  },
  allowedLanguages: [{
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript']
  }],
  // Function signature for code template generation
  functionName: {
    type: String,
    required: true,
    maxlength: [50, 'Function name cannot be more than 50 characters']
  },
  parameters: [parameterSchema],
  returnType: {
    type: String,
    required: true // e.g., "number", "string", "boolean", "number[]"
  },
  pythonReturnType: {
    type: String // e.g., "int", "str", "bool", "List[int]"
  },
  javaReturnType: {
    type: String // e.g., "int", "String", "boolean", "int[]"
  },
  cppReturnType: {
    type: String // e.g., "int", "string", "bool", "vector<int>"
  },
  
  // Examples shown to users
  examples: [exampleSchema],
  
  // Test cases for evaluation
  testCases: [testCaseSchema],
  
  // Legacy fields for backward compatibility
  sampleInput: {
    type: String
  },
  sampleOutput: {
    type: String
  },
  constraints: [{
    type: String,
    maxlength: [200, 'Each constraint cannot be more than 200 characters']
  }],
  hints: [{
    type: String,
    maxlength: [500, 'Hint cannot be more than 500 characters']
  }],
  
  // Algorithm complexity information
  timeComplexity: {
    type: String,
    maxlength: [100, 'Time complexity cannot be more than 100 characters']
  },
  spaceComplexity: {
    type: String,
    maxlength: [100, 'Space complexity cannot be more than 100 characters']
  },
  
  scoring: {
    maxPoints: {
      type: Number,
      default: 100,
      min: [1, 'Max points must be at least 1'],
      max: [1000, 'Max points cannot exceed 1000']
    },
    partialScoring: {
      type: Boolean,
      default: true
    },
    timeBonus: {
      type: Boolean,
      default: false
    },
    timeBonusPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Time bonus percentage cannot be negative'],
      max: [50, 'Time bonus percentage cannot exceed 50%']
    }
  },
  schedule: {
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  accessCode: {
    type: String,
    sparse: true
  },
  teamChallenge: {
    enabled: {
      type: Boolean,
      default: false
    },
    maxTeamSize: {
      type: Number,
      default: 1,
      min: [1, 'Max team size must be at least 1'],
      max: [10, 'Max team size cannot exceed 10']
    },
    allowSoloParticipation: {
      type: Boolean,
      default: true
    }
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'active', 'completed', 'disqualified'],
      default: 'registered'
    }
  }],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  discussions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion'
  }],
  statistics: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    successfulSubmissions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    }
  },
  prizes: [{
    position: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    value: {
      type: String
    }
  }],
  resources: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['documentation', 'tutorial', 'example', 'reference'],
      required: true
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Virtual for challenge duration
challengeSchema.virtual('duration').get(function() {
  return this.schedule.endTime - this.schedule.startTime
})

// Virtual for time remaining
challengeSchema.virtual('timeRemaining').get(function() {
  const now = new Date()
  if (now > this.schedule.endTime) return 0
  return Math.max(0, this.schedule.endTime - now)
})

// Virtual for challenge progress
challengeSchema.virtual('progress').get(function() {
  const now = new Date()
  const start = this.schedule.startTime
  const end = this.schedule.endTime
  
  if (now < start) return 0
  if (now > end) return 100
  
  return ((now - start) / (end - start)) * 100
})

// Pre-save middleware to validate schedule
challengeSchema.pre('save', function(next) {
  if (this.schedule.startTime >= this.schedule.endTime) {
    return next(new Error('End time must be after start time'))
  }
  next()
})

// Instance method to check if challenge is active
challengeSchema.methods.isActive = function() {
  const now = new Date()
  return now >= this.schedule.startTime && now <= this.schedule.endTime && this.status === 'active'
}

// Instance method to add participant
challengeSchema.methods.addParticipant = function(userId, teamId = null) {
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  )
  
  if (existingParticipant) {
    throw new Error('User is already registered for this challenge')
  }
  
  this.participants.push({
    user: userId,
    team: teamId,
    joinedAt: new Date(),
    status: 'registered'
  })
  
  this.statistics.totalParticipants += 1
  return this.save()
}

// Static method to get active challenges
challengeSchema.statics.getActiveChallenges = function() {
  const now = new Date()
  return this.find({
    'schedule.startTime': { $lte: now },
    'schedule.endTime': { $gte: now },
    status: 'active',
    isDeleted: false
  })
}

// Static method to get upcoming challenges
challengeSchema.statics.getUpcomingChallenges = function() {
  const now = new Date()
  return this.find({
    'schedule.startTime': { $gt: now },
    status: { $in: ['published', 'active'] },
    isDeleted: false
  })
}

// Indexes for better performance
challengeSchema.index({ 'schedule.startTime': 1, 'schedule.endTime': 1 })
challengeSchema.index({ status: 1, visibility: 1 })
challengeSchema.index({ difficulty: 1, category: 1 })
challengeSchema.index({ creator: 1 })
challengeSchema.index({ 'statistics.totalParticipants': -1 })

const Challenge = mongoose.model('Challenge', challengeSchema)

export default Challenge
