import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const analyzeConnectionString = () => {
  console.log('🔍 MongoDB Connection String Analysis')
  console.log('=====================================')
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ No MONGODB_URI found in environment variables')
    console.log('💡 Add MONGODB_URI to your .env file')
    return
  }
  
  const uri = process.env.MONGODB_URI
  console.log('✅ Connection string found')
  
  // Check for common issues
  const issues = []
  
  // Check for unencoded special characters in password
  if (uri.includes('@') && !uri.includes('%40')) {
    const parts = uri.split('@')
    if (parts.length > 2) {
      issues.push('🔴 Password may contain unencoded @ symbol')
    }
  }
  
  // Check for other special characters that need encoding
  const specialChars = ['#', '%', '&', '+', '=', '?', ' ']
  const passwordSection = uri.split('://')[1]?.split('@')[0]?.split(':')[1]
  
  if (passwordSection) {
    specialChars.forEach(char => {
      if (passwordSection.includes(char)) {
        issues.push(`🔴 Password contains special character '${char}' that should be URL encoded`)
      }
    })
  }
  
  // Check for SSL/TLS parameters
  if (uri.includes('mongodb+srv://') && !uri.includes('ssl=')) {
    console.log('ℹ️  Using SRV connection (SSL enabled by default)')
  }
  
  // Extract components
  try {
    const url = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://'))
    console.log('\n📊 Connection Details:')
    console.log(`   Protocol: ${uri.startsWith('mongodb+srv://') ? 'MongoDB+SRV (Atlas)' : 'MongoDB'}`)
    console.log(`   Host: ${url.hostname}`)
    console.log(`   Username: ${url.username || 'Not specified'}`)
    console.log(`   Database: ${url.pathname.substring(1).split('?')[0] || 'Default'}`)
    
    // Parse query parameters
    if (url.search) {
      console.log('\n🔧 Connection Options:')
      const params = new URLSearchParams(url.search)
      params.forEach((value, key) => {
        console.log(`   ${key}: ${value}`)
      })
    }
  } catch (e) {
    issues.push('🔴 Invalid connection string format')
  }
  
  // Report issues
  if (issues.length > 0) {
    console.log('\n⚠️  Potential Issues Found:')
    issues.forEach(issue => console.log(`   ${issue}`))
    
    console.log('\n💡 To fix password encoding issues:')
    console.log('   • Replace @ with %40')
    console.log('   • Replace # with %23')
    console.log('   • Replace % with %25')
    console.log('   • Replace & with %26')
    console.log('   • Replace + with %2B')
    console.log('   • Replace = with %3D')
    console.log('   • Replace ? with %3F')
    console.log('   • Replace space with %20')
  } else {
    console.log('\n✅ No obvious issues found in connection string')
  }
  
  console.log('\n📋 Troubleshooting Steps:')
  console.log('1. Verify MongoDB Atlas cluster is running')
  console.log('2. Check Network Access whitelist (add 0.0.0.0/0 for development)')
  console.log('3. Verify database user credentials')
  console.log('4. Test from different network if possible')
  console.log('5. Try connecting with MongoDB Compass first')
}

analyzeConnectionString()
