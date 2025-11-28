const express = require('express');
const { getBranches } = require('../controllers/branchController');

const router = express.Router();

router.get('/', getBranches);

module.exports = router;
