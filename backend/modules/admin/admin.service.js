const User = require('../../models/User');
const Queue = require('../../models/Queue');
const Token = require('../../models/Token');

/**
 * Queue Management
 */
const createQueue = async (data) => {
  // Ensure default values are explicit
  const queueData = {
    name: data.name,
    currentTokenNumber: 0,
    isActive: true
  };
  return await Queue.create(queueData);
};

const getAllQueues = async () => {
  return await Queue.find().sort({ createdAt: -1 });
};

const updateQueue = async (id, data) => {
  return await Queue.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

/**
 * User Management
 */
const getAllUsers = async () => {
  // Only return name, email, role, and queueId as requested
  return await User.find()
    .select('name email role queueId')
    .sort({ createdAt: -1 });
};

const updateUserRole = async (id, role) => {
  const allowedRoles = ['USER', 'STAFF', 'ADMIN'];
  if (!allowedRoles.includes(role)) {
    throw new Error('Invalid role');
  }
  return await User.findByIdAndUpdate(id, { role }, { new: true });
};

/**
 * Staff Assignment
 */
const assignQueueToStaff = async (staffId, queueId) => {
  const staff = await User.findById(staffId);
  if (!staff) {
    throw new Error('User not found');
  }
  
  if (staff.role !== 'STAFF') {
    throw new Error('User is not a staff member. Please update their role first.');
  }

  const queue = await Queue.findById(queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  staff.queueId = queueId;
  await staff.save();

  return staff;
};

/**
 * Dashboard Stats (Optional but kept for completeness)
 */
const getDashboardStats = async () => {
  const [totalUsers, totalQueues, totalTokens, activeTokens] = await Promise.all([
    User.countDocuments(),
    Queue.countDocuments(),
    Token.countDocuments(),
    Token.countDocuments({ status: { $in: ['WAITING', 'CALLED'] } })
  ]);

  return {
    totalUsers,
    totalQueues,
    totalTokens,
    activeTokens
  };
};

/**
 * Get tokens for a specific queue (Admin view)
 */
const getQueueTokens = async (queueId, statusFilter) => {
  const queue = await Queue.findById(queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  const query = { queueId };
  if (statusFilter) {
    query.status = statusFilter;
  }

  const tokens = await Token.find(query)
    .populate('userId', 'name email')
    .sort({ tokenNumber: 1 });

  return tokens;
};

module.exports = {
  createQueue,
  getAllQueues,
  updateQueue,
  getAllUsers,
  updateUserRole,
  assignQueueToStaff,
  getDashboardStats,
  getQueueTokens
};
