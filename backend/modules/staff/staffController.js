const staffService = require('./staffService');

/**
 * @desc    Get staff details and assigned queue
 * @route   GET /api/staff/me
 * @access  Private (STAFF)
 */
const getMe = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffMe(req.user.id);
    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get assigned queue status
 * @route   GET /api/staff/queue
 * @access  Private (STAFF)
 */
const getQueue = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffMe(req.user.id);
    if (!staff.queueId) {
      return res.status(400).json({
        success: false,
        message: 'No queue assigned to this staff member'
      });
    }

    const queueData = await staffService.getStaffQueue(staff.queueId._id);
    res.status(200).json({
      success: true,
      data: queueData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Call next user in assigned queue
 * @route   POST /api/staff/queue/call-next
 * @access  Private (STAFF)
 */
const callNext = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffMe(req.user.id);
    if (!staff.queueId) {
      return res.status(400).json({
        success: false,
        message: 'No queue assigned to this staff member. Please contact Admin.'
      });
    }

    const io = req.app.get('io');
    const token = await staffService.callNextToken(staff.queueId._id, io);
    res.status(200).json({
      success: true,
      message: `Token #${token.tokenNumber} has been called. Prepare for service.`,
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update token status
 * @route   PATCH /api/staff/token/:id/status
 * @access  Private (STAFF)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const staff = await staffService.getStaffMe(req.user.id);
    if (!staff.queueId) {
      return res.status(400).json({
        success: false,
        message: 'No queue assigned to this staff member'
      });
    }

    const io = req.app.get('io');
    const token = await staffService.updateTokenStatus(id, status, staff.queueId._id, io);
    res.status(200).json({
      success: true,
      message: `Service completed successfully. Token marked as ${status}.`,
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle queue active status
 * @route   PATCH /api/staff/queue/pause
 * @access  Private (STAFF)
 */
const togglePause = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffMe(req.user.id);
    if (!staff.queueId) {
      return res.status(400).json({
        success: false,
        message: 'No queue assigned to this staff member'
      });
    }

    const queue = await staffService.toggleQueueStatus(staff.queueId._id);
    
    // Optional: Emit queue status update to room
    const io = req.app.get('io');
    if (io) {
      io.to(queue._id.toString()).emit('QUEUE_UPDATED', {
        queueId: queue._id,
        isActive: queue.isActive
      });
    }

    res.status(200).json({
      success: true,
      message: `The queue has been ${queue.isActive ? 'resumed' : 'paused'}.`,
      data: queue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tokens in staff's assigned queue
 * @route   GET /api/staff/queue/tokens?status=WAITING
 * @access  Private (STAFF)
 */
const getQueueTokens = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffMe(req.user.id);
    if (!staff.queueId) {
      return res.status(400).json({
        success: false,
        message: 'No queue assigned to this staff member'
      });
    }

    const { status } = req.query;
    const tokens = await staffService.getQueueTokens(staff.queueId._id, status);
    res.status(200).json({
      success: true,
      count: tokens.length,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  getQueue,
  getQueueTokens,
  callNext,
  updateStatus,
  togglePause
};
