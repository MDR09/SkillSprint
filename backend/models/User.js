import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.socialAuth.github.id && !this.socialAuth.google.id
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: [30, 'Username cannot be more than 30 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['participant', 'organizer', 'admin'],
    default: 'participant'
  },
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    university: {
      type: String,
      maxlength: [100, 'University name cannot be more than 100 characters']
    },
    year: {
      type: String,
      enum: ['1st', '2nd', '3rd', '4th', 'Graduate', 'Professional']
    },
    skills: [{
      type: String,
      maxlength: [30, 'Skill name cannot be more than 30 characters']
    }],
    github: {
      type: String,
      match: [/^https:\/\/github\.com\/[\w-]+$/, 'Please enter a valid GitHub URL']
    },
    linkedin: {
      type: String,
      match: [/^https:\/\/www\.linkedin\.com\/in\/[\w-]+$/, 'Please enter a valid LinkedIn URL']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    }
  },
  socialAuth: {
    github: {
      id: String,
      username: String
    },
    google: {
      id: String,
      email: String
    }
  },
  stats: {
    totalPoints: {
      type: Number,
      default: 0
    },
    challengesCompleted: {
      type: Number,
      default: 0
    },
    challengesAttempted: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    },
    globalRank: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      challengeUpdates: {
        type: Boolean,
        default: true
      },
      leaderboardUpdates: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      showProfile: {
        type: Boolean,
        default: true
      },
      showStats: {
        type: Boolean,
        default: true
      }
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject()
  delete user.password
  delete user.emailVerificationToken
  delete user.passwordResetToken
  delete user.passwordResetExpires
  delete user.socialAuth
  return user
}

// Static method to update user stats
userSchema.statics.updateUserStats = async function(userId, statsUpdate) {
  return this.findByIdAndUpdate(
    userId,
    { $inc: { ...statsUpdate }, 'stats.lastActiveDate': new Date() },
    { new: true }
  )
}

// Index for better query performance (email and username are already indexed due to unique: true)
userSchema.index({ 'stats.totalPoints': -1 })
userSchema.index({ 'stats.globalRank': 1 })

const User = mongoose.model('User', userSchema)

export default User
