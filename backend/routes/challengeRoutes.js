import express from 'express'
import Challenge from '../models/Challenge.js'
import User from '../models/User.js'
import { protect, authorize, optionalAuth } from '../middleware/auth.js'
import { validateChallenge } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import mongoose from 'mongoose'

const router = express.Router()

// Mock challenge data for when database is not available
const mockChallenges = {
  '1': {
    _id: '1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    difficulty: 'Easy',
    category: 'Array',
    tags: ['Array', 'Hash Table'],
    functionName: 'twoSum',
    className: 'Solution',
    returnType: 'int[]',
    pythonReturnType: 'List[int]',
    javaReturnType: 'int[]',
    cppReturnType: 'vector<int>',
    cReturnType: 'int*',
    parameters: [
      { name: 'nums', type: 'int[]', pythonType: 'List[int]', javaType: 'int[]', cppType: 'vector<int>&', cType: 'int*' },
      { name: 'target', type: 'int', pythonType: 'int', javaType: 'int', cppType: 'int', cType: 'int' }
    ],
    sampleTestCases: [
      {
        input: '[2,7,11,15], 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        functionCall: 'twoSum([2,7,11,15], 9)'
      },
      {
        input: '[3,2,4], 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
        functionCall: 'twoSum([3,2,4], 6)'
      }
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10^4',
      '-10^9 ≤ nums[i] ≤ 10^9',
      '-10^9 ≤ target ≤ 10^9',
      'Only one valid answer exists.'
    ],
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try out brute force solutions for comparison and then think of a better way.',
      'So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?',
      'The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?'
    ],
    allowedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
    timeLimit: 1000,
    memoryLimit: 256,
    points: 100,
    solvedCount: 1245,
    totalSubmissions: 2890,
    acceptanceRate: 43.1,
    status: 'active',
    schedule: {
      startTime: new Date('2024-01-01'),
      endTime: new Date('2025-12-31')
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  '2': {
    _id: '2',
    title: 'Add Two Numbers',
    description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.',
    difficulty: 'Medium',
    category: 'Linked List',
    tags: ['Linked List', 'Math', 'Recursion'],
    functionName: 'addTwoNumbers',
    className: 'Solution',
    returnType: 'ListNode*',
    pythonReturnType: 'Optional[ListNode]',
    javaReturnType: 'ListNode',
    cppReturnType: 'ListNode*',
    cReturnType: 'struct ListNode*',
    parameters: [
      { name: 'l1', type: 'ListNode*', pythonType: 'Optional[ListNode]', javaType: 'ListNode', cppType: 'ListNode*', cType: 'struct ListNode*' },
      { name: 'l2', type: 'ListNode*', pythonType: 'Optional[ListNode]', javaType: 'ListNode', cppType: 'ListNode*', cType: 'struct ListNode*' }
    ],
    sampleTestCases: [
      {
        input: 'l1 = [2,4,3], l2 = [5,6,4]',
        output: '[7,0,8]',
        explanation: '342 + 465 = 807.',
        functionCall: 'addTwoNumbers([2,4,3], [5,6,4])'
      },
      {
        input: 'l1 = [0], l2 = [0]',
        output: '[0]',
        explanation: '0 + 0 = 0.',
        functionCall: 'addTwoNumbers([0], [0])'
      }
    ],
    constraints: [
      'The number of nodes in each linked list is in the range [1, 100].',
      '0 ≤ Node.val ≤ 9',
      'It is guaranteed that the list represents a number that does not have leading zeros.'
    ],
    hints: [
      'Think about how you would add two numbers on paper. You start from the least significant digit.',
      'Since the digits are stored in reverse order, we can start from the head of both linked lists.',
      'Don\'t forget to handle the carry when the sum of two digits is greater than 9.'
    ],
    allowedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
    timeLimit: 1000,
    memoryLimit: 256,
    points: 150,
    solvedCount: 987,
    totalSubmissions: 2134,
    acceptanceRate: 46.3,
    status: 'active',
    schedule: {
      startTime: new Date('2024-01-01'),
      endTime: new Date('2025-12-31')
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  '3': {
    _id: '3',
    title: 'Longest Palindromic Substring',
    description: 'Given a string s, return the longest palindromic substring in s.',
    difficulty: 'Medium',
    category: 'String',
    tags: ['String', 'Dynamic Programming'],
    functionName: 'longestPalindrome',
    className: 'Solution',
    returnType: 'string',
    pythonReturnType: 'str',
    javaReturnType: 'String',
    cppReturnType: 'string',
    cReturnType: 'char*',
    parameters: [
      { name: 's', type: 'string', pythonType: 'str', javaType: 'String', cppType: 'string', cType: 'char*' }
    ],
    sampleTestCases: [
      {
        input: '"babad"',
        output: '"bab"',
        explanation: '"aba" is also a valid answer.',
        functionCall: 'longestPalindrome("babad")'
      },
      {
        input: '"cbbd"',
        output: '"bb"',
        explanation: '',
        functionCall: 'longestPalindrome("cbbd")'
      }
    ],
    constraints: [
      '1 ≤ s.length ≤ 1000',
      's consist of only digits and English letters.'
    ],
    hints: [
      'How can we reuse a previously computed palindrome to compute a larger palindrome?',
      'If "aba" is a palindrome, is "xabax" a palindrome? Similarly is "xabay" a palindrome?',
      'Complexity based hint: If we use brute force and check whether for every start and end position a substring is a palindrome we have O(n^2) start - end pairs and O(n) palindromic checks. Can we reduce the time for palindromic checks to O(1) by reusing some previous computation.'
    ],
    allowedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
    timeLimit: 1000,
    memoryLimit: 256,
    points: 150,
    solvedCount: 654,
    totalSubmissions: 1876,
    acceptanceRate: 34.9,
    status: 'active',
    schedule: {
      startTime: new Date('2024-01-01'),
      endTime: new Date('2025-12-31')
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
}

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1
}

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  // If database is not connected, return mock data
  if (!isDatabaseConnected()) {
    const challenges = Object.values(mockChallenges)
    
    return res.json({
      success: true,
      data: challenges,
      pagination: {
        page: 1,
        limit: 10,
        total: challenges.length,
        pages: 1
      }
    })
  }

  const {
    page = 1,
    limit = 10,
    difficulty,
    category,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  // Build query
  let query = { isDeleted: false }

  // Apply filters
  if (difficulty && difficulty !== 'all') {
    query.difficulty = difficulty
  }

  if (category && category !== 'all') {
    query.category = category
  }

  if (status && status !== 'all') {
    const now = new Date()
    switch (status) {
      case 'upcoming':
        query['schedule.startTime'] = { $gt: now }
        query.status = { $in: ['published', 'active'] }
        break
      case 'active':
        query['schedule.startTime'] = { $lte: now }
        query['schedule.endTime'] = { $gte: now }
        query.status = 'active'
        break
      case 'completed':
        query['schedule.endTime'] = { $lt: now }
        break
    }
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ]
  }

  // Only show public challenges unless user is authenticated
  if (!req.user) {
    query.visibility = 'public'
  }

  // Build sort object
  const sort = {}
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1

  // Execute query with pagination
  const skip = (page - 1) * limit
  const challenges = await Challenge.find(query)
    .populate('creator', 'name username avatar')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean()

  // Get total count for pagination
  const total = await Challenge.countDocuments(query)

  // Add computed fields
  const challengesWithStatus = challenges.map(challenge => {
    const now = new Date()
    let challengeStatus = 'upcoming'
    
    if (now >= challenge.schedule.startTime && now <= challenge.schedule.endTime) {
      challengeStatus = 'active'
    } else if (now > challenge.schedule.endTime) {
      challengeStatus = 'completed'
    }

    return {
      ...challenge,
      challengeStatus,
      timeRemaining: Math.max(0, challenge.schedule.endTime - now),
      isRegistered: req.user ? challenge.participants.some(p => 
        p.user.toString() === req.user.id.toString()
      ) : false
    }
  })

  res.json({
    success: true,
    data: {
      challenges: challengesWithStatus,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  })
}))

// @desc    Get single challenge
// @desc    Get challenge by ID
// @route   GET /api/challenges/:id
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  // If database is not connected, return mock data
  if (!isDatabaseConnected()) {
    const challenge = mockChallenges[req.params.id]
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      })
    }
    
    return res.json({
      success: true,
      data: challenge
    })
  }

  const challenge = await Challenge.findOne({
    _id: req.params.id,
    isDeleted: false
  })
    .populate('creator', 'name username avatar')
    .populate('participants.user', 'name username avatar')

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    })
  }

  // Check visibility
  if (challenge.visibility === 'private' && (!req.user || 
      (challenge.creator._id.toString() !== req.user.id.toString() && req.user.role !== 'admin'))) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this challenge'
    })
  }

  // Increment view count (only once per user per day)
  await Challenge.findByIdAndUpdate(req.params.id, {
    $inc: { 'statistics.viewCount': 1 }
  })

  // Add computed fields
  const now = new Date()
  let challengeStatus = 'upcoming'
  
  if (now >= challenge.schedule.startTime && now <= challenge.schedule.endTime) {
    challengeStatus = 'active'
  } else if (now > challenge.schedule.endTime) {
    challengeStatus = 'completed'
  }

  const challengeData = {
    ...challenge.toObject(),
    challengeStatus,
    timeRemaining: Math.max(0, challenge.schedule.endTime - now),
    isRegistered: req.user ? challenge.participants.some(p => 
      p.user._id.toString() === req.user.id.toString()
    ) : false,
    canEdit: req.user && (challenge.creator._id.toString() === req.user.id.toString() || req.user.role === 'admin')
  }

  // Hide test cases for non-creators (except sample)
  if (!challengeData.canEdit) {
    challengeData.testCases = challengeData.testCases.filter(tc => !tc.isHidden)
  }

  res.json({
    success: true,
    data: challengeData
  })
}))

// @desc    Create new challenge
// @route   POST /api/challenges
// @access  Private (Organizer/Admin)
router.post('/', protect, authorize('organizer', 'admin'), validateChallenge, asyncHandler(async (req, res) => {
  const challengeData = {
    ...req.body,
    creator: req.user.id
  }

  const challenge = await Challenge.create(challengeData)
  await challenge.populate('creator', 'name username avatar')

  res.status(201).json({
    success: true,
    message: 'Challenge created successfully',
    data: challenge
  })
}))

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private (Creator/Admin)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  let challenge = await Challenge.findById(req.params.id)

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    })
  }

  // Check permission
  if (challenge.creator.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this challenge'
    })
  }

  // Don't allow updates to active challenges (except status)
  const now = new Date()
  if (now >= challenge.schedule.startTime && now <= challenge.schedule.endTime) {
    const allowedFields = ['status', 'hints', 'resources']
    const updateFields = Object.keys(req.body)
    const hasRestrictedFields = updateFields.some(field => !allowedFields.includes(field))
    
    if (hasRestrictedFields) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update challenge details while it is active'
      })
    }
  }

  challenge = await Challenge.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('creator', 'name username avatar')

  res.json({
    success: true,
    message: 'Challenge updated successfully',
    data: challenge
  })
}))

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Creator/Admin)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id)

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    })
  }

  // Check permission
  if (challenge.creator.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this challenge'
    })
  }

  // Soft delete
  await Challenge.findByIdAndUpdate(req.params.id, { isDeleted: true })

  res.json({
    success: true,
    message: 'Challenge deleted successfully'
  })
}))

// @desc    Join challenge
// @route   POST /api/challenges/:id/join
// @access  Private
router.post('/:id/join', protect, asyncHandler(async (req, res) => {
  const challenge = await Challenge.findOne({
    _id: req.params.id,
    isDeleted: false
  })

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    })
  }

  // Check if challenge is joinable
  const now = new Date()
  if (now > challenge.schedule.endTime) {
    return res.status(400).json({
      success: false,
      message: 'Challenge has already ended'
    })
  }

  // Check if already registered
  const isRegistered = challenge.participants.some(p => 
    p.user.toString() === req.user.id.toString()
  )

  if (isRegistered) {
    return res.status(400).json({
      success: false,
      message: 'Already registered for this challenge'
    })
  }

  // Check access code for private challenges
  if (challenge.visibility === 'private' && challenge.accessCode) {
    const { accessCode } = req.body
    if (!accessCode || accessCode !== challenge.accessCode) {
      return res.status(403).json({
        success: false,
        message: 'Invalid access code'
      })
    }
  }

  // Add participant
  await challenge.addParticipant(req.user.id)

  res.json({
    success: true,
    message: 'Successfully joined the challenge',
    data: {
      challengeId: challenge._id,
      participantCount: challenge.statistics.totalParticipants
    }
  })
}))

// @desc    Leave challenge
// @route   POST /api/challenges/:id/leave
// @access  Private
router.post('/:id/leave', protect, asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id)

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    })
  }

  // Check if challenge has started
  const now = new Date()
  if (now >= challenge.schedule.startTime) {
    return res.status(400).json({
      success: false,
      message: 'Cannot leave challenge after it has started'
    })
  }

  // Remove participant
  challenge.participants = challenge.participants.filter(p => 
    p.user.toString() !== req.user.id.toString()
  )
  challenge.statistics.totalParticipants = Math.max(0, challenge.statistics.totalParticipants - 1)
  
  await challenge.save()

  res.json({
    success: true,
    message: 'Successfully left the challenge'
  })
}))

// @desc    Get challenge leaderboard
// @route   GET /api/challenges/:id/leaderboard
// @access  Public
router.get('/:id/leaderboard', optionalAuth, asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query

  const challenge = await Challenge.findOne({
    _id: req.params.id,
    isDeleted: false
  })

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    })
  }

  // Import Submission model dynamically to avoid circular dependency
  const { default: Submission } = await import('../models/Submission.js')
  
  const leaderboard = await Submission.getLeaderboard(req.params.id, Number(limit))

  res.json({
    success: true,
    data: {
      leaderboard,
      total: leaderboard.length,
      challengeInfo: {
        title: challenge.title,
        status: challenge.status,
        totalParticipants: challenge.statistics.totalParticipants
      }
    }
  })
}))

// @desc    Get featured challenges
// @route   GET /api/challenges/featured
// @access  Public
router.get('/featured', optionalAuth, asyncHandler(async (req, res) => {
  const now = new Date()
  
  // Get active challenges with high participation
  const featured = await Challenge.find({
    isDeleted: false,
    visibility: 'public',
    'schedule.startTime': { $lte: now },
    'schedule.endTime': { $gte: now },
    status: 'active'
  })
    .populate('creator', 'name username avatar')
    .sort({ 'statistics.totalParticipants': -1, 'statistics.viewCount': -1 })
    .limit(6)
    .lean()

  const featuredWithStatus = featured.map(challenge => ({
    ...challenge,
    challengeStatus: 'active',
    timeRemaining: Math.max(0, challenge.schedule.endTime - now),
    isRegistered: req.user ? challenge.participants.some(p => 
      p.user.toString() === req.user.id.toString()
    ) : false
  }))

  res.json({
    success: true,
    data: featuredWithStatus
  })
}))

export default router
