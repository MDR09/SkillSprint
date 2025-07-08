// Load environment variables first
import dotenv from 'dotenv'
dotenv.config()

// Debug: Log environment variables to verify they're loaded
console.log('🔍 Environment Debug:')
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET')
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET')
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET')

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import passport from 'passport'
import session from 'express-session'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import middleware and config
import { connectDB, connectDBAlternative } from './config/database.js'
import { setupSocketIO } from './config/socket.js'
import { errorHandler } from './middleware/errorHandler.js'
import { configurePassport } from './config/passport.js'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
})

// Configure Passport after dotenv is loaded
configurePassport()

const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}))

// Session configuration for Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Socket.IO setup
const socketHelpers = setupSocketIO(io)

// Make socket helpers available to routes
app.set('socketHelpers', socketHelpers)

// Async function to start the server
const startServer = async () => {
  // Connect to database (async) - try multiple methods
  let dbConnection = null
  try {
    console.log('🔄 Attempting primary database connection...')
    dbConnection = await connectDB()
    
    if (!dbConnection && process.env.MONGODB_URI) {
      console.log('🔄 Primary connection failed, trying alternative method...')
      dbConnection = await connectDBAlternative()
    }
    
    if (dbConnection) {
      console.log('✅ Database connection successful!')
    } else {
      console.log('⚠️  All database connection attempts failed, continuing in mock mode')
    }
  } catch (error) {
    console.log('⚠️  Database connection failed, continuing in mock mode')
  }

  // Make db connection status available to routes
  app.set('dbConnection', dbConnection)

  // Import routes dynamically after environment variables are loaded
  const { default: authRoutes } = await import('./routes/authRoutes.js')
  const { default: userRoutes } = await import('./routes/userRoutes.js')
  const { default: challengeRoutes } = await import('./routes/challengeRoutes.js')
  const { default: submissionRoutes } = await import('./routes/submissionRoutes.js')
  const { default: leaderboardRoutes } = await import('./routes/leaderboardRoutes.js')
  const { default: teamRoutes } = await import('./routes/teamRoutes.js')
  const { default: discussionRoutes } = await import('./routes/discussionRoutes.js')
  const { default: adminRoutes } = await import('./routes/adminRoutes.js')
  const { default: uploadRoutes } = await import('./routes/uploadRoutes.js')
  const { default: competitionRoutes } = await import('./routes/competitionRoutes.js')

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SkillSprint API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/discussions', discussionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/competitions', competitionRoutes)

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to SkillSprint API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      challenges: '/api/challenges',
      submissions: '/api/submissions',
      competitions: '/api/competitions',
      leaderboard: '/api/leaderboard',
      health: '/api/health'
    },
    documentation: 'https://github.com/skillsprint/api-docs'
  })
})

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

server.listen(PORT, () => {
  console.log(`🚀 SkillSprint Server running on port ${PORT}`)
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`)
  console.log(`🔗 Socket.IO: Enabled`)
  console.log(`🔐 GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? 'Configured' : 'Not configured'}`)
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`)
  })
}

// Start the server
startServer().catch(console.error)
