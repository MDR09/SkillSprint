import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminAPI from '../../services/api/adminAPI'

// Async thunks
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllUsers()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUserRole(userId, role)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await adminAPI.deleteUser(userId)
      return userId
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  stats: null,
  users: [],
  challenges: [],
  loading: false,
  error: null,
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
        state.error = null
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to fetch admin stats'
      })
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
        state.error = null
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to fetch users'
      })
      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.error = null
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload
        const userIndex = state.users.findIndex(user => user._id === updatedUser._id)
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser
        }
        state.error = null
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update user role'
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload
        state.users = state.users.filter(user => user._id !== userId)
        state.error = null
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to delete user'
      })
  },
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer
