import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  TrophyIcon,
  ClockIcon,
  UserGroupIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { fetchCompetitions, fetchMyCompetitions } from '../store/slices/competitionSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import CompetitionCard from '../components/competitions/CompetitionCard'
import CreateCompetitionModal from '../components/competitions/CreateCompetitionModal'
import ChallengeFriendModal from '../components/competitions/ChallengeFriendModal'

const statusOptions = [
  { value: 'all', label: 'All Competitions' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' }
]

const CompetitionsPage = () => {
  const dispatch = useDispatch()
  const { 
    competitions, 
    myCompetitions, 
    loading, 
    error,
    pagination 
  } = useSelector((state) => state.competition)
  
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showChallengeModal, setShowChallengeModal] = useState(false)

  useEffect(() => {
    if (activeTab === 'all') {
      dispatch(fetchCompetitions({
        search: searchTerm,
        type: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus
      }))
    } else {
      dispatch(fetchMyCompetitions({
        search: searchTerm,
        type: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus
      }))
    }
  }, [dispatch, activeTab, searchTerm, filterType, filterStatus])

  const filteredCompetitions = activeTab === 'all' ? (competitions || []) : (myCompetitions || [])

  const tabs = [
    { id: 'all', name: 'All Competitions', icon: TrophyIcon },
    { id: 'mine', name: 'My Competitions', icon: UserGroupIcon }
  ]

  const competitionTypes = [
    { value: 'all', label: 'All Types' },
    { value: '1v1', label: '1v1 Challenge' },
    { value: 'group', label: 'Group Competition' },
    { value: 'tournament', label: 'Tournament' }
  ]

  if (loading && filteredCompetitions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Competitions</h1>
              <p className="mt-2 text-gray-600">
                Challenge friends, join group competitions, and compete in real-time
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowChallengeModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                <BoltIcon className="w-4 h-4 mr-2" />
                Quick Challenge
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Competition
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <motion.div
              key="active-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <TrophyIcon className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredCompetitions?.filter(c => c.status === 'active').length || 0}
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              key="pending-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredCompetitions?.filter(c => c.status === 'pending').length || 0}
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              key="my-competitions-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <UsersIcon className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Competitions</p>
                  <p className="text-2xl font-bold text-gray-900">{myCompetitions.length}</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              key="challenges-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <BoltIcon className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">1v1 Challenges</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredCompetitions?.filter(c => c.type === '1v1').length || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {competitionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterType('all')
                setFilterStatus('all')
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Competitions Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredCompetitions.length === 0 ? (
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No competitions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'all' 
                ? 'Be the first to create a competition!' 
                : "You haven't joined any competitions yet."
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Competition
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCompetitions.map((competition, index) => (
              <motion.div
                key={competition._id || competition.id || `competition-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CompetitionCard competition={competition} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Loading More */}
        {loading && filteredCompetitions.length > 0 && (
          <div className="flex justify-center mt-8">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCompetitionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <ChallengeFriendModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
      />
    </div>
  )
}

export default CompetitionsPage
