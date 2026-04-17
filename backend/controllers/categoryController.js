const Category = require("../models/Category");
const { asyncHandler } = require("../middleware/errorHandler");
const { isValidObjectId } = require("../middleware/validators");

// @desc    Get categories for a branch
// @route   GET /api/categories?branchId=xxx
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const { branchId } = req.query;

  const query = {};
  if (branchId) {
    if (!isValidObjectId(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branchId format",
      });
    }
    query.branchId = branchId;
  }

  const categories = await Category.find(query)
    .populate({
      path: 'branchId',
      populate: { path: 'serviceId', select: 'name' }
    })
    .select("-__v");

  return res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});
