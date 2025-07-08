import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { fetchChallenges } from '../store/slices/challengeSlice'

const ChallengesPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { challenges = [], loading = false } = useSelector((state) => state.challenge || {})
  const { user } = useSelector((state) => state.auth)
  const { submissions = [] } = useSelector((state) => state.submission || {})
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const difficulties = ['Easy', 'Medium', 'Hard']
  const categories = [
    'Algorithms',
    'Data Structures', 
    'Dynamic Programming',
    'Graph Theory',
    'Math',
    'String Manipulation',
    'Array',
    'Tree',
    'Sorting',
    'Searching'
  ]
  const statuses = ['Solved', 'Attempted', 'Not Attempted']
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'difficulty-asc', label: 'Easy to Hard' },
    { value: 'difficulty-desc', label: 'Hard to Easy' },
    { value: 'points-asc', label: 'Lowest Points' },
    { value: 'points-desc', label: 'Highest Points' },
    { value: 'title', label: 'Alphabetical' }
  ]

  useEffect(() => {
    dispatch(fetchChallenges())
  }, [dispatch])

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getChallengeStatus = (challengeId) => {
    if (!submissions || !user) return 'not-attempted'
    
    const userSubmissions = submissions.filter(
      s => s.challengeId === challengeId && s.userId === user._id
    )
    
    if (userSubmissions.length === 0) return 'not-attempted'
    
    const hasSolved = userSubmissions.some(s => s.status === 'Accepted')
    return hasSolved ? 'solved' : 'attempted'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'solved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'attempted':
        return <XMarkIcon className="h-5 w-5 text-red-600" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
    }
  }

  const filteredAndSortedChallenges = (challenges || [])
    .filter(challenge => {
      if (!challenge) return false
      
      const title = challenge.title || ''
      const description = challenge.description || ''
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDifficulty = !selectedDifficulty || challenge.difficulty === selectedDifficulty
      const matchesCategory = !selectedCategory || challenge.category === selectedCategory
      const status = getChallengeStatus(challenge._id)
      const matchesStatus = !selectedStatus || 
        (selectedStatus === 'Solved' && status === 'solved') ||
        (selectedStatus === 'Attempted' && status === 'attempted') ||
        (selectedStatus === 'Not Attempted' && status === 'not-attempted')
      
      return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        case 'difficulty-asc':
          const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 }
          return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0)
        case 'difficulty-desc':
          const diffOrderDesc = { 'Easy': 3, 'Medium': 2, 'Hard': 1 }
          return (diffOrderDesc[a.difficulty] || 0) - (diffOrderDesc[b.difficulty] || 0)
        case 'points-asc':
          return (a.scoring?.maxPoints || 0) - (b.scoring?.maxPoints || 0)
        case 'points-desc':
          return (b.scoring?.maxPoints || 0) - (a.scoring?.maxPoints || 0)
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        default:
          return 0
      }
    })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDifficulty('')
    setSelectedCategory('')
    setSelectedStatus('')
    setSortBy('newest')
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Challenges</h1>
              <p className="text-gray-600 mt-2">
                {filteredAndSortedChallenges.length} challenge{filteredAndSortedChallenges.length !== 1 ? 's' : ''} available
              </p>
            </div>
            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <button
                onClick={() => navigate('/create-challenge')}
                className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Challenge</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search challenges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-md ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Difficulties</option>
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Challenges Grid */}
          {filteredAndSortedChallenges.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CodeBracketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedChallenges.map((challenge) => {
                const status = getChallengeStatus(challenge._id)
                
                return (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/challenges/${challenge._id}`)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <TrophyIcon className="h-4 w-4" />
                          <span>{challenge.scoring?.maxPoints || challenge.points || 100}</span>
                        </div>
                      </div>

                      {/* Title and Description */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {challenge.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {challenge.description}
                      </p>

                      {/* Tags */}
                      {challenge.tags && challenge.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {challenge.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {challenge.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{challenge.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{challenge.timeLimit || 'N/A'}m</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <StarIcon className="h-4 w-4" />
                            <span>{challenge.category}</span>
                          </div>
                        </div>
                        <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ChallengesPage
