import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import mongoose from 'mongoose'
import User from '../models/User.js'

// Configure Passport strategies
export const configurePassport = () => {
  // Serialize/Deserialize user
  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      // Skip user lookup if database is not connected
      if (mongoose.connection.readyState !== 1) {
        return done(null, { _id: id, name: 'Demo User' })
      }
      
      const user = await User.findById(id).select('-password')
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })

  // GitHub Strategy - only configure if credentials are available
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
          console.log('⚠️ Database not connected, using mock user for GitHub auth')
          return done(null, {
            id: profile.id,
            name: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
            username: profile.username,
            provider: 'github'
          })
        }

        // Check if user already exists with this GitHub ID
        let user = await User.findOne({ 'socialAuth.github.id': profile.id })
        
        if (user) {
          return done(null, user)
        }
        
        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0]?.value })
        
        if (user) {
          // Link GitHub account to existing user
          user.socialAuth.github.id = profile.id
          user.socialAuth.github.username = profile.username
          await user.save()
          return done(null, user)
        }
        
        // Create new user
        user = await User.create({
          name: profile.displayName || profile.username,
          email: profile.emails[0]?.value || `${profile.username}@github.local`,
          username: profile.username + Math.floor(Math.random() * 1000),
          socialAuth: {
            github: {
              id: profile.id,
              username: profile.username
            }
          },
          isEmailVerified: true // GitHub emails are considered verified
        })
        
        return done(null, user)
      } catch (error) {
        console.log('⚠️ GitHub auth error, using fallback mock user:', error.message)
        return done(null, {
          id: profile.id,
          name: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
          username: profile.username,
          provider: 'github'
        })
      }
    }))
    console.log('✅ GitHub OAuth strategy configured')
  } else {
    console.log('⚠️  GitHub OAuth disabled - missing credentials')
  }

  // Google Strategy - only configure if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
          console.log('⚠️  Database not connected, using mock authentication')
          // Create a mock user for development when database is not available
          const mockUser = {
            _id: 'mock-google-' + profile.id,
            username: profile.displayName || profile.emails?.[0]?.value || 'GoogleUser',
            email: profile.emails?.[0]?.value || 'google@example.com',
            socialAuth: {
              google: {
                id: profile.id,
                email: profile.emails?.[0]?.value
              }
            },
            role: 'user',
            isVerified: true,
            isMockUser: true
          }
          return done(null, mockUser)
        }

        // Check if user already exists with this Google ID
        let user = await User.findOne({ 'socialAuth.google.id': profile.id })
        
        if (user) {
          return done(null, user)
        }
        
        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0]?.value })
        
        if (user) {
          // Link Google account to existing user
          user.socialAuth.google.id = profile.id
          user.socialAuth.google.email = profile.emails[0]?.value
          await user.save()
          return done(null, user)
        }
        
        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0]?.value,
          username: profile.emails[0]?.value.split('@')[0] + Math.floor(Math.random() * 1000),
          socialAuth: {
            google: {
              id: profile.id,
              email: profile.emails[0]?.value
            }
          },
          isEmailVerified: true // Google emails are considered verified
        })
        
        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    }))
    console.log('✅ Google OAuth strategy configured')
  } else {
    console.log('⚠️  Google OAuth disabled - missing credentials')
  }
}
