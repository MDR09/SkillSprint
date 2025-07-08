import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Competition from '../models/Competition.js'
import Challenge from '../models/Challenge.js'
import User from '../models/User.js'

// Load environment variables
dotenv.config()

// Sample competitions data
const sampleCompetitions = [
  {
    title: "Weekly Algorithm Challenge",
    description: "Join our weekly algorithm challenge to sharpen your problem-solving skills. Perfect for beginners and intermediate programmers.",
    type: "individual",
    format: "standard",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
    registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    maxParticipants: 100,
    isPublic: true,
    status: "upcoming",
    difficulty: "Medium",
    prizes: [
      {
        position: 1,
        description: "Winner Certificate + $100 Gift Card",
        value: 100
      },
      {
        position: 2,
        description: "Runner-up Certificate + $50 Gift Card",
        value: 50
      },
      {
        position: 3,
        description: "Third Place Certificate + $25 Gift Card",
        value: 25
      }
    ],
    rules: [
      "All solutions must be original work",
      "Participants can use any programming language from the allowed list",
      "Internet research is allowed, but code copying from solutions is prohibited",
      "Time limit for each problem will be clearly specified",
      "Final ranking based on total score and submission time"
    ],
    eligibility: [
      "Open to all skill levels",
      "Must have a valid SkillSprint account",
      "Age 13+ (under 18 requires parental consent)"
    ]
  },
  {
    title: "Frontend Masters Hackathon",
    description: "24-hour hackathon focused on building amazing frontend applications. Show off your React, Vue, or Angular skills!",
    type: "team",
    format: "hackathon",
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 1 week + 1 day from now
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    maxParticipants: 200,
    maxTeamSize: 4,
    isPublic: true,
    status: "upcoming",
    difficulty: "Hard",
    prizes: [
      {
        position: 1,
        description: "Best Overall Project - $2000 team prize",
        value: 2000
      },
      {
        position: 2,
        description: "Most Creative Design - $1000 team prize",
        value: 1000
      },
      {
        position: 3,
        description: "Best Technical Implementation - $500 team prize",
        value: 500
      }
    ],
    rules: [
      "Teams of 2-4 members",
      "Project must be built during the hackathon period",
      "Must use modern frontend frameworks (React, Vue, Angular, etc.)",
      "Code must be submitted via GitHub repository",
      "Live demo required for final judging"
    ],
    eligibility: [
      "Intermediate to advanced frontend developers",
      "Teams can be formed before or during the event",
      "Must have experience with at least one modern frontend framework"
    ]
  },
  {
    title: "AI/ML Innovation Challenge",
    description: "Solve real-world problems using artificial intelligence and machine learning. Build models that make a difference!",
    type: "individual",
    format: "project",
    startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    endTime: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000), // 2 weeks + 30 days from now
    registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    maxParticipants: 50,
    isPublic: true,
    status: "upcoming",
    difficulty: "Hard",
    prizes: [
      {
        position: 1,
        description: "Grand Prize - $5000 + Internship Opportunity",
        value: 5000
      },
      {
        position: 2,
        description: "Runner-up - $2500 + Tech Conference Ticket",
        value: 2500
      },
      {
        position: 3,
        description: "Third Place - $1000 + Online Course Access",
        value: 1000
      }
    ],
    rules: [
      "Project must address a real-world problem",
      "Must use machine learning or AI techniques",
      "Code and documentation must be submitted",
      "Live presentation of solution required",
      "Judging based on innovation, technical merit, and impact"
    ],
    eligibility: [
      "Experience with Python and ML libraries required",
      "Knowledge of data science fundamentals",
      "Previous ML project experience preferred"
    ]
  },
  {
    title: "Beginner's First Code Challenge",
    description: "Perfect for newcomers to programming! Solve fun, beginner-friendly problems and learn the basics.",
    type: "individual",
    format: "standard",
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    maxParticipants: 500,
    isPublic: true,
    status: "upcoming",
    difficulty: "Easy",
    prizes: [
      {
        position: 1,
        description: "Beginner Champion Certificate + Learning Resources",
        value: 0
      },
      {
        position: 2,
        description: "Excellence Certificate + Study Guide",
        value: 0
      },
      {
        position: 3,
        description: "Achievement Certificate + Programming Book",
        value: 0
      }
    ],
    rules: [
      "Designed for programming beginners",
      "Basic problems focusing on fundamentals",
      "Multiple programming languages supported",
      "Learning resources provided",
      "Focus on participation and learning"
    ],
    eligibility: [
      "Beginner programmers welcome",
      "No prior competition experience required",
      "Educational focus over competitive"
    ]
  },
  {
    title: "Full-Stack Development Sprint",
    description: "Build a complete web application from scratch! Challenge yourself with both frontend and backend development.",
    type: "individual",
    format: "project",
    startTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    endTime: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 3 weeks + 2 weeks from now
    registrationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
    maxParticipants: 75,
    isPublic: true,
    status: "upcoming",
    difficulty: "Medium",
    prizes: [
      {
        position: 1,
        description: "Full-Stack Champion - $1500 + Job Referrals",
        value: 1500
      },
      {
        position: 2,
        description: "Outstanding Developer - $750 + Portfolio Review",
        value: 750
      },
      {
        position: 3,
        description: "Rising Star - $300 + Mentorship Session",
        value: 300
      }
    ],
    rules: [
      "Must build both frontend and backend",
      "Application must be fully functional",
      "Database integration required",
      "Deployment to live URL required",
      "Code quality and documentation matter"
    ],
    eligibility: [
      "Experience with both frontend and backend required",
      "Knowledge of databases (SQL or NoSQL)",
      "Familiarity with deployment platforms"
    ]
  }
]

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected for competition seeding')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Seed competitions
const seedCompetitions = async () => {
  try {
    console.log('🏆 Starting to seed competitions...')
    
    // Find an admin user to be the creator
    const admin = await User.findOne({ role: 'admin' })
    
    if (!admin) {
      console.error('❌ No admin user found. Please run the challenge seed script first.')
      process.exit(1)
    }

    // Get some challenges to associate with competitions
    const challenges = await Challenge.find({ status: 'published' }).limit(5)
    
    if (challenges.length === 0) {
      console.error('❌ No challenges found. Please run the challenge seed script first.')
      process.exit(1)
    }

    // Delete existing competitions
    await Competition.deleteMany({})
    console.log('🧹 Cleared existing competitions')

    // Add creator ID and random challenges to each competition
    const competitionsWithData = sampleCompetitions.map(competition => ({
      ...competition,
      organizer: admin._id,
      challenges: challenges.slice(0, Math.min(3, challenges.length)).map(c => c._id)
    }))

    // Insert sample competitions
    const createdCompetitions = await Competition.insertMany(competitionsWithData)
    
    console.log(`✅ Successfully seeded ${createdCompetitions.length} competitions:`)
    createdCompetitions.forEach((competition, index) => {
      console.log(`   ${index + 1}. ${competition.title} (${competition.difficulty})`)
    })

    console.log('🎉 Competition seeding completed!')
    
  } catch (error) {
    console.error('❌ Error seeding competitions:', error)
  }
}

// Run the seeding
const runSeed = async () => {
  await connectDB()
  await seedCompetitions()
  mongoose.connection.close()
  console.log('🔌 Database connection closed')
  process.exit(0)
}

runSeed()
