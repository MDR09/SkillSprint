import express from 'express'
import User from '../models/User.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import mongoose from 'mongoose'

const router = express.Router()

// Mock users data for when database is not available
const mockUsers = [
  { 
    _id: '1', 
    username: 'codeMaster', 
    name: 'John Doe', 
    email: 'john@example.com',
    avatar: null,
    stats: { wins: 15, losses: 5, totalChallenges: 20 },
    isOnline: true,
    lastSeen: new Date()
  },
  { 
    _id: '2', 
    username: 'pythonPro', 
    name: 'Jane Smith', 
    email: 'jane@example.com',
    avatar: null,
    stats: { wins: 12, losses: 8, totalChallenges: 20 },
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
  },
  { 
    _id: '3', 
    username: 'jsNinja', 
    name: 'Bob Johnson', 
    email: 'bob@example.com',
    avatar: null,
    stats: { wins: 8, losses: 12, totalChallenges: 20 },
    isOnline: true,
    lastSeen: new Date()
  },
  { 
    _id: '4', 
    username: 'reactDev', 
    name: 'Alice Wilson', 
    email: 'alice@example.com',
    avatar: null,
    stats: { wins: 22, losses: 3, totalChallenges: 25 },
    isOnline: false,
    lastSeen: new Date(Date.now() - 1800000) // 30 minutes ago
  },
  { 
    _id: '5', 
    username: 'cppExpert', 
    name: 'Mike Chen', 
    email: 'mike@example.com',
    avatar: null,
    stats: { wins: 18, losses: 7, totalChallenges: 25 },
    isOnline: true,
    lastSeen: new Date()
  }
]

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1
}

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
router.get('/search', asyncHandler(async (req, res) => {
  const { q, exclude } = req.query;
  if (!q) return res.json({ data: [] });

  // If database is not connected, return mock data
  if (!isDatabaseConnected()) {
    const filteredUsers = mockUsers.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(q.toLowerCase()) || 
                           user.email.toLowerCase().includes(q.toLowerCase()) ||
                           user.name.toLowerCase().includes(q.toLowerCase());
      const isNotExcluded = !exclude || user._id !== exclude;
      return matchesSearch && isNotExcluded;
    });
    
    return res.json({ 
      success: true,
      data: filteredUsers.slice(0, 10) 
    });
  }

  // Query the real database for users matching the username or email
  const users = await User.find({
    $and: [
      {
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } }
        ]
      },
      { _id: { $ne: exclude } } // Exclude current user
    ]
  })
  .select('username name email stats') // Only return needed fields
  .limit(10);

  res.json({ 
    success: true,
    data: users 
  });
}));

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  // If database is not connected, return mock data
  if (!isDatabaseConnected()) {
    const user = mockUsers.find(u => u._id === req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    return res.json({
      success: true,
      data: user
    })
  }

  const user = await User.findById(req.params.id)
    .select('username name email avatar stats isOnline lastSeen')
    .lean()

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  res.json({
    success: true,
    data: user
  })
}))

// @desc    Get user by username
// @route   GET /api/users/username/:username
// @access  Public
router.get('/username/:username', optionalAuth, asyncHandler(async (req, res) => {
  // If database is not connected, return mock data
  if (!isDatabaseConnected()) {
    const user = mockUsers.find(u => u.username.toLowerCase() === req.params.username.toLowerCase())
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    return res.json({
      success: true,
      data: user
    })
  }

  const user = await User.findOne({ username: req.params.username })
    .select('username name email avatar stats isOnline lastSeen')
    .lean()

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  res.json({
    success: true,
    data: user
  })
}))

// @desc    Get online users
// @route   GET /api/users/online
// @access  Public
router.get('/online', optionalAuth, asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query

  // If database is not connected, return mock data
  if (!isDatabaseConnected()) {
    const onlineUsers = mockUsers
      .filter(user => user.isOnline)
      .slice(0, parseInt(limit))

    return res.json({
      success: true,
      data: onlineUsers,
      total: onlineUsers.length
    })
  }

  const onlineUsers = await User.find({ 
    isOnline: true,
    lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Active in last 5 minutes
  })
    .select('username name avatar stats')
    .limit(parseInt(limit))
    .lean()

  res.json({
    success: true,
    data: onlineUsers,
    total: onlineUsers.length
  })
}))

// @desc    Get user leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
router.get('/leaderboard', optionalAuth, asyncHandler(async (req, res) => {
  const { limit = 50, sortBy = 'wins' } = req.query

  // If database is not connected, return mock data
  if (!isDatabaseConnected()) {
    const sortedUsers = [...mockUsers]
      .sort((a, b) => {
        if (sortBy === 'wins') return (b.stats.wins || 0) - (a.stats.wins || 0)
        if (sortBy === 'winRate') {
          const aRate = (a.stats.wins || 0) / Math.max(a.stats.totalChallenges || 1, 1)
          const bRate = (b.stats.wins || 0) / Math.max(b.stats.totalChallenges || 1, 1)
          return bRate - aRate
        }
        return 0
      })
      .slice(0, parseInt(limit))

    return res.json({
      success: true,
      data: sortedUsers,
      total: sortedUsers.length
    })
  }

  let sortQuery = {}
  if (sortBy === 'wins') {
    sortQuery = { 'stats.wins': -1 }
  } else if (sortBy === 'winRate') {
    sortQuery = { 'stats.winRate': -1 }
  } else {
    sortQuery = { 'stats.totalScore': -1 }
  }

  const users = await User.find({})
    .select('username name avatar stats')
    .sort(sortQuery)
    .limit(parseInt(limit))
    .lean()

  res.json({
    success: true,
    data: users,
    total: users.length
  })
}))

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, bio, preferredLanguages, githubUsername, linkedinUrl } = req.body

  const updateData = {
    ...(name && { name }),
    ...(bio !== undefined && { bio }),
    ...(preferredLanguages && { preferredLanguages }),
    ...(githubUsername !== undefined && { githubUsername }),
    ...(linkedinUrl !== undefined && { linkedinUrl })
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password')

  res.json({
    success: true,
    data: user
  })
}))

export default router
