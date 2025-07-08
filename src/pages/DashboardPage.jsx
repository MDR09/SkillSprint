import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  CodeBracketIcon, 
  TrophyIcon, 
  ClockIcon, 
  FireIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon,
  StarIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { fetchChallenges } from '../store/slices/challengeSlice'
import { fetchGlobalLeaderboard } from '../store/slices/leaderboardSlice'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { challenges = [] } = useSelector(state => state.challenge || {})
  const { globalLeaderboard = [] } = useSelector(state => state.leaderboard || {})
  
  const [stats, setStats] = useState({
    totalChallenges: 0,
    completedChallenges: 0,
    currentRank: 0,
    totalPoints: 0,
    streak: 0,
    recentSubmissions: 0
  })

  useEffect(() => {
    dispatch(fetchChallenges({ limit: 6 }))
    dispatch(fetchGlobalLeaderboard({ limit: 10 }))
    
    // Mock user stats - in real app, fetch from API
    setStats({
      totalChallenges: 24,
      completedChallenges: 18,
      currentRank: 42,
      totalPoints: 1250,
      streak: 7,
      recentSubmissions: 5
    })
  }, [dispatch])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  )

  const ChallengeCard = ({ challenge }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:scale-105"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
            challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {challenge.difficulty}
          </span>
          <span className="text-xs text-gray-500">{challenge.category}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          {challenge.timeLimit}
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            {challenge.participants}
          </span>
          <span className="flex items-center">
            <EyeIcon className="h-4 w-4 mr-1" />
            {challenge.views}
          </span>
        </div>
        <Link
          to={`/challenges/${challenge.id}`}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Join Challenge
        </Link>
      </div>
    </motion.div>
  )

  const LeaderboardRow = ({ user, rank }) => (
    <motion.div
      variants={itemVariants}
      className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg"
    >
      <div className="flex items-center space-x-3">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          rank <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {rank <= 3 ? <TrophyIcon className="h-4 w-4" /> : rank}
        </div>
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.university}</p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{user.points}</p>
        <p className="text-xs text-gray-500">points</p>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Developer'}! 🚀
            </h1>
            <p className="text-gray-600 mt-2">
              Ready to tackle some coding challenges today?
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
          >
            <StatCard
              icon={CodeBracketIcon}
              title="Challenges Solved"
              value={stats.completedChallenges}
              subtitle={`of ${stats.totalChallenges} attempted`}
              color="green"
            />
            <StatCard
              icon={TrophyIcon}
              title="Global Rank"
              value={`#${stats.currentRank}`}
              subtitle="out of 10,247"
              color="yellow"
            />
            <StatCard
              icon={StarIcon}
              title="Total Points"
              value={stats.totalPoints}
              subtitle="+125 this week"
              color="blue"
            />
            <StatCard
              icon={FireIcon}
              title="Current Streak"
              value={`${stats.streak} days`}
              subtitle="Keep it up!"
              color="red"
            />
            <StatCard
              icon={BoltIcon}
              title="Recent Submissions"
              value={stats.recentSubmissions}
              subtitle="last 7 days"
              color="purple"
            />
            <StatCard
              icon={ChartBarIcon}
              title="Success Rate"
              value="76%"
              subtitle="avg across all challenges"
              color="indigo"
            />
          </motion.div>

          {/* Competition Stats */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <FireIcon className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-900">Competition Arena</h2>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to="/competitions"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View All
                  </Link>
                  <Link
                    to="/competitions"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <FireIcon className="w-4 h-4 mr-2" />
                    Challenge Friends
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">3</p>
                  <p className="text-sm text-orange-700">Active 1v1s</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-blue-700">Wins</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">5</p>
                  <p className="text-sm text-red-700">Losses</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">71%</p>
                  <p className="text-sm text-purple-700">Win Rate</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Ready for a quick challenge?</h3>
                    <p className="text-sm text-gray-600">Challenge a friend to a 1v1 coding duel!</p>
                  </div>
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all">
                    Quick Challenge ⚡
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Challenges */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Trending Challenges</h2>
                  <Link 
                    to="/challenges" 
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View All
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: 1,
                      title: "Binary Tree Traversal",
                      description: "Implement various tree traversal algorithms and optimize for performance",
                      difficulty: "Medium",
                      category: "Algorithms",
                      timeLimit: "45 min",
                      participants: 156,
                      views: 1205
                    },
                    {
                      id: 2,
                      title: "Real-time Chat System",
                      description: "Build a scalable chat application with WebSockets and React",
                      difficulty: "Hard",
                      category: "Full Stack",
                      timeLimit: "2 hours",
                      participants: 89,
                      views: 892
                    },
                    {
                      id: 3,
                      title: "Array Manipulation",
                      description: "Solve complex array problems with optimal time complexity",
                      difficulty: "Easy",
                      category: "Data Structures",
                      timeLimit: "30 min",
                      participants: 234,
                      views: 1567
                    },
                    {
                      id: 4,
                      title: "API Rate Limiter",
                      description: "Design and implement a distributed rate limiting system",
                      difficulty: "Hard",
                      category: "System Design",
                      timeLimit: "90 min",
                      participants: 67,
                      views: 743
                    }
                  ].map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Leaderboard */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
                  <Link 
                    to="/leaderboard" 
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Full
                  </Link>
                </div>
                
                <div className="space-y-1">
                  {[
                    { name: "Alex Chen", university: "MIT", points: 2847, avatar: null },
                    { name: "Sarah Johnson", university: "Stanford", points: 2634, avatar: null },
                    { name: "Mike Rodriguez", university: "Berkeley", points: 2521, avatar: null },
                    { name: "Emma Davis", university: "Harvard", points: 2398, avatar: null },
                    { name: "You", university: "Your University", points: stats.totalPoints, avatar: null }
                  ].map((user, index) => (
                    <LeaderboardRow key={index} user={user} rank={index + 1} />
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Weekly Hackathon",
                      date: "Tomorrow, 2:00 PM",
                      participants: 450,
                      prize: "$5,000"
                    },
                    {
                      title: "Algorithm Sprint",
                      date: "Jul 8, 10:00 AM",
                      participants: 230,
                      prize: "$2,000"
                    },
                    {
                      title: "Team Challenge",
                      date: "Jul 12, 6:00 PM",
                      participants: 120,
                      prize: "$3,000"
                    }
                  ].map((event, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="border border-gray-100 rounded-lg p-4 hover:border-primary-200 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {event.participants} participants
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          Prize: {event.prize}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/challenges/create"
                    className="block w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-3 text-center transition-colors"
                  >
                    Create Challenge
                  </Link>
                  <Link
                    to="/practice"
                    className="block w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-3 text-center transition-colors"
                  >
                    Practice Mode
                  </Link>
                  <Link
                    to="/teams"
                    className="block w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-3 text-center transition-colors"
                  >
                    Join a Team
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage
