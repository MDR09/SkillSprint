import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  TrophyIcon,
  FireIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'
import { createCompetition } from '../../store/slices/competitionSlice'
import { fetchChallenges } from '../../store/slices/challengeSlice'
import toast from 'react-hot-toast'

const CreateCompetitionModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { challenges = [] } = useSelector((state) => state.challenge || {})
  const { loading } = useSelector((state) => state.competition)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '1v1',
    challengeId: '',
    startTime: '',
    timeLimit: 60,
    maxParticipants: 2,
    isPublic: true,
    prizePool: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchChallenges({ limit: 50 }))
    }
  }, [dispatch, isOpen])

  useEffect(() => {
    // Set default values based on competition type
    if (formData.type === '1v1') {
      setFormData(prev => ({ ...prev, maxParticipants: 2 }))
    } else if (formData.type === 'group') {
      setFormData(prev => ({ ...prev, maxParticipants: Math.max(prev.maxParticipants, 3) }))
    }
  }, [formData.type])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.challengeId) {
      newErrors.challengeId = 'Please select a challenge'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    } else {
      const startTime = new Date(formData.startTime)
      const now = new Date()
      if (startTime <= now) {
        newErrors.startTime = 'Start time must be in the future'
      }
    }

    if (formData.timeLimit < 15) {
      newErrors.timeLimit = 'Time limit must be at least 15 minutes'
    }

    if (formData.maxParticipants < 2) {
      newErrors.maxParticipants = 'Must allow at least 2 participants'
    }

    if (formData.type === '1v1' && formData.maxParticipants !== 2) {
      newErrors.maxParticipants = '1v1 competitions must have exactly 2 participants'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await dispatch(createCompetition(formData)).unwrap()
      toast.success('Competition created successfully!')
      onClose()
      setFormData({
        title: '',
        description: '',
        type: '1v1',
        challengeId: '',
        startTime: '',
        timeLimit: 60,
        maxParticipants: 2,
        isPublic: true,
        prizePool: ''
      })
      setErrors({})
    } catch (error) {
      toast.error(error.message || 'Failed to create competition')
    }
  }

  const competitionTypes = [
    {
      value: '1v1',
      label: '1v1 Challenge',
      description: 'Head-to-head coding duel',
      icon: FireIcon,
      color: 'text-red-600'
    },
    {
      value: 'group',
      label: 'Group Competition',
      description: 'Multiple participants compete',
      icon: UsersIcon,
      color: 'text-blue-600'
    },
    {
      value: 'tournament',
      label: 'Tournament',
      description: 'Bracket-style elimination',
      icon: TrophyIcon,
      color: 'text-purple-600'
    }
  ]

  // Set minimum date to 5 minutes from now
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5)
    return now.toISOString().slice(0, 16)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create Competition</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competition Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter competition title..."
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe your competition..."
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Competition Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Competition Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {competitionTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <label
                        key={type.value}
                        className={`relative border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center text-center">
                          <Icon className={`w-6 h-6 ${type.color} mb-2`} />
                          <span className="text-sm font-medium text-gray-900">
                            {type.label}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {type.description}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Challenge Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Challenge
                </label>
                <select
                  name="challengeId"
                  value={formData.challengeId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.challengeId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a challenge...</option>
                  {challenges.map((challenge) => (
                    <option key={challenge._id} value={challenge._id}>
                      {challenge.title} ({challenge.difficulty})
                    </option>
                  ))}
                </select>
                {errors.challengeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.challengeId}</p>
                )}
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    min={getMinDateTime()}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    min={15}
                    max={180}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.timeLimit ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.timeLimit && (
                    <p className="mt-1 text-sm text-red-600">{errors.timeLimit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min={2}
                    max={formData.type === '1v1' ? 2 : 100}
                    disabled={formData.type === '1v1'}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.maxParticipants ? 'border-red-300' : 'border-gray-300'
                    } ${formData.type === '1v1' ? 'bg-gray-100' : ''}`}
                  />
                  {errors.maxParticipants && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prize Pool (optional)
                  </label>
                  <input
                    type="text"
                    name="prizePool"
                    value={formData.prizePool}
                    onChange={handleInputChange}
                    placeholder="e.g., $100, Gift cards, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Visibility
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isPublic"
                      value={true}
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: true }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <GlobeAltIcon className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Public</span>
                      </div>
                      <p className="text-sm text-gray-500">Anyone can join this competition</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isPublic"
                      value={false}
                      checked={!formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: false }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <LockClosedIcon className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Private</span>
                      </div>
                      <p className="text-sm text-gray-500">Only invited users can join</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </div>
                  ) : (
                    'Create Competition'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CreateCompetitionModal
