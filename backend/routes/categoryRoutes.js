const express = require("express");
const { getCategories } = require("../controllers/categoryController");
const { branchIdQueryValidator } = require("../middleware/validators");

const router = express.Router();

router.get("/", branchIdQueryValidator, getCategories);

module.exports = router;
