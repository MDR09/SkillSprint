import express from 'express'
import Submission from '../models/Submission.js'
import Challenge from '../models/Challenge.js'
import { protect } from '../middleware/auth.js'
import { validateSubmission } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import mongoose from 'mongoose'

const router = express.Router()

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1
}

// Mock submission service
const mockSubmissionService = {
  executeCode: (code, language) => {
    // Simulate code execution with random results
    const testCases = [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
      { input: '[3,3], 6', expectedOutput: '[0,1]' }
    ]

    const results = testCases.map((testCase, index) => {
      const passed = Math.random() > 0.3 // 70% pass rate
      return {
        testCase: index + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: passed ? testCase.expectedOutput : '[1,0]',
        passed,
        executionTime: `${Math.floor(Math.random() * 50) + 10}ms`,
        memoryUsage: `${Math.floor(Math.random() * 20) + 10}MB`
      }
    })

    const passedCount = results.filter(r => r.passed).length
    const status = passedCount === results.length ? 'Accepted' : 
                  passedCount > 0 ? 'Partial Success' : 'Wrong Answer'

    return {
      status,
      passed: passedCount,
      total: results.length,
      executionTime: `${Math.floor(Math.random() * 100) + 50}ms`,
      memoryUsage: `${Math.floor(Math.random() * 30) + 15}MB`,
      results
    }
  }
}

// @desc    Submit code for a challenge
// @route   POST /api/submissions
// @access  Private
router.post('/', protect, validateSubmission, asyncHandler(async (req, res) => {
  const { challengeId, code, language } = req.body

  // If database is not connected, use mock submission
  if (!isDatabaseConnected()) {
    const mockResult = mockSubmissionService.executeCode(code, language)
    
    return res.json({
      success: true,
      data: {
        submission: {
          _id: 'mock-submission-id',
          challenge: challengeId,
          user: req.user.id,
          code,
          language,
          status: mockResult.status,
          testResults: mockResult,
          submittedAt: new Date()
        },
        testResults: mockResult
      }
    })
  }

  // Check if challenge exists and is active
  const challenge = await Challenge.findById(challengeId)
  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    })
  }

  const now = new Date()
  if (now < challenge.schedule.startTime || now > challenge.schedule.endTime) {
    return res.status(400).json({
      success: false,
      message: 'Challenge is not currently active'
    })
  }

  // Check if user is registered for the challenge
  const isRegistered = challenge.participants.some(p => 
    p.user.toString() === req.user.id.toString()
  )

  if (!isRegistered) {
    return res.status(403).json({
      success: false,
      message: 'You must join the challenge before submitting'
    })
  }

  // Create submission
  const submission = await Submission.create({
    challenge: challengeId,
    user: req.user.id,
    code,
    language,
    metadata: {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  })

  // TODO: Queue for code execution
  // For now, simulate execution results
  setTimeout(async () => {
    submission.status = 'accepted'
    submission.results = {
      totalTestCases: challenge.testCases.length,
      passedTestCases: challenge.testCases.length,
      score: 100,
      executionTime: Math.floor(Math.random() * 1000),
      memoryUsed: Math.floor(Math.random() * 100)
    }
    await submission.save()
  }, 2000)

  res.status(201).json({
    success: true,
    message: 'Code submitted successfully',
    data: {
      submissionId: submission._id,
      status: submission.status
    }
  })
}))

// @desc    Get submissions for a challenge
// @route   GET /api/submissions/challenge/:challengeId
// @access  Private
router.get('/challenge/:challengeId', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query

  const submissions = await Submission.find({
    challenge: req.params.challengeId,
    user: req.user.id
  })
    .sort({ submissionTime: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean()

  const total = await Submission.countDocuments({
    challenge: req.params.challengeId,
    user: req.user.id
  })

  res.json({
    success: true,
    data: {
      submissions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  })
}))

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('challenge', 'title difficulty')
    .populate('user', 'name username')

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    })
  }

  // Check if user can view this submission
  if (submission.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  res.json({
    success: true,
    data: submission
  })
}))

export default router
