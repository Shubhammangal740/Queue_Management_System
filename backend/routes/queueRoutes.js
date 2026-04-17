const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');

// Public - Get all queues
router.get('/', queueController.getAllQueues);

// Public/Private - Get queue status
router.get('/:queueId/status', queueController.getQueueStatus);

// Private - Generate token
router.post('/:queueId/token', protect, queueController.generateToken);

// Private - Get my tokens (Note: This is /api/tokens/my, but I'll mount it accordingly in server.js)
// But wait, the requirements say POST /queue/:queueId/token and GET /tokens/my
// I'll create a separate route file for tokens if needed, but I can put them here for now and mount them twice or as needed.
// Actually, let's create a dedicated tokenRoutes for /api/tokens.

module.exports = router;
