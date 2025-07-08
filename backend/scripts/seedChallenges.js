import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Challenge from '../models/Challenge.js'
import User from '../models/User.js'

// Load environment variables
dotenv.config()

// Sample challenges data
const sampleChallenges = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    problemStatement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\``,
    difficulty: "Easy",
    category: "Algorithms",
    tags: ["array", "hash-table", "two-pointers"],
    timeLimit: 60,
    memoryLimit: 256,
    allowedLanguages: ["javascript", "python", "java", "cpp"],
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        isHidden: false,
        weight: 1
      },
      {
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        isHidden: false,
        weight: 1
      },
      {
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        isHidden: false,
        weight: 1
      },
      {
        input: "[1,2,3,4,5]\n9",
        expectedOutput: "[3,4]",
        isHidden: true,
        weight: 2
      }
    ],
    sampleInput: "[2,7,11,15]\n9",
    sampleOutput: "[0,1]",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be too slow.",
      "Use a hash map to store numbers and their indices.",
      "For each number, check if target - number exists in the hash map."
    ],
    scoring: {
      maxPoints: 100,
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
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    problemStatement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: s = "(]"
Output: false
\`\`\``,
    difficulty: "Easy",
    category: "Data Structures",
    tags: ["string", "stack"],
    timeLimit: 45,
    memoryLimit: 256,
    allowedLanguages: ["javascript", "python", "java", "cpp"],
    testCases: [
      {
        input: "()",
        expectedOutput: "true",
        isHidden: false,
        weight: 1
      },
      {
        input: "()[]{}", 
        expectedOutput: "true",
        isHidden: false,
        weight: 1
      },
      {
        input: "(]",
        expectedOutput: "false",
        isHidden: false,
        weight: 1
      },
      {
        input: "((()))",
        expectedOutput: "true",
        isHidden: true,
        weight: 2
      }
    ],
    sampleInput: "()",
    sampleOutput: "true",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    hints: [
      "Use a stack data structure.",
      "Push opening brackets onto the stack and pop when you encounter closing brackets.",
      "Check if the popped bracket matches the current closing bracket."
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
    title: "Longest Common Subsequence",
    description: "Given two strings text1 and text2, return the length of their longest common subsequence.",
    problemStatement: `Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

For example, "ace" is a subsequence of "abcde".

A common subsequence of two strings is a subsequence that is common to both strings.

**Example 1:**
\`\`\`
Input: text1 = "abcde", text2 = "ace" 
Output: 3  
Explanation: The longest common subsequence is "ace" and its length is 3.
\`\`\`

**Example 2:**
\`\`\`
Input: text1 = "abc", text2 = "abc"
Output: 3
Explanation: The longest common subsequence is "abc" and its length is 3.
\`\`\`

**Example 3:**
\`\`\`
Input: text1 = "abc", text2 = "def"
Output: 0
Explanation: There is no such common subsequence, so the result is 0.
\`\`\``,
    difficulty: "Medium",
    category: "Dynamic Programming",
    tags: ["string", "dynamic-programming"],
    timeLimit: 90,
    memoryLimit: 512,
    allowedLanguages: ["javascript", "python", "java", "cpp"],
    testCases: [
      {
        input: "abcde\nace",
        expectedOutput: "3",
        isHidden: false,
        weight: 1
      },
      {
        input: "abc\nabc",
        expectedOutput: "3",
        isHidden: false,
        weight: 1
      },
      {
        input: "abc\ndef",
        expectedOutput: "0",
        isHidden: false,
        weight: 1
      },
      {
        input: "abcdefghijklmnop\nace",
        expectedOutput: "3",
        isHidden: true,
        weight: 2
      }
    ],
    sampleInput: "abcde\nace",
    sampleOutput: "3",
    constraints: "1 <= text1.length, text2.length <= 1000\ntext1 and text2 consist of only lowercase English characters.",
    hints: [
      "Try using dynamic programming. DP[i][j] represents the longest common subsequence of text1[0...i] & text2[0...j].",
      "DP[i][j] = DP[i-1][j-1] + 1, if text1[i] == text2[j] DP[i][j] = max(DP[i-1][j], DP[i][j-1]), otherwise"
    ],
    scoring: {
      maxPoints: 200,
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
    title: "Binary Tree Maximum Path Sum",
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them.",
    problemStatement: `A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.

The path sum of a path is the sum of the node's values in the path.

Given the root of a binary tree, return the maximum path sum of any non-empty path.

**Example 1:**
\`\`\`
Input: root = [1,2,3]
Output: 6
Explanation: The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.
\`\`\`

**Example 2:**
\`\`\`
Input: root = [-10,9,20,null,null,15,7]
Output: 42
Explanation: The optimal path is 15 -> 20 -> 7 with a path sum of 15 + 20 + 7 = 42.
\`\`\``,
    difficulty: "Hard",
    category: "Data Structures",
    tags: ["binary-tree", "depth-first-search", "recursion"],
    timeLimit: 120,
    memoryLimit: 512,
    allowedLanguages: ["javascript", "python", "java", "cpp"],
    testCases: [
      {
        input: "[1,2,3]",
        expectedOutput: "6",
        isHidden: false,
        weight: 1
      },
      {
        input: "[-10,9,20,null,null,15,7]",
        expectedOutput: "42",
        isHidden: false,
        weight: 1
      },
      {
        input: "[-3]",
        expectedOutput: "-3",
        isHidden: true,
        weight: 2
      }
    ],
    sampleInput: "[1,2,3]",
    sampleOutput: "6",
    constraints: "The number of nodes in the tree is in the range [1, 3 * 10^4].\n-1000 <= Node.val <= 1000",
    hints: [
      "For each node, think about the maximum path sum that goes through that node.",
      "The path can either start from the current node, or pass through it.",
      "Use recursion to calculate the maximum path sum for each subtree."
    ],
    scoring: {
      maxPoints: 300,
      partialScoring: false,
      timeBonus: true,
      timeBonusPercentage: 25
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
    title: "Build a Todo App API",
    description: "Create a RESTful API for a Todo application with CRUD operations and user authentication.",
    problemStatement: `Create a RESTful API for a Todo application with the following requirements:

**Features Required:**
1. User authentication (register, login, logout)
2. CRUD operations for todos
3. Todo categories/tags
4. Mark todos as complete/incomplete
5. Filter todos by status and category

**API Endpoints:**
- POST /auth/register - Register a new user
- POST /auth/login - Login user
- POST /auth/logout - Logout user
- GET /todos - Get all todos for authenticated user
- POST /todos - Create a new todo
- PUT /todos/:id - Update a todo
- DELETE /todos/:id - Delete a todo
- GET /todos/stats - Get todo statistics

**Todo Model:**
\`\`\`
{
  id: string,
  title: string,
  description: string,
  completed: boolean,
  category: string,
  priority: 'low' | 'medium' | 'high',
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

**Requirements:**
- Use Express.js framework
- Implement JWT authentication
- Use MongoDB with Mongoose
- Include input validation
- Add error handling middleware
- Include API documentation`,
    difficulty: "Medium",
    category: "Backend",
    tags: ["express", "mongodb", "jwt", "rest-api", "node.js"],
    timeLimit: 180,
    memoryLimit: 512,
    allowedLanguages: ["javascript", "typescript"],
    testCases: [
      {
        input: "API_ENDPOINT_TEST",
        expectedOutput: "AUTHENTICATION_WORKING",
        isHidden: false,
        weight: 1
      },
      {
        input: "CRUD_OPERATIONS_TEST",
        expectedOutput: "ALL_ENDPOINTS_WORKING",
        isHidden: false,
        weight: 3
      },
      {
        input: "VALIDATION_TEST",
        expectedOutput: "INPUT_VALIDATION_WORKING",
        isHidden: true,
        weight: 2
      }
    ],
    sampleInput: "Create API endpoints as specified",
    sampleOutput: "Working RESTful API with all features",
    constraints: "Must use Express.js, MongoDB, and JWT\nInclude proper error handling\nAPI must be RESTful",
    hints: [
      "Start with setting up Express server and MongoDB connection",
      "Implement authentication middleware first",
      "Use Mongoose schemas for data validation",
      "Don't forget to hash passwords before storing"
    ],
    scoring: {
      maxPoints: 250,
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
    title: "React Todo Dashboard",
    description: "Build a responsive React dashboard for managing todos with real-time updates.",
    problemStatement: `Create a modern React Todo Dashboard application with the following features:

**Core Features:**
1. Responsive design that works on desktop and mobile
2. Create, read, update, delete todos
3. Filter todos by status (all, active, completed)
4. Search functionality
5. Drag and drop to reorder todos
6. Dark/light theme toggle
7. Real-time sync with backend API

**Technical Requirements:**
- Use React 18+ with hooks
- Implement state management (Redux or Zustand)
- Use TypeScript for type safety
- Responsive design with CSS-in-JS or Tailwind CSS
- Include animations and transitions
- Error boundaries for error handling
- Loading states and optimistic updates

**Components to Build:**
- TodoList component
- TodoItem component
- AddTodo form component
- FilterBar component
- SearchBar component
- ThemeToggle component

**Bonus Features:**
- Offline support with service workers
- Export todos to CSV/JSON
- Todo statistics dashboard
- Keyboard shortcuts`,
    difficulty: "Medium",
    category: "Frontend",
    tags: ["react", "typescript", "redux", "tailwind", "responsive"],
    timeLimit: 150,
    memoryLimit: 256,
    allowedLanguages: ["typescript", "javascript"],
    testCases: [
      {
        input: "COMPONENT_RENDERING_TEST",
        expectedOutput: "ALL_COMPONENTS_RENDER",
        isHidden: false,
        weight: 1
      },
      {
        input: "CRUD_FUNCTIONALITY_TEST",
        expectedOutput: "CRUD_OPERATIONS_WORKING",
        isHidden: false,
        weight: 2
      },
      {
        input: "RESPONSIVE_DESIGN_TEST",
        expectedOutput: "MOBILE_DESKTOP_COMPATIBLE",
        isHidden: true,
        weight: 1
      }
    ],
    sampleInput: "Build React Todo Dashboard as specified",
    sampleOutput: "Fully functional Todo Dashboard with all features",
    constraints: "Must use React 18+\nTypeScript required\nResponsive design mandatory",
    hints: [
      "Start with basic todo CRUD operations",
      "Use React hooks for state management",
      "Implement proper TypeScript interfaces",
      "Consider using React Query for API state management"
    ],
    scoring: {
      maxPoints: 200,
      partialScoring: true,
      timeBonus: true,
      timeBonusPercentage: 10
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
    console.log('✅ MongoDB connected for seeding')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Seed challenges
const seedChallenges = async () => {
  try {
    console.log('🌱 Starting to seed challenges...')
    
    // Find an admin user to be the creator
    let admin = await User.findOne({ role: 'admin' })
    
    if (!admin) {
      // Create an admin user if none exists
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@skillsprint.com',
        username: 'admin',
        password: 'AdminPassword123!',
        role: 'admin',
        isEmailVerified: true
      })
      console.log('✅ Created admin user')
    }

    // Delete existing challenges
    await Challenge.deleteMany({})
    console.log('🧹 Cleared existing challenges')

    // Add creator ID to each challenge
    const challengesWithCreator = sampleChallenges.map(challenge => ({
      ...challenge,
      creator: admin._id
    }))

    // Insert sample challenges
    const createdChallenges = await Challenge.insertMany(challengesWithCreator)
    
    console.log(`✅ Successfully seeded ${createdChallenges.length} challenges:`)
    createdChallenges.forEach((challenge, index) => {
      console.log(`   ${index + 1}. ${challenge.title} (${challenge.difficulty})`)
    })

    console.log('🎉 Challenge seeding completed!')
    
  } catch (error) {
    console.error('❌ Error seeding challenges:', error)
  }
}

// Run the seeding
const runSeed = async () => {
  await connectDB()
  await seedChallenges()
  mongoose.connection.close()
  console.log('🔌 Database connection closed')
  process.exit(0)
}

runSeed()
