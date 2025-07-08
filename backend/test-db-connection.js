#!/usr/bin/env node

// MongoDB Connection Test Script
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

async function testConnection() {
  console.log('🧪 MongoDB Connection Test')
  console.log('===========================')
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI not found in environment variables')
    return
  }
  
  console.log('🔗 MongoDB URI found (partial):', process.env.MONGODB_URI.substring(0, 20) + '...')
  
  const connectionOptions = [
    {
      name: 'Standard Connection',
      options: {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false,
        retryWrites: true,
        w: 'majority'
      }
    },
    {
      name: 'Minimal Connection',
      options: {
        serverSelectionTimeoutMS: 15000,
        bufferCommands: false
      }
    },
    {
      name: 'Legacy Connection',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false
      }
    }
  ]
  
  for (const { name, options } of connectionOptions) {
    console.log(`\n🔄 Trying ${name}...`)
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, options)
      console.log(`✅ ${name} successful!`)
      console.log(`   Host: ${conn.connection.host}`)
      console.log(`   Database: ${conn.connection.name}`)
      console.log(`   Ready State: ${conn.connection.readyState}`)
      
      await mongoose.disconnect()
      console.log('✅ Connection test passed!')
      process.exit(0)
    } catch (error) {
      console.log(`❌ ${name} failed:`)
      console.log(`   Error: ${error.message}`)
      
      if (error.message.includes('IP')) {
        console.log('💡 Suggestion: Check MongoDB Atlas IP whitelist')
      } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
        console.log('💡 Suggestion: SSL/TLS issue - check network/firewall')
      } else if (error.message.includes('authentication')) {
        console.log('💡 Suggestion: Check username/password in connection string')
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  console.log('\n❌ All connection attempts failed')
  console.log('\n📋 Troubleshooting steps:')
  console.log('1. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)')
  console.log('2. Verify username and password in connection string')
  console.log('3. Check if your network allows MongoDB connections (port 27017)')
  console.log('4. Try connecting from MongoDB Compass with the same URI')
  console.log('5. Check if VPN or firewall is blocking the connection')
  
  process.exit(1)
}

testConnection()
