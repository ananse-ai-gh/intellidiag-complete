const express = require('express');
const { body } = require('express-validator');
const patientController = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const patientValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('contactNumber').optional().isMobilePhone().withMessage('Valid contact number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('assignedDoctorId').optional().isInt().withMessage('Valid doctor ID is required')
];

const updatePatientValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('contactNumber').optional().isMobilePhone().withMessage('Valid contact number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('assignedDoctorId').optional().isInt().withMessage('Valid doctor ID is required')
];

const medicalHistoryValidation = [
  body('condition').notEmpty().withMessage('Medical condition is required'),
  body('diagnosis').optional().notEmpty().withMessage('Diagnosis cannot be empty'),
  body('treatment').optional().notEmpty().withMessage('Treatment cannot be empty'),
  body('date').isISO8601().withMessage('Valid date is required')
];

const allergyValidation = [
  body('allergy').notEmpty().withMessage('Allergy is required'),
  body('severity').optional().isIn(['mild', 'moderate', 'severe']).withMessage('Valid severity is required')
];

const medicationValidation = [
  body('name').notEmpty().withMessage('Medication name is required'),
  body('dosage').optional().notEmpty().withMessage('Dosage cannot be empty'),
  body('frequency').optional().notEmpty().withMessage('Frequency cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required')
];

// Apply authentication to all routes
router.use(protect);

// Patient CRUD routes
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatient);
router.post('/', restrictTo('admin', 'doctor'), patientValidation, patientController.createPatient);
router.patch('/:id', restrictTo('admin', 'doctor'), updatePatientValidation, patientController.updatePatient);
router.delete('/:id', restrictTo('admin'), patientController.deletePatient);

// Medical history routes
router.post('/:id/medical-history', restrictTo('admin', 'doctor'), medicalHistoryValidation, patientController.addMedicalHistory);

// Allergy routes
router.post('/:id/allergies', restrictTo('admin', 'doctor'), allergyValidation, patientController.addAllergy);

// Medication routes
router.post('/:id/medications', restrictTo('admin', 'doctor'), medicationValidation, patientController.addMedication);

module.exports = router;
