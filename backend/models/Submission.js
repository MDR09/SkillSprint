import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    maxlength: [50000, 'Code cannot exceed 50000 characters']
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',    // Submitted, waiting for execution
      'running',    // Currently being executed
      'accepted',   // All test cases passed
      'wrong_answer', // Some test cases failed
      'time_limit_exceeded', // Execution took too long
      'memory_limit_exceeded', // Used too much memory
      'runtime_error', // Code crashed during execution
      'compile_error', // Code failed to compile
      'system_error' // Internal system error
    ],
    default: 'pending'
  },
  results: {
    totalTestCases: {
      type: Number,
      default: 0
    },
    passedTestCases: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000
    },
    executionTime: {
      type: Number, // in milliseconds
      default: 0
    },
    memoryUsed: {
      type: Number, // in MB
      default: 0
    },
    testCaseResults: [{
      testCaseId: String,
      status: {
        type: String,
        enum: ['passed', 'failed', 'error', 'timeout']
      },
      input: String,
      expectedOutput: String,
      actualOutput: String,
      executionTime: Number,
      memoryUsed: Number,
      errorMessage: String
    }],
    compileOutput: String,
    errorMessage: String
  },
  submissionTime: {
    type: Date,
    default: Date.now
  },
  executionStartTime: Date,
  executionEndTime: Date,
  isPublic: {
    type: Boolean,
    default: false
  },
  feedback: {
    hints: [String],
    suggestions: [String],
    codeQuality: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      issues: [{
        type: {
          type: String,
          enum: ['style', 'performance', 'security', 'maintainability']
        },
        message: String,
        line: Number,
        severity: {
          type: String,
          enum: ['low', 'medium', 'high']
        }
      }]
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    submissionCount: {
      type: Number,
      default: 1
    },
    isLatest: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
})

// Pre-save middleware to update submission count
submissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Mark previous submissions as not latest
    await this.constructor.updateMany(
      { 
        challenge: this.challenge, 
        user: this.user,
        _id: { $ne: this._id }
      },
      { 'metadata.isLatest': false }
    )
    
    // Count previous submissions
    const submissionCount = await this.constructor.countDocuments({
      challenge: this.challenge,
      user: this.user
    })
    
    this.metadata.submissionCount = submissionCount + 1
  }
  next()
})

// Instance method to calculate final score
submissionSchema.methods.calculateScore = function() {
  const challenge = this.challenge
  const passedRatio = this.results.passedTestCases / this.results.totalTestCases
  let score = Math.floor(passedRatio * (challenge.scoring?.maxPoints || 100))
  
  // Apply time bonus if enabled
  if (challenge.scoring?.timeBonus && this.status === 'accepted') {
    const timeLimit = challenge.timeLimit * 60 * 1000 // Convert to milliseconds
    const timeTaken = this.results.executionTime
    const timeRatio = Math.max(0, (timeLimit - timeTaken) / timeLimit)
    const bonus = Math.floor(score * (challenge.scoring.timeBonusPercentage / 100) * timeRatio)
    score += bonus
  }
  
  return Math.min(score, challenge.scoring?.maxPoints || 100)
}

// Instance method to get public results
submissionSchema.methods.getPublicResults = function() {
  return {
    status: this.status,
    score: this.results.score,
    passedTestCases: this.results.passedTestCases,
    totalTestCases: this.results.totalTestCases,
    executionTime: this.results.executionTime,
    memoryUsed: this.results.memoryUsed,
    submissionTime: this.submissionTime,
    language: this.language
  }
}

// Static method to get leaderboard for a challenge
submissionSchema.statics.getLeaderboard = async function(challengeId, limit = 50) {
  return this.aggregate([
    {
      $match: {
        challenge: mongoose.Types.ObjectId(challengeId),
        'metadata.isLatest': true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $unwind: '$userInfo'
    },
    {
      $project: {
        user: '$userInfo._id',
        username: '$userInfo.username',
        name: '$userInfo.name',
        avatar: '$userInfo.avatar',
        score: '$results.score',
        status: '$status',
        executionTime: '$results.executionTime',
        submissionTime: '$submissionTime',
        passedTestCases: '$results.passedTestCases',
        totalTestCases: '$results.totalTestCases'
      }
    },
    {
      $sort: {
        score: -1,
        executionTime: 1,
        submissionTime: 1
      }
    },
    {
      $limit: limit
    }
  ])
}

// Static method to get user's best submission for a challenge
submissionSchema.statics.getBestSubmission = function(userId, challengeId) {
  return this.findOne({
    user: userId,
    challenge: challengeId
  }).sort({ 'results.score': -1, executionTime: 1 })
}

// Indexes for performance
submissionSchema.index({ challenge: 1, user: 1 })
submissionSchema.index({ challenge: 1, 'results.score': -1, executionTime: 1 })
submissionSchema.index({ user: 1, submissionTime: -1 })
submissionSchema.index({ status: 1 })
submissionSchema.index({ 'metadata.isLatest': 1 })

const Submission = mongoose.model('Submission', submissionSchema)

export default Submission
