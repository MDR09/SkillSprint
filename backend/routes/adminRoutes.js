import express from 'express';
import User from '../models/User.js';
import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import Discussion from '../models/Discussion.js';
import { protect as auth } from '../middleware/auth.js';

const router = express.Router();

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Dashboard stats
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    const [
      userCount,
      challengeCount,
      submissionCount,
      teamCount,
      discussionCount,
      recentUsers,
      recentChallenges,
      activeUsers,
      submissionStats
    ] = await Promise.all([
      User.countDocuments(),
      Challenge.countDocuments(),
      Submission.countDocuments(),
      Team.countDocuments(),
      Discussion.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('username email createdAt'),
      Challenge.find().sort({ createdAt: -1 }).limit(5).select('title difficulty createdAt participants'),
      User.find({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }).countDocuments(),
      Submission.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      stats: {
        totalUsers: userCount,
        totalChallenges: challengeCount,
        totalSubmissions: submissionCount,
        totalTeams: teamCount,
        totalDiscussions: discussionCount,
        activeUsers
      },
      recentUsers,
      recentChallenges,
      submissionStats: submissionStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users with pagination and filtering
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, role, status } = req.query;

    let filter = {};
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
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

// Update user role or status
router.put('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};
    
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up user's data
    await Promise.all([
      Challenge.deleteMany({ creator: req.params.id }),
      Submission.deleteMany({ user: req.params.id }),
      Team.deleteMany({ creator: req.params.id }),
      Discussion.deleteMany({ author: req.params.id })
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all challenges with admin details
router.get('/challenges', [auth, adminAuth], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, difficulty, status } = req.query;

    let filter = {};
    
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;

    const challenges = await Challenge.find(filter)
      .populate('creator', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Challenge.countDocuments(filter);

    res.json({
      challenges,
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

// Update challenge status or featured status
router.put('/challenges/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { status, isFeatured } = req.body;
    const updates = {};
    
    if (status) updates.status = status;
    if (typeof isFeatured === 'boolean') updates.isFeatured = isFeatured;

    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('creator', 'username email');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete challenge
router.delete('/challenges/:id', [auth, adminAuth], async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Clean up related data
    await Promise.all([
      Submission.deleteMany({ challenge: req.params.id }),
      Discussion.deleteMany({ challenge: req.params.id })
    ]);

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system analytics
router.get('/analytics', [auth, adminAuth], async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case '24h':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      userGrowth,
      challengeGrowth,
      submissionGrowth,
      popularChallenges,
      userActivity
    ] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Challenge.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Submission.aggregate([
        { $match: { submittedAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$submittedAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Challenge.find()
        .sort({ 'participants.length': -1 })
        .limit(10)
        .select('title participants difficulty'),
      User.aggregate([
        { $match: { lastActive: { $gte: dateFilter } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$lastActive"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      userGrowth,
      challengeGrowth,
      submissionGrowth,
      popularChallenges,
      userActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reported content
router.get('/reports', [auth, adminAuth], async (req, res) => {
  try {
    // This would typically involve a Report model
    // For now, return placeholder data
    res.json({
      reports: [],
      message: 'Report system not yet implemented'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
