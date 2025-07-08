import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store'
import { useSelector } from 'react-redux'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Page Components
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AuthCallbackPage from './pages/auth/AuthCallbackPage'
import DashboardPage from './pages/DashboardPage'
import ChallengesPage from './pages/ChallengesPage'
import ChallengePage from './pages/ChallengePage'
import CreateChallengePage from './pages/CreateChallengePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import TeamsPage from './pages/TeamsPage'
import CompetitionsPage from './pages/CompetitionsPage'
import CompetitionPage from './pages/CompetitionPage'

// HOC Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

// Services
import socketService from './services/socketService'

// Layout wrapper component
function AppLayout() {
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  // Check if current route is ChallengePage (challenge detail page)
  const isChallengePage = location.pathname.includes('/challenges/') && location.pathname.split('/').length === 3

  return (
    <>
      {!isChallengePage && <Navbar />}
      <main className={isChallengePage ? 'h-screen' : 'flex-1'}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />} 
          />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
          />
          <Route 
            path="/auth/callback" 
            element={<AuthCallbackPage />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/challenges" 
            element={
              <ProtectedRoute>
                <ChallengesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/challenges/:id" 
            element={
              <ProtectedRoute>
                <ChallengePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-challenge" 
            element={
              <ProtectedRoute>
                <CreateChallengePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/competitions" 
            element={
              <ProtectedRoute>
                <CompetitionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/competitions/:id" 
            element={
              <ProtectedRoute>
                <CompetitionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute>
                <TeamsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isChallengePage && <Footer />}
    </>
  )
}

function AppContent() {
  const { isAuthenticated, token, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token)
    } else {
      socketService.disconnect()
    }

    return () => {
      socketService.disconnect()
    }
  }, [isAuthenticated, token])

  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <AppLayout />
      </Router>
      
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
