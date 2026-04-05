const Queue = require("../models/Queue");
const Token = require("../models/Token");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  getStartOfDay,
  getToday,
  isValidBookingDate,
} = require("../utils/dateHelper");
const {
  AVERAGE_SERVICE_TIME,
  generateDisplayNumber,
  calculateWaitTime,
} = require("../utils/constants");

// @desc    Call next token in queue (Staff/Admin only)
// @route   POST /api/queue/next
// @access  Private (STAFF, ADMIN)
exports.callNextToken = asyncHandler(async (req, res) => {
  const { branchId, categoryId, date } = req.body;

  // Normalize date to start of day, default to today
  const queueDate = date ? getStartOfDay(date) : getToday();

  // Find the queue
  const queue = await Queue.findOne({
    branch: branchId,
    category: categoryId,
    date: queueDate,
  });

  if (!queue) {
    return res.status(404).json({
      success: false,
      message: "Queue not found for this branch, category, and date",
    });
  }

  // Find the next WAITING token (lowest tokenNumber)
  const nextToken = await Token.findOneAndUpdate(
    {
      queue: queue._id,
      status: "WAITING",
    },
    {
      status: "CALLED",
    },
    {
      new: true,
      sort: { tokenNumber: 1 }, // Get lowest token number first
    },
  ).populate([
    { path: "user", select: "name email" },
    { path: "service", select: "name" },
    { path: "branch", select: "name address" },
    { path: "category", select: "name" },
  ]);

  if (!nextToken) {
    return res.status(404).json({
      success: false,
      message: "No waiting tokens in queue",
    });
  }

  // Update queue's currentToken
  await Queue.findByIdAndUpdate(queue._id, {
    currentToken: nextToken.tokenNumber,
  });

  // Count remaining waiting tokens
  const waitingCount = await Token.countDocuments({
    queue: queue._id,
    status: "WAITING",
  });

  return res.json({
    success: true,
    message: `Token ${nextToken.tokenNumber} has been called`,
    data: {
      token: {
        tokenId: nextToken._id,
        tokenNumber: nextToken.tokenNumber,
        displayNumber: generateDisplayNumber(nextToken.tokenNumber),
        status: nextToken.status,
        user: nextToken.user,
        service: nextToken.service,
        branch: nextToken.branch,
        category: nextToken.category,
      },
      queueInfo: {
        currentToken: nextToken.tokenNumber,
        currentDisplayNumber: generateDisplayNumber(nextToken.tokenNumber),
        waitingCount,
      },
    },
  });
});

// @desc    Get current queue status (Staff/Admin only)
// @route   GET /api/queue/status
// @access  Private (STAFF, ADMIN)
exports.getQueueStatus = asyncHandler(async (req, res) => {
  const { branchId, categoryId, date } = req.query;

  // Normalize date to start of day, default to today
  const queueDate = date ? getStartOfDay(date) : getToday();

  // Find the queue
  const queue = await Queue.findOne({
    branch: branchId,
    category: categoryId,
    date: queueDate,
  })
    .populate("branch", "name address")
    .populate("category", "name");

  if (!queue) {
    return res.status(404).json({
      success: false,
      message: "Queue not found",
    });
  }

  // Get token counts by status
  const statusCounts = await Token.aggregate([
    { $match: { queue: queue._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Convert to object format
  const counts = {
    WAITING: 0,
    CALLED: 0,
    COMPLETED: 0,
    SKIPPED: 0,
    CANCELLED: 0,
  };
  statusCounts.forEach((item) => {
    counts[item._id] = item.count;
  });

  // Get currently called token
  const calledToken = await Token.findOne({
    queue: queue._id,
    status: "CALLED",
  })
    .populate("user", "name")
    .sort({ tokenNumber: 1 })
    .lean();

  return res.json({
    success: true,
    data: {
      queue: {
        id: queue._id,
        date: queue.date,
        status: queue.status,
        lastTokenNumber: queue.lastTokenNumber,
        currentToken: queue.currentToken,
        branch: queue.branch,
        category: queue.category,
      },
      counts,
      totalTokens: queue.lastTokenNumber,
      calledToken: calledToken
        ? {
            tokenId: calledToken._id,
            tokenNumber: calledToken.tokenNumber,
            displayNumber: generateDisplayNumber(calledToken.tokenNumber),
            user: calledToken.user,
          }
        : null,
    },
  });
});

// @desc    Get list of waiting tokens (Staff/Admin only)
// @route   GET /api/queue/waiting
// @access  Private (STAFF, ADMIN)
exports.getWaitingTokens = asyncHandler(async (req, res) => {
  const { branchId, categoryId, date, limit = 10 } = req.query;

  // Normalize date to start of day, default to today
  const queueDate = date ? getStartOfDay(date) : getToday();

  // Find the queue
  const queue = await Queue.findOne({
    branch: branchId,
    category: categoryId,
    date: queueDate,
  });

  if (!queue) {
    return res.status(404).json({
      success: false,
      message: "Queue not found",
    });
  }

  // Get waiting tokens sorted by tokenNumber
  const waitingTokens = await Token.find({
    queue: queue._id,
    status: "WAITING",
  })
    .populate("user", "name email")
    .sort({ tokenNumber: 1 })
    .limit(parseInt(limit))
    .select("-__v")
    .lean();

  // Add displayNumber to each token
  const enrichedTokens = waitingTokens.map((token, index) => ({
    ...token,
    displayNumber: generateDisplayNumber(token.tokenNumber),
    position: index + 1,
    estimatedWaitTime: calculateWaitTime(index + 1),
  }));

  return res.json({
    success: true,
    count: enrichedTokens.length,
    data: enrichedTokens,
  });
});

// @desc    Get live queue status (Public - for display screens and users)
// @route   GET /api/queue/:branchId/:categoryId
// @access  Public (or Private with basic auth)
exports.getLiveQueue = asyncHandler(async (req, res) => {
  const { branchId, categoryId } = req.params;
  const { date } = req.query;

  // Normalize date to start of day, default to today
  const queueDate = date ? getStartOfDay(date) : getToday();

  // Find the queue
  const queue = await Queue.findOne({
    branch: branchId,
    category: categoryId,
    date: queueDate,
  })
    .populate("branch", "name address")
    .populate("category", "name")
    .lean();

  if (!queue) {
    return res.status(404).json({
      success: false,
      message: "Queue not found for this branch and category",
    });
  }

  // Get current token (latest CALLED token)
  const currentCalledToken = await Token.findOne({
    queue: queue._id,
    status: "CALLED",
  })
    .sort({ tokenNumber: -1 })
    .lean();

  // Get next waiting tokens (next 5)
  const nextWaitingTokens = await Token.find({
    queue: queue._id,
    status: "WAITING",
  })
    .sort({ tokenNumber: 1 })
    .limit(5)
    .select("tokenNumber")
    .lean();

  // Count total waiting
  const totalWaiting = await Token.countDocuments({
    queue: queue._id,
    status: "WAITING",
  });

  return res.json({
    success: true,
    data: {
      queueId: queue._id,
      date: queue.date,
      status: queue.status,
      branch: queue.branch,
      category: queue.category,
      currentToken: currentCalledToken ? currentCalledToken.tokenNumber : null,
      currentDisplayNumber: currentCalledToken
        ? generateDisplayNumber(currentCalledToken.tokenNumber)
        : null,
      nextTokens: nextWaitingTokens.map((t) => ({
        tokenNumber: t.tokenNumber,
        displayNumber: generateDisplayNumber(t.tokenNumber),
      })),
      totalWaiting,
      lastTokenNumber: queue.lastTokenNumber,
      averageServiceTime: AVERAGE_SERVICE_TIME,
    },
  });
});

// @desc    Get slot preview for booking (shows queue info before booking)
// @route   GET /api/slots/:branchId/:categoryId
// @access  Private (logged in users)
exports.getSlotPreview = asyncHandler(async (req, res) => {
  const { branchId, categoryId } = req.params;
  const { date } = req.query;

  // Normalize date to start of day, default to today
  const queueDate = date ? getStartOfDay(date) : getToday();

  // Validate booking date is within allowed range
  if (!isValidBookingDate(queueDate)) {
    return res.status(400).json({
      success: false,
      message:
        "Booking is only allowed for today, tomorrow, or day after tomorrow",
    });
  }

  // Find existing queue for this date (if any)
  const queue = await Queue.findOne({
    branch: branchId,
    category: categoryId,
    date: queueDate,
  }).lean();

  // Calculate slot info
  const totalTokens = queue ? queue.lastTokenNumber : 0;
  const nextTokenNumber = totalTokens + 1;

  // Count waiting tokens (only if queue exists)
  let waitingCount = 0;
  if (queue) {
    waitingCount = await Token.countDocuments({
      queue: queue._id,
      status: "WAITING",
    });
  }

  // Calculate estimated wait time
  const estimatedWaitTime = waitingCount * AVERAGE_SERVICE_TIME;

  return res.json({
    success: true,
    data: {
      date: queueDate,
      totalTokens,
      nextTokenNumber,
      nextDisplayNumber: generateDisplayNumber(nextTokenNumber),
      waitingCount,
      estimatedWaitTime, // in minutes
      queueStatus: queue ? queue.status : "OPEN", // If no queue yet, it will be OPEN
      averageServiceTime: AVERAGE_SERVICE_TIME,
    },
  });
});
