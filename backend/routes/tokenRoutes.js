const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/tokens/my
router.get('/my', protect, queueController.getMyTokens);

// PATCH /api/tokens/:id/cancel
router.patch('/:id/cancel', protect, queueController.cancelToken);

module.exports = router;
