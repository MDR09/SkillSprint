import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import leaderboardAPI from '../../services/api/leaderboardAPI'

// Async thunks
export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetch',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await leaderboardAPI.getLeaderboard(challengeId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchGlobalLeaderboard = createAsyncThunk(
  'leaderboard/fetchGlobal',
  async (params, { rejectWithValue }) => {
    try {
      const response = await leaderboardAPI.getGlobalLeaderboard(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  challengeLeaderboard: [],
  globalLeaderboard: [],
  isLoading: false,
  error: null,
  realTimeUpdates: true,
}

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateLeaderboardRealTime: (state, action) => {
      state.challengeLeaderboard = action.payload
    },
    toggleRealTimeUpdates: (state) => {
      state.realTimeUpdates = !state.realTimeUpdates
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch challenge leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false
        state.challengeLeaderboard = action.payload
        state.error = null
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Failed to fetch leaderboard'
      })
      // Fetch global leaderboard
      .addCase(fetchGlobalLeaderboard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGlobalLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false
        state.globalLeaderboard = action.payload
        state.error = null
      })
      .addCase(fetchGlobalLeaderboard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Failed to fetch global leaderboard'
      })
  },
})

export const { clearError, updateLeaderboardRealTime, toggleRealTimeUpdates } = leaderboardSlice.actions
export default leaderboardSlice.reducer
