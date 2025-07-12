import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { competitionAPI } from '../../services/api/competitionAPI.js';

// Async thunks
export const createCompetition = createAsyncThunk(
  'competitions/createCompetition',
  async (competitionData, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.createCompetition(competitionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create competition');
    }
  }
);

export const fetchCompetitions = createAsyncThunk(
  'competitions/fetchCompetitions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.getCompetitions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch competitions');
    }
  }
);

export const fetchCompetitionById = createAsyncThunk(
  'competitions/fetchCompetitionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.getCompetitionById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch competition');
    }
  }
);

export const joinCompetition = createAsyncThunk(
  'competitions/joinCompetition',
  async (competitionId, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.joinCompetition(competitionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join competition');
    }
  }
);

export const inviteUser = createAsyncThunk(
  'competitions/inviteUser',
  async ({ competitionId, username }, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.inviteUser(competitionId, username);
      return { competitionId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invitation');
    }
  }
);

export const respondToInvitation = createAsyncThunk(
  'competitions/respondToInvitation',
  async ({ competitionId, response }, { rejectWithValue }) => {
    try {
      const apiResponse = await competitionAPI.respondToInvitation(competitionId, response);
      return apiResponse.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to invitation');
    }
  }
);

export const deleteCompetition = createAsyncThunk(
  'competitions/deleteCompetition',
  async (competitionId, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.deleteCompetition(competitionId);
      return { competitionId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete competition');
    }
  }
);

export const startCompetition = createAsyncThunk(
  'competitions/startCompetition',
  async (competitionId, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.startCompetition(competitionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start competition');
    }
  }
);

export const submitSolution = createAsyncThunk(
  'competitions/submitSolution',
  async ({ competitionId, submissionData }, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.submitSolution(competitionId, submissionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit solution');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'competitions/fetchLeaderboard',
  async (competitionId, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.getLeaderboard(competitionId);
      return { competitionId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'competitions/sendChatMessage',
  async ({ competitionId, message }, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.sendChatMessage(competitionId, message);
      return { competitionId, message: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchMyCompetitions = createAsyncThunk(
  'competitions/fetchMyCompetitions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.getMyCompetitions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch competitions');
    }
  }
);

export const autoSubmitSolution = createAsyncThunk(
  'competitions/autoSubmitSolution',
  async ({ competitionId, submissionData }, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.autoSubmitSolution(competitionId, submissionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to auto-submit solution');
    }
  }
);

export const endCompetition = createAsyncThunk(
  'competitions/endCompetition',
  async (competitionId, { rejectWithValue }) => {
    try {
      const response = await competitionAPI.endCompetition(competitionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end competition');
    }
  }
);

const initialState = {
  competitions: [],
  myCompetitions: [],
  currentCompetition: null,
  leaderboard: [],
  chatMessages: [],
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },
  loading: false,
  submitting: false,
  error: null,
  competitionStatus: 'idle' // idle, loading, active, completed
};

const competitionSlice = createSlice({
  name: 'competitions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCompetition: (state, action) => {
      state.currentCompetition = action.payload;
      state.chatMessages = action.payload?.chatMessages || [];
    },
    clearCurrentCompetition: (state) => {
      state.currentCompetition = null;
      state.leaderboard = [];
      state.chatMessages = [];
    },
    updateCompetitionStatus: (state, action) => {
      const { competitionId, status } = action.payload;
      if (state.currentCompetition && state.currentCompetition._id === competitionId) {
        state.currentCompetition.status = status;
      }
      
      // Update in competitions list
      const competition = state.competitions.find(c => c._id === competitionId);
      if (competition) {
        competition.status = status;
      }
    },
    addChatMessage: (state, action) => {
      const { competitionId, message } = action.payload;
      if (state.currentCompetition && state.currentCompetition._id === competitionId) {
        state.chatMessages.push(message);
      }
    },
    updateParticipantScore: (state, action) => {
      const { competitionId, userId, score } = action.payload;
      if (state.currentCompetition && state.currentCompetition._id === competitionId) {
        const participant = state.currentCompetition.participants.find(
          p => p.user._id === userId
        );
        if (participant) {
          participant.score = score;
        }
      }
    },
    addParticipant: (state, action) => {
      const { competitionId, user } = action.payload;
      if (state.currentCompetition && state.currentCompetition._id === competitionId) {
        state.currentCompetition.participants.push({
          user,
          status: 'active',
          joinedAt: new Date().toISOString(),
          score: 0
        });
      }
    },
    setCompetitionLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create competition
      .addCase(createCompetition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompetition.fulfilled, (state, action) => {
        state.loading = false;
        state.competitions.unshift(action.payload);
        state.myCompetitions.unshift(action.payload);
      })
      .addCase(createCompetition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch competitions
      .addCase(fetchCompetitions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetitions.fulfilled, (state, action) => {
        state.loading = false;
        state.competitions = action.payload.data || action.payload.competitions || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCompetitions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch competition by ID
      .addCase(fetchCompetitionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetitionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCompetition = action.payload;
        state.chatMessages = action.payload.chatMessages || [];
      })
      .addCase(fetchCompetitionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Join competition
      .addCase(joinCompetition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCompetition.fulfilled, (state, action) => {
        state.loading = false;
        // Update current competition if it's the same one
        if (state.currentCompetition && 
            state.currentCompetition._id === action.payload.competition._id) {
          state.currentCompetition = action.payload.competition;
        }
      })
      .addCase(joinCompetition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete competition
      .addCase(deleteCompetition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompetition.fulfilled, (state, action) => {
        state.loading = false;
        const competitionId = action.payload.competitionId;
        // Remove from competitions list after successful deletion
        state.competitions = state.competitions.filter(comp => comp._id !== competitionId);
        // Remove from my competitions list
        state.myCompetitions = state.myCompetitions.filter(comp => comp._id !== competitionId);
        // Clear current competition if it's the deleted one
        if (state.currentCompetition && state.currentCompetition._id === competitionId) {
          state.currentCompetition = null;
        }
      })
      .addCase(deleteCompetition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Start competition
      .addCase(startCompetition.fulfilled, (state, action) => {
        if (state.currentCompetition && 
            state.currentCompetition._id === action.payload.competition._id) {
          state.currentCompetition = action.payload.competition;
        }
      })
      
      // Submit solution
      .addCase(submitSolution.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitSolution.fulfilled, (state, action) => {
        state.submitting = false;
        // Update participant score in current competition
        if (state.currentCompetition) {
          const participant = state.currentCompetition.participants.find(
            p => p.user._id === action.meta.arg.userId
          );
          if (participant) {
            participant.score = action.payload.score;
            participant.submissionTime = new Date().toISOString();
          }
        }
      })
      .addCase(submitSolution.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Fetch leaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload.leaderboard;
      })
      
      // Send chat message
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        const { competitionId, message } = action.payload;
        if (state.currentCompetition && state.currentCompetition._id === competitionId) {
          state.chatMessages.push(message);
        }
      })
      
      // Fetch my competitions
      .addCase(fetchMyCompetitions.fulfilled, (state, action) => {
        state.myCompetitions = action.payload.data || action.payload.competitions || action.payload || [];
      })
      
      // Invite user
      .addCase(inviteUser.fulfilled, (state, action) => {
        // Could show success message
      })
      
      // Respond to invitation
      .addCase(respondToInvitation.fulfilled, (state, action) => {
        if (action.payload.competition) {
          // Update the competition in myCompetitions
          const index = state.myCompetitions.findIndex(
            c => c._id === action.payload.competition._id
          );
          if (index !== -1) {
            state.myCompetitions[index] = action.payload.competition;
          } else {
            state.myCompetitions.unshift(action.payload.competition);
          }
        }
      })
      
      // Auto-submit solution
      .addCase(autoSubmitSolution.fulfilled, (state, action) => {
        // Update participant score in current competition
        if (state.currentCompetition) {
          const participant = state.currentCompetition.participants.find(
            p => p.user._id === action.payload.userId
          );
          if (participant) {
            participant.score = action.payload.score;
            participant.submissionTime = new Date().toISOString();
            participant.autoSubmitted = true;
          }
        }
      })
      
      // End competition
      .addCase(endCompetition.fulfilled, (state, action) => {
        if (state.currentCompetition && 
            state.currentCompetition._id === action.payload.competition._id) {
          state.currentCompetition = {
            ...state.currentCompetition,
            ...action.payload.competition
          };
        }
        // Update in competitions list too
        const index = state.competitions.findIndex(
          comp => comp._id === action.payload.competition._id
        );
        if (index !== -1) {
          state.competitions[index] = {
            ...state.competitions[index],
            ...action.payload.competition
          };
        }
      });
  }
});

export const {
  clearError,
  setCurrentCompetition,
  clearCurrentCompetition,
  updateCompetitionStatus,
  addChatMessage,
  updateParticipantScore,
  addParticipant,
  setCompetitionLeaderboard
} = competitionSlice.actions;

export default competitionSlice.reducer;
