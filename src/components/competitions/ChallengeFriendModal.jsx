import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  UserIcon,
  CodeBracketIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { createCompetition } from '../../store/slices/competitionSlice'
import { fetchChallenges } from '../../store/slices/challengeSlice'
import userAPI from '../../services/api/userAPI'
import toast from 'react-hot-toast'

const ChallengeFriendModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { challenges = [] } = useSelector((state) => state.challenge || {})
  const { loading } = useSelector((state) => state.competition)
  const { user } = useSelector((state) => state.auth)
  
  const [step, setStep] = useState(1) // 1: Select Friend, 2: Choose Challenge, 3: Set Duration
  const [formData, setFormData] = useState({
    username: '',
    challengeId: '',
    timeLimit: 60
  })
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [errors, setErrors] = useState({})
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [lastSearchTime, setLastSearchTime] = useState(0)

  useEffect(() => {
    if (isOpen && step === 2) {
      dispatch(fetchChallenges({ limit: 20, difficulty: ['Easy', 'Medium'] }))
    }
  }, [dispatch, isOpen, step])

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const searchUsers = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    // Rate limiting: don't search more than once per second
    const now = Date.now()
    if (now - lastSearchTime < 1000) {
      return
    }
    setLastSearchTime(now)

    setSearchLoading(true)
    try {
      // Pass current user ID as exclude param
      const response = await userAPI.searchUsers(query, user?._id)
      console.log('Search response:', response.data) // Debug log
      setSearchResults(response.data.data || response.data || [])
    } catch (error) {
      console.error('Error searching users:', error)
      if (error.response?.status === 429) {
        toast.error('Search rate limit exceeded. Please wait a moment.')
      } else {
        toast.error('Failed to search users')
      }
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleUsernameChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, username: value }))
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Only search if input has at least 2 characters
    if (value.length < 2) {
      setSearchResults([])
      return
    }
    
    // Set new timeout for debounced search with longer delay
    const newTimeout = setTimeout(() => {
      searchUsers(value)
    }, 800) // Increased to 800ms delay
    
    setSearchTimeout(newTimeout)
  }

  const selectFriend = (user) => {
    setSelectedFriend(user)
    setFormData(prev => ({ ...prev, username: user.username }))
    setSearchResults([])
    setStep(2)
  }

  const handleChallenge = async () => {
    if (!formData.challengeId) {
      setErrors({ challengeId: 'Please select a challenge' })
      return
    }

    try {
      const competitionData = {
        title: `⚡ 1v1 Challenge vs ${selectedFriend.username}`,
        description: `Head-to-head coding duel between you and ${selectedFriend.username}`,
        type: '1v1',
        challengeId: formData.challengeId,
        startTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // Start in 2 minutes
        timeLimit: formData.timeLimit,
        maxParticipants: 2,
        isPublic: false,
        inviteUsername: selectedFriend.username
      }

      const result = await dispatch(createCompetition(competitionData)).unwrap()
      toast.success(`Challenge sent to ${selectedFriend.username}! 🔥`)
      onClose()
      resetForm()
      
      // Navigate to the competition page
      navigate(`/competitions/${result.data._id}`)
    } catch (error) {
      toast.error(error.message || 'Failed to send challenge')
    }
  }

  const resetForm = () => {
    setStep(1)
    setFormData({ username: '', challengeId: '', timeLimit: 60 })
    setSelectedFriend(null)
    setSearchResults([])
    setErrors({})
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const timeLimitOptions = [
    { value: 30, label: '30 minutes - Quick Battle' },
    { value: 60, label: '60 minutes - Standard' },
    { value: 90, label: '90 minutes - Extended' },
    { value: 120, label: '2 hours - Marathon' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BoltIcon className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Quick Challenge</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="mt-4 flex items-center space-x-2">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNum 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div className={`w-8 h-1 mx-2 ${
                        step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Select Friend */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <BoltIcon className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">Challenge a Friend</h3>
                    <p className="text-gray-600">Who do you want to challenge to a coding duel?</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search for a user
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={handleUsernameChange}
                        placeholder="Enter username..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchLoading && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center text-sm text-gray-500">
                        <div className="w-4 h-4 border border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                        Searching...
                      </div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {searchResults.map((user) => (
                        <motion.button
                          key={user._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => selectFriend(user)}
                          className="w-full p-3 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 text-left transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.username[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.username}</p>
                                <p className="text-sm text-gray-500">{user.name}</p>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>{user.stats?.wins || user.wins || 0}W - {user.stats?.losses || user.losses || 0}L</p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {formData.username && !searchLoading && searchResults.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No users found matching "{formData.username}"
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Choose Challenge */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {selectedFriend?.username[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-lg">⚔️</span>
                      <UserIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Challenge vs {selectedFriend?.username}
                    </h3>
                    <p className="text-gray-600">Choose your battlefield</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Challenge
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {challenges.map((challenge) => (
                        <motion.label
                          key={challenge._id}
                          whileHover={{ scale: 1.01 }}
                          className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.challengeId === challenge._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="challengeId"
                            value={challenge._id}
                            checked={formData.challengeId === challenge._id}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              challengeId: e.target.value 
                            }))}
                            className="sr-only"
                          />
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {challenge.description}
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                                  challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                  challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {challenge.difficulty}
                                </span>
                                <span>{challenge.category}</span>
                              </div>
                            </div>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                    {errors.challengeId && (
                      <p className="mt-2 text-sm text-red-600">{errors.challengeId}</p>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!formData.challengeId}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Set Duration and Confirm */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <TrophyIcon className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">Final Setup</h3>
                    <p className="text-gray-600">Choose the battle duration</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Time Limit
                    </label>
                    <div className="space-y-2">
                      {timeLimitOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`block border rounded-lg p-3 cursor-pointer transition-colors ${
                            formData.timeLimit === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="timeLimit"
                            value={option.value}
                            checked={formData.timeLimit === option.value}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              timeLimit: parseInt(e.target.value) 
                            }))}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{option.label}</span>
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Challenge Summary</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• Opponent: {selectedFriend?.username}</p>
                      <p>• Challenge: {challenges.find(c => c._id === formData.challengeId)?.title}</p>
                      <p>• Duration: {formData.timeLimit} minutes</p>
                      <p>• Starts: In 2 minutes</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleChallenge}
                      disabled={loading}
                      className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </div>
                      ) : (
                        <>
                          <BoltIcon className="w-4 h-4 inline mr-1" />
                          Send Challenge!
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ChallengeFriendModal
