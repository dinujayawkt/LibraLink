import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listCommunities, myCommunities, getCommunity, createCommunity, joinCommunity, leaveCommunity, getMessages, postMessage, replyToMessage, reactToMessage } from '../controllers/communitiesController.js';

const router = express.Router();

// Get all communities
router.get('/', listCommunities);

// Get user's communities
router.get('/my', requireAuth, myCommunities);

// Get community details
router.get('/:communityId', getCommunity);

// Create a new community
router.post('/', requireAuth, createCommunity);

// Join a community
router.post('/:communityId/join', requireAuth, joinCommunity);

// Leave a community
router.post('/:communityId/leave', requireAuth, leaveCommunity);

// Get community messages
router.get('/:communityId/messages', requireAuth, getMessages);

// Send a message to community
router.post('/:communityId/messages', requireAuth, postMessage);

// Reply to a message
router.post('/messages/:messageId/reply', requireAuth, replyToMessage);

// Add reaction to message
router.post('/messages/:messageId/reaction', requireAuth, reactToMessage);

export default router;
