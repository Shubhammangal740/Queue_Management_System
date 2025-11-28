const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createToken, getTokenDetails } = require('../controllers/tokenController');

const router = express.Router();

router.post('/', protect, createToken);
router.get('/:id', protect, getTokenDetails);

module.exports = router;
