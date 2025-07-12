import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Challenge from '../models/Challenge.js';
import { protect as auth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Create a new team
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Team name must be 3-50 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
  body('maxMembers').optional().isInt({ min: 2, max: 10 }).withMessage('Max members must be between 2-10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, maxMembers = 4, isPublic = true } = req.body;

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    const team = new Team({
      name,
      description,
      leader: req.user.id,
      members: [{
        user: req.user.id,
        role: 'leader',
        joinedAt: new Date(),
        status: 'active'
      }],
      maxMembers,
      isPublic
    });

    await team.save();
    await team.populate('members.user', 'username email avatar');
    await team.populate('leader', 'username email avatar');

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all public teams with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const teams = await Team.find({ isPublic: true })
      .populate('members.user', 'username avatar')
      .populate('leader', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Team.countDocuments({ isPublic: true });

    res.json({
      teams,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's teams
router.get('/my-teams', auth, async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.user.id })
      .populate('members.user', 'username avatar')
      .populate('leader', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'username email avatar skillLevel')
      .populate('leader', 'username email avatar')
      .populate('challenges.challenge', 'title difficulty status');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join a team
router.post('/:id/join', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is already a member
    const existingMember = team.members.find(member => 
      member.user.toString() === req.user.id.toString()
    );
    
    if (existingMember && existingMember.status === 'active') {
      return res.status(400).json({ message: 'Already a member of this team' });
    }

    // Check if team is full (count active members)
    const activeMemberCount = team.members.filter(member => member.status === 'active').length;
    if (activeMemberCount >= team.maxMembers) {
      return res.status(400).json({ message: 'Team is full' });
    }

    // Use the model's addMember method
    await team.addMember(req.user.id);
    await team.populate('members.user', 'username avatar');

    res.json({ message: 'Successfully joined team', team });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leave a team
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is a member
    const memberIndex = team.members.findIndex(member => 
      member.user.toString() === req.user.id.toString() && member.status === 'active'
    );
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this team' });
    }

    // Check if user is the leader
    if (team.leader.toString() === req.user.id.toString()) {
      const activeMemberCount = team.members.filter(member => member.status === 'active').length;
      if (activeMemberCount > 1) {
        return res.status(400).json({ message: 'Leader cannot leave team with members. Transfer ownership first.' });
      }
    }

    // Use the model's removeMember method
    await team.removeMember(req.user.id);
    
    // If no active members left, delete the team
    const activeMemberCount = team.members.filter(member => member.status === 'active').length;
    if (activeMemberCount === 0) {
      await Team.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Team deleted as last member left' });
    }

    res.json({ message: 'Successfully left team' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update team (creator only)
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 3, max: 50 }),
  body('description').optional().isLength({ max: 500 }),
  body('maxMembers').optional().isInt({ min: 2, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team leader can update team' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      team[key] = updates[key];
    });

    await team.save();
    await team.populate('members.user', 'username avatar');
    await team.populate('leader', 'username avatar');

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove member (leader only)
router.delete('/:id/members/:memberId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team leader can remove members' });
    }

    if (req.params.memberId === req.user.id) {
      return res.status(400).json({ message: 'Cannot remove yourself. Use leave endpoint instead.' });
    }

    // Use the model's removeMember method
    await team.removeMember(req.params.memberId);

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
