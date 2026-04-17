const adminService = require('./admin.service');
const mongoose = require('mongoose');

/**
 * @desc    Hierarchy Management
 */
const createService = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const service = await adminService.createService(name);
    res.status(201).json({ success: true, message: 'Service created', data: service });
  } catch (error) { next(error); }
};

const createBranch = async (req, res, next) => {
  try {
    const { name, serviceId } = req.body;
    if (!name || !serviceId) return res.status(400).json({ success: false, message: 'Name and serviceId are required' });
    const branch = await adminService.createBranch(name, serviceId);
    res.status(201).json({ success: true, message: 'Branch created', data: branch });
  } catch (error) { next(error); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, branchId } = req.body;
    if (!name || !branchId) return res.status(400).json({ success: false, message: 'Name and branchId are required' });
    const category = await adminService.createCategory(name, branchId);
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) { next(error); }
};

/**
 * @desc    Create new queue
 * @route   POST /api/admin/queue
 */
const createQueue = async (req, res, next) => {
  try {
    const { name, categoryId } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Queue name is required'
      });
    }

    const queue = await adminService.createQueue({ name, categoryId });
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
  createService,
  createBranch,
  createCategory,
  createQueue,
  getAllQueues,
  updateQueue,
  getAllUsers,
  updateUserRole,
  assignQueue,
  getDashboard,
  getQueueTokens
};
