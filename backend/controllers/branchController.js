const Branch = require("../models/Branch");
const { asyncHandler } = require("../middleware/errorHandler");
const { isValidObjectId } = require("../middleware/validators");

// @desc    Get branches (optionally filtered by serviceId)
// @route   GET /api/branches?serviceId=xxx
// @access  Public
exports.getBranches = asyncHandler(async (req, res) => {
  const { serviceId } = req.query;

  const query = {};
  if (serviceId) {
    if (!isValidObjectId(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid serviceId format",
      });
    }
    query.serviceId = serviceId;
  }

  const branches = await Branch.find(query)
    .populate("serviceId", "name")
    .select("-__v");

  return res.json({
    success: true,
    count: branches.length,
    data: branches,
  });
});
