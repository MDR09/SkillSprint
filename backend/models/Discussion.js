import mongoose from 'mongoose'

const discussionSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Discussion content is required'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['question', 'clarification', 'hint', 'solution', 'general'],
    default: 'question'
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Reply cannot be more than 2000 characters']
    },
    isAnswer: {
      type: Boolean,
      default: false
    },
    votes: {
      upvotes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }],
      downvotes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }],
  votes: {
    upvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    downvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  views: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  moderatorNotes: {
    type: String,
    maxlength: [500, 'Moderator notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
})

// Virtual for vote score
discussionSchema.virtual('voteScore').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length
})

// Virtual for reply count
discussionSchema.virtual('replyCount').get(function() {
  return this.replies.filter(reply => !reply.isDeleted).length
})

// Instance method to add reply
discussionSchema.methods.addReply = function(authorId, content) {
  if (this.isLocked) {
    throw new Error('Discussion is locked')
  }
  
  this.replies.push({
    author: authorId,
    content: content,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  return this.save()
}

// Instance method to vote on discussion
discussionSchema.methods.vote = function(userId, voteType) {
  const upvoteIndex = this.votes.upvotes.findIndex(vote => 
    vote.user.toString() === userId.toString()
  )
  const downvoteIndex = this.votes.downvotes.findIndex(vote => 
    vote.user.toString() === userId.toString()
  )
  
  // Remove existing votes
  if (upvoteIndex !== -1) {
    this.votes.upvotes.splice(upvoteIndex, 1)
  }
  if (downvoteIndex !== -1) {
    this.votes.downvotes.splice(downvoteIndex, 1)
  }
  
  // Add new vote if different from removed vote
  if (voteType === 'upvote' && upvoteIndex === -1) {
    this.votes.upvotes.push({ user: userId, votedAt: new Date() })
  } else if (voteType === 'downvote' && downvoteIndex === -1) {
    this.votes.downvotes.push({ user: userId, votedAt: new Date() })
  }
  
  return this.save()
}

// Instance method to vote on reply
discussionSchema.methods.voteReply = function(replyId, userId, voteType) {
  const reply = this.replies.id(replyId)
  if (!reply) {
    throw new Error('Reply not found')
  }
  
  const upvoteIndex = reply.votes.upvotes.findIndex(vote => 
    vote.user.toString() === userId.toString()
  )
  const downvoteIndex = reply.votes.downvotes.findIndex(vote => 
    vote.user.toString() === userId.toString()
  )
  
  // Remove existing votes
  if (upvoteIndex !== -1) {
    reply.votes.upvotes.splice(upvoteIndex, 1)
  }
  if (downvoteIndex !== -1) {
    reply.votes.downvotes.splice(downvoteIndex, 1)
  }
  
  // Add new vote if different from removed vote
  if (voteType === 'upvote' && upvoteIndex === -1) {
    reply.votes.upvotes.push({ user: userId, votedAt: new Date() })
  } else if (voteType === 'downvote' && downvoteIndex === -1) {
    reply.votes.downvotes.push({ user: userId, votedAt: new Date() })
  }
  
  reply.updatedAt = new Date()
  return this.save()
}

// Instance method to mark reply as answer
discussionSchema.methods.markAsAnswer = function(replyId, userId) {
  // Only author or moderator can mark as answer
  if (this.author.toString() !== userId.toString()) {
    throw new Error('Only the discussion author can mark answers')
  }
  
  const reply = this.replies.id(replyId)
  if (!reply) {
    throw new Error('Reply not found')
  }
  
  // Unmark other answers
  this.replies.forEach(r => r.isAnswer = false)
  
  // Mark this reply as answer
  reply.isAnswer = true
  this.isSolved = true
  
  return this.save()
}

// Instance method to increment view count
discussionSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Static method to get trending discussions
discussionSchema.statics.getTrending = function(challengeId, limit = 10) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  return this.aggregate([
    {
      $match: {
        challenge: mongoose.Types.ObjectId(challengeId),
        createdAt: { $gte: oneDayAgo },
        isDeleted: false
      }
    },
    {
      $addFields: {
        score: {
          $add: [
            { $size: '$votes.upvotes' },
            { $multiply: [{ $size: '$replies' }, 0.5] },
            { $multiply: ['$views', 0.1] }
          ]
        }
      }
    },
    {
      $sort: { score: -1, createdAt: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorInfo'
      }
    },
    {
      $unwind: '$authorInfo'
    }
  ])
}

// Indexes for performance
discussionSchema.index({ challenge: 1, createdAt: -1 })
discussionSchema.index({ author: 1 })
discussionSchema.index({ type: 1 })
discussionSchema.index({ isPinned: -1, createdAt: -1 })
discussionSchema.index({ 'votes.upvotes.user': 1 })

const Discussion = mongoose.model('Discussion', discussionSchema)

export default Discussion
