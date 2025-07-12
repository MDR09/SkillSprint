import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const testConnections = async () => {
  console.log('🧪 MongoDB Connection Test Utility')
  console.log('==================================')
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ No MONGODB_URI found in environment variables')
    return
  }
  
  console.log('🔍 Connection string analysis:')
  const uri = process.env.MONGODB_URI
  
  // Parse connection string details
  try {
    const url = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://'))
    console.log(`📍 Cluster: ${url.hostname}`)
    console.log(`📊 Database: ${url.pathname.substring(1).split('?')[0]}`)
    console.log(`🔐 Authentication: ${url.username ? 'YES' : 'NO'}`)
  } catch (e) {
    console.log('⚠️  Could not parse connection string')
  }
  
  console.log('\n🔄 Testing different connection methods...\n')
  
  // Test 1: Standard connection
  console.log('1️⃣  Testing standard Atlas connection...')
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      ssl: true,
      sslValidate: true,
      authSource: 'admin'
    })
    console.log('✅ Standard connection: SUCCESS')
    await mongoose.disconnect()
  } catch (error) {
    console.log('❌ Standard connection: FAILED')
    console.log(`   Error: ${error.message}`)
  }
  
  // Test 2: Relaxed SSL validation
  console.log('\n2️⃣  Testing with relaxed SSL validation...')
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      ssl: true,
      sslValidate: false,
      authSource: 'admin'
    })
    console.log('✅ Relaxed SSL connection: SUCCESS')
    await mongoose.disconnect()
  } catch (error) {
    console.log('❌ Relaxed SSL connection: FAILED')
    console.log(`   Error: ${error.message}`)
  }
  
  // Test 3: Minimal options
  console.log('\n3️⃣  Testing with minimal options...')
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000
    })
    console.log('✅ Minimal options connection: SUCCESS')
    await mongoose.disconnect()
  } catch (error) {
    console.log('❌ Minimal options connection: FAILED')
    console.log(`   Error: ${error.message}`)
  }
  
  // Test 4: Local MongoDB
  console.log('\n4️⃣  Testing local MongoDB...')
  try {
    await mongoose.connect('mongodb://localhost:27017/skillsprint', {
      serverSelectionTimeoutMS: 5000
    })
    console.log('✅ Local MongoDB connection: SUCCESS')
    await mongoose.disconnect()
  } catch (error) {
    console.log('❌ Local MongoDB connection: FAILED')
    console.log(`   Error: ${error.message}`)
  }
  
  console.log('\n📋 Connection Test Complete')
  console.log('==========================')
  
  process.exit(0)
}

// Run the test
testConnections().catch(error => {
  console.error('Test failed:', error)
  process.exit(1)
})
