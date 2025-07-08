import { motion } from 'framer-motion'
import {
  UsersIcon,
  StarIcon,
  UserPlusIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline'

const ParticipantsList = ({ participants = [], invitations = [], maxParticipants, creatorId }) => {
  const getParticipantBadge = (participant, isInvited = false) => {
    const isCreator = participant.user._id === creatorId || participant.user === creatorId
    
    if (isCreator) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <StarIcon className="w-3 h-3 mr-1" />
          Host
        </span>
      )
    }

    if (isInvited) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Invited
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <UsersIcon className="w-3 h-3 mr-1" />
        Player
      </span>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'completed': return 'text-blue-600'
      case 'left': return 'text-gray-500'
      default: return 'text-gray-600'
    }
  }

  const formatJoinTime = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">
                {participants.length}/{maxParticipants}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrophyIcon className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Players</p>
              <p className="text-2xl font-bold text-gray-900">
                {participants.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Invites</p>
              <p className="text-2xl font-bold text-gray-900">
                {invitations.filter(inv => inv.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Participants</h3>
          <p className="text-sm text-gray-600">
            All competitors in this challenge
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {participants.length === 0 && invitations.length === 0 ? (
            <div className="text-center py-12">
              <UserPlusIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No participants yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Participants will appear here once they join
              </p>
            </div>
          ) : (
            <>
              {/* Active Participants */}
              {participants.map((participant, index) => (
                <motion.div
                  key={participant.user._id || participant._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {(participant.user?.username || participant.user?.name || 'U')[0].toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {participant.user?.username || participant.user?.name || 'Unknown User'}
                          </h4>
                          {getParticipantBadge(participant, false)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            Joined {formatJoinTime(participant.joinedAt)}
                          </span>
                          <span className={`font-medium ${getStatusColor(participant.status)}`}>
                            {participant.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {participant.score || 0}
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                      
                      {participant.submissionCount !== undefined && (
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {participant.submissionCount}
                          </p>
                          <p className="text-xs text-gray-500">Submissions</p>
                        </div>
                      )}

                      {participant.lastActivity && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(participant.lastActivity).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500">Last Active</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  {participant.user?.bio && (
                    <div className="mt-3 text-sm text-gray-600">
                      {participant.user.bio}
                    </div>
                  )}

                  {/* Progress Bar for Active Participants */}
                  {participant.status === 'active' && participant.progress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{participant.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-blue-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${participant.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Invited Users */}
              {invitations.map((invitation, index) => (
                <motion.div
                  key={invitation.user._id || invitation._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (participants.length + index) * 0.1 }}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors bg-yellow-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {(invitation.user?.username || invitation.user?.name || 'U')[0].toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {invitation.user?.username || invitation.user?.name || 'Unknown User'}
                          </h4>
                          {getParticipantBadge(invitation, true)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            Invited {formatJoinTime(invitation.sentAt)}
                          </span>
                          <span className="font-medium text-yellow-600">
                            {invitation.status === 'pending' ? 'Awaiting Response' : invitation.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Invitation Status */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-600">
                        Invitation {invitation.status}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {invitation.invitedBy?.username || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Slots Available */}
        {(participants.length + invitations.length) < maxParticipants && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <UserPlusIcon className="w-4 h-4 mr-2" />
              {maxParticipants - participants.length - invitations.length} slot(s) available
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParticipantsList
