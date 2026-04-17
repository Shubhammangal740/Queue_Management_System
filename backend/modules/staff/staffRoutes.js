const express = require('express');
const router = express.Router();
const staffController = require('./staffController');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware');

// All staff routes require protection and STAFF role
router.use(protect);
router.use(authorizeRoles('STAFF'));

// GET /api/staff/me
router.get('/me', staffController.getMe);

// GET /api/staff/queue
router.get('/queue', staffController.getQueue);

// GET /api/staff/queue/tokens?status=WAITING
router.get('/queue/tokens', staffController.getQueueTokens);

// POST /api/staff/queue/call-next
router.post('/queue/call-next', staffController.callNext);

// PATCH /api/staff/token/:id/status
router.patch('/token/:id/status', staffController.updateStatus);

// PATCH /api/staff/queue/pause
router.patch('/queue/pause', staffController.togglePause);

module.exports = router;
