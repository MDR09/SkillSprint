import express from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import passport from 'passport'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { validateUser, validateLogin } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import mongoose from 'mongoose'

const router = express.Router()

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1
}

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  })
}

// Mock authentication for demo mode
const mockAuth = {
  // Demo user login
  demoLogin: asyncHandler(async (req, res) => {
    const token = generateToken('demo-user-id')
    
    res.json({
      success: true,
      token,
      data: {
        user: {
          _id: 'demo-user-id',
          name: 'Demo User',
          email: 'demo@skillsprint.com',
          username: 'demouser',
          role: 'user',
          isActive: true,
          avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff'
        }
      }
    })
  }),

  // Mock register
  demoRegister: asyncHandler(async (req, res) => {
    const { name, email } = req.body
    const token = generateToken('demo-user-id')
    
    res.status(201).json({
      success: true,
      token,
      data: {
        user: {
          _id: 'demo-user-id',
          name: name || 'Demo User',
          email: email || 'demo@skillsprint.com',
          username: 'demouser',
          role: 'user',
          isActive: true,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Demo User')}&background=6366f1&color=fff`
        }
      }
    })
  })
}

// @desc    Demo login (when database is not available)
// @route   POST /api/auth/demo-login
// @access  Public
router.post('/demo-login', mockAuth.demoLogin)

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUser, asyncHandler(async (req, res) => {
  // If database is not connected, use mock registration
  if (!isDatabaseConnected()) {
    return mockAuth.demoRegister(req, res)
  }

  const { name, email, password, username } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    })
  }

  // Check if username is taken
  if (username) {
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      })
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    username: username || email.split('@')[0] + Math.floor(Math.random() * 1000),
    emailVerificationToken: crypto.randomBytes(20).toString('hex')
  })

  // Generate token
  const token = generateToken(user._id)

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: user.getPublicProfile()
  })
}))

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  // If database is not connected, use mock login
  if (!isDatabaseConnected()) {
    return mockAuth.demoLogin(req, res)
  }

  const { email, password } = req.body

  // Check for user
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    })
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    })
  }

  // Check password
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    })
  }

  // Update last active date
  user.stats.lastActiveDate = new Date()
  await user.save()

  // Generate token
  const token = generateToken(user._id)

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.getPublicProfile()
  })
}))

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  
  res.json({
    success: true,
    user: user.getPublicProfile()
  })
}))

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'username', 'profile.bio', 'profile.university', 
    'profile.year', 'profile.skills', 'profile.github', 
    'profile.linkedin', 'profile.website'
  ]

  const updates = {}
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      if (key.includes('.')) {
        const [parent, child] = key.split('.')
        if (!updates[parent]) updates[parent] = {}
        updates[parent][child] = req.body[key]
      } else {
        updates[key] = req.body[key]
      }
    }
  })

  // Check if username is being updated and is available
  if (updates.username && updates.username !== req.user.username) {
    const existingUser = await User.findOne({ 
      username: updates.username, 
      _id: { $ne: req.user.id } 
    })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      })
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true, runValidators: true }
  )

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: user.getPublicProfile()
  })
}))

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters'
    })
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password')
  
  // Check current password
  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    })
  }

  // Update password
  user.password = newPassword
  await user.save()

  res.json({
    success: true,
    message: 'Password changed successfully'
  })
}))

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex')
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

  await user.save({ validateBeforeSave: false })

  // In a real app, send email here
  console.log('Password reset token:', resetToken)

  res.json({
    success: true,
    message: 'Password reset token sent to email',
    // Remove this in production
    resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
  })
}))

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: 'Token and new password are required'
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    })
  }

  // Get hashed token
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: resetPasswordToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }

  // Set new password
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // Generate new JWT token
  const jwtToken = generateToken(user._id)

  res.json({
    success: true,
    message: 'Password reset successful',
    token: jwtToken,
    user: user.getPublicProfile()
  })
}))

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  // In a JWT-based system, logout is typically handled client-side
  // But we can track last logout time
  await User.findByIdAndUpdate(req.user.id, {
    'stats.lastActiveDate': new Date()
  })

  res.json({
    success: true,
    message: 'Logout successful'
  })
}))

// @desc    Get user stats
// @route   GET /api/auth/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  
  res.json({
    success: true,
    stats: user.stats
  })
}))

// Function to setup OAuth routes after environment variables are loaded
export const setupOAuthRoutes = () => {
  // Debug log to check environment variables
  console.log('🔍 Debug - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET')
  console.log('🔍 Debug - GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET')
  console.log('🔍 Debug - GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET')
  console.log('🔍 Debug - GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET')

  // GitHub OAuth routes - only register if credentials are available
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    console.log('✅ Registering GitHub OAuth routes')
    // @desc    GitHub OAuth
    // @route   GET /api/auth/github
    // @access  Public
    router.get('/github', passport.authenticate('github', { 
      scope: ['user:email'] 
    }))

    // @desc    GitHub OAuth callback
    // @route   GET /api/auth/github/callback
    // @access  Public
    router.get('/github/callback', 
      passport.authenticate('github', { session: false }),
      asyncHandler(async (req, res) => {
        const token = generateToken(req.user._id)
        
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
      })
    )
  } else {
    console.log('⚠️  Registering mock GitHub OAuth routes')
    // Provide mock GitHub OAuth routes
    router.get('/github', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'GitHub OAuth is not configured in this environment'
      })
    })
    
    router.get('/github/callback', (req, res) => {
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_disabled`)
    })
  }

  // Google OAuth routes - only register if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Registering Google OAuth routes')
    // @desc    Google OAuth
    // @route   GET /api/auth/google
    // @access  Public
    router.get('/google', passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    }))

    // @desc    Google OAuth callback
    // @route   GET /api/auth/google/callback
    // @access  Public
    router.get('/google/callback', 
      passport.authenticate('google', { session: false }),
      asyncHandler(async (req, res) => {
        const token = generateToken(req.user._id)
        
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
      })
    )
  } else {
    console.log('⚠️  Registering mock Google OAuth routes')
    // Provide mock Google OAuth routes
    router.get('/google', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Google OAuth is not configured in this environment'
      })
    })
    
    router.get('/google/callback', (req, res) => {
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_disabled`)
    })
  }
}

// Call the setup function immediately (after environment variables are loaded)
setupOAuthRoutes()

export default router
