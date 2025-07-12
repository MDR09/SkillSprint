import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authAPI from '../../services/api/authAPI'

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      localStorage.setItem('token', response.data.token)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData)
      localStorage.setItem('token', response.data.token)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  return null
})

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile()
      return response.data
    } catch (error) {
      // Handle rate limiting
      if (error.message?.includes('Too many requests')) {
        console.warn('Rate limit hit, backing off...')
        return rejectWithValue('Rate limit exceeded. Please wait before trying again.')
      }
      
      // If backend is not available, return mock user data for demo
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.log('Backend not available, using mock user data')
        return {
          user: {
            id: 'mock-user-id',
            name: 'Demo User',
            username: 'demouser',
            email: 'demo@example.com',
            avatar: null,
            role: 'user',
            verified: true,
            statistics: {
              solvedChallenges: 5,
              totalSubmissions: 12,
              ranking: 42
            }
          }
        }
      }
      
      // For other errors, clear the token and reject
      localStorage.removeItem('token')
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user' })
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false, // Will be set to true only after successful user fetch
  error: null,
  isInitialized: false, // Track if auth has been initialized
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    loadUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isInitialized = true
    },
    initializeAuth: (state) => {
      // If no token, mark as initialized but not authenticated
      if (!state.token) {
        state.isInitialized = true
        state.isAuthenticated = false
        state.user = null
      }
      // If token exists, we'll fetch user data
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.isInitialized = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload?.message || 'Login failed'
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.isInitialized = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload?.message || 'Registration failed'
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.isInitialized = true
        state.user = null
        state.token = null
      })
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.isInitialized = true
        state.user = action.payload.user
        state.error = null
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.isInitialized = true
        state.user = null
        state.token = null
        state.error = action.payload?.message || 'Failed to load user'
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { ...state.user, ...action.payload.user }
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Profile update failed'
      })
  },
})

export const { clearError, loadUser, initializeAuth } = authSlice.actions
export default authSlice.reducer
