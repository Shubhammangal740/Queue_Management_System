const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware');

// All admin routes require protection and ADMIN role
router.use(protect);
router.use(authorizeRoles('ADMIN'));

// Dashboard stats
router.get('/dashboard', adminController.getDashboard);

// Hierarchy Management
router.post('/service', adminController.createService);
router.post('/branch', adminController.createBranch);
router.post('/category', adminController.createCategory);

// Queue Management
router.post('/queue', adminController.createQueue);
router.get('/queues', adminController.getAllQueues);
router.patch('/queue/:id', adminController.updateQueue);
router.get('/queue/:id/tokens', adminController.getQueueTokens);

// User Management
router.get('/users', adminController.getAllUsers);
router.patch('/user/:id/role', adminController.updateUserRole);

// Staff Assignment
router.patch('/staff/:id/assign-queue', adminController.assignQueue);

module.exports = router;
