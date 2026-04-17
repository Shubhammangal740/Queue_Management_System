const queueService = require('../services/queueService');

const generateToken = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const userId = req.user.id;
    const io = req.app.get('io');

    const token = await queueService.generateToken(queueId, userId, io);

    res.status(201).json({
      success: true,
      message: 'Token generated successfully. Follow the queue updates in real-time!',
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel current user's token
 * @route   PATCH /api/tokens/:id/cancel
 * @access  Private (USER/STAFF/ADMIN)
 */
const cancelToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const io = req.app.get('io');

    const token = await queueService.cancelToken(id, userId, io);

    res.status(200).json({
      success: true,
      message: 'Your token has been canceled successfully',
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's tokens
 * @route   GET /api/tokens/my
 * @access  Private (USER/STAFF/ADMIN)
 */
const getMyTokens = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tokens = await queueService.getMyTokens(userId);

    res.status(200).json({
      success: true,
      message: 'Your token history fetched successfully',
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get queue status
 * @route   GET /api/queue/:queueId/status
 * @access  Public/Private
 */
const getQueueStatus = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const status = await queueService.getQueueStatus(queueId);

    res.status(200).json({
      success: true,
      message: 'Queue status updated',
      data: status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all queues
 * @route   GET /api/queue
 * @access  Public
 */
const getAllQueues = async (req, res, next) => {
  try {
    const queues = await queueService.getAllQueues();
    res.status(200).json({
      success: true,
      data: queues
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateToken,
  cancelToken,
  getMyTokens,
  getQueueStatus,
  getAllQueues
};
