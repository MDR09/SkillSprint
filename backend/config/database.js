import mongoose from 'mongoose'

// Set mongoose options to prevent buffering and timeout issues
mongoose.set('bufferCommands', false)

export const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  No MongoDB URI provided. Running in mock mode.')
      return null
    }
    
    console.log('🔄 Attempting to connect to MongoDB Atlas...')
    
    // Enhanced connection options for MongoDB Atlas
    const connectionOptions = {
      // Connection timeouts
      serverSelectionTimeoutMS: 15000, // 15 seconds to select a server
      connectTimeoutMS: 10000, // 10 seconds to establish initial connection
      socketTimeoutMS: 0, // No socket timeout (use heartbeat instead)
      
      // Connection pool settings
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Heartbeat and monitoring
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
      
      // Write concern and read preference
      retryWrites: true, // Retry writes on transient errors
      w: 'majority', // Write concern
      
      // SSL/TLS settings for Atlas
      ssl: true, // Enable SSL
      
      // Buffering
      bufferCommands: false, // Disable mongoose buffering
      
      // Auth settings (important for Atlas)
      authSource: 'admin', // Authentication database
      
      // Compression
      compressors: ['zlib'], // Enable compression
      
      // App name for monitoring
      appName: 'SkillSprint'
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions)
    
    console.log(`✅ MongoDB Atlas connected successfully!`)
    console.log(`📍 Host: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
    console.log(`🔗 Ready state: ${conn.connection.readyState}`)
    
    return conn
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`)
    
    // Provide specific guidance for common Atlas issues
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('📋 IP Whitelist Issue:')
      console.log('   1. Go to MongoDB Atlas Dashboard → Network Access')
      console.log('   2. Click "Add IP Address"')
      console.log('   3. Add 0.0.0.0/0 for development (allows all IPs)')
      console.log('   4. Or add your specific IP address')
    } else if (error.message.includes('authentication') || error.message.includes('auth')) {
      console.log('📋 Authentication Issue:')
      console.log('   1. Check your username and password in the connection string')
      console.log('   2. Ensure the user has proper database permissions')
      console.log('   3. Try creating a new database user in Atlas')
    } else if (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('certificate')) {
      console.log('📋 SSL/TLS Issue:')
      console.log('   1. This might be due to corporate firewall or network restrictions')
      console.log('   2. Try connecting from a different network')
      console.log('   3. Check if port 27017 is blocked')
    } else if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
      console.log('📋 Network/Timeout Issue:')
      console.log('   1. Check your internet connection')
      console.log('   2. Try connecting from a different network')
      console.log('   3. Check if MongoDB Atlas is experiencing issues')
    }
    
    console.log('⚠️  Continuing without database connection. Using mock data mode.')
    
    // Ensure mongoose is properly disconnected
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
      }
    } catch (disconnectError) {
      console.error('Error disconnecting mongoose:', disconnectError.message)
    }
    
    return null
  }
}

// Alternative connection method for network issues
export const connectDBAlternative = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  No MongoDB URI provided. Running in mock mode.')
      return null
    }
    
    console.log('🔄 Trying alternative connection method with minimal SSL validation...')
    
    // Simpler connection with minimal options and relaxed SSL
    const alternativeOptions = {
      serverSelectionTimeoutMS: 20000, // Longer timeout
      connectTimeoutMS: 15000,
      socketTimeoutMS: 0,
      bufferCommands: false,
      retryWrites: true,
      ssl: true,
      authSource: 'admin'
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, alternativeOptions)
    
    console.log(`✅ MongoDB connected using alternative method!`)
    console.log(`📍 Host: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
    
    return conn
  } catch (error) {
    console.error(`❌ Alternative connection also failed: ${error.message}`)
    return null
  }
}

// Fallback connection for development (local MongoDB)
export const connectDBLocal = async () => {
  try {
    const localURI = 'mongodb://localhost:27017/skillsprint'
    console.log('🔄 Attempting local MongoDB connection...')
    
    const conn = await mongoose.connect(localURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      bufferCommands: false
    })
    
    console.log(`✅ Local MongoDB connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`❌ Local MongoDB connection failed: ${error.message}`)
    return null
  }
}

// Handle mongoose connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose connection error: ${err}`)
})

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB')
})
