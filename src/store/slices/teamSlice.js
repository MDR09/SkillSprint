import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamAPI } from '../../services/api/teamAPI.js';

// Async thunks
export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await teamAPI.createTeam(teamData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create team');
    }
  }
);

export const fetchPublicTeams = createAsyncThunk(
  'teams/fetchPublicTeams',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await teamAPI.getPublicTeams(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

export const fetchMyTeams = createAsyncThunk(
  'teams/fetchMyTeams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await teamAPI.getMyTeams();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your teams');
    }
  }
);

export const joinTeam = createAsyncThunk(
  'teams/joinTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await teamAPI.joinTeam(teamId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join team');
    }
  }
);

export const leaveTeam = createAsyncThunk(
  'teams/leaveTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await teamAPI.leaveTeam(teamId);
      return { teamId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave team');
    }
  }
);

const initialState = {
  teams: [],
  myTeams: [],
  currentTeam: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },
  loading: false,
  error: null
};

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload;
    },
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeams.unshift(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch public teams
      .addCase(fetchPublicTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.teams;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPublicTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch my teams
      .addCase(fetchMyTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeams = action.payload;
      })
      .addCase(fetchMyTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Join team
      .addCase(joinTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinTeam.fulfilled, (state, action) => {
        state.loading = false;
        // Update the team in both lists
        const updatedTeam = action.payload.team;
        const teamIndex = state.teams.findIndex(team => team._id === updatedTeam._id);
        if (teamIndex !== -1) {
          state.teams[teamIndex] = updatedTeam;
        }
        // Add to my teams if not already there
        const myTeamIndex = state.myTeams.findIndex(team => team._id === updatedTeam._id);
        if (myTeamIndex === -1) {
          state.myTeams.push(updatedTeam);
        }
      })
      .addCase(joinTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Leave team
      .addCase(leaveTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveTeam.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from my teams
        state.myTeams = state.myTeams.filter(team => team._id !== action.payload.teamId);
      })
      .addCase(leaveTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentTeam, clearCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer;
