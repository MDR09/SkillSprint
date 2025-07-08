import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ClockIcon,
  UsersIcon,
  TrophyIcon,
  FireIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CalendarIcon,
  PlayIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'
import { joinCompetition } from '../../store/slices/competitionSlice'
import toast from 'react-hot-toast'

const CompetitionCard = ({ competition }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [isJoining, setIsJoining] = useState(false)

  const isParticipant = competition.participants?.some(p => p.user._id === user._id || p.user === user._id)
  const creator = competition.createdBy || competition.creator
  const isCreator = creator?._id === user._id || creator === user._id
  const isFull = competition.participants?.length >= competition.maxParticipants
  const canJoin = !isParticipant && 
                  !isFull &&
                  competition.status === 'pending' &&
                  (competition.isPublic || competition.invitations?.some(inv => inv.user === user._id))

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case '1v1': return 'bg-red-100 text-red-800 border-red-200'
      case 'group': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'tournament': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case '1v1': return <FireIcon className="w-4 h-4" />
      case 'group': return <UsersIcon className="w-4 h-4" />
      case 'tournament': return <TrophyIcon className="w-4 h-4" />
      default: return <TrophyIcon className="w-4 h-4" />
    }
  }

  const handleQuickJoin = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!canJoin) return

    setIsJoining(true)
    try {
      await dispatch(joinCompetition(competition._id)).unwrap()
      toast.success('Successfully joined the competition!')
      // Navigate to the competition page after successful join
      if (competition._id) {
        navigate(`/competitions/${competition._id}`)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to join competition')
    } finally {
      setIsJoining(false)
    }
  }

  const formatTimeRemaining = () => {
    const now = new Date()
    const startTime = new Date(competition.startTime)
    const diffMs = startTime - now

    if (diffMs <= 0) {
      if (competition.status === 'active') {
        const endTime = new Date(startTime.getTime() + competition.timeLimit * 60000)
        const remaining = endTime - now
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60000)
          return `${minutes}m remaining`
        }
      }
      return 'Started'
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <Link 
        to={isParticipant ? `/challenges/${competition.challenge?._id || competition.challengeId}` : `/competitions/${competition._id}`} 
        className="block"
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {getTypeIcon(competition.type)}
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {competition.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">
                {competition.description}
              </p>
            </div>
            <div className="flex items-center space-x-1 ml-3">
              {competition.isPublic ? (
                <GlobeAltIcon className="w-4 h-4 text-green-500" />
              ) : (
                <LockClosedIcon className="w-4 h-4 text-orange-500" />
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center space-x-2 mb-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(competition.status)}`}>
              {competition.status}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(competition.type)}`}>
              {competition.type}
            </span>
            {isParticipant && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                Joined
              </span>
            )}
            {isCreator && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                Creator
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span>
                {competition.participants?.length || 0}/{competition.maxParticipants}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{competition.timeLimit}m</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>{formatTimeRemaining()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <TrophyIcon className="w-4 h-4 mr-1" />
              <span>{competition.prizePool || 'Honor'}</span>
            </div>
          </div>

          {/* Challenge Info */}
          {competition.challenge && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {competition.challenge.title}
                </span>
                <span className="text-xs text-gray-500">
                  {competition.challenge.difficulty}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {creator && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-medium">
                      {(creator.username || creator.name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <span>{creator.username || creator.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Quick Actions */}
              {canJoin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleQuickJoin}
                  disabled={isJoining}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <PlayIcon className="w-3 h-3 mr-1" />
                  )}
                  Quick Join
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (isParticipant) {
                    navigate(`/challenges/${competition.challenge?._id || competition.challengeId}`)
                  } else {
                    navigate(`/competitions/${competition._id}`)
                  }
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="w-3 h-3 mr-1" />
                {isParticipant ? 'Start Challenge' : 'View Details'}
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default CompetitionCard
