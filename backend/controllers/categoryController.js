const Category = require("../models/Category");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc    Get categories for a branch
// @route   GET /api/categories?branchId=xxx
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const { branchId } = req.query;

  // branchId is validated by branchIdQueryValidator middleware
  const categories = await Category.find({ branch: branchId })
    .populate("service", "name")
    .populate("branch", "name")
    .select("-__v");

  return res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});
