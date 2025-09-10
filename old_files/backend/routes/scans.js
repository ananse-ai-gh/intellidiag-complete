const express = require('express');
const { body } = require('express-validator');
const scanController = require('../controllers/scanController');
const { protect, restrictTo } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 10 // Maximum 10 files
  }
});

// Validation rules
const scanValidation = [
  body('patientId').isInt().withMessage('Valid patient ID is required'),
  body('scanType').isIn(['X-Ray', 'CT', 'MRI', 'Ultrasound', 'PET', 'Other']).withMessage('Valid scan type is required'),
  body('bodyPart').notEmpty().withMessage('Body part is required'),
  body('scanDate').optional().isISO8601().withMessage('Valid scan date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Valid priority is required'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const updateAnalysisValidation = [
  body('findings').notEmpty().withMessage('Findings are required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  body('recommendations').notEmpty().withMessage('Recommendations are required')
];

const updateAIAnalysisValidation = [
  body('status').isIn(['pending', 'processing', 'completed', 'failed']).withMessage('Valid status is required'),
  body('confidence').optional().isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0 and 1'),
  body('findings').optional().isString().withMessage('Findings must be a string'),
  body('recommendations').optional().isString().withMessage('Recommendations must be a string'),
  body('processingTime').optional().isInt({ min: 0 }).withMessage('Processing time must be a positive integer'),
  body('modelVersion').optional().isString().withMessage('Model version must be a string')
];

// Apply authentication to all routes
router.use(protect);

// Scan CRUD routes
router.get('/', scanController.getAllScans);
router.get('/:id', scanController.getScan);
router.post('/', restrictTo('admin', 'doctor', 'radiologist'), upload.array('images', 10), scanValidation, scanController.uploadScan);
router.patch('/:id/analysis', restrictTo('admin', 'radiologist'), updateAnalysisValidation, scanController.updateScanAnalysis);
router.patch('/:id/ai-analysis', restrictTo('admin', 'doctor', 'radiologist'), updateAIAnalysisValidation, scanController.updateAIAnalysis);
router.delete('/:id', restrictTo('admin'), scanController.deleteScan);

// Patient-specific scan routes
router.get('/patient/:patientId', scanController.getScansByPatient);

module.exports = router;
