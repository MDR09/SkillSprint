import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import {
  ArrowLeftIcon,
  PlayIcon,
  TrophyIcon,
  ClockIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  CodeBracketIcon,
  FireIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { 
  fetchCompetitionById, 
  joinCompetition, 
  startCompetition,
  deleteCompetition,
  clearCurrentCompetition,
  fetchLeaderboard,
  autoSubmitSolution,
  endCompetition
} from '../store/slices/competitionSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import CompetitionTimer from '../components/competitions/CompetitionTimer'
import CompetitionLeaderboard from '../components/competitions/CompetitionLeaderboard'
import CompetitionChat from '../components/competitions/CompetitionChat'
import CompetitionEditor from '../components/competitions/CompetitionEditor'
import ParticipantsList from '../components/competitions/ParticipantsList'
import toast from 'react-hot-toast'

const CompetitionPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { 
    currentCompetition, 
    leaderboard,
    loading, 
    error 
  } = useSelector((state) => state.competition)
  const { user } = useSelector((state) => state.auth)
  
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentCode, setCurrentCode] = useState('')
  const [currentLanguage, setCurrentLanguage] = useState('javascript')
  const autoSubmitTriggeredRef = useRef(false)
  const [winner, setWinner] = useState(null)
  const socketRef = useRef(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Define competition and participant variables early
  const competition = currentCompetition
  const isParticipant = competition?.participants?.some(p => p.user?._id === user?._id) || false
  const isCreator = competition?.createdBy?._id === user?._id || competition?.creator?._id === user?._id

  // Socket.io connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !id) return

    // Initialize socket connection
    socketRef.current = io('http://localhost:5000', {
      auth: { token }
    })

    // Join competition room
    socketRef.current.emit('joinCompetition', id)

    // Listen for competition started event
    socketRef.current.on('competitionStarted', (data) => {
      console.log('🚀 Competition started event received:', data)
      
      toast.success('🚀 Competition has started! Good luck!', {
        duration: 4000,
        icon: '🏁'
      })
      
      console.log('🔗 Socket event - Competition started for user:', {
        competitionId: id,
        isParticipant,
        isCreator,
        currentUser: user?.username,
        currentTab: activeTab
      })
      
      // For both creator and participants, switch to code editor tab
      if (isParticipant || isCreator) {
        console.log('🔗 Switching to code editor tab for competition')
        setActiveTab('code')
      }
      
      // Always refresh competition data for display updates
      dispatch(fetchCompetitionById(id))
    })

    // Listen for competition ended event  
    socketRef.current.on('competitionEnded', (data) => {
      toast.success('🏁 Competition has ended!')
      setWinner(data.winner)
      dispatch(fetchCompetitionById(id)) // Refresh competition data
    })

    // Listen for participant joined
    socketRef.current.on('participantJoined', (data) => {
      toast.success(`${data.username} joined the competition!`)
      dispatch(fetchCompetitionById(id)) // Refresh competition data
    })

    // Listen for submission updates
    socketRef.current.on('submissionUpdate', (data) => {
      dispatch(fetchLeaderboard(id)) // Refresh leaderboard
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [id, dispatch])

  useEffect(() => {
    if (id) {
      dispatch(fetchCompetitionById(id))
      dispatch(fetchLeaderboard(id))
    }

    return () => {
      dispatch(clearCurrentCompetition())
    }
  }, [dispatch, id])

  // Auto-switch to code tab when competition becomes active for participants
  useEffect(() => {
    if (isParticipant && competition?.status === 'active' && activeTab !== 'code') {
      console.log('🔄 Auto-switching to code tab for active competition participant')
      setActiveTab('code')
    }
  }, [competition?.status, isParticipant, activeTab])

  // Switch to code tab when page loads for participants in active competitions (only once)
  useEffect(() => {
    if (competition && isParticipant && competition?.status === 'active' && activeTab === 'overview') {
      console.log('🎯 Page loaded - switching participant to code tab for active competition')
      setActiveTab('code')
    }
  }, [competition?.status, competition?._id, isParticipant]) // Only trigger when competition status or ID changes

  const handleJoinCompetition = async () => {
    try {
      await dispatch(joinCompetition(id)).unwrap()
      toast.success('Successfully joined the competition! 🎉')
      setShowJoinModal(false)
      
      // Switch to code tab after joining
      setActiveTab('code')
    } catch (error) {
      toast.error(error.message || 'Failed to join competition')
    }
  }

  const handleStartCompetition = async () => {
    try {
      console.log('🚀 Starting competition:', {
        competitionId: id,
        challengeId: competition?.challenge?._id || competition?.challenge,
        participantCount: competition?.participants?.length
      })
      
      toast.loading('Starting competition...', { id: 'start-competition' })
      
      const result = await dispatch(startCompetition(id)).unwrap()
      
      toast.success('Competition started! Switching to code editor...', { 
        id: 'start-competition',
        duration: 2000 
      })
      
      console.log('✅ Competition started successfully:', result)
      
      // Immediately switch creator to code tab
      console.log('🔗 Creator starting competition - switching to code tab')
      setActiveTab('code')
      
      // Socket events will handle switching other participants to code tab
      
    } catch (error) {
      console.error('❌ Failed to start competition:', error)
      toast.error(error.message || 'Failed to start competition', { id: 'start-competition' })
    }
  }

  const handleDeleteCompetition = async () => {
    try {
      await dispatch(deleteCompetition(id)).unwrap()
      toast.success('Competition deleted successfully!')
      setShowDeleteModal(false)
      navigate('/competitions')
    } catch (error) {
      toast.error(error.message || 'Failed to delete competition')
      setShowDeleteModal(false)
    }
  }

  const handleAutoSubmit = async () => {
    if (autoSubmitTriggeredRef.current) return
    autoSubmitTriggeredRef.current = true

    try {
      const resultAction = await dispatch(autoSubmitSolution(id))
      const { payload } = resultAction

      if (resultAction.type === 'competition/autoSubmitSolution/fulfilled' && payload) {
        toast.success('Solution submitted automatically!')
        setCurrentCode('')
        setWinner(payload.winner)
      } else {
        toast.error('Auto submission failed')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to auto-submit solution')
    } finally {
      autoSubmitTriggeredRef.current = false
    }
  }

  const handleTimeUp = async () => {
    if (autoSubmitTriggeredRef.current) return
    autoSubmitTriggeredRef.current = true

    try {
      // Auto-submit current user's code if they're a participant
      if (isParticipant && currentCode.trim()) {
        await dispatch(autoSubmitSolution({
          competitionId: id,
          submissionData: {
            challengeId: competition?.challenge?._id,
            code: currentCode,
            language: currentLanguage,
            isAutoSubmitted: true
          }
        })).unwrap()
        
        toast.success('⏰ Time up! Your code has been auto-submitted.', {
          duration: 5000,
          icon: '⏰'
        })
      }

      // End the competition
      const result = await dispatch(endCompetition(id)).unwrap()
      
      // Determine and announce winner
      if (result.winner) {
        setWinner(result.winner)
        if (result.winner._id === user?._id) {
          toast.success('🎉 Congratulations! You won the competition!', {
            duration: 8000,
            icon: '🏆'
          })
        } else {
          toast.success(`🏆 Competition ended! Winner: ${result.winner.username}`, {
            duration: 8000,
            icon: '🏆'
          })
        }
      } else {
        toast.success('⏰ Competition ended! Check the leaderboard for results.', {
          duration: 5000,
          icon: '🏁'
        })
      }

    } catch (error) {
      console.error('Auto-submission error:', error)
      toast.error('Failed to auto-submit. Please submit manually if possible.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !currentCompetition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Competition Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The competition you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/competitions')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Competitions
          </button>
        </div>
      </div>
    )
  }

  // Debug logging
  console.log('Competition Page Debug:', {
    isCreator,
    competitionStatus: competition?.status,
    participantCount: competition?.participants?.length,
    maxParticipants: competition?.maxParticipants,
    participants: competition?.participants?.map(p => ({
      userId: p.user?._id || p.user,
      username: p.user?.username || 'Unknown'
    }))
  })

  const canStart = isCreator && 
                 competition?.status === 'pending' && 
                 competition?.participants?.length >= 1 // Temporarily allow 1 participant for testing
  const canDelete = isCreator && (competition?.status === 'pending' || competition?.status === 'completed')
  const canJoin = !isParticipant && 
                  competition?.status === 'pending' && 
                  (competition?.participants?.length || 0) < (competition?.maxParticipants || 0) &&
                  (competition?.isPublic || competition?.invitations?.some(inv => inv.user === user?._id))

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case '1v1': return <FireIcon className="w-5 h-5" />
      case 'group': return <UsersIcon className="w-5 h-5" />
      case 'tournament': return <TrophyIcon className="w-5 h-5" />
      default: return <TrophyIcon className="w-5 h-5" />
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrophyIcon },
    { id: 'participants', name: 'Participants', icon: UsersIcon },
    { id: 'leaderboard', name: 'Leaderboard', icon: TrophyIcon },
    { id: 'chat', name: 'Chat', icon: ChatBubbleLeftIcon }
  ]

  // Add code tab for participants (enabled when active, disabled when pending)
  if (isParticipant) {
    tabs.push({ 
      id: 'code', 
      name: competition?.status === 'active' ? '🔥 Code Editor' : 'Code Editor', 
      icon: CodeBracketIcon,
      disabled: competition?.status !== 'active'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/competitions')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(competition?.type)}
                    <h1 className="text-2xl font-bold text-gray-900">{competition?.title || 'Competition'}</h1>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(competition?.status)}`}>
                    {competition?.status || 'Unknown'}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{competition?.description || 'No description available'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Debug: Log button visibility */}
              {console.log('Button visibility:', { canJoin, canStart, canDelete })}
              
              {canJoin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowJoinModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Join Competition
                </motion.button>
              )}
              {canStart && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartCompetition}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Start Competition
                </motion.button>
              )}
              {canDelete && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  title="Delete Competition"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Delete
                </motion.button>
              )}
            </div>
          </div>

          {/* Competition Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <UsersIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-600">Participants</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {competition?.participants?.length || 0}/{competition?.maxParticipants || 0}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-600">Duration</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {competition?.timeLimit || 0} min
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <TrophyIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-600">Prize Pool</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {competition?.prizePool || 'Honor & Glory'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              {competition?.status === 'active' ? (
                <CompetitionTimer
                  startTime={competition?.actualStartTime}
                  timeLimit={competition?.timeLimit}
                />
              ) : (
                <>
                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">
                      {competition?.status === 'pending' ? 'Starts' : 'Ended'}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {competition?.startTime ? new Date(competition.startTime).toLocaleDateString() : 'TBD'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Competition Timer Banner - Shows when active */}
      {competition?.status === 'active' && isParticipant && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-lg border-b-4 border-yellow-400"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-lg">LIVE COMPETITION</span>
                </div>
                {winner && (
                  <div className="flex items-center space-x-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full">
                    <TrophyIcon className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      Winner: {winner.username} ({winner.score} pts)
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-white/80 text-sm">Challenge</p>
                  <p className="text-white font-semibold">{competition?.challenge?.title || 'Loading...'}</p>
                </div>
                <div className="h-8 w-px bg-white/30"></div>
                <CompetitionTimer
                  startTime={competition?.actualStartTime}
                  timeLimit={competition?.timeLimit}
                  onTimeUp={handleTimeUp}
                  competitionEnded={competition?.status === 'completed'}
                  isBanner={true}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Winner Announcement Banner */}
      {winner && competition?.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrophyIcon className="w-8 h-8 text-yellow-900 mr-2" />
                <h2 className="text-2xl font-bold text-yellow-900">Competition Complete!</h2>
                <TrophyIcon className="w-8 h-8 text-yellow-900 ml-2" />
              </div>
              <p className="text-yellow-800 text-lg">
                🎉 <span className="font-bold">{winner.username}</span> wins with {winner.score} points! 🎉
              </p>
              {winner._id === user?._id && (
                <p className="text-yellow-900 font-semibold mt-1">Congratulations! You are the champion! 🏆</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isDisabled = tab.disabled
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`${
                    isActive && !isDisabled
                      ? 'border-blue-500 text-blue-600'
                      : isDisabled
                      ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                    tab.id === 'code' && competition?.status === 'active' ? 'animate-pulse' : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isDisabled ? 'opacity-50' : ''}`} />
                  <span className={isDisabled ? 'opacity-50' : ''}>{tab.name}</span>
                  {tab.id === 'code' && competition?.status === 'active' && (
                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Competition Overview</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <p className="text-gray-600 mt-1">
                      {competition?.status === 'active' ? 'Competition is live!' : 'Waiting to start...'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Participants</h4>
                    <p className="text-gray-600 mt-1">
                      {competition?.participants?.length || 0} / {competition?.maxParticipants || 'Unlimited'} joined
                    </p>
                  </div>
                  {competition?.challenge && (
                    <div>
                      <h4 className="font-medium text-gray-900">Challenge</h4>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="font-medium text-gray-900">{competition.challenge.title}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {competition.challenge.difficulty}
                        </span>
                        <span className="text-sm text-gray-500">
                          {competition.challenge.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2 text-sm">
                        Switch to the Code Editor tab to view the full challenge details and start coding.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Rules</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Competition duration: {competition?.timeLimit || 0} minutes</li>
                  <li>• Maximum {competition?.maxParticipants || 0} participants</li>
                  <li>• {competition?.type === '1v1' ? 'Head-to-head challenge' : 'Group competition'}</li>
                  <li>• Submissions are automatically evaluated</li>
                  <li>• Real-time leaderboard updates</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Creator</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {(competition?.createdBy?.username || competition?.creator?.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{competition?.createdBy?.username || competition?.creator?.username || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">Competition Host</p>
                  </div>
                </div>
              </div>

              <CompetitionLeaderboard 
                leaderboard={leaderboard}
                competitionType={competition.type}
              />
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <ParticipantsList 
            participants={competition?.participants || []}
            invitations={competition?.invitations || []}
            maxParticipants={competition?.maxParticipants || 0}
            creatorId={competition?.createdBy?._id || competition?.creator?._id}
          />
        )}

        {activeTab === 'leaderboard' && (
          <CompetitionLeaderboard 
            leaderboard={leaderboard}
            competitionType={competition.type}
            detailed={true}
          />
        )}

        {activeTab === 'chat' && (
          <CompetitionChat competitionId={competition._id} />
        )}

        {activeTab === 'code' && isParticipant && (
          competition?.status === 'active' ? (
            <CompetitionEditor 
              competition={competition}
              challenge={competition.challenge}
              onCodeChange={setCurrentCode}
              onLanguageChange={setCurrentLanguage}
            />
          ) : (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
                <CodeBracketIcon className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Waiting for Competition to Start
                </h3>
                <p className="text-yellow-700 mb-4">
                  The code editor will be available once the competition begins.
                </p>
                {isCreator && competition?.status === 'pending' && (
                  <div className="text-sm text-yellow-600 bg-yellow-100 rounded p-3">
                    <strong>Creator:</strong> Click "Start Competition" to begin the coding challenge!
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Join Competition Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <TrophyIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Join Competition</h3>
              <p className="text-gray-600 mb-6">
                Are you ready to participate in "{competition?.title}"?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinCompetition}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Join Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Competition Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Competition</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to permanently delete "{competition?.title}"? This will remove the competition from your screen and cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCompetition}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Competition
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default CompetitionPage
