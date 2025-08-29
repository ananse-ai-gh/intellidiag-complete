const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Analytics routes
router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/scans', analyticsController.getScanStats);
router.get('/patients', analyticsController.getPatientStats);
router.get('/users', analyticsController.getUserActivityStats);
router.get('/performance', analyticsController.getPerformanceMetrics);

module.exports = router;
