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
      creator: req.user.id,
      members: [req.user.id],
      maxMembers,
      isPublic
    });

    await team.save();
    await team.populate('members', 'username email avatar');
    await team.populate('creator', 'username email avatar');

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
      .populate('members', 'username avatar')
      .populate('creator', 'username avatar')
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
    const teams = await Team.find({ members: req.user.id })
      .populate('members', 'username avatar')
      .populate('creator', 'username avatar')
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
      .populate('members', 'username email avatar skillLevel')
      .populate('creator', 'username email avatar')
      .populate('challenges', 'title difficulty status');

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

    if (team.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member of this team' });
    }

    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: 'Team is full' });
    }

    team.members.push(req.user.id);
    await team.save();
    await team.populate('members', 'username avatar');

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

    if (!team.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Not a member of this team' });
    }

    if (team.creator.toString() === req.user.id && team.members.length > 1) {
      return res.status(400).json({ message: 'Creator cannot leave team with members. Transfer ownership first.' });
    }

    team.members = team.members.filter(member => member.toString() !== req.user.id);
    
    if (team.members.length === 0) {
      await Team.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Team deleted as last member left' });
    }

    await team.save();
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

    if (team.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team creator can update team' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      team[key] = updates[key];
    });

    await team.save();
    await team.populate('members', 'username avatar');
    await team.populate('creator', 'username avatar');

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove member (creator only)
router.delete('/:id/members/:memberId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team creator can remove members' });
    }

    if (req.params.memberId === req.user.id) {
      return res.status(400).json({ message: 'Cannot remove yourself. Use leave endpoint instead.' });
    }

    team.members = team.members.filter(member => member.toString() !== req.params.memberId);
    await team.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
