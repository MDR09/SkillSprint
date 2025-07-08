import express from 'express'
import User from '../models/User.js'
import Challenge from '../models/Challenge.js'
import Submission from '../models/Submission.js'
import { optionalAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = express.Router()

// @desc    Get global leaderboard
// @route   GET /api/leaderboard/global
// @access  Public
router.get('/global', optionalAuth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, timeframe = 'all' } = req.query

  let dateFilter = {}
  const now = new Date()

  switch (timeframe) {
    case 'weekly':
      dateFilter = { 'stats.lastActiveDate': { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } }
      break
    case 'monthly':
      dateFilter = { 'stats.lastActiveDate': { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } }
      break
    case 'yearly':
      dateFilter = { 'stats.lastActiveDate': { $gte: new Date(now - 365 * 24 * 60 * 60 * 1000) } }
      break
  }

  const leaderboard = await User.find({
    isActive: true,
    'stats.totalPoints': { $gt: 0 },
    ...dateFilter
  })
    .select('name username avatar stats profile.university')
    .sort({ 'stats.totalPoints': -1, 'stats.challengesCompleted': -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean()

  // Add rank to each user
  const leaderboardWithRank = leaderboard.map((user, index) => ({
    ...user,
    rank: (page - 1) * limit + index + 1
  }))

  const total = await User.countDocuments({
    isActive: true,
    'stats.totalPoints': { $gt: 0 },
    ...dateFilter
  })

  res.json({
    success: true,
    data: {
      leaderboard: leaderboardWithRank,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      timeframe
    }
  })
}))

// @desc    Get challenge leaderboard
// @route   GET /api/leaderboard/challenge/:challengeId
// @access  Public
router.get('/challenge/:challengeId', optionalAuth, asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query

  const challenge = await Challenge.findById(req.params.challengeId)
  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    })
  }

  const leaderboard = await Submission.getLeaderboard(req.params.challengeId, Number(limit))

  // Add rank to each submission
  const leaderboardWithRank = leaderboard.map((submission, index) => ({
    ...submission,
    rank: index + 1
  }))

  res.json({
    success: true,
    data: {
      leaderboard: leaderboardWithRank,
      challengeInfo: {
        title: challenge.title,
        difficulty: challenge.difficulty,
        category: challenge.category,
        totalParticipants: challenge.statistics.totalParticipants
      }
    }
  })
}))

// @desc    Get user's rank in global leaderboard
// @route   GET /api/leaderboard/my-rank
// @access  Private
router.get('/my-rank', optionalAuth, asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  const user = await User.findById(req.user.id)
  const rank = await User.countDocuments({
    'stats.totalPoints': { $gt: user.stats.totalPoints },
    isActive: true
  }) + 1

  res.json({
    success: true,
    data: {
      globalRank: rank,
      totalPoints: user.stats.totalPoints,
      challengesCompleted: user.stats.challengesCompleted
    }
  })
}))

export default router
