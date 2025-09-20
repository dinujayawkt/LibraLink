import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Community from '../models/Community.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get all communities
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { isPublic: true };
    
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const communities = await Community.find(filter)
      .populate('createdBy', 'name')
      .populate('members', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Community.countDocuments(filter);
    
    res.json({ 
      communities, 
      total, 
      page: Number(page), 
      limit: Number(limit) 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's communities
router.get('/my', requireAuth, async (req, res) => {
  try {
    const communities = await Community.find({
      members: req.user.id
    })
    .populate('createdBy', 'name')
    .populate('members', 'name')
    .sort({ createdAt: -1 });
    
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get community details
router.get('/:communityId', async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId)
      .populate('createdBy', 'name')
      .populate('members', 'name')
      .populate('moderators', 'name');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new community
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, category, isPublic = true, maxMembers = 100, rules = [], tags = [] } = req.body;
    
    const community = await Community.create({
      name,
      description,
      category,
      createdBy: req.user.id,
      members: [req.user.id], // Creator is automatically a member
      moderators: [req.user.id], // Creator is automatically a moderator
      isPublic,
      maxMembers,
      rules,
      tags
    });
    
    await community.populate('createdBy', 'name');
    res.status(201).json(community);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Join a community
router.post('/:communityId/join', requireAuth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    if (community.members.includes(req.user.id)) {
      return res.status(409).json({ message: 'You are already a member' });
    }
    
    if (community.members.length >= community.maxMembers) {
      return res.status(400).json({ message: 'Community is full' });
    }
    
    community.members.push(req.user.id);
    await community.save();
    
    res.json({ message: 'Successfully joined community' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave a community
router.post('/:communityId/leave', requireAuth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    if (!community.members.includes(req.user.id)) {
      return res.status(409).json({ message: 'You are not a member' });
    }
    
    // Remove from members and moderators
    community.members.pull(req.user.id);
    community.moderators.pull(req.user.id);
    
    // If creator leaves, transfer ownership to first moderator or delete if no moderators
    if (String(community.createdBy) === req.user.id) {
      if (community.moderators.length > 0) {
        community.createdBy = community.moderators[0];
      } else {
        await Community.findByIdAndDelete(req.params.communityId);
        return res.json({ message: 'Community deleted as creator left' });
      }
    }
    
    await community.save();
    res.json({ message: 'Successfully left community' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get community messages
router.get('/:communityId/messages', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Check if user is a member
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    if (!community.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this community' });
    }
    
    const messages = await Message.find({ community: req.params.communityId })
      .populate('sender', 'name')
      .populate('attachments.bookId', 'title author coverUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Message.countDocuments({ community: req.params.communityId });
    
    res.json({ 
      messages: messages.reverse(), // Show oldest first
      total, 
      page: Number(page), 
      limit: Number(limit) 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message to community
router.post('/:communityId/messages', requireAuth, async (req, res) => {
  try {
    const { content, messageType = 'text', attachments = [] } = req.body;
    
    // Check if user is a member
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    if (!community.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this community' });
    }
    
    const message = await Message.create({
      community: req.params.communityId,
      sender: req.user.id,
      content,
      messageType,
      attachments
    });
    
    await message.populate('sender', 'name');
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Reply to a message
router.post('/messages/:messageId/reply', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is a member of the community
    const community = await Community.findById(message.community);
    if (!community.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this community' });
    }
    
    message.replies.push({
      user: req.user.id,
      content
    });
    
    await message.save();
    res.json({ message: 'Reply added successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Add reaction to message
router.post('/messages/:messageId/reaction', requireAuth, async (req, res) => {
  try {
    const { emoji } = req.body;
    
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is a member of the community
    const community = await Community.findById(message.community);
    if (!community.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this community' });
    }
    
    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      reaction => String(reaction.user) !== req.user.id
    );
    
    // Add new reaction
    message.reactions.push({
      user: req.user.id,
      emoji
    });
    
    await message.save();
    res.json({ message: 'Reaction added successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

export default router;
