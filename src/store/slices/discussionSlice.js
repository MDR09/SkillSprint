import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { discussionAPI } from '../../services/api/discussionAPI.js';

// Async thunks
export const fetchChallengeDiscussions = createAsyncThunk(
  'discussions/fetchChallengeDiscussions',
  async ({ challengeId, page, limit }, { rejectWithValue }) => {
    try {
      const response = await discussionAPI.getChallengeDiscussions(challengeId, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch discussions');
    }
  }
);

export const createPost = createAsyncThunk(
  'discussions/createPost',
  async ({ challengeId, postData }, { rejectWithValue }) => {
    try {
      const response = await discussionAPI.createPost(challengeId, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'discussions/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await discussionAPI.likePost(postId);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const dislikePost = createAsyncThunk(
  'discussions/dislikePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await discussionAPI.dislikePost(postId);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to dislike post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'discussions/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await discussionAPI.deletePost(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

const initialState = {
  discussions: [],
  currentPost: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },
  loading: false,
  error: null
};

const discussionSlice = createSlice({
  name: 'discussions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    updatePostLocally: (state, action) => {
      const { postId, updates } = action.payload;
      const postIndex = state.discussions.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        state.discussions[postIndex] = { ...state.discussions[postIndex], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch challenge discussions
      .addCase(fetchChallengeDiscussions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallengeDiscussions.fulfilled, (state, action) => {
        state.loading = false;
        state.discussions = action.payload.discussions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchChallengeDiscussions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.parentPost) {
          // It's a reply, add to the parent's replies
          const parentIndex = state.discussions.findIndex(
            post => post._id === action.payload.parentPost
          );
          if (parentIndex !== -1) {
            state.discussions[parentIndex].replies.push(action.payload);
          }
        } else {
          // It's a new top-level post
          state.discussions.unshift(action.payload);
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likes, dislikes, userLiked, userDisliked } = action.payload;
        const updatePost = (post) => {
          if (post._id === postId) {
            post.likes = Array(likes).fill(null);
            post.dislikes = Array(dislikes).fill(null);
            post.userLiked = userLiked;
            post.userDisliked = userDisliked;
          }
          // Update replies too
          post.replies?.forEach(updatePost);
        };
        state.discussions.forEach(updatePost);
      })
      
      // Dislike post
      .addCase(dislikePost.fulfilled, (state, action) => {
        const { postId, likes, dislikes, userLiked, userDisliked } = action.payload;
        const updatePost = (post) => {
          if (post._id === postId) {
            post.likes = Array(likes).fill(null);
            post.dislikes = Array(dislikes).fill(null);
            post.userLiked = userLiked;
            post.userDisliked = userDisliked;
          }
          // Update replies too
          post.replies?.forEach(updatePost);
        };
        state.discussions.forEach(updatePost);
      })
      
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.discussions = state.discussions.filter(post => post._id !== postId);
      });
  }
});

export const { clearError, setCurrentPost, clearCurrentPost, updatePostLocally } = discussionSlice.actions;
export default discussionSlice.reducer;
