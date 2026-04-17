const adminService = require('./admin.service');
const mongoose = require('mongoose');

/**
 * @desc    Create new queue
 * @route   POST /api/admin/queue
 * @access  Private (ADMIN)
 */
const createQueue = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Queue name is required'
      });
    }

    const queue = await adminService.createQueue({ name });
    res.status(201).json({
      success: true,
      message: 'Queue created successfully',
      data: queue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all queues
 * @route   GET /api/admin/queues
 * @access  Private (ADMIN)
 */
const getAllQueues = async (req, res, next) => {
  try {
    const queues = await adminService.getAllQueues();
    res.status(200).json({
      success: true,
      data: queues
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update queue
 * @route   PATCH /api/admin/queue/:id
 * @access  Private (ADMIN)
 */
const updateQueue = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Queue ID'
      });
    }

    const queue = await adminService.updateQueue(id, req.body);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Queue updated successfully',
      data: queue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (ADMIN)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/user/:id/role
 * @access  Private (ADMIN)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID'
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    const user = await adminService.updateUserRole(id, role);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign queue to staff
 * @route   PATCH /api/admin/staff/:id/assign-queue
 * @access  Private (ADMIN)
 */
const assignQueue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { queueId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID or Queue ID'
      });
    }

    const staff = await adminService.assignQueueToStaff(id, queueId);
    res.status(200).json({
      success: true,
      message: 'Queue assigned to staff successfully',
      data: {
        id: staff._id,
        name: staff.name,
        queueId: staff.queueId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Private (ADMIN)
 */
const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tokens for a specific queue
 * @route   GET /api/admin/queue/:id/tokens?status=WAITING
 * @access  Private (ADMIN)
 */
const getQueueTokens = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Queue ID'
      });
    }

    const { status } = req.query;
    const tokens = await adminService.getQueueTokens(id, status);
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
  createQueue,
  getAllQueues,
  updateQueue,
  getAllUsers,
  updateUserRole,
  assignQueue,
  getDashboard,
  getQueueTokens
};
