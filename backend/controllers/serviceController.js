const Service = require("../models/Service");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find().select("-__v");

  return res.json({
    success: true,
    count: services.length,
    data: services,
  });
});
