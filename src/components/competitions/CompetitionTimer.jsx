import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const CompetitionTimer = ({ 
  startTime, 
  timeLimit, 
  onTimeUp, 
  competitionEnded = false, 
  isBanner = false 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isWarning, setIsWarning] = useState(false)
  const [hasEnded, setHasEnded] = useState(competitionEnded)
  const timeUpCalledRef = useRef(false)

  useEffect(() => {
    if (competitionEnded) {
      setHasEnded(true)
      setTimeRemaining(0)
      return
    }

    const calculateTimeRemaining = () => {
      const now = new Date()
      const start = new Date(startTime)
      const end = new Date(start.getTime() + timeLimit * 60 * 1000)
      
      const remaining = end - now
      
      if (remaining <= 0) {
        setTimeRemaining(0)
        setHasEnded(true)
        if (onTimeUp && !timeUpCalledRef.current) {
          timeUpCalledRef.current = true
          onTimeUp()
        }
        return
      }
      
      setTimeRemaining(remaining)
      setIsWarning(remaining <= 5 * 60 * 1000) // Warning in last 5 minutes
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [startTime, timeLimit, onTimeUp, competitionEnded])

  const formatTime = (ms) => {
    if (ms === null || ms <= 0) return '00:00:00'
    
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (timeRemaining === null) return 0
    const totalTime = timeLimit * 60 * 1000
    return Math.max(0, (timeRemaining / totalTime) * 100)
  }

  const getTimerColor = () => {
    if (hasEnded) return 'bg-gray-50 border-gray-200'
    if (isWarning) return 'bg-red-50 border-red-200'
    return 'bg-blue-50 border-blue-200'
  }

  const getTextColor = () => {
    if (hasEnded) return 'text-gray-700'
    if (isWarning) return 'text-red-700'
    return 'text-blue-700'
  }

  const getIconColor = () => {
    if (hasEnded) return 'text-gray-500'
    if (isWarning) return 'text-red-500'
    return 'text-blue-500'
  }

  const getProgressColor = () => {
    if (hasEnded) return 'bg-gray-500'
    if (isWarning) return 'bg-red-500'
    return 'bg-blue-500'
  }

  // Banner mode simplified display
  if (isBanner) {
    return (
      <div className="flex items-center space-x-4">
        {hasEnded ? (
          <div className="flex items-center space-x-2 text-white">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-mono text-lg font-bold">FINISHED</span>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              {isWarning ? (
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-300" />
              ) : (
                <ClockIcon className="w-5 h-5 text-white" />
              )}
              <span className="text-sm font-medium text-white/90">Time Left:</span>
            </div>
            <span className={`font-mono text-xl font-bold ${isWarning ? 'text-yellow-300 animate-pulse' : 'text-white'}`}>
              {formatTime(timeRemaining)}
            </span>
          </>
        )}
      </div>
    )
  }

  // Regular mode with full styling
  return (
    <motion.div
      animate={{ 
        scale: isWarning && !hasEnded ? [1, 1.05, 1] : 1,
        boxShadow: isWarning && !hasEnded ? [
          '0 0 0 0 rgba(239, 68, 68, 0)',
          '0 0 0 10px rgba(239, 68, 68, 0.1)',
          '0 0 0 0 rgba(239, 68, 68, 0)'
        ] : '0 0 0 0 rgba(239, 68, 68, 0)'
      }}
      transition={{ duration: 1, repeat: isWarning && !hasEnded ? Infinity : 0 }}
      className={`relative overflow-hidden rounded-lg p-4 border ${getTimerColor()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {hasEnded ? (
            <CheckCircleIcon className={`w-5 h-5 ${getIconColor()}`} />
          ) : isWarning ? (
            <ExclamationTriangleIcon className={`w-5 h-5 ${getIconColor()}`} />
          ) : (
            <ClockIcon className={`w-5 h-5 ${getIconColor()}`} />
          )}
          <span className={`text-sm font-medium ${getTextColor()}`}>
            {hasEnded ? 'Competition Ended' : 'Time Remaining'}
          </span>
        </div>
        <div className={`text-2xl font-bold font-mono ${getTextColor()}`}>
          {hasEnded ? 'FINISHED' : formatTime(timeRemaining)}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className={getTextColor()}>
            {hasEnded ? 'Completed' : 'Started'}
          </span>
          <span className={getTextColor()}>
            {timeLimit} min total
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full transition-colors duration-300 ${getProgressColor()}`}
            initial={{ width: hasEnded ? '0%' : '100%' }}
            animate={{ width: hasEnded ? '100%' : `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      {hasEnded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-gray-600 font-medium"
        >
          ✅ All submissions have been finalized
        </motion.div>
      )}
      
      {isWarning && !hasEnded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-red-600 font-medium"
        >
          ⚠️ Less than 5 minutes remaining!
        </motion.div>
      )}
    </motion.div>
  )
}

export default CompetitionTimer
