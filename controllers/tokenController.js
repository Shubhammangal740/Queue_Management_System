const Token = require("../models/Token");
const Queue = require("../models/Queue");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  getStartOfDay,
  isValidBookingDate,
  getToday,
} = require("../utils/dateHelper");
const {
  generateDisplayNumber,
  calculateWaitTime,
  AVERAGE_SERVICE_TIME,
} = require("../utils/constants");

// @desc    Create a new token (book queue position)
// @route   POST /api/tokens
// @access  Private
exports.createToken = asyncHandler(async (req, res) => {
  const { serviceId, branchId, categoryId, scheduledDate } = req.body;

  // Normalize scheduledDate to start of day (00:00:00)
  // Default to today if not provided
  const bookingDate = scheduledDate ? getStartOfDay(scheduledDate) : getToday();

  // Validate booking date is within allowed range (today, tomorrow, day after tomorrow)
  if (!isValidBookingDate(bookingDate)) {
    return res.status(400).json({
      success: false,
      message:
        "Booking is only allowed for today, tomorrow, or day after tomorrow",
    });
  }

  // Find or create queue for this (branch + category + date)
  // Use atomic findOneAndUpdate with upsert to handle concurrency
  const queue = await Queue.findOneAndUpdate(
    {
      branch: branchId,
      category: categoryId,
      date: bookingDate,
    },
    {
      $setOnInsert: {
        branch: branchId,
        category: categoryId,
        date: bookingDate,
        status: "OPEN",
      },
    },
    {
      new: true,
      upsert: true,
    },
  );

  // Check if queue is closed
  if (queue.status === "CLOSED") {
    return res.status(400).json({
      success: false,
      message: "This queue is closed for booking",
    });
  }

  // Check for existing active token (prevent double booking in same queue)
  const existingToken = await Token.findOne({
    user: req.user.id,
    queue: queue._id,
    status: { $in: ["WAITING", "CALLED"] },
  });

  if (existingToken) {
    return res.status(400).json({
      success: false,
      message: "You already have an active token in this queue",
      data: {
        existingTokenNumber: existingToken.tokenNumber,
        existingTokenId: existingToken._id,
      },
    });
  }

  // Generate sequential token number using atomic increment
  const updatedQueue = await Queue.findByIdAndUpdate(
    queue._id,
    { $inc: { lastTokenNumber: 1 } },
    { new: true },
  );

  const tokenNumber = updatedQueue.lastTokenNumber;

  // Create token
  const token = await Token.create({
    tokenNumber,
    user: req.user.id,
    service: serviceId,
    branch: branchId,
    category: categoryId,
    queue: queue._id,
    scheduledDate: bookingDate,
    status: "WAITING",
  });

  // Populate references for response
  await token.populate([
    { path: "service", select: "name" },
    { path: "branch", select: "name address" },
    { path: "category", select: "name" },
  ]);

  // Calculate position for new token
  const waitingAhead = await Token.countDocuments({
    queue: queue._id,
    tokenNumber: { $lt: token.tokenNumber },
    status: { $in: ["WAITING", "CALLED"] },
  });
  const position = waitingAhead + 1;
  const estimatedWaitTime = calculateWaitTime(position);

  return res.status(201).json({
    success: true,
    message: "Token booked successfully",
    data: {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      displayNumber: generateDisplayNumber(token.tokenNumber),
      scheduledDate: token.scheduledDate,
      queueId: token.queue,
      status: token.status,
      position,
      estimatedWaitTime,
      service: token.service,
      branch: token.branch,
      category: token.category,
    },
  });
});

// @desc    Get token details with queue position
// @route   GET /api/tokens/:id
// @access  Private
exports.getTokenDetails = asyncHandler(async (req, res) => {
  const tokenId = req.params.id;

  const token = await Token.findById(tokenId)
    .populate("service", "name")
    .populate("branch", "name address")
    .populate("category", "name")
    .populate("user", "name email")
    .populate("queue", "date status lastTokenNumber currentToken")
    .select("-__v");

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token not found",
    });
  }

  // Check ownership: User can only view their own token, STAFF/ADMIN can view all
  const isOwner = token.user._id.toString() === req.user.id;
  const isStaffOrAdmin = ["STAFF", "ADMIN"].includes(req.user.role);

  if (!isOwner && !isStaffOrAdmin) {
    return res.status(403).json({
      success: false,
      message: "You can only view your own tokens",
    });
  }

  // Calculate queue position (only for WAITING or CALLED tokens)
  let position = null;
  let peopleAhead = null;
  let estimatedWaitTime = null;

  if (["WAITING", "CALLED"].includes(token.status)) {
    // Count tokens with smaller tokenNumber that are still WAITING or CALLED
    peopleAhead = await Token.countDocuments({
      queue: token.queue._id,
      tokenNumber: { $lt: token.tokenNumber },
      status: { $in: ["WAITING", "CALLED"] },
    });
    position = peopleAhead + 1;
    estimatedWaitTime = calculateWaitTime(position);
  }

  return res.json({
    success: true,
    data: {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      displayNumber: generateDisplayNumber(token.tokenNumber),
      status: token.status,
      scheduledDate: token.scheduledDate,
      position,
      peopleAhead,
      estimatedWaitTime,
      service: token.service,
      branch: token.branch,
      category: token.category,
      queue: token.queue,
      user: token.user,
      createdAt: token.createdAt,
    },
  });
});

// @desc    Get user's tokens (grouped by status)
// @route   GET /api/tokens/my-tokens
// @access  Private
exports.getMyTokens = asyncHandler(async (req, res) => {
  const { status, date, grouped } = req.query;

  // Build query
  const query = { user: req.user.id };

  // Filter by status if provided
  if (status) {
    query.status = status;
  }

  // Filter by date if provided
  if (date) {
    query.scheduledDate = getStartOfDay(date);
  }

  const tokens = await Token.find(query)
    .populate("service", "name")
    .populate("branch", "name address")
    .populate("category", "name")
    .populate("queue", "date status currentToken")
    .sort({ scheduledDate: -1, tokenNumber: 1 })
    .lean();

  // Add displayNumber and calculate position for active tokens
  const enrichedTokens = await Promise.all(
    tokens.map(async (token) => {
      const enriched = {
        ...token,
        tokenId: token._id,
        displayNumber: generateDisplayNumber(token.tokenNumber),
      };

      // Calculate position for WAITING/CALLED tokens
      if (["WAITING", "CALLED"].includes(token.status)) {
        const peopleAhead = await Token.countDocuments({
          queue: token.queue._id,
          tokenNumber: { $lt: token.tokenNumber },
          status: { $in: ["WAITING", "CALLED"] },
        });
        enriched.position = peopleAhead + 1;
        enriched.estimatedWaitTime = calculateWaitTime(enriched.position);
      }

      return enriched;
    }),
  );

  // If grouped=true, return tokens grouped by status
  if (grouped === "true") {
    const upcoming = enrichedTokens.filter((t) =>
      ["WAITING", "CALLED"].includes(t.status),
    );
    const completed = enrichedTokens.filter((t) =>
      ["COMPLETED", "SKIPPED", "CANCELLED"].includes(t.status),
    );

    return res.json({
      success: true,
      data: {
        upcoming: {
          count: upcoming.length,
          tokens: upcoming,
        },
        completed: {
          count: completed.length,
          tokens: completed,
        },
      },
    });
  }

  // Default: return flat list
  return res.json({
    success: true,
    count: enrichedTokens.length,
    data: enrichedTokens,
  });
});

// @desc    Cancel a token
// @route   PATCH /api/tokens/:id/cancel
// @access  Private
exports.cancelToken = asyncHandler(async (req, res) => {
  const tokenId = req.params.id;

  const token = await Token.findById(tokenId);

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token not found",
    });
  }

  // Check ownership
  if (token.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You can only cancel your own tokens",
    });
  }

  // Can only cancel WAITING tokens
  if (token.status !== "WAITING") {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel token with status: ${token.status}`,
    });
  }

  token.status = "CANCELLED";
  await token.save();

  return res.json({
    success: true,
    message: "Token cancelled successfully",
    data: {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      displayNumber: generateDisplayNumber(token.tokenNumber),
      status: token.status,
    },
  });
});

// ==================== STAFF OPERATIONS ====================

// Valid status transitions for staff operations
const VALID_STATUS_TRANSITIONS = {
  WAITING: ["CALLED", "SKIPPED"],
  CALLED: ["COMPLETED", "SKIPPED"],
  COMPLETED: [], // Cannot transition from COMPLETED
  SKIPPED: ["WAITING"], // Can re-queue a skipped token
  CANCELLED: [], // Cannot transition from CANCELLED
};

// @desc    Complete a token (Staff/Admin only)
// @route   POST /api/tokens/:id/complete
// @access  Private (STAFF, ADMIN)
exports.completeToken = asyncHandler(async (req, res) => {
  const tokenId = req.params.id;

  const token = await Token.findById(tokenId);

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token not found",
    });
  }

  // Validate status transition: Only CALLED tokens can be completed
  if (token.status !== "CALLED") {
    return res.status(400).json({
      success: false,
      message: `Cannot complete token with status '${token.status}'. Only CALLED tokens can be completed.`,
    });
  }

  token.status = "COMPLETED";
  await token.save();

  return res.json({
    success: true,
    message: `Token ${token.tokenNumber} completed successfully`,
    data: {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      displayNumber: generateDisplayNumber(token.tokenNumber),
      status: token.status,
    },
  });
});

// @desc    Skip a token (Staff/Admin only)
// @route   POST /api/tokens/:id/skip
// @access  Private (STAFF, ADMIN)
exports.skipToken = asyncHandler(async (req, res) => {
  const tokenId = req.params.id;

  const token = await Token.findById(tokenId);

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token not found",
    });
  }

  // Validate status transition: WAITING or CALLED can be skipped
  if (!["WAITING", "CALLED"].includes(token.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot skip token with status '${token.status}'. Only WAITING or CALLED tokens can be skipped.`,
    });
  }

  token.status = "SKIPPED";
  await token.save();

  return res.json({
    success: true,
    message: `Token ${token.tokenNumber} has been skipped`,
    data: {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      displayNumber: generateDisplayNumber(token.tokenNumber),
      status: token.status,
    },
  });
});

// @desc    Re-queue a skipped token (Staff/Admin only)
// @route   POST /api/tokens/:id/requeue
// @access  Private (STAFF, ADMIN)
exports.requeueToken = asyncHandler(async (req, res) => {
  const tokenId = req.params.id;

  const token = await Token.findById(tokenId);

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token not found",
    });
  }

  // Only SKIPPED tokens can be re-queued
  if (token.status !== "SKIPPED") {
    return res.status(400).json({
      success: false,
      message: `Cannot re-queue token with status '${token.status}'. Only SKIPPED tokens can be re-queued.`,
    });
  }

  token.status = "WAITING";
  await token.save();

  // Calculate new position
  const position =
    (await Token.countDocuments({
      queue: token.queue,
      tokenNumber: { $lt: token.tokenNumber },
      status: { $in: ["WAITING", "CALLED"] },
    })) + 1;

  const estimatedWaitTime = calculateWaitTime(position);

  return res.json({
    success: true,
    message: `Token ${token.tokenNumber} has been re-queued`,
    data: {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      displayNumber: generateDisplayNumber(token.tokenNumber),
      status: token.status,
      position,
      estimatedWaitTime,
    },
  });
});
