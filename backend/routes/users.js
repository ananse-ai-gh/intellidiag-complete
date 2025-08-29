const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['doctor', 'radiologist', 'admin', 'patient']).withMessage('Invalid role'),
  body('specialization').optional().notEmpty().withMessage('Specialization cannot be empty'),
  body('licenseNumber').optional().notEmpty().withMessage('License number cannot be empty')
];

const updateUserValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('specialization').optional().notEmpty().withMessage('Specialization cannot be empty'),
  body('licenseNumber').optional().notEmpty().withMessage('License number cannot be empty')
];

// Apply authentication to all routes
router.use(protect);

// User CRUD routes (admin only)
router.get('/', restrictTo('admin'), userController.getAllUsers);
router.get('/:id', restrictTo('admin'), userController.getUser);
router.post('/', restrictTo('admin'), createUserValidation, userController.createUser);
router.patch('/:id', restrictTo('admin'), updateUserValidation, userController.updateUser);
router.delete('/:id', restrictTo('admin'), userController.deactivateUser);
router.patch('/:id/reactivate', restrictTo('admin'), userController.reactivateUser);

// User statistics routes
router.get('/:id/stats', userController.getUserStats);

// Role-based user routes
router.get('/role/:role', restrictTo('admin'), userController.getUsersByRole);

module.exports = router;
