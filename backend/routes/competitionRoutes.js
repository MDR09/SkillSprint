import express from 'express';
import Competition from '../models/Competition.js';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import { protect as auth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1
}

// Mock challenges for when database is not available
const mockChallenges = {
  '1': { _id: '1', title: 'Two Sum', difficulty: 'Easy' },
  '2': { _id: '2', title: 'Add Two Numbers', difficulty: 'Medium' },
  '3': { _id: '3', title: 'Longest Substring', difficulty: 'Medium' }
}

// Mock competitions storage (in production, this would be in database)
let mockCompetitions = []

// Create a new competition
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('type').isIn(['1v1', 'group', 'tournament']).withMessage('Invalid competition type'),
  body('challengeId').notEmpty().withMessage('Challenge ID required'),
  body('startTime').isISO8601().withMessage('Valid start time required'),
  body('timeLimit').optional().isInt({ min: 5, max: 480 }).withMessage('Time limit must be 5-480 minutes'),
  body('maxParticipants').optional().isInt({ min: 2, max: 50 }).withMessage('Max participants must be 2-50')
], async (req, res) => {
  try {
    console.log('🔍 Competition creation request:', {
      body: req.body,
      user: req.user ? { id: req.user.id, username: req.user.username } : 'No user'
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      type,
      challengeId,
      startTime,
      timeLimit = 60,
      maxParticipants = type === '1v1' ? 2 : 10,
      isPublic = false,
      allowedLanguages = ['javascript', 'python'],
      maxSubmissions = 10,
      inviteUsername // Add this field for quick challenges
    } = req.body;

    console.log('🔍 Create competition request body:', req.body);
    console.log('🔍 isPublic value:', isPublic);

    // If database is not connected, use mock data
    if (!isDatabaseConnected()) {
      // Check if mock challenge exists
      if (!mockChallenges[challengeId]) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
    // Validate start time is in the future
    const startDate = new Date(startTime);
    if (startDate <= new Date()) {
      return res.status(400).json({ message: 'Start time must be in the future' });
    }

    // Calculate end time based on start time + time limit
    const endDate = new Date(startDate.getTime() + timeLimit * 60 * 1000);

    // Create mock competition
    const mockCompetition = {
      _id: (mockCompetitions.length + 1).toString(),
      title,
      description,
      type,
      creator: { _id: req.user.id, username: req.user.username || 'user' },
      createdBy: { _id: req.user.id, username: req.user.username || 'user' },
      challenge: mockChallenges[challengeId],
      challengeId,
      startTime: startDate,
      endTime: endDate,
      timeLimit,
      maxParticipants,
      isPublic,
      status: 'pending',
      participants: [{
        user: { _id: req.user.id, username: req.user.username || 'user' },
        status: 'active',
        joinedAt: new Date()
      }],
      invitations: inviteUsername ? [{
        user: { username: inviteUsername },
        invitedBy: { _id: req.user.id, username: req.user.username || 'user' },
        sentAt: new Date(),
        status: 'pending'
      }] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

      mockCompetitions.push(mockCompetition);

      return res.status(201).json({
        success: true,
        data: mockCompetition,
        message: 'Competition created successfully'
      });
    }

    // Database is connected - use real data
    // Verify challenge exists
    let challenge;
    try {
      challenge = await Challenge.findById(challengeId);
    } catch (error) {
      // If challenge ID is invalid, treat as mock scenario
      console.log('⚠️  Invalid challenge ID, falling back to mock data');
      challenge = null;
    }
    
    if (!challenge) {
      // If challenge not found in database, fallback to mock
      console.log('⚠️  Challenge not found in database, using mock competition creation');
      const mockChallenge = { _id: challengeId, title: 'Challenge', difficulty: 'Medium' };
      
      // Calculate end time based on start time + time limit
      const endDate = new Date(startDate.getTime() + timeLimit * 60 * 1000);
      
      // Create mock competition structure that matches database schema
      const mockCompetition = {
        _id: new Date().getTime().toString(),
        title,
        description,
        type,
        creator: { _id: req.user.id, username: req.user.username || 'user' },
        challenge: mockChallenge,
        challengeId,
        startTime: startDate,
        endTime: endDate,
        timeLimit,
        maxParticipants,
        isPublic,
        status: 'pending',
        participants: [{
          user: { _id: req.user.id, username: req.user.username || 'user' },
          status: 'active',
          joinedAt: new Date()
        }],
        invitations: inviteUsername ? [{
          user: { username: inviteUsername },
          invitedBy: { _id: req.user.id, username: req.user.username || 'user' },
          sentAt: new Date(),
          status: 'pending'
        }] : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return res.status(201).json({
        success: true,
        data: mockCompetition,
        message: 'Competition created successfully'
      });
    }

    // Validate start time is in the future
    const startDate = new Date(startTime);
    if (startDate <= new Date()) {
      return res.status(400).json({ message: 'Start time must be in the future' });
    }

    // Calculate end time based on start time + time limit
    const endDate = new Date(startDate.getTime() + timeLimit * 60 * 1000);

    // If inviteUsername is provided, find the user to invite
    let userToInvite = null;
    if (inviteUsername) {
      userToInvite = await User.findOne({ username: inviteUsername });
      if (!userToInvite) {
        return res.status(404).json({ message: `User '${inviteUsername}' not found` });
      }
      
      // Check if trying to invite self
      if (userToInvite._id.toString() === req.user.id) {
        return res.status(400).json({ message: 'Cannot invite yourself' });
      }
    }

    const competition = new Competition({
      title,
      description,
      type,
      creator: req.user.id,
      challenge: challengeId,
      startTime: startDate,
      endTime: endDate,
      timeLimit,
      maxParticipants,
      isPublic,
      rules: {
        allowedLanguages,
        maxSubmissions,
        penaltyPerWrongSubmission: 5,
        showLeaderboardDuringContest: true
      },
      participants: [{
        user: req.user.id,
        status: 'active',
        joinedAt: new Date()
      }],
      invitations: userToInvite ? [{
        user: userToInvite._id,
        invitedBy: req.user.id,
        sentAt: new Date(),
        status: 'pending'
      }] : []
    });

    await competition.save();
    await competition.populate([
      { path: 'creator', select: 'username email avatar' },
      { path: 'challenge' },
      { path: 'participants.user', select: 'username email avatar' },
      { path: 'invitations.user', select: 'username email avatar' },
      { path: 'invitations.invitedBy', select: 'username email avatar' }
    ]);

    // Send real-time notification to invited user
    if (userToInvite) {
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${userToInvite._id}`).emit('competitionInvitation', {
          competition: {
            _id: competition._id,
            title: competition.title,
            type: competition.type,
            creator: competition.creator,
            startTime: competition.startTime,
            timeLimit: competition.timeLimit
          },
          invitedBy: req.user
        });
      }
    }

    res.status(201).json({
      success: true,
      data: competition,
      message: 'Competition created successfully'
    });
  } catch (error) {
    console.error('❌ Competition creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get competitions (public and user's competitions)
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 Get competitions request from user:', req.user.id);
    
    const { type, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // If database is not connected, return mock competitions
    if (!isDatabaseConnected()) {
      const filteredCompetitions = mockCompetitions.filter(comp => {
        const matchesType = !type || comp.type === type;
        const matchesStatus = !status || comp.status === status;
        const hasAccess = comp.isPublic || 
                         comp.creator._id === req.user.id ||
                         comp.participants.some(p => p.user._id === req.user.id) ||
                         comp.invitations.some(inv => inv.user.username === req.user.username);
        return matchesType && matchesStatus && hasAccess;
      });

      return res.json({
        success: true,
        data: filteredCompetitions.slice(skip, skip + parseInt(limit)),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filteredCompetitions.length / limit),
          total: filteredCompetitions.length
        }
      });
    }

    // Database is connected - query real competitions and include mock competitions
    let filter = {
      $or: [
        { isPublic: true },
        { creator: req.user.id },
        { 'participants.user': req.user.id },
        { 'invitations.user': req.user.id }
      ]
    };

    if (type) filter.type = type;
    if (status) filter.status = status;

    const competitions = await Competition.find(filter)
      .populate('creator', 'username avatar')
      .populate('challenge', 'title difficulty')
      .populate('participants.user', 'username avatar')
      .populate('winner', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Also include mock competitions for this user
    const userMockCompetitions = mockCompetitions.filter(comp => {
      const matchesType = !type || comp.type === type;
      const matchesStatus = !status || comp.status === status;
      const hasAccess = comp.isPublic || 
                       comp.creator._id === req.user.id ||
                       comp.participants.some(p => p.user._id === req.user.id) ||
                       comp.invitations.some(inv => inv.user.username === req.user.username);
      return matchesType && matchesStatus && hasAccess;
    });

    // Combine database and mock competitions
    const allCompetitions = [...competitions, ...userMockCompetitions];
    const total = await Competition.countDocuments(filter) + userMockCompetitions.length;

    res.json({
      success: true,
      data: allCompetitions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('❌ Get competitions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get competition by ID
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('🔍 Get competition details request:', {
      competitionId: req.params.id,
      user: req.user ? { id: req.user.id, username: req.user.username } : 'No user',
      isDatabaseConnected: isDatabaseConnected()
    });

    let competition = null;
    let isMockCompetition = false;

    // Try to find in database first
    if (isDatabaseConnected()) {
      try {
        competition = await Competition.findById(req.params.id)
          .populate('creator', 'username email avatar')
          .populate('challenge')
          .populate('participants.user', 'username avatar skillLevel')
          .populate('participants.submission')
          .populate('winner', 'username avatar')
          .populate('invitations.user', 'username avatar')
          .populate('invitations.invitedBy', 'username avatar')
          .populate('chatMessages.user', 'username avatar');
      } catch (error) {
        console.log('Database lookup failed, checking mock competitions:', error.message);
      }
    }

    // If not found in database, check mock competitions
    if (!competition) {
      const mockComp = mockCompetitions.find(comp => comp._id === req.params.id);
      if (mockComp) {
        competition = mockComp;
        isMockCompetition = true;
        console.log('Found mock competition:', competition.title);
      }
    }

    if (!competition) {
      console.log('Competition not found:', req.params.id);
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check if user has access to this competition
    const userId = req.user.id;
    let hasAccess = false;

    if (isMockCompetition) {
      // For mock competitions, check access differently
      hasAccess = competition.isPublic ||
        (competition.creator && competition.creator._id === userId) ||
        (competition.createdBy === userId) ||
        (competition.participants && competition.participants.some(p => 
          (p.user && p.user._id === userId) || (p.user === userId)
        )) ||
        (competition.invitations && competition.invitations.some(i => 
          (i.user && i.user._id === userId) || (i.user === userId)
        ));
    } else {
      // For real competitions
      hasAccess = competition.isPublic ||
        competition.creator._id.toString() === userId ||
        competition.participants.some(p => p.user._id.toString() === userId) ||
        competition.invitations.some(i => i.user._id.toString() === userId);
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Successfully retrieved competition details');
    res.json(competition);
  } catch (error) {
    console.error('Error getting competition details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send invitation to user
router.post('/:id/invite', [
  auth,
  body('username').trim().isLength({ min: 1 }).withMessage('Username required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check if user is creator
    if (competition.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only creator can send invitations' });
    }

    // Check if competition is still pending
    if (competition.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot invite to an active or completed competition' });
    }

    // Find user to invite
    const userToInvite = await User.findOne({ username: req.body.username });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already invited or participating
    const alreadyInvited = competition.invitations.some(
      inv => inv.user.toString() === userToInvite._id.toString()
    );
    const alreadyParticipating = competition.participants.some(
      p => p.user.toString() === userToInvite._id.toString()
    );

    if (alreadyInvited || alreadyParticipating) {
      return res.status(400).json({ message: 'User already invited or participating' });
    }

    // Check if competition is full
    if (competition.participants.length >= competition.maxParticipants) {
      return res.status(400).json({ message: 'Competition is full' });
    }

    // Add invitation
    competition.invitations.push({
      user: userToInvite._id,
      invitedBy: req.user.id,
      sentAt: new Date(),
      status: 'pending'
    });

    await competition.save();

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userToInvite._id}`).emit('competitionInvitation', {
        competition: {
          _id: competition._id,
          title: competition.title,
          type: competition.type,
          creator: {
            _id: req.user.id,
            username: req.user.username
          }
        }
      });
    }

    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Respond to invitation
router.post('/:id/invitation/respond', [
  auth,
  body('response').isIn(['accept', 'decline']).withMessage('Invalid response')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Find invitation
    const invitation = competition.invitations.find(
      inv => inv.user.toString() === req.user.id && inv.status === 'pending'
    );

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or already responded' });
    }

    invitation.status = req.body.response === 'accept' ? 'accepted' : 'declined';
    invitation.respondedAt = new Date();

    if (req.body.response === 'accept') {
      // Check if competition is still open and not full
      if (competition.status !== 'pending') {
        return res.status(400).json({ message: 'Competition is no longer accepting participants' });
      }

      if (competition.participants.length >= competition.maxParticipants) {
        return res.status(400).json({ message: 'Competition is full' });
      }

      // Add to participants
      competition.participants.push({
        user: req.user.id,
        status: 'active',
        joinedAt: new Date()
      });
    }

    await competition.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`competition_${competition._id}`).emit('participantUpdate', {
        competitionId: competition._id,
        action: req.body.response,
        user: {
          _id: req.user.id,
          username: req.user.username
        }
      });
    }

    res.json({ 
      message: `Invitation ${req.body.response}ed successfully`,
      competition 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join public competition
router.post('/:id/join', auth, async (req, res) => {
  try {
    console.log('🔍 Join competition request:', {
      competitionId: req.params.id,
      user: req.user ? { id: req.user.id, username: req.user.username } : 'No user',
      isDatabaseConnected: isDatabaseConnected()
    });

    let competition = null;
    let isMockCompetition = false;

    // Try to find in database first
    if (isDatabaseConnected()) {
      try {
        competition = await Competition.findById(req.params.id);
      } catch (error) {
        console.log('Database lookup failed, checking mock competitions:', error.message);
      }
    }

    // If not found in database, check mock competitions
    if (!competition) {
      const mockComp = mockCompetitions.find(comp => comp._id === req.params.id);
      if (mockComp) {
        competition = mockComp;
        isMockCompetition = true;
        console.log('Found mock competition:', competition.title);
      }
    }

    if (!competition) {
      console.log('Competition not found:', req.params.id);
      return res.status(404).json({ message: 'Competition not found' });
    }

    if (!competition.isPublic) {
      // Check if user has been invited
      const hasInvitation = competition.invitations && competition.invitations.some(inv => {
        if (isMockCompetition) {
          return inv.user && (
            (inv.user.username && inv.user.username === req.user.username) ||
            (inv.user._id && inv.user._id === req.user.id) ||
            (inv.user === req.user.id)
          );
        } else {
          return inv.user && (
            inv.user._id.toString() === req.user.id ||
            inv.user.toString() === req.user.id
          );
        }
      });

      if (!hasInvitation) {
        console.log('❌ Competition is not public and user not invited:', {
          competitionId: req.params.id,
          isPublic: competition.isPublic,
          title: competition.title,
          userId: req.user.id,
          username: req.user.username,
          invitations: competition.invitations
        });
        return res.status(403).json({ message: 'This competition requires an invitation' });
      }

      console.log('✅ User has invitation to join private competition');
    }

    // Check if user can join
    const currentParticipants = competition.participants || [];
    const isAlreadyParticipant = currentParticipants.some(p => 
      (p.user && p.user.toString && p.user.toString() === req.user.id) ||
      (p.user === req.user.id)
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({ message: 'You are already a participant in this competition' });
    }

    if (competition.status === 'completed') {
      return res.status(400).json({ message: 'Cannot join completed competition' });
    }

    if (competition.maxParticipants && currentParticipants.length >= competition.maxParticipants) {
      return res.status(400).json({ message: 'Competition is full' });
    }

    // Add user to participants
    const newParticipant = {
      user: req.user.id,
      status: 'active',
      joinedAt: new Date()
    };

    if (isMockCompetition) {
      // Handle mock competition
      competition.participants.push(newParticipant);
      
      // Create a response with populated user data
      const responseCompetition = {
        ...competition,
        participants: competition.participants.map(p => ({
          ...p,
          user: p.user === req.user.id ? {
            _id: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar
          } : p.user
        }))
      };

      console.log('Successfully joined mock competition');
      
      // Emit socket event for participant joined
      const io = req.app.get('io');
      if (io) {
        io.to(`competition_${competition._id}`).emit('participantJoined', {
          competitionId: competition._id,
          username: req.user.username,
          userId: req.user.id
        });
      }
      
      res.json({ message: 'Joined competition successfully', competition: responseCompetition });
    } else {
      // Handle real database competition
      competition.participants.push(newParticipant);
      await competition.save();
      await competition.populate('participants.user', 'username avatar');

      console.log('Successfully joined real competition');
      
      // Emit socket event for participant joined
      const io = req.app.get('io');
      if (io) {
        io.to(`competition_${competition._id}`).emit('participantJoined', {
          competitionId: competition._id,
          username: req.user.username,
          userId: req.user.id
        });
      }
      
      res.json({ message: 'Joined competition successfully', competition });
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`competition_${competition._id}`).emit('participantJoined', {
        competitionId: competition._id,
        user: {
          _id: req.user.id,
          username: req.user.username,
          avatar: req.user.avatar
        }
      });
    }

  } catch (error) {
    console.error('Error joining competition:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start competition manually (creator only)
router.post('/:id/start', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🚀 Start competition request:', {
      competitionId: id,
      userId: req.user.id,
      username: req.user.username
    });

    if (!isDatabaseConnected()) {
      // Mock mode - handle start competition
      const competitionIndex = mockCompetitions.findIndex(comp => comp._id === id);
      if (competitionIndex === -1) {
        console.log('❌ Competition not found in mock array');
        return res.status(404).json({ message: 'Competition not found' });
      }

      const competition = mockCompetitions[competitionIndex];
      
      console.log('🔍 Found competition for start:', {
        id: competition._id,
        title: competition.title,
        status: competition.status,
        creator: competition.creator || competition.createdBy,
        participantCount: competition.participants?.length || 0
      });

      // Check if user is the creator
      const creatorId = competition.createdBy?._id || competition.creator?._id || competition.createdBy || competition.creator;
      if (creatorId !== req.user.id) {
        console.log('❌ User is not the creator');
        return res.status(403).json({ message: 'Only creator can start competition' });
      }

      if (competition.status !== 'pending') {
        console.log('❌ Competition cannot be started, status:', competition.status);
        return res.status(400).json({ message: 'Competition cannot be started' });
      }

      if ((competition.participants?.length || 0) < 2) {
        console.log('❌ Need at least 2 participants, current:', competition.participants?.length || 0);
        return res.status(400).json({ message: 'Need at least 2 participants to start' });
      }

      // Start the competition
      competition.status = 'active';
      competition.actualStartTime = new Date();

      console.log('✅ Mock competition started:', {
        competitionId: competition._id,
        actualStartTime: competition.actualStartTime,
        challengeId: competition.challenge
      });

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        const eventData = {
          competitionId: competition._id,
          challengeId: competition.challenge,
          startTime: competition.actualStartTime
        };
        console.log('📡 Emitting competitionStarted event:', eventData);
        io.to(`competition_${competition._id}`).emit('competitionStarted', eventData);
      }

      return res.json({ 
        message: 'Competition started successfully', 
        competition: competition 
      });
    }

    // Database mode
    const competition = await Competition.findById(id);
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    if (competition.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only creator can start competition' });
    }

    if (competition.status !== 'pending') {
      return res.status(400).json({ message: 'Competition cannot be started' });
    }

    if (competition.participants.length < 2) {
      return res.status(400).json({ message: 'Need at least 2 participants to start' });
    }

    await competition.startCompetition();

    console.log('🚀 Competition started:', {
      competitionId: competition._id,
      challengeId: competition.challenge,
      challenge: competition.challenge?.toString(),
      startTime: competition.actualStartTime
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      const eventData = {
        competitionId: competition._id,
        challengeId: competition.challenge?.toString() || competition.challenge,
        startTime: competition.actualStartTime
      };
      console.log('📡 Emitting competitionStarted event:', eventData);
      io.to(`competition_${competition._id}`).emit('competitionStarted', eventData);
    }

    res.json({ message: 'Competition started successfully', competition });
  } catch (error) {
    console.error('Start competition error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit solution for competition
router.post('/:id/submit', [
  auth,
  body('code').trim().isLength({ min: 1 }).withMessage('Code required'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const competition = await Competition.findById(req.params.id)
      .populate('challenge');

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    if (!competition.isActive()) {
      return res.status(400).json({ message: 'Competition is not active' });
    }

    // Check if user is participant
    const participant = competition.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (!participant) {
      return res.status(403).json({ message: 'You are not a participant in this competition' });
    }

    // Check if language is allowed
    if (!competition.rules.allowedLanguages.includes(req.body.language)) {
      return res.status(400).json({ message: 'Language not allowed in this competition' });
    }

    // Create submission
    const submission = new Submission({
      user: req.user.id,
      challenge: competition.challenge._id,
      code: req.body.code,
      language: req.body.language,
      status: 'pending',
      metadata: {
        competitionId: competition._id,
        isCompetitionSubmission: true
      }
    });

    // Simulate code execution and scoring
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const score = Math.floor(Math.random() * 100) + 1;
    submission.score = score;
    submission.status = score >= 70 ? 'accepted' : 'wrong-answer';
    submission.executionTime = Math.floor(Math.random() * 1000) + 100;
    submission.memoryUsed = Math.floor(Math.random() * 50) + 10;

    await submission.save();

    // Update participant submission info
    participant.score = Math.max(participant.score, score);
    participant.submissionTime = new Date();
    participant.submission = submission._id;

    await competition.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`competition_${competition._id}`).emit('submissionUpdate', {
        competitionId: competition._id,
        userId: req.user.id,
        score: participant.score,
        status: submission.status
      });
    }

    res.json({
      message: 'Submission successful',
      submission,
      score: participant.score
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get competition leaderboard
router.get('/:id/leaderboard', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('participants.user', 'username avatar')
      .populate('rankings.user', 'username avatar');

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check access
    const userId = req.user.id;
    const hasAccess = competition.isPublic ||
      competition.creator.toString() === userId ||
      competition.participants.some(p => p.user._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let leaderboard;

    if (competition.status === 'completed') {
      // Show final rankings
      leaderboard = competition.rankings;
    } else if (competition.isActive() && competition.rules.showLeaderboardDuringContest) {
      // Show live leaderboard
      leaderboard = competition.participants
        .filter(p => p.score > 0)
        .map(p => ({
          user: p.user,
          score: p.score,
          submissionTime: p.submissionTime,
          rank: 0 // Will be calculated below
        }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (a.submissionTime && b.submissionTime) {
            return a.submissionTime - b.submissionTime;
          }
          return 0;
        })
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
    } else {
      leaderboard = [];
    }

    res.json({
      leaderboard,
      showDuringContest: competition.rules.showLeaderboardDuringContest,
      competitionStatus: competition.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add chat message
router.post('/:id/chat', [
  auth,
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be 1-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check if user is participant
    const isParticipant = competition.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Only participants can chat' });
    }

    const chatMessage = {
      user: req.user.id,
      message: req.body.message,
      timestamp: new Date(),
      isSystemMessage: false
    };

    competition.chatMessages.push(chatMessage);
    await competition.save();

    await competition.populate('chatMessages.user', 'username avatar');
    const populatedMessage = competition.chatMessages[competition.chatMessages.length - 1];

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`competition_${competition._id}`).emit('newChatMessage', {
        competitionId: competition._id,
        message: populatedMessage
      });
    }

    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's competitions
router.get('/user/my-competitions', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let filter = {
      $or: [
        { creator: req.user.id },
        { 'participants.user': req.user.id }
      ]
    };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const competitions = await Competition.find(filter)
      .populate('creator', 'username avatar')
      .populate('challenge', 'title difficulty')
      .populate('participants.user', 'username avatar')
      .populate('winner', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(competitions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Auto-submit solution when time expires
router.post('/:id/auto-submit', [
  auth,
  body('submissionData.code').trim().isLength({ min: 1 }).withMessage('Code required'),
  body('submissionData.language').isIn(['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { submissionData } = req.body;
    
    console.log('🏁 Auto-submit request:', {
      competitionId: id,
      userId: req.user.id,
      isAutoSubmitted: submissionData.isAutoSubmitted
    });

    if (!isDatabaseConnected()) {
      // Mock mode - handle auto-submit
      const competitionIndex = mockCompetitions.findIndex(comp => comp._id === id);
      if (competitionIndex === -1) {
        return res.status(404).json({ message: 'Competition not found' });
      }

      const competition = mockCompetitions[competitionIndex];
      
      // Check if user is participant
      const participantIndex = competition.participants.findIndex(
        p => (p.user._id || p.user) === req.user.id
      );

      if (participantIndex === -1) {
        return res.status(403).json({ message: 'You are not a participant in this competition' });
      }

      const participant = competition.participants[participantIndex];

      // Simulate code execution and scoring
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const score = Math.floor(Math.random() * 100) + 1;
      const executionTime = Math.floor(Math.random() * 1000) + 100;
      
      // Update participant submission info
      participant.score = Math.max(participant.score || 0, score);
      participant.submissionTime = new Date();
      participant.autoSubmitted = submissionData.isAutoSubmitted || false;
      participant.status = score >= 70 ? 'accepted' : 'wrong-answer';

      console.log('✅ Mock participant updated:', {
        userId: req.user.id,
        score: participant.score,
        autoSubmitted: participant.autoSubmitted
      });

      // Check if all participants have submitted or competition should end
      const allSubmitted = competition.participants.every(p => 
        p.submissionTime || p.autoSubmitted || (p.user._id || p.user) === req.user.id
      );
      
      let winner = null;
      let shouldEndCompetition = false;
      
      // Check if time is up or all participants submitted
      if (allSubmitted || submissionData.isAutoSubmitted) {
        shouldEndCompetition = true;
      }
      
      if (shouldEndCompetition && competition.status === 'active') {
        // End competition and determine winner
        competition.status = 'completed';
        competition.actualEndTime = new Date();
        
        console.log('🏁 Ending competition, participants:', competition.participants.map(p => ({
          userId: p.user._id || p.user,
          score: p.score || 0,
          submissionTime: p.submissionTime
        })));
        
        // Find winner (highest score, or earliest submission time if tied)
        winner = competition.participants.reduce((best, current) => {
          const currentScore = current.score || 0;
          const bestScore = best ? (best.score || 0) : 0;
          
          if (!best) return current;
          if (currentScore > bestScore) return current;
          if (currentScore === bestScore && current.submissionTime < best.submissionTime) return current;
          return best;
        }, null);
        
        if (winner) {
          competition.winner = winner.user._id || winner.user;
        }
        
        console.log('🏆 Winner determined:', {
          winnerId: competition.winner,
          winnerScore: winner?.score || 0
        });

        // Emit competition ended event
        const io = req.app.get('io');
        if (io) {
          const winnerData = winner ? {
            _id: winner.user._id || winner.user,
            username: winner.user.username || req.user.username, // Fallback
            score: winner.score || 0
          } : null;
          
          console.log('📡 Emitting competitionEnded event:', winnerData);
          
          io.to(`competition_${competition._id}`).emit('competitionEnded', {
            competitionId: competition._id,
            winner: winnerData
          });
        }
      }

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.to(`competition_${competition._id}`).emit('submissionUpdate', {
          competitionId: competition._id,
          userId: req.user.id,
          score: participant.score,
          status: participant.status,
          autoSubmitted: participant.autoSubmitted
        });
      }

      return res.json({
        success: true,
        message: 'Auto-submission successful',
        score: participant.score,
        status: participant.status,
        executionTime,
        winner: winner ? {
          _id: winner.user._id || winner.user,
          username: winner.user.username || req.user.username,
          score: winner.score || 0
        } : null
      });
    }

    // Database mode
    const competition = await Competition.findById(id).populate('challenge');

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check if user is participant
    const participant = competition.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (!participant) {
      return res.status(403).json({ message: 'You are not a participant in this competition' });
    }

    // Create submission with auto-submit flag
    const submission = new Submission({
      user: req.user.id,
      challenge: competition.challenge._id,
      code: submissionData.code,
      language: submissionData.language,
      status: 'pending',
      metadata: {
        competitionId: competition._id,
        isCompetitionSubmission: true,
        autoSubmitted: submissionData.isAutoSubmitted || false
      }
    });

    // Simulate code execution and scoring
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const score = Math.floor(Math.random() * 100) + 1;
    submission.score = score;
    submission.status = score >= 70 ? 'accepted' : 'wrong-answer';
    submission.executionTime = Math.floor(Math.random() * 1000) + 100;
    submission.memoryUsed = Math.floor(Math.random() * 50) + 10;

    await submission.save();

    // Update participant submission info
    participant.score = Math.max(participant.score, score);
    participant.submissionTime = new Date();
    participant.submission = submission._id;
    participant.autoSubmitted = submissionData.isAutoSubmitted || false;

    await competition.save();

    // Check if all participants have submitted or time is up
    const allSubmitted = competition.participants.every(p => p.submission || p.autoSubmitted);
    let winner = null;
    
    if (allSubmitted || submissionData.isAutoSubmitted) {
      // End competition and determine winner
      competition.status = 'completed';
      competition.actualEndTime = new Date();
      
      // Find winner (highest score, or earliest submission time if tied)
      winner = competition.participants.reduce((best, current) => {
        if (!best) return current;
        if (current.score > best.score) return current;
        if (current.score === best.score && current.submissionTime < best.submissionTime) return current;
        return best;
      }, null);
      
      if (winner) {
        competition.winner = winner.user;
        await competition.populate('winner', 'username avatar');
      }
      
      await competition.save();

      // Emit competition ended event
      const io = req.app.get('io');
      if (io) {
        io.to(`competition_${competition._id}`).emit('competitionEnded', {
          competitionId: competition._id,
          winner: winner ? {
            _id: winner.user._id || winner.user,
            username: competition.winner?.username || 'Unknown',
            score: winner.score
          } : null
        });
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`competition_${competition._id}`).emit('submissionUpdate', {
        competitionId: competition._id,
        userId: req.user.id,
        score: participant.score,
        status: submission.status,
        autoSubmitted: participant.autoSubmitted
      });
    }

    res.json({
      success: true,
      message: 'Auto-submission successful',
      submission,
      score: participant.score,
      winner: winner ? {
        _id: winner.user._id || winner.user,
        username: competition.winner?.username || 'Unknown',
        score: winner.score
      } : null
    });
  } catch (error) {
    console.error('Auto-submit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// End competition manually or automatically
router.post('/:id/end', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('participants.user', 'username avatar')
      .populate('winner', 'username avatar');

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Only creator can manually end, or system can auto-end
    if (competition.creator.toString() !== req.user.id && !competition.isTimeUp()) {
      return res.status(403).json({ message: 'Only creator can end competition or time must be up' });
    }

    if (competition.status === 'completed') {
      return res.status(400).json({ message: 'Competition already ended' });
    }

    // End competition
    competition.status = 'completed';
    competition.endTime = new Date();
    
    // Determine winner if not already set
    if (!competition.winner && competition.participants.length > 0) {
      const winner = competition.participants.reduce((best, current) => {
        if (!best) return current;
        if (current.score > best.score) return current;
        if (current.score === best.score && current.submissionTime < best.submissionTime) return current;
        return best;
      }, null);
      
      if (winner) {
        competition.winner = winner.user._id || winner.user;
      }
    }
    
    await competition.save();
    await competition.populate('winner', 'username avatar');

    // Emit competition ended event
    const io = req.app.get('io');
    if (io) {
      io.to(`competition_${competition._id}`).emit('competitionEnded', {
        competitionId: competition._id,
        winner: competition.winner ? {
          _id: competition.winner._id,
          username: competition.winner.username,
          score: competition.participants.find(p => 
            (p.user._id || p.user).toString() === competition.winner._id.toString()
          )?.score || 0
        } : null
      });
    }

    res.json({
      message: 'Competition ended successfully',
      competition,
      winner: competition.winner
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete competition (creator only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Delete request received:', {
      competitionId: id,
      userId: req.user.id,
      username: req.user.username
    });
    
    if (!isDatabaseConnected()) {
      // Mock mode - find and remove from mock array
      const competitionIndex = mockCompetitions.findIndex(comp => comp._id === id);
      if (competitionIndex === -1) {
        console.log('❌ Competition not found in mock array');
        return res.status(404).json({ message: 'Competition not found' });
      }
      
      const competition = mockCompetitions[competitionIndex];
      
      console.log('🔍 Found competition for deletion:', {
        id: competition._id,
        title: competition.title,
        status: competition.status,
        creator: competition.creator || competition.createdBy
      });
      
      // Check if user is the creator (handle both createdBy and creator fields)
      const creatorId = competition.createdBy?._id || competition.creator?._id || competition.createdBy || competition.creator;
      if (!creatorId) {
        console.log('❌ No creator information found');
        return res.status(500).json({ message: 'Competition creator information is missing' });
      }
      
      console.log('🔍 Creator check:', {
        creatorId,
        requestUserId: req.user.id,
        match: creatorId === req.user.id
      });
      
      if (creatorId !== req.user.id) {
        console.log('❌ User is not the creator');
        return res.status(403).json({ message: 'Only the creator can delete this competition' });
      }
      
      // Temporarily allow deletion of active competitions for testing
      // Don't allow deletion of active competitions
      // if (competition.status === 'active') {
      //   console.log('❌ Cannot delete active competition');
      //   return res.status(400).json({ message: 'Cannot delete an active competition' });
      // }
      
      console.log('✅ Deleting competition from mock array');
      // Remove from mock array
      mockCompetitions.splice(competitionIndex, 1);
      
      return res.json({ message: 'Competition deleted successfully' });
    }

    // Database mode
    const competition = await Competition.findById(id);
    if (!competition) {
      console.log('❌ Competition not found in database');
      return res.status(404).json({ message: 'Competition not found' });
    }

    console.log('🔍 Found competition in database:', {
      id: competition._id,
      title: competition.title,
      status: competition.status,
      creator: competition.creator || competition.createdBy
    });

    // Check if user is the creator (handle both createdBy and creator fields)
    const creatorId = competition.createdBy?._id || competition.creator?._id || competition.createdBy || competition.creator;
    if (!creatorId) {
      console.log('❌ No creator information found in database');
      return res.status(500).json({ message: 'Competition creator information is missing' });
    }
    
    console.log('🔍 Database creator check:', {
      creatorId: creatorId.toString(),
      requestUserId: req.user.id,
      match: creatorId.toString() === req.user.id
    });
    
    if (creatorId.toString() !== req.user.id) {
      console.log('❌ User is not the creator in database');
      return res.status(403).json({ message: 'Only the creator can delete this competition' });
    }

    // Temporarily allow deletion of active competitions for testing
    // Don't allow deletion of active competitions
    // if (competition.status === 'active') {
    //   console.log('❌ Cannot delete active competition in database');
    //   return res.status(400).json({ message: 'Cannot delete an active competition' });
    // }

    console.log('✅ Deleting competition from database');
    // Delete related submissions
    await Submission.deleteMany({ competitionId: competition._id });

    // Delete the competition
    await Competition.findByIdAndDelete(id);

    res.json({ message: 'Competition deleted successfully' });
  } catch (error) {
    console.error('Delete competition error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
