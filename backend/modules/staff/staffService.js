const User = require('../../models/User');
const Queue = require('../../models/Queue');
const Token = require('../../models/Token');

/**
 * Get staff details and assigned queue
 */
const getStaffMe = async (userId) => {
  const staff = await User.findById(userId).populate('queueId');
  if (!staff) {
    throw new Error('Staff not found');
  }
  return staff;
};

/**
 * Get queue assigned to staff
 */
const getStaffQueue = async (queueId) => {
  const queue = await Queue.findById(queueId);
  if (!queue) {
    throw new Error('Assigned queue not found');
  }

  const currentToken = await Token.findOne({ 
    queueId, 
    status: 'CALLED' 
  }).sort({ updatedAt: -1 });

  const waitingCount = await Token.countDocuments({ 
    queueId, 
    status: 'WAITING' 
  });

  return {
    queue,
    currentlyServing: currentToken ? currentToken.tokenNumber : (queue.currentTokenNumber > 0 ? 'Wait for call' : 'No tokens yet'),
    waitingCount
  };
};

/**
 * Call next WAITING token in the queue
 */
const callNextToken = async (queueId, io) => {
  // 1. Find the earliest WAITING token in FIFO order
  const nextToken = await Token.findOne({ 
    queueId, 
    status: 'WAITING' 
  }).sort({ tokenNumber: 1 });

  if (!nextToken) {
    throw new Error('No users waiting in the queue. You are all caught up!');
  }

  // 2. Update status to CALLED
  nextToken.status = 'CALLED';
  await nextToken.save();

  // 3. Emit Real-Time Event
  if (io) {
    io.to(queueId.toString()).emit('TOKEN_CALLED', {
      queueId,
      tokenId: nextToken._id,
      tokenNumber: nextToken.tokenNumber,
      status: 'CALLED'
    });
    io.to(queueId.toString()).emit('QUEUE_UPDATED', {
      queueId
    });
  }

  return nextToken;
};

/**
 * Update token status (CALLED -> COMPLETED/NO_SHOW)
 */
const updateTokenStatus = async (tokenId, status, staffQueueId, io) => {
  const allowedStatuses = ['COMPLETED', 'NO_SHOW'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid status. Staff can only mark COMPLETED or NO_SHOW');
  }

  const token = await Token.findById(tokenId);
  if (!token) {
    throw new Error('Token not found');
  }

  // Security: Ensure token belongs to staff's assigned queue
  if (token.queueId.toString() !== staffQueueId.toString()) {
    throw new Error('Unauthorized: This token does not belong to your assigned queue');
  }

  // STRICT FLOW: Only allow CALLED -> COMPLETED/NO_SHOW
  if (token.status !== 'CALLED') {
    throw new Error(`Token must be CALLED before it can be marked as ${status}. Current status: ${token.status}`);
  }

  token.status = status;
  await token.save();

  // Emit Real-Time Events
  if (io) {
    io.to(token.queueId.toString()).emit('TOKEN_UPDATED', {
      queueId: token.queueId,
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      status: status
    });
    io.to(token.queueId.toString()).emit('QUEUE_UPDATED', {
      queueId: token.queueId
    });
  }

  return token;
};

/**
 * Get all tokens for a queue (with optional status filter)
 */
const getQueueTokens = async (queueId, statusFilter) => {
  const query = { queueId };
  if (statusFilter) {
    query.status = statusFilter;
  }

  const tokens = await Token.find(query)
    .populate('userId', 'name email')
    .sort({ tokenNumber: 1 });

  return tokens;
};

/**
 * Toggle queue active status
 */
const toggleQueueStatus = async (queueId) => {
  const queue = await Queue.findById(queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  queue.isActive = !queue.isActive;
  await queue.save();

  return queue;
};

module.exports = {
  getStaffMe,
  getStaffQueue,
  getQueueTokens,
  callNextToken,
  updateTokenStatus,
  toggleQueueStatus
};
