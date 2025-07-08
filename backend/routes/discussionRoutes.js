import express from 'express';
import Discussion from '../models/Discussion.js';
import Challenge from '../models/Challenge.js';
import { protect as auth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get discussions for a challenge
router.get('/challenge/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const discussions = await Discussion.find({ 
      challenge: challengeId,
      parentPost: null // Only get top-level posts
    })
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username avatar'
        },
        options: { sort: { createdAt: 1 } }
      })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Discussion.countDocuments({ 
      challenge: challengeId,
      parentPost: null 
    });

    res.json({
      discussions,
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

// Create a new discussion post
router.post('/challenge/:challengeId', [
  auth,
  body('title').if(body('parentPost').not().exists()).trim().isLength({ min: 5, max: 200 }).withMessage('Title is required for new posts and must be 5-200 characters'),
  body('content').trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be 10-5000 characters'),
  body('type').optional().isIn(['question', 'discussion', 'hint', 'bug-report']).withMessage('Invalid post type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { challengeId } = req.params;
    const { title, content, type = 'discussion', parentPost } = req.body;

    // Verify challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // If it's a reply, verify parent post exists
    if (parentPost) {
      const parent = await Discussion.findById(parentPost);
      if (!parent || parent.challenge.toString() !== challengeId) {
        return res.status(404).json({ message: 'Parent post not found' });
      }
    }

    const discussion = new Discussion({
      title: parentPost ? undefined : title,
      content,
      type: parentPost ? 'reply' : type,
      author: req.user.id,
      challenge: challengeId,
      parentPost: parentPost || undefined
    });

    await discussion.save();
    await discussion.populate('author', 'username avatar');

    // If it's a reply, add to parent's replies array
    if (parentPost) {
      await Discussion.findByIdAndUpdate(parentPost, {
        $push: { replies: discussion._id }
      });
    }

    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific discussion post
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username avatar'
        },
        options: { sort: { createdAt: 1 } }
      })
      .populate('challenge', 'title');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a discussion post (author only)
router.put('/:id', [
  auth,
  body('content').trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be 10-5000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only author can edit this post' });
    }

    discussion.content = req.body.content;
    discussion.isEdited = true;
    discussion.editedAt = new Date();

    await discussion.save();
    await discussion.populate('author', 'username avatar');

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a discussion post (author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only author can delete this post' });
    }

    // If it has replies, mark as deleted instead of removing
    if (discussion.replies.length > 0) {
      discussion.content = '[This post has been deleted]';
      discussion.isDeleted = true;
      await discussion.save();
    } else {
      // Remove from parent's replies if it's a reply
      if (discussion.parentPost) {
        await Discussion.findByIdAndUpdate(discussion.parentPost, {
          $pull: { replies: discussion._id }
        });
      }
      await Discussion.findByIdAndDelete(req.params.id);
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike a discussion post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const userId = req.user.id;
    const likeIndex = discussion.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      discussion.likes.splice(likeIndex, 1);
    } else {
      // Like
      discussion.likes.push(userId);
      // Remove from dislikes if present
      const dislikeIndex = discussion.dislikes.indexOf(userId);
      if (dislikeIndex > -1) {
        discussion.dislikes.splice(dislikeIndex, 1);
      }
    }

    await discussion.save();
    res.json({ 
      likes: discussion.likes.length,
      dislikes: discussion.dislikes.length,
      userLiked: discussion.likes.includes(userId),
      userDisliked: discussion.dislikes.includes(userId)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Dislike/Undislike a discussion post
router.post('/:id/dislike', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const userId = req.user.id;
    const dislikeIndex = discussion.dislikes.indexOf(userId);

    if (dislikeIndex > -1) {
      // Undislike
      discussion.dislikes.splice(dislikeIndex, 1);
    } else {
      // Dislike
      discussion.dislikes.push(userId);
      // Remove from likes if present
      const likeIndex = discussion.likes.indexOf(userId);
      if (likeIndex > -1) {
        discussion.likes.splice(likeIndex, 1);
      }
    }

    await discussion.save();
    res.json({ 
      likes: discussion.likes.length,
      dislikes: discussion.dislikes.length,
      userLiked: discussion.likes.includes(userId),
      userDisliked: discussion.dislikes.includes(userId)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Pin/Unpin a discussion post (moderators/admins only)
router.post('/:id/pin', auth, async (req, res) => {
  try {
    // Check if user is admin or moderator
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Only moderators and admins can pin posts' });
    }

    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({ 
      message: discussion.isPinned ? 'Post pinned' : 'Post unpinned',
      isPinned: discussion.isPinned 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
