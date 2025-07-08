import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  UsersIcon,
  StarIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';
import { fetchPublicTeams, fetchMyTeams, createTeam, joinTeam } from '../store/slices/teamSlice';
import toast from 'react-hot-toast';

const TeamsPage = () => {
  const dispatch = useDispatch();
  const { teams = [], myTeams = [], loading = false, error = null, pagination = {} } = useSelector(state => state.team || {});
  const { user } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('public');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    maxMembers: 4,
    isPublic: true
  });

  useEffect(() => {
    if (activeTab === 'public') {
      dispatch(fetchPublicTeams({ page: 1, limit: 12 }));
    } else {
      dispatch(fetchMyTeams());
    }
  }, [dispatch, activeTab]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    if (!newTeam.name.trim()) {
      toast.error('Team name is required');
      return;
    }
    
    try {
      await dispatch(createTeam(newTeam)).unwrap();
      toast.success('Team created successfully! 🎉');
      setShowCreateForm(false);
      setNewTeam({ name: '', description: '', maxMembers: 4, isPublic: true });
      if (activeTab === 'my-teams') {
        dispatch(fetchMyTeams());
      } else {
        dispatch(fetchPublicTeams({ page: 1, limit: 12 }));
      }
    } catch (err) {
      toast.error(err || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      await dispatch(joinTeam(teamId)).unwrap();
      toast.success('Successfully joined the team! 🎉');
      dispatch(fetchPublicTeams({ page: 1, limit: 12 }));
      if (activeTab === 'my-teams') {
        dispatch(fetchMyTeams());
      }
    } catch (err) {
      toast.error(err || 'Failed to join team');
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TeamCard = ({ team, showJoinButton = true }) => {
    const isUserMember = team.members?.some(member => member._id === user?.id);
    const isCreator = team.creator?._id === user?.id;
    const isFull = team.members?.length >= team.maxMembers;

    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {team.name}
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <StarIcon className="w-4 h-4 mr-1" />
                  {team.creator?.username || 'Unknown'}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              {isCreator && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Creator
                </span>
              )}
              {isUserMember && !isCreator && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Member
                </span>
              )}
              {isFull && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  Full
                </span>
              )}
            </div>
          </div>

          {team.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {team.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <UsersIcon className="w-4 h-4 mr-1" />
              {team.members.length}/{team.maxMembers} members
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {new Date(team.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center mt-4 -space-x-2">
            {team.members.slice(0, 4).map((member) => (
              <img
                key={member._id}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                src={member.avatar || `https://ui-avatars.com/api/?name=${member.username}&background=random`}
                alt={member.username}
                title={member.username}
              />
            ))}
            {team.members.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  +{team.members.length - 4}
                </span>
              </div>
            )}
          </div>

          {showJoinButton && !isUserMember && !isFull && (
            <button
              onClick={() => handleJoinTeam(team._id)}
              disabled={loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
            >
              {loading ? 'Joining...' : 'Join Team'}
            </button>
          )}

          {isFull && !isUserMember && (
            <div className="w-full mt-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 py-2 px-4 rounded-lg text-center font-medium">
              Team Full
            </div>
          )}

          {isUserMember && (
            <div className="w-full mt-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 py-2 px-4 rounded-lg text-center font-medium flex items-center justify-center">
              <CheckIcon className="w-4 h-4 mr-2" />
              You're a member
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Teams
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join teams to collaborate on challenges and competitions
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Teams</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {(teams?.length || 0) + (myTeams?.length || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">My Teams</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {myTeams?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Spots</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {teams?.reduce((acc, team) => acc + (team.maxMembers - team.members?.length || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'public'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Public Teams
            </button>
            <button
              onClick={() => setActiveTab('my-teams')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'my-teams'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              My Teams ({myTeams.length})
            </button>
          </div>

          <div className="flex space-x-3">
            {activeTab === 'public' && (
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Team
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Teams Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeTab === 'public' 
              ? filteredTeams.map((team) => (
                  <TeamCard key={team._id} team={team} />
                ))
              : myTeams.map((team) => (
                  <TeamCard key={team._id} team={team} showJoinButton={false} />
                ))
            }
          </div>
        )}

        {/* Empty State */}
        {!loading && (
          (activeTab === 'public' && filteredTeams.length === 0) ||
          (activeTab === 'my-teams' && myTeams.length === 0)
        ) && (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {activeTab === 'public' ? 'No teams found' : 'No teams yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeTab === 'public' 
                ? 'Try adjusting your search criteria'
                : 'Create or join a team to get started'
              }
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Team
            </button>
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Team
              </h3>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team name"
                  />
                  <p className="text-xs text-gray-500 mt-1">{newTeam.name.length}/50 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    rows={3}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your team's goals and what you're looking for..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{newTeam.description.length}/200 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Members
                  </label>
                  <select
                    value={newTeam.maxMembers}
                    onChange={(e) => setNewTeam({ ...newTeam, maxMembers: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} members</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose the ideal team size for collaboration</p>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newTeam.isPublic}
                    onChange={(e) => setNewTeam({ ...newTeam, isPublic: e.target.checked })}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Make team public
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Public teams can be discovered and joined by anyone
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTeam({ name: '', description: '', maxMembers: 4, isPublic: true });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newTeam.name.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                  >
                    {loading ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
