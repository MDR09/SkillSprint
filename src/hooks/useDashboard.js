import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchChallenges } from '../store/slices/challengeSlice'
import { fetchGlobalLeaderboard } from '../store/slices/leaderboardSlice'
import socketService from '../services/socketService'

export const useDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { challenges = [], isLoading: challengesLoading = false } = useSelector(state => state.challenge || {})
  const { globalLeaderboard = [], isLoading: leaderboardLoading = false } = useSelector(state => state.leaderboard || {})
  
  const [dashboardStats, setDashboardStats] = useState({
    totalChallenges: 0,
    completedChallenges: 0,
    currentRank: 0,
    totalPoints: 0,
    streak: 0,
    recentSubmissions: 0,
    successRate: 0,
    weeklyProgress: 0
  })

  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch initial data
        await Promise.all([
          dispatch(fetchChallenges({ limit: 6, featured: true })),
          dispatch(fetchGlobalLeaderboard({ limit: 10 }))
        ])
        
        // Connect to real-time updates
        if (!socketService.getConnectionStatus()) {
          socketService.connect()
        }
        
        socketService.joinLeaderboard()
        
        // Simulate fetching user stats (replace with actual API call)
        await fetchUserStats()
        await fetchUpcomingEvents()
        await fetchRecentActivity()
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()

    // Cleanup on unmount
    return () => {
      if (socketService.getConnectionStatus()) {
        socketService.disconnect()
      }
    }
  }, [dispatch])

  const fetchUserStats = async () => {
    try {
      // Try to fetch real user stats from API
      const response = await fetch('/api/auth/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardStats({
          totalChallenges: data.totalChallenges || 0,
          completedChallenges: data.challengesCompleted || 0,
          currentRank: data.rank?.global || 0,
          totalPoints: data.totalScore || 0,
          streak: data.currentStreak || 0,
          recentSubmissions: data.totalSubmissions || 0,
          successRate: data.averageScore || 0,
          weeklyProgress: data.weeklyProgress || 0
        });
      } else {
        throw new Error('Failed to fetch user stats');
      }
    } catch (error) {
      console.error('Error fetching user stats, using mock data:', error);
      // Fallback to mock data
      const mockStats = {
        totalChallenges: 42,
        completedChallenges: 28,
        currentRank: 156,
        totalPoints: 2847,
        streak: 12,
        recentSubmissions: 8,
        successRate: 76,
        weeklyProgress: 15
      };
      
      setDashboardStats(mockStats);
    }
  }

  const fetchUpcomingEvents = async () => {
    // Mock upcoming events
    const events = [
      {
        id: 1,
        title: "Weekly Algorithm Challenge",
        description: "Test your algorithm skills with time-bounded problems",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        participants: 523,
        prize: "$2,500",
        type: "competition",
        difficulty: "Medium"
      },
      {
        id: 2,
        title: "Full-Stack Hackathon",
        description: "Build a complete web application in 48 hours",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        participants: 189,
        prize: "$10,000",
        type: "hackathon",
        difficulty: "Hard"
      },
      {
        id: 3,
        title: "Team Programming Contest",
        description: "Collaborate with your team to solve complex problems",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        participants: 76,
        prize: "$5,000",
        type: "team",
        difficulty: "Hard"
      }
    ]
    
    setUpcomingEvents(events)
  }

  const fetchRecentActivity = async () => {
    // Mock recent activity
    const activities = [
      {
        id: 1,
        type: "submission",
        message: "Submitted solution for 'Binary Tree Traversal'",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: "accepted",
        points: 150
      },
      {
        id: 2,
        type: "achievement",
        message: "Earned 'Problem Solver' badge",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        status: "completed",
        points: 50
      },
      {
        id: 3,
        type: "challenge_joined",
        message: "Joined 'Array Manipulation Challenge'",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: "in_progress",
        points: 0
      },
      {
        id: 4,
        type: "rank_update",
        message: "Moved up 5 positions in global ranking",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: "improvement",
        points: 0
      }
    ]
    
    setRecentActivity(activities)
  }

  const refreshData = async () => {
    await Promise.all([
      dispatch(fetchChallenges({ limit: 6, featured: true })),
      dispatch(fetchGlobalLeaderboard({ limit: 10 })),
      fetchUserStats(),
      fetchUpcomingEvents(),
      fetchRecentActivity()
    ])
  }

  return {
    user,
    challenges,
    globalLeaderboard,
    dashboardStats,
    upcomingEvents,
    recentActivity,
    isLoading: isLoading || challengesLoading || leaderboardLoading,
    refreshData
  }
}
