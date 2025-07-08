import mongoose from 'mongoose'

// Set mongoose options to prevent buffering and timeout issues
mongoose.set('bufferCommands', false)

export const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  No MongoDB URI provided. Running in mock mode.')
      return
    }
    
    console.log('🔄 Attempting to connect to MongoDB...')
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      heartbeatFrequencyMS: 10000, // Send a ping every 10s
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true,
      w: 'majority'
    })
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`)
    
    // Provide specific guidance for common Atlas issues
    if (error.message.includes('IP')) {
      console.log('📋 To fix IP whitelist issues:')
      console.log('   1. Go to MongoDB Atlas Dashboard')
      console.log('   2. Navigate to Network Access')
      console.log('   3. Add your current IP address or use 0.0.0.0/0 for development')
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('📋 SSL/TLS connection issue detected.')
      console.log('   This might be due to network restrictions or firewall settings.')
    }
    
    console.log('⚠️  Continuing without database connection. Using mock data mode.')
    
    // Disconnect mongoose to prevent further connection attempts
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
    
    // Don't exit the process, just log the error and continue
    return null
  }
}

// Alternative connection method for network issues
export const connectDBAlternative = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  No MongoDB URI provided. Running in mock mode.')
      return
    }
    
    console.log('🔄 Trying alternative connection method...')
    
    // Simpler connection with minimal options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      bufferCommands: false
    })
    
    console.log(`✅ MongoDB connected (alternative method): ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`❌ Alternative connection also failed: ${error.message}`)
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
