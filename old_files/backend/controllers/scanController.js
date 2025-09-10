const { validationResult } = require('express-validator');
const { runQuery, getRow, getAll } = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get all scans with pagination and filtering
exports.getAllScans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build filter conditions
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (req.query.status) {
      whereClause += ' AND s.status = ?';
      params.push(req.query.status);
    }
    
    if (req.query.scanType) {
      whereClause += ' AND s.scanType = ?';
      params.push(req.query.scanType);
    }
    
    if (req.query.patientId) {
      whereClause += ' AND s.patientId = ?';
      params.push(req.query.patientId);
    }

    if (req.query.priority) {
      whereClause += ' AND s.priority = ?';
      params.push(req.query.priority);
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total FROM scans s ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get scans with patient and user info
    const scans = await getAll(
      `SELECT s.*, 
              p.firstName as patientFirstName, 
              p.lastName as patientLastName, 
              p.patientId as patientNumber,
              u.firstName as uploadedByFirstName, 
              u.lastName as uploadedByLastName,
              ma.radiologistId,
              ma.findings as manualFindings,
              ma.diagnosis as manualDiagnosis,
              ma.recommendations as manualRecommendations,
              ma.analysisDate as manualAnalysisDate,
              ai.status as aiStatus,
              ai.confidence,
              ai.findings as aiFindings,
              ai.recommendations as aiRecommendations
       FROM scans s 
       LEFT JOIN patients p ON s.patientId = p.id 
       LEFT JOIN users u ON s.uploadedById = u.id
       LEFT JOIN manual_analysis ma ON s.id = ma.scanId
       LEFT JOIN ai_analysis ai ON s.id = ai.scanId
       ${whereClause}
       ORDER BY s.createdAt DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.status(200).json({
      status: 'success',
      data: {
        scans,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalScans: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get scans error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching scans'
    });
  }
};

// Get single scan with all related data
exports.getScan = async (req, res) => {
  try {
    const scan = await getRow(
      `SELECT s.*, 
              p.firstName as patientFirstName, 
              p.lastName as patientLastName, 
              p.patientId as patientNumber,
              p.dateOfBirth as patientDateOfBirth,
              p.gender as patientGender,
              u.firstName as uploadedByFirstName, 
              u.lastName as uploadedByLastName,
              u.email as uploadedByEmail
       FROM scans s 
       LEFT JOIN patients p ON s.patientId = p.id 
       LEFT JOIN users u ON s.uploadedById = u.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (!scan) {
      return res.status(404).json({
        status: 'error',
        message: 'Scan not found'
      });
    }

    // Get scan images
    const images = await getAll(
      'SELECT * FROM scan_images WHERE scanId = ? ORDER BY createdAt ASC',
      [req.params.id]
    );

    // Get AI analysis
    const aiAnalysis = await getRow(
      'SELECT * FROM ai_analysis WHERE scanId = ?',
      [req.params.id]
    );

    // Get manual analysis
    const manualAnalysis = await getRow(
      `SELECT ma.*, 
              u.firstName as radiologistFirstName, 
              u.lastName as radiologistLastName,
              u.email as radiologistEmail
       FROM manual_analysis ma
       LEFT JOIN users u ON ma.radiologistId = u.id
       WHERE ma.scanId = ?`,
      [req.params.id]
    );

    // Combine all data
    const scanData = {
      ...scan,
      images,
      aiAnalysis,
      manualAnalysis
    };

    res.status(200).json({
      status: 'success',
      data: {
        scan: scanData
      }
    });
  } catch (error) {
    console.error('Get scan error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching scan'
    });
  }
};

// Upload new scan
exports.uploadScan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const {
      patientId,
      scanType,
      bodyPart,
      scanDate,
      priority,
      notes
    } = req.body;

    // Verify patient exists
    const patient = await getRow('SELECT id FROM patients WHERE id = ? AND isActive = 1', [patientId]);
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Generate scan ID
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const scanId = `S${year}${month}${randomNum}`;

    // Create scan record
    const result = await runQuery(
      `INSERT INTO scans (
        scanId, patientId, scanType, bodyPart, scanDate, uploadedById, priority, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [scanId, patientId, scanType, bodyPart, scanDate || new Date(), req.user.id, priority, notes]
    );

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await runQuery(
          'INSERT INTO scan_images (scanId, url, thumbnail, originalName, size) VALUES (?, ?, ?, ?, ?)',
          [result.id, file.path, file.thumbnail || file.path, file.originalname, file.size]
        );
      }
    }

    // Create AI analysis record
    await runQuery(
      'INSERT INTO ai_analysis (scanId, status) VALUES (?, ?)',
      [result.id, 'pending']
    );

    // Get the created scan with all related data
    const scan = await getRow(
      `SELECT s.*, 
              p.firstName as patientFirstName, 
              p.lastName as patientLastName, 
              p.patientId as patientNumber
       FROM scans s 
       LEFT JOIN patients p ON s.patientId = p.id 
       WHERE s.id = ?`,
      [result.id]
    );

    res.status(201).json({
      status: 'success',
      data: {
        scan
      }
    });
  } catch (error) {
    console.error('Upload scan error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error uploading scan'
    });
  }
};

// Update scan analysis
exports.updateScanAnalysis = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const {
      findings,
      diagnosis,
      recommendations
    } = req.body;

    // Check if manual analysis already exists
    const existingAnalysis = await getRow(
      'SELECT id FROM manual_analysis WHERE scanId = ?',
      [req.params.id]
    );

    if (existingAnalysis) {
      // Update existing analysis
      await runQuery(
        `UPDATE manual_analysis SET 
         findings = ?, diagnosis = ?, recommendations = ?, 
         analysisDate = CURRENT_TIMESTAMP 
         WHERE scanId = ?`,
        [findings, diagnosis, recommendations, req.params.id]
      );
    } else {
      // Create new analysis
      await runQuery(
        `INSERT INTO manual_analysis (
          scanId, radiologistId, findings, diagnosis, recommendations
        ) VALUES (?, ?, ?, ?, ?)`,
        [req.params.id, req.user.id, findings, diagnosis, recommendations]
      );
    }

    // Update scan status
    await runQuery(
      'UPDATE scans SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      ['completed', req.params.id]
    );

    // Get updated scan
    const scan = await getRow(
      `SELECT s.*, 
              p.firstName as patientFirstName, 
              p.lastName as patientLastName, 
              p.patientId as patientNumber
       FROM scans s 
       LEFT JOIN patients p ON s.patientId = p.id 
       WHERE s.id = ?`,
      [req.params.id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Scan analysis updated successfully',
      data: {
        scan
      }
    });
  } catch (error) {
    console.error('Update scan analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating scan analysis'
    });
  }
};

// Update AI analysis
exports.updateAIAnalysis = async (req, res) => {
  try {
    const {
      status,
      confidence,
      findings,
      recommendations,
      processingTime,
      modelVersion
    } = req.body;

    const scanId = req.params.id;

    // Update or create AI analysis
    const existingAnalysis = await getRow(
      'SELECT id FROM ai_analysis WHERE scanId = ?',
      [scanId]
    );

    if (existingAnalysis) {
      await runQuery(
        `UPDATE ai_analysis SET 
         status = ?, confidence = ?, findings = ?, recommendations = ?, 
         processingTime = ?, modelVersion = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE scanId = ?`,
        [status, confidence, findings, recommendations, processingTime, modelVersion, scanId]
      );
    } else {
      await runQuery(
        `INSERT INTO ai_analysis (
          scanId, status, confidence, findings, recommendations, processingTime, modelVersion
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [scanId, status, confidence, findings, recommendations, processingTime, modelVersion]
      );
    }

    // Update scan status if AI analysis is completed
    if (status === 'completed') {
      await runQuery(
        'UPDATE scans SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        ['analyzing', scanId]
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'AI analysis updated successfully'
    });
  } catch (error) {
    console.error('Update AI analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating AI analysis'
    });
  }
};

// Delete scan
exports.deleteScan = async (req, res) => {
  try {
    // Get scan images to delete files
    const images = await getAll(
      'SELECT url, thumbnail FROM scan_images WHERE scanId = ?',
      [req.params.id]
    );

    // Delete image files
    images.forEach(image => {
      if (image.url && fs.existsSync(image.url)) {
        fs.unlinkSync(image.url);
      }
      if (image.thumbnail && fs.existsSync(image.thumbnail)) {
        fs.unlinkSync(image.thumbnail);
      }
    });

    // Delete from database (cascade will handle related records)
    const result = await runQuery('DELETE FROM scans WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Scan not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Scan deleted successfully'
    });
  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting scan'
    });
  }
};

// Get scans by patient
exports.getScansByPatient = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Verify patient exists
    const patient = await getRow('SELECT id FROM patients WHERE id = ? AND isActive = 1', [patientId]);
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Get total count
    const countResult = await getRow(
      'SELECT COUNT(*) as total FROM scans WHERE patientId = ?',
      [patientId]
    );
    const total = countResult.total;

    // Get scans
    const scans = await getAll(
      `SELECT s.*, 
              u.firstName as uploadedByFirstName, 
              u.lastName as uploadedByLastName,
              ai.status as aiStatus,
              ai.confidence
       FROM scans s 
       LEFT JOIN users u ON s.uploadedById = u.id
       LEFT JOIN ai_analysis ai ON s.id = ai.scanId
       WHERE s.patientId = ?
       ORDER BY s.createdAt DESC 
       LIMIT ? OFFSET ?`,
      [patientId, limit, offset]
    );

    res.status(200).json({
      status: 'success',
      data: {
        scans,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalScans: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get scans by patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient scans'
    });
  }
};
