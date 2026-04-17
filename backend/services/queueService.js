const Queue = require('../models/Queue');
const Token = require('../models/Token');

/**
 * Generate a new token for a user in a specific queue
 */
const generateToken = async (queueId, userId, io) => {
  // 1. Check if queue exists and is active
  const queue = await Queue.findById(queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }
  if (!queue.isActive) {
    throw new Error('Queue is currently inactive');
  }

  // 2. Atomically increment token number
  const updatedQueue = await Queue.findByIdAndUpdate(
    queueId,
    { $inc: { currentTokenNumber: 1 } },
    { new: true, runValidators: true }
  );

  const tokenNumber = updatedQueue.currentTokenNumber;

  // 3. Create new token
  const token = await Token.create({
    tokenNumber,
    userId,
    queueId,
    status: 'WAITING'
  });

  // 4. Emit Real-Time Events
  if (io) {
    io.to(queueId.toString()).emit('TOKEN_CREATED', {
      queueId,
      tokenId: token._id,
      tokenNumber,
      status: 'WAITING'
    });
    io.to(queueId.toString()).emit('QUEUE_UPDATED', {
      queueId,
      currentTokenNumber: tokenNumber
    });
  }

  return token;
};

/**
 * Cancel a token (User only)
 */
const cancelToken = async (tokenId, userId, io) => {
  const token = await Token.findById(tokenId);
  if (!token) {
    throw new Error('Token not found');
  }

  // Verify ownership
  if (token.userId.toString() !== userId.toString()) {
    throw new Error('You are not authorized to cancel this token');
  }

  // Only allowed if WAITING
  if (token.status !== 'WAITING') {
    throw new Error(`Cannot cancel a token that is currently ${token.status}`);
  }

  token.status = 'CANCELLED';
  await token.save();

  // Emit Real-Time Events
  if (io) {
    io.to(token.queueId.toString()).emit('TOKEN_UPDATED', {
      queueId: token.queueId,
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      status: 'CANCELLED'
    });
    io.to(token.queueId.toString()).emit('QUEUE_UPDATED', {
      queueId: token.queueId
    });
  }

  return token;
};

/**
 * Get logged-in user's tokens (latest first, limit 10)
 */
const getMyTokens = async (userId) => {
  return await Token.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('queueId', 'name');
};

/**
 * Get queue status (current served token + waiting count)
 */
const getQueueStatus = async (queueId) => {
  const queue = await Queue.findById(queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  // Find the token that is currently CALLED
  const currentToken = await Token.findOne({ 
    queueId, 
    status: 'CALLED' 
  }).sort({ updatedAt: -1 });

  // Count waiting users
  const waitingCount = await Token.countDocuments({ 
    queueId, 
    status: 'WAITING' 
  });

  return {
    queueName: queue.name,
    isActive: queue.isActive,
    currentlyServing: currentToken ? currentToken.tokenNumber : (queue.currentTokenNumber > 0 ? 'Wait for call' : 'No tokens yet'),
    waitingCount
  };
};

/**
 * Get all available queues
 */
const getAllQueues = async () => {
  return await Queue.find({ isActive: true });
};

module.exports = {
  generateToken,
  cancelToken,
  getMyTokens,
  getQueueStatus,
  getAllQueues
};
