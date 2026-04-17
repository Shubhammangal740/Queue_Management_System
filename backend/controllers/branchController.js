const Branch = require("../models/Branch");
const { asyncHandler } = require("../middleware/errorHandler");
const { isValidObjectId } = require("../middleware/validators");

// @desc    Get branches (optionally filtered by serviceId)
// @route   GET /api/branches?serviceId=xxx
// @access  Public
exports.getBranches = asyncHandler(async (req, res) => {
  const { serviceId } = req.query;

  // Build query
  const query = {};
  if (serviceId) {
    // Validate ObjectId format
    if (!isValidObjectId(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid serviceId format",
      });
    }
    query.service = serviceId;
  }

  const branches = await Branch.find(query)
    .populate("service", "name")
    .select("-__v");

  return res.json({
    success: true,
    count: branches.length,
    data: branches,
  });
});
