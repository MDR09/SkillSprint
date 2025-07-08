import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import challengeSlice from './slices/challengeSlice'
import leaderboardSlice from './slices/leaderboardSlice'
import submissionSlice from './slices/submissionSlice'
import teamSlice from './slices/teamSlice'
import discussionSlice from './slices/discussionSlice'
import competitionSlice from './slices/competitionSlice'
import adminSlice from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    challenge: challengeSlice,
    leaderboard: leaderboardSlice,
    submission: submissionSlice,
    team: teamSlice,
    discussion: discussionSlice,
    competition: competitionSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
