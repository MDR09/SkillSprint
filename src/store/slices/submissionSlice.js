import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import submissionAPI from '../../services/api/submissionAPI'

// Async thunks
export const submitCode = createAsyncThunk(
  'submissions/submit',
  async (submissionData, { rejectWithValue }) => {
    try {
      const response = await submissionAPI.submitCode(submissionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchAll',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await submissionAPI.getSubmissions(challengeId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchSubmissionById = createAsyncThunk(
  'submissions/fetchById',
  async (submissionId, { rejectWithValue }) => {
    try {
      const response = await submissionAPI.getSubmissionById(submissionId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  submissions: [],
  currentSubmission: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  executionResults: null,
}

const submissionSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearExecutionResults: (state) => {
      state.executionResults = null
    },
    updateExecutionResults: (state, action) => {
      state.executionResults = action.payload
    },
    resetSubmissionState: (state) => {
      state.currentSubmission = null
      state.executionResults = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit code
      .addCase(submitCode.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(submitCode.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.currentSubmission = action.payload
        state.submissions.unshift(action.payload)
        state.error = null
      })
      .addCase(submitCode.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload?.message || 'Failed to submit code'
      })
      // Fetch submissions
      .addCase(fetchSubmissions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.isLoading = false
        state.submissions = action.payload
        state.error = null
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Failed to fetch submissions'
      })
      // Fetch submission by ID
      .addCase(fetchSubmissionById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSubmission = action.payload
        state.error = null
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Failed to fetch submission'
      })
  },
})

export const { 
  clearError, 
  clearExecutionResults, 
  updateExecutionResults, 
  resetSubmissionState 
} = submissionSlice.actions
export default submissionSlice.reducer
