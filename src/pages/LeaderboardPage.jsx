import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  TrophyIcon, 
  StarIcon,
  ClockIcon,
  UserIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { 
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { fetchGlobalLeaderboard } from '../store/slices/leaderboardSlice'

const LeaderboardPage = () => {
  const dispatch = useDispatch()
  const { leaderboard, loading } = useSelector((state) => state.leaderboard)
  const { user } = useSelector((state) => state.auth)
  
  const [timeFilter, setTimeFilter] = useState('all-time')
  const [categoryFilter, setCategoryFilter] = useState('overall')

  const timeFilters = [
    { value: 'all-time', label: 'All Time' },
    { value: 'this-month', label: 'This Month' },
    { value: 'this-week', label: 'This Week' },
    { value: 'today', label: 'Today' }
  ]

  const categoryFilters = [
    { value: 'overall', label: 'Overall' },
    { value: 'algorithms', label: 'Algorithms' },
    { value: 'data-structures', label: 'Data Structures' },
    { value: 'dynamic-programming', label: 'Dynamic Programming' },
    { value: 'graph-theory', label: 'Graph Theory' }
  ]

  useEffect(() => {
    dispatch(fetchGlobalLeaderboard({ 
      timeFilter, 
      category: categoryFilter === 'overall' ? null : categoryFilter 
    }))
  }, [dispatch, timeFilter, categoryFilter])

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <TrophyIconSolid className="h-6 w-6 text-yellow-500" />
      case 2:
        return <TrophyIconSolid className="h-6 w-6 text-gray-400" />
      case 3:
        return <TrophyIconSolid className="h-6 w-6 text-amber-600" />
      default:
        return (
          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-600">{rank}</span>
          </div>
        )
    }
  }

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      default:
        return 'bg-white text-gray-900 border border-gray-200'
    }
  }

  const getUserRank = () => {
    if (!user || !leaderboard) return null
    const userIndex = leaderboard.findIndex(u => u._id === user._id)
    return userIndex !== -1 ? userIndex + 1 : null
  }

  const getCurrentUser = () => {
    if (!user || !leaderboard) return null
    return leaderboard.find(u => u._id === user._id)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const userRank = getUserRank()
  const currentUser = getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
            </div>
            <p className="text-gray-600">
              Compete with the best programmers and climb the rankings
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeFilters.map(filter => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categoryFilters.map(filter => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {userRank && (
                <div className="text-center sm:text-right">
                  <div className="text-sm text-gray-600">Your Rank</div>
                  <div className="text-2xl font-bold text-blue-600">#{userRank}</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Top 3 Podium */}
            <div className="lg:col-span-3">
              {leaderboard && leaderboard.length >= 3 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    Top Performers
                  </h2>
                  
                  <div className="flex items-end justify-center space-x-4 mb-8">
                    {/* Second Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="text-center"
                    >
                      <div className="h-24 w-20 bg-gradient-to-t from-gray-300 to-gray-100 rounded-t-lg flex items-end justify-center pb-2">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                      <div className="mt-3">
                        <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="font-semibold text-gray-900">{leaderboard[1]?.username}</div>
                        <div className="text-sm text-gray-600">{leaderboard[1]?.totalScore} pts</div>
                      </div>
                    </motion.div>

                    {/* First Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-center"
                    >
                      <div className="h-32 w-20 bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-t-lg flex items-end justify-center pb-2 relative">
                        <TrophyIcon className="h-6 w-6 text-yellow-600 absolute -top-3" />
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <div className="mt-3">
                        <div className="h-12 w-12 bg-yellow-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="font-bold text-gray-900">{leaderboard[0]?.username}</div>
                        <div className="text-sm text-gray-600">{leaderboard[0]?.totalScore} pts</div>
                      </div>
                    </motion.div>

                    {/* Third Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-center"
                    >
                      <div className="h-20 w-20 bg-gradient-to-t from-amber-600 to-amber-300 rounded-t-lg flex items-end justify-center pb-2">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                      <div className="mt-3">
                        <div className="h-12 w-12 bg-amber-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="font-semibold text-gray-900">{leaderboard[2]?.username}</div>
                        <div className="text-sm text-gray-600">{leaderboard[2]?.totalScore} pts</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Full Leaderboard */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Rankings</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {leaderboard?.map((user, index) => {
                    const rank = index + 1
                    const isCurrentUser = user._id === currentUser?._id
                    
                    return (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`px-6 py-4 ${isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getRankIcon(rank)}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {user.username}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {user.firstName || user.lastName ? 
                                    `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                                    'No name provided'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">{user.totalScore || 0}</div>
                              <div className="text-gray-600">Points</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">{user.solvedChallenges || 0}</div>
                              <div className="text-gray-600">Solved</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">{user.submissions || 0}</div>
                              <div className="text-gray-600">Submissions</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">
                                {user.solvedChallenges && user.submissions ? 
                                  Math.round((user.solvedChallenges / user.submissions) * 100) : 0}%
                              </div>
                              <div className="text-gray-600">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Total Users</span>
                    </div>
                    <span className="font-semibold text-gray-900">{leaderboard?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrophyIcon className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-gray-600">Avg Score</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {leaderboard && leaderboard.length > 0 ? 
                        Math.round(leaderboard.reduce((sum, user) => sum + (user.totalScore || 0), 0) / leaderboard.length) : 
                        0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FireIcon className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-gray-600">Top Score</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {leaderboard && leaderboard.length > 0 ? leaderboard[0]?.totalScore || 0 : 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Your Progress */}
              {currentUser && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Rank Progress</span>
                        <span className="font-semibold">#{userRank}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max(10, 100 - ((userRank || 1) / (leaderboard?.length || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-center pt-4 border-t border-gray-200">
                      <div className="text-2xl font-bold text-blue-600">{currentUser.totalScore || 0}</div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LeaderboardPage
