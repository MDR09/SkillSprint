import { motion } from 'framer-motion'
import { 
  TrophyIcon, 
  StarIcon, 
  XMarkIcon,
  FireIcon 
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const WinnerModal = ({ 
  isOpen, 
  onClose, 
  winner, 
  currentUser, 
  competition,
  finalScores = [] 
}) => {
  const navigate = useNavigate()
  
  if (!isOpen) return null

  const isCurrentUserWinner = winner?._id === currentUser?._id
  const currentUserScore = finalScores.find(score => score.userId === currentUser?._id)?.score || 0

  const handleBackToCompetitions = () => {
    onClose()
    navigate('/competitions')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Competition Ended Badge */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <FireIcon className="w-6 h-6 text-orange-500" />
          <span className="text-lg font-semibold text-gray-900">Competition Ended</span>
        </div>

        {/* Winner Section */}
        {isCurrentUserWinner ? (
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <TrophyIcon className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              🎉 You Won!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-600"
            >
              Congratulations! You achieved the highest score.
            </motion.p>
          </div>
        ) : (
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <TrophyIcon className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Competition Complete
            </motion.h2>
            {winner ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600"
              >
                <span className="font-semibold text-yellow-600">{winner.username}</span> won with {winner.score} points!
              </motion.p>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600"
              >
                Great effort! The competition has ended.
              </motion.p>
            )}
          </div>
        )}

        {/* Score Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Final Results</h3>
          
          {/* Current User Score */}
          <div className="flex items-center justify-between p-3 bg-white rounded-md mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.username?.[0]?.toUpperCase() || 'Y'}
                </span>
              </div>
              <span className="font-medium text-gray-900">You</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-blue-600">{currentUserScore}</span>
              <span className="text-sm text-gray-500">pts</span>
            </div>
          </div>

          {/* Winner Score (if different from current user) */}
          {!isCurrentUserWinner && winner && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <TrophyIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">{winner.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-yellow-600">{winner.score}</span>
                <span className="text-sm text-gray-500">pts</span>
                <StarIcon className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          )}
        </div>

        {/* Competition Info */}
        {competition && (
          <div className="text-sm text-gray-600 mb-6">
            <p className="font-medium">{competition.title}</p>
            <p>{competition.type} • {competition.timeLimit} minutes</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Stay Here
          </button>
          <button
            onClick={handleBackToCompetitions}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Competitions
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default WinnerModal
