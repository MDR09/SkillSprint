import { motion } from 'framer-motion'
import {
  TrophyIcon,
  ClockIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline'

const CompetitionLeaderboard = ({ leaderboard = [], competitionType, detailed = false }) => {
  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <TrophyIcon className="w-6 h-6 text-yellow-500" />
      case 2:
        return <TrophyIcon className="w-6 h-6 text-gray-400" />
      case 3:
        return <TrophyIcon className="w-6 h-6 text-orange-600" />
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">{position}</span>
          </div>
        )
    }
  }

  const getRankColor = (position) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
      case 3: return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
      default: return 'bg-white border-gray-200'
    }
  }

  const formatTime = (timeInMs) => {
    if (!timeInMs) return '--:--'
    const minutes = Math.floor(timeInMs / 60000)
    const seconds = Math.floor((timeInMs % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatScore = (score) => {
    if (typeof score === 'number') {
      return score.toFixed(0)
    }
    return score || '0'
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrophyIcon className="w-5 h-5 mr-2" />
          Leaderboard
        </h3>
        <div className="text-center py-8">
          <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No participants yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Leaderboard will update when participants submit solutions
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <TrophyIcon className="w-5 h-5 mr-2" />
          Leaderboard
          {competitionType === '1v1' && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <FireIcon className="w-3 h-3 mr-1" />
              1v1
            </span>
          )}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {competitionType === '1v1' 
            ? 'Head-to-head battle rankings' 
            : 'Real-time participant rankings'
          }
        </p>
      </div>

      <div className="overflow-hidden">
        {leaderboard.map((participant, index) => {
          const position = index + 1
          return (
            <motion.div
              key={participant.user._id || participant._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border-b border-gray-100 last:border-b-0 ${getRankColor(position)}`}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(position)}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {(participant.user?.username || participant.username || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {participant.user?.username || participant.username}
                        </p>
                        {detailed && (
                          <p className="text-sm text-gray-500">
                            {participant.user?.name || participant.name || 'Competitor'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6">
                    {/* Score */}
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <CodeBracketIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-lg font-bold text-gray-900">
                          {formatScore(participant.score)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>

                    {/* Completion Time */}
                    {participant.completionTime && (
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {formatTime(participant.completionTime)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Time</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="text-right">
                      {participant.hasCompleted ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">Complete</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Details for Detailed View */}
                {detailed && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Submissions:</span>
                      <span>{participant.submissionCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Last Submit:</span>
                      <span>
                        {participant.lastSubmissionTime 
                          ? new Date(participant.lastSubmissionTime).toLocaleTimeString()
                          : 'None'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Progress:</span>
                      <span>{participant.testsPassed || 0} tests passed</span>
                    </div>
                  </div>
                )}

                {/* Winner Badge */}
                {position === 1 && leaderboard.length > 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
                  >
                    <TrophyIcon className="w-3 h-3 mr-1" />
                    {competitionType === '1v1' ? 'Winner!' : 'Leading!'}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 1v1 Special Footer */}
      {competitionType === '1v1' && leaderboard.length === 2 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>Head-to-Head Battle</span>
            <span>•</span>
            <span>First to solve wins!</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompetitionLeaderboard
