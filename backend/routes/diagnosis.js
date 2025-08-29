const express = require('express');
const { body } = require('express-validator');
const diagnosisController = require('../controllers/diagnosisController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateConfidenceValidation = [
  body('confidence').isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0 and 1'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

// Apply authentication to all routes
router.use(protect);

// Diagnosis routes
router.get('/', diagnosisController.getAllDiagnoses);
router.get('/stats', diagnosisController.getDiagnosisStats);
router.get('/:id', diagnosisController.getDiagnosis);
router.patch('/:id/confidence', restrictTo('admin', 'radiologist'), updateConfidenceValidation, diagnosisController.updateDiagnosisConfidence);

// Comparison and analysis routes
router.get('/:scanId/compare', diagnosisController.compareDiagnoses);
router.get('/:scanId/recommendations', diagnosisController.getDiagnosisRecommendations);

module.exports = router;
