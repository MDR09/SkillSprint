import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Challenge from '../models/Challenge.js'
import User from '../models/User.js'

// Load environment variables
dotenv.config()

// Additional challenges data
const additionalChallenges = [
  {
    title: "Fibonacci Sequence",
    description: "Write a function to return the nth Fibonacci number.",
    problemStatement: `The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

Given n, calculate F(n).

**Example 1:**
\`\`\`
Input: n = 2
Output: 1
Explanation: F(2) = F(1) + F(0) = 1 + 0 = 1.
\`\`\`

**Example 2:**
\`\`\`
Input: n = 3
Output: 2
Explanation: F(3) = F(2) + F(1) = 1 + 1 = 2.
\`\`\`

**Example 3:**
\`\`\`
Input: n = 4
Output: 3
Explanation: F(4) = F(3) + F(2) = 2 + 1 = 3.
\`\`\``,
    difficulty: "Easy",
    category: "Dynamic Programming",
    tags: ["recursion", "dynamic-programming", "math"],
    timeLimit: 45,
    memoryLimit: 256,
    allowedLanguages: ["javascript", "python", "java", "cpp"],
    testCases: [
      {
        input: "2",
        expectedOutput: "1",
        isHidden: false,
        weight: 1
      },
      {
        input: "3",
        expectedOutput: "2",
        isHidden: false,
        weight: 1
      },
      {
        input: "4",
        expectedOutput: "3",
        isHidden: false,
        weight: 1
      },
      {
        input: "10",
        expectedOutput: "55",
        isHidden: true,
        weight: 2
      }
    ],
    sampleInput: "2",
    sampleOutput: "1",
    constraints: "0 <= n <= 30",
    hints: [
      "You can solve this recursively, but it will be slow for large n.",
      "Try using dynamic programming to store previously calculated values.",
      "Can you solve it with O(1) space complexity?"
    ],
    scoring: {
      maxPoints: 100,
      partialScoring: true,
      timeBonus: false
    },
    schedule: {
      startTime: new Date('2025-01-01T00:00:00.000Z'),
      endTime: new Date('2025-12-31T23:59:59.000Z'),
      timezone: 'UTC'
    },
    status: "published",
    visibility: "public"
  },
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    problemStatement: `Given the head of a singly linked list, reverse the list, and return the reversed list.

**Example 1:**
\`\`\`
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
\`\`\`

**Example 2:**
\`\`\`
Input: head = [1,2]
Output: [2,1]
\`\`\`

**Example 3:**
\`\`\`
Input: head = []
Output: []
\`\`\`

**Follow up:** A linked list can be reversed either iteratively or recursively. Could you implement both?`,
    difficulty: "Easy",
    category: "Data Structures",
    tags: ["linked-list", "recursion", "two-pointers"],
    timeLimit: 60,
    memoryLimit: 256,
    allowedLanguages: ["javascript", "python", "java", "cpp"],
    testCases: [
      {
        input: "[1,2,3,4,5]",
        expectedOutput: "[5,4,3,2,1]",
        isHidden: false,
        weight: 1
      },
      {
        input: "[1,2]",
        expectedOutput: "[2,1]",
        isHidden: false,
        weight: 1
      },
      {
        input: "[]",
        expectedOutput: "[]",
        isHidden: false,
        weight: 1
      },
      {
        input: "[1]",
        expectedOutput: "[1]",
        isHidden: true,
        weight: 1
      }
    ],
    sampleInput: "[1,2,3,4,5]",
    sampleOutput: "[5,4,3,2,1]",
    constraints: "The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
    hints: [
      "Think about what variables you need to keep track of as you iterate through the list.",
      "You need to change the next pointer of each node to point to the previous node.",
      "Don't forget to handle the edge cases (empty list, single node)."
    ],
    scoring: {
      maxPoints: 100,
      partialScoring: true,
      timeBonus: true,
      timeBonusPercentage: 15
    },
    schedule: {
      startTime: new Date('2025-01-01T00:00:00.000Z'),
      endTime: new Date('2025-12-31T23:59:59.000Z'),
      timezone: 'UTC'
    },
    status: "published",
    visibility: "public"
  },
  {
    title: "Product of Array Except Self",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
    problemStatement: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.

**Example 1:**
\`\`\`
Input: nums = [1,2,3,4]
Output: [24,12,8,6]
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]
\`\`\`

**Follow up:** Can you solve the problem in O(1) extra space complexity? (The output array does not count as extra space for space complexity analysis.)`,
    difficulty: "Medium",
    category: "Algorithms",
    tags: ["array", "prefix-sum"],
    timeLimit: 75,
    memoryLimit: 256,
    allowedLanguages: ["javascript", "python", "java", "cpp"],
    testCases: [
      {
        input: "[1,2,3,4]",
        expectedOutput: "[24,12,8,6]",
        isHidden: false,
        weight: 1
      },
      {
        input: "[-1,1,0,-3,3]",
        expectedOutput: "[0,0,9,0,0]",
        isHidden: false,
        weight: 1
      },
      {
        input: "[2,3,4,5]",
        expectedOutput: "[60,40,30,24]",
        isHidden: true,
        weight: 2
      }
    ],
    sampleInput: "[1,2,3,4]",
    sampleOutput: "[24,12,8,6]",
    constraints: "2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.",
    hints: [
      "Think about how you can calculate the product of all elements to the left and right of each index.",
      "You can do this in two passes - one for left products and one for right products.",
      "Can you optimize the space complexity by using the output array to store intermediate results?"
    ],
    scoring: {
      maxPoints: 150,
      partialScoring: true,
      timeBonus: true,
      timeBonusPercentage: 20
    },
    schedule: {
      startTime: new Date('2025-01-01T00:00:00.000Z'),
      endTime: new Date('2025-12-31T23:59:59.000Z'),
      timezone: 'UTC'
    },
    status: "published",
    visibility: "public"
  },
  {
    title: "Design a Chat Application",
    description: "Design and implement a real-time chat application with WebSocket support.",
    problemStatement: `Design and implement a real-time chat application with the following features:

**Core Features:**
1. Real-time messaging using WebSockets
2. User authentication and authorization
3. Multiple chat rooms/channels
4. Private messaging between users
5. Message history and persistence
6. Online user status
7. Typing indicators
8. Message reactions (like, love, etc.)

**Technical Requirements:**
- Backend: Node.js with Socket.io
- Frontend: React with Socket.io client
- Database: MongoDB for message storage
- Authentication: JWT tokens
- Real-time features: WebSocket connections

**API Design:**
- POST /auth/login - User authentication
- GET /rooms - Get available chat rooms
- POST /rooms - Create new chat room
- GET /rooms/:id/messages - Get room message history
- WebSocket events: join_room, leave_room, send_message, typing, etc.

**Database Schema:**
\`\`\`
User: { id, username, email, avatar, isOnline, lastSeen }
Room: { id, name, description, isPrivate, members, createdBy }
Message: { id, content, sender, room, timestamp, reactions }
\`\`\`

**Bonus Features:**
- File/image sharing
- Message search functionality
- Push notifications
- Voice/video calling integration`,
    difficulty: "Hard",
    category: "Full Stack",
    tags: ["websockets", "socket.io", "react", "mongodb", "real-time"],
    timeLimit: 240,
    memoryLimit: 1024,
    allowedLanguages: ["javascript", "typescript"],
    testCases: [
      {
        input: "REAL_TIME_MESSAGING_TEST",
        expectedOutput: "WEBSOCKET_CONNECTION_WORKING",
        isHidden: false,
        weight: 2
      },
      {
        input: "AUTHENTICATION_TEST",
        expectedOutput: "JWT_AUTH_WORKING",
        isHidden: false,
        weight: 1
      },
      {
        input: "MESSAGE_PERSISTENCE_TEST",
        expectedOutput: "MESSAGES_STORED_AND_RETRIEVED",
        isHidden: true,
        weight: 2
      }
    ],
    sampleInput: "Implement chat application as specified",
    sampleOutput: "Fully functional real-time chat application",
    constraints: "Must use WebSockets for real-time communication\nImplement proper authentication\nStore messages in database",
    hints: [
      "Start with basic WebSocket connection between client and server",
      "Implement authentication before allowing users to join rooms",
      "Use Socket.io rooms feature for managing chat rooms",
      "Consider using Redis for storing online user sessions in production"
    ],
    scoring: {
      maxPoints: 400,
      partialScoring: true,
      timeBonus: false
    },
    schedule: {
      startTime: new Date('2025-01-01T00:00:00.000Z'),
      endTime: new Date('2025-12-31T23:59:59.000Z'),
      timezone: 'UTC'
    },
    status: "published",
    visibility: "public"
  },
  {
    title: "Machine Learning Model Deployment",
    description: "Deploy a machine learning model as a REST API with proper error handling and monitoring.",
    problemStatement: `Create a production-ready deployment for a machine learning model with the following requirements:

**Project Overview:**
Deploy a pre-trained machine learning model (e.g., image classification, text sentiment analysis, or house price prediction) as a REST API that can handle real-world traffic.

**Technical Requirements:**
1. **Model API:**
   - REST API endpoints for model inference
   - Input validation and preprocessing
   - Output formatting and error handling
   - Support for batch predictions

2. **Infrastructure:**
   - Containerized deployment (Docker)
   - Load balancing and scaling
   - Health checks and monitoring
   - Logging and metrics collection

3. **API Design:**
   - POST /predict - Single prediction
   - POST /predict/batch - Batch predictions
   - GET /health - Health check endpoint
   - GET /metrics - Model performance metrics

**Implementation Details:**
- Use Flask/FastAPI for the API server
- Implement proper input validation
- Add rate limiting and authentication
- Include comprehensive error handling
- Add model versioning support
- Implement caching for common requests

**Deliverables:**
- Working API with all endpoints
- Docker container with the application
- docker-compose.yml for easy deployment
- API documentation (OpenAPI/Swagger)
- Monitoring dashboard setup
- Load testing results`,
    difficulty: "Hard",
    category: "Machine Learning",
    tags: ["ml-deployment", "docker", "flask", "fastapi", "monitoring"],
    timeLimit: 180,
    memoryLimit: 1024,
    allowedLanguages: ["python"],
    testCases: [
      {
        input: "API_ENDPOINT_TEST",
        expectedOutput: "PREDICTION_API_WORKING",
        isHidden: false,
        weight: 2
      },
      {
        input: "DOCKER_DEPLOYMENT_TEST",
        expectedOutput: "CONTAINER_RUNNING_SUCCESSFULLY",
        isHidden: false,
        weight: 1
      },
      {
        input: "LOAD_TESTING",
        expectedOutput: "API_HANDLES_CONCURRENT_REQUESTS",
        isHidden: true,
        weight: 2
      }
    ],
    sampleInput: "Deploy ML model as specified",
    sampleOutput: "Production-ready ML API with monitoring",
    constraints: "Must use Docker for deployment\nImplement proper error handling\nInclude monitoring and logging",
    hints: [
      "Start with a simple Flask/FastAPI application",
      "Use joblib or pickle to load your trained model",
      "Implement proper input validation for model features",
      "Consider using nginx for load balancing in production"
    ],
    scoring: {
      maxPoints: 350,
      partialScoring: true,
      timeBonus: false
    },
    schedule: {
      startTime: new Date('2025-01-01T00:00:00.000Z'),
      endTime: new Date('2025-12-31T23:59:59.000Z'),
      timezone: 'UTC'
    },
    status: "published",
    visibility: "public"
  }
]

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected for additional seeding')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Seed additional challenges
const seedAdditionalChallenges = async () => {
  try {
    console.log('🌱 Adding more challenges...')
    
    // Find an admin user to be the creator
    const admin = await User.findOne({ role: 'admin' })
    
    if (!admin) {
      console.error('❌ No admin user found. Please run the main seed script first.')
      process.exit(1)
    }

    // Add creator ID to each challenge
    const challengesWithCreator = additionalChallenges.map(challenge => ({
      ...challenge,
      creator: admin._id
    }))

    // Insert additional challenges
    const createdChallenges = await Challenge.insertMany(challengesWithCreator)
    
    console.log(`✅ Successfully added ${createdChallenges.length} more challenges:`)
    createdChallenges.forEach((challenge, index) => {
      console.log(`   ${index + 1}. ${challenge.title} (${challenge.difficulty})`)
    })

    // Get total count
    const totalChallenges = await Challenge.countDocuments()
    console.log(`📊 Total challenges in database: ${totalChallenges}`)
    
    console.log('🎉 Additional challenge seeding completed!')
    
  } catch (error) {
    console.error('❌ Error seeding additional challenges:', error)
  }
}

// Run the seeding
const runSeed = async () => {
  await connectDB()
  await seedAdditionalChallenges()
  mongoose.connection.close()
  console.log('🔌 Database connection closed')
  process.exit(0)
}

runSeed()
