const express = require("express");
const { getBranches } = require("../controllers/branchController");
const { serviceIdQueryValidator } = require("../middleware/validators");

const router = express.Router();

router.get("/", serviceIdQueryValidator, getBranches);

module.exports = router;
