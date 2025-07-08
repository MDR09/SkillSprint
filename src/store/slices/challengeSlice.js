import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import challengeAPI from '../../services/api/challengeAPI'

// Async thunks
export const fetchChallenges = createAsyncThunk(
  'challenges/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.getAllChallenges(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchChallengeById = createAsyncThunk(
  'challenges/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.getChallengeById(id)
      return response.data
    } catch (error) {
      // Fallback to mock data for demo purposes
      console.log('API failed, using mock data for challenge:', id)
      
      const mockChallenges = {
        '1': {
          _id: '1',
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
          difficulty: 'Easy',
          category: 'Array',
          tags: ['Array', 'Hash Table'],
          functionName: 'twoSum',
          className: 'Solution',
          returnType: 'int[]',
          pythonReturnType: 'List[int]',
          javaReturnType: 'int[]',
          cppReturnType: 'vector<int>',
          cReturnType: 'int*',
          parameters: [
            { name: 'nums', type: 'int[]', pythonType: 'List[int]', javaType: 'int[]', cppType: 'vector<int>&', cType: 'int*' },
            { name: 'target', type: 'int', pythonType: 'int', javaType: 'int', cppType: 'int', cType: 'int' }
          ],
          sampleTestCases: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              output: '[0,1]',
              explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            }
          ],
          constraints: [
            '2 ≤ nums.length ≤ 10^4',
            '-10^9 ≤ nums[i] ≤ 10^9',
            '-10^9 ≤ target ≤ 10^9',
            'Only one valid answer exists.'
          ],
          hints: [
            'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
            'So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x.',
            'Can we use additional space like a hash map to speed up the search?'
          ],
          allowedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
          timeLimit: 1000,
          memoryLimit: 256,
          points: 100
        },
        '2': {
          _id: '2',
          title: 'Add Two Numbers',
          description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
          difficulty: 'Medium',
          category: 'Linked List',
          tags: ['Linked List', 'Math', 'Recursion'],
          functionName: 'addTwoNumbers',
          className: 'Solution',
          returnType: 'ListNode*',
          pythonReturnType: 'Optional[ListNode]',
          javaReturnType: 'ListNode',
          cppReturnType: 'ListNode*',
          cReturnType: 'struct ListNode*',
          parameters: [
            { name: 'l1', type: 'ListNode*', pythonType: 'Optional[ListNode]', javaType: 'ListNode', cppType: 'ListNode*', cType: 'struct ListNode*' },
            { name: 'l2', type: 'ListNode*', pythonType: 'Optional[ListNode]', javaType: 'ListNode', cppType: 'ListNode*', cType: 'struct ListNode*' }
          ],
          sampleTestCases: [
            {
              input: 'l1 = [2,4,3], l2 = [5,6,4]',
              output: '[7,0,8]',
              explanation: '342 + 465 = 807.'
            }
          ],
          constraints: [
            'The number of nodes in each linked list is in the range [1, 100].',
            '0 ≤ Node.val ≤ 9',
            'It is guaranteed that the list represents a number that does not have leading zeros.'
          ],
          hints: [
            'Think about how you would add two numbers on paper. You start from the least significant digit.',
            'Since the digits are stored in reverse order, we can start from the head of both linked lists.',
            'Don\'t forget to handle the carry when the sum of two digits is greater than 9.'
          ],
          allowedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
          timeLimit: 1000,
          memoryLimit: 256,
          points: 150
        },
        '3': {
          _id: '3',
          title: 'Longest Palindromic Substring',
          description: 'Given a string s, return the longest palindromic substring in s.',
          difficulty: 'Medium',
          category: 'String',
          tags: ['String', 'Dynamic Programming'],
          functionName: 'longestPalindrome',
          className: 'Solution',
          returnType: 'string',
          pythonReturnType: 'str',
          javaReturnType: 'String',
          cppReturnType: 'string',
          cReturnType: 'char*',
          parameters: [
            { name: 's', type: 'string', pythonType: 'str', javaType: 'String', cppType: 'string', cType: 'char*' }
          ],
          sampleTestCases: [
            {
              input: 's = "babad"',
              output: '"bab"',
              explanation: '"aba" is also a valid answer.'
            }
          ],
          constraints: [
            '1 ≤ s.length ≤ 1000',
            's consist of only digits and English letters.'
          ],
          hints: [
            'How can we reuse a previously computed palindrome to compute a larger palindrome?',
            'If "aba" is a palindrome, is "xabax" a palindrome? Similarly is "xabay" a palindrome?',
            'Can we reduce the time for palindromic checks to O(1) by reusing some previous computation?'
          ],
          allowedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
          timeLimit: 1000,
          memoryLimit: 256,
          points: 150
        }
      }
      
      const mockChallenge = mockChallenges[id]
      if (mockChallenge) {
        return mockChallenge
      }
      
      return rejectWithValue(error.response?.data || { message: 'Challenge not found' })
    }
  }
)

export const createChallenge = createAsyncThunk(
  'challenges/create',
  async (challengeData, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.createChallenge(challengeData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const joinChallenge = createAsyncThunk(
  'challenges/join',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.joinChallenge(challengeId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const deleteChallenge = createAsyncThunk(
  'challenges/delete',
  async (challengeId, { rejectWithValue }) => {
    try {
      await challengeAPI.deleteChallenge(challengeId)
      return challengeId
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  challenges: [],
  currentChallenge: null,
  isLoading: false,
  error: null,
  filters: {
    difficulty: 'all',
    status: 'all',
    category: 'all',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
}

const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearCurrentChallenge: (state) => {
      state.currentChallenge = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all challenges
      .addCase(fetchChallenges.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.isLoading = false
        state.challenges = action.payload.data?.challenges || action.payload.challenges || []
        state.pagination.total = action.payload.data?.total || action.payload.total || 0
        state.error = null
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Failed to fetch challenges'
      })
      // Fetch challenge by ID
      .addCase(fetchChallengeById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChallengeById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentChallenge = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchChallengeById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Failed to fetch challenge'
      })
      // Create challenge
      .addCase(createChallenge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createChallenge.fulfilled, (state, action) => {
        state.isLoading = false
        const newChallenge = action.payload.data?.challenge || action.payload.challenge || action.payload
        state.challenges.unshift(newChallenge)
        state.error = null
      })
      .addCase(createChallenge.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Failed to create challenge'
      })
      // Join challenge
      .addCase(joinChallenge.fulfilled, (state, action) => {
        if (state.currentChallenge) {
          state.currentChallenge.participants = action.payload.participants
        }
      })
      // Delete challenge
      .addCase(deleteChallenge.pending, (state) => {
        state.error = null
      })
      .addCase(deleteChallenge.fulfilled, (state, action) => {
        const challengeId = action.payload
        state.challenges = state.challenges.filter(challenge => challenge._id !== challengeId)
        if (state.currentChallenge?._id === challengeId) {
          state.currentChallenge = null
        }
        state.error = null
      })
      .addCase(deleteChallenge.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to delete challenge'
      })
  },
})

export const { clearError, setFilters, setPagination, clearCurrentChallenge } = challengeSlice.actions
export default challengeSlice.reducer
