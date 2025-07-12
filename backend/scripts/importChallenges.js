import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import Challenge from '../models/Challenge.js'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const importChallengesFromJSON = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsprint')
    console.log('Connected to MongoDB')

    // Get or create a default admin user for challenges
    let adminUser = await User.findOne({ email: 'admin@skillsprint.com' })
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@skillsprint.com',
        password: 'admin123', // In production, use proper hashing
        role: 'admin',
        isVerified: true
      })
      console.log('Created admin user')
    }

    // Read all JSON files from sample-problems directory
    const problemsDir = path.join(process.cwd(), '..', 'sample-problems')
    
    if (!fs.existsSync(problemsDir)) {
      console.log('Creating sample-problems directory...')
      fs.mkdirSync(problemsDir, { recursive: true })
      console.log('Please add your problem JSON files to the sample-problems directory')
      return
    }

    const files = fs.readdirSync(problemsDir).filter(file => file.endsWith('.json'))
    
    if (files.length === 0) {
      console.log('No JSON files found in sample-problems directory')
      return
    }

    console.log(`Found ${files.length} problem files`)

    for (const file of files) {
      try {
        const filePath = path.join(problemsDir, file)
        const problemData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        
        // Check if challenge already exists
        const existingChallenge = await Challenge.findOne({ 
          title: problemData.title,
          creator: adminUser._id 
        })
        
        if (existingChallenge) {
          console.log(`Challenge "${problemData.title}" already exists, skipping...`)
          continue
        }

        // Transform the problem data to match our schema
        const challengeData = {
          title: problemData.title,
          description: problemData.description,
          problemStatement: problemData.problemStatement,
          difficulty: problemData.difficulty,
          category: problemData.category || 'Algorithms',
          tags: problemData.tags || [],
          creator: adminUser._id,
          timeLimit: problemData.timeLimit || 60, // Default 60 minutes
          memoryLimit: problemData.memoryLimit ? parseInt(problemData.memoryLimit) : 256,
          allowedLanguages: problemData.allowedLanguages || ['javascript', 'python', 'java', 'cpp'],
          
          // Function signature
          functionName: problemData.functionName,
          parameters: problemData.parameters || [],
          returnType: problemData.returnType,
          pythonReturnType: problemData.pythonReturnType,
          javaReturnType: problemData.javaReturnType,
          cppReturnType: problemData.cppReturnType,
          
          // Examples and test cases
          examples: problemData.examples || [],
          testCases: problemData.testCases || [],
          
          // Additional info
          constraints: problemData.constraints || [],
          hints: problemData.hints || [],
          timeComplexity: problemData.timeComplexity,
          spaceComplexity: problemData.spaceComplexity,
          
          // Legacy fields for backward compatibility
          sampleInput: problemData.examples?.[0]?.input || '',
          sampleOutput: problemData.examples?.[0]?.output || '',
          
          // Scoring
          scoring: {
            maxPoints: problemData.scoring?.maxPoints || 100,
            partialScoring: problemData.scoring?.partialCredit !== false,
            timeBonus: problemData.scoring?.timeBonus || false,
            timeBonusPercentage: problemData.scoring?.timeBonusPercentage || 0
          },
          
          // Schedule (set as active immediately)
          schedule: {
            startTime: new Date(),
            endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            timezone: 'UTC'
          },
          
          status: 'published',
          visibility: 'public'
        }

        const challenge = await Challenge.create(challengeData)
        console.log(`✅ Imported challenge: "${challenge.title}"`)
        
      } catch (error) {
        console.error(`❌ Error importing ${file}:`, error.message)
      }
    }

    console.log('Import process completed!')
    
  } catch (error) {
    console.error('Error during import:', error)
  } finally {
    mongoose.connection.close()
  }
}

// Run the import
importChallengesFromJSON()
