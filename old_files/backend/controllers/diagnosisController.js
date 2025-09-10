const { validationResult } = require('express-validator');
const { runQuery, getRow, getAll } = require('../config/database');

// Get all diagnoses with pagination and filtering
exports.getAllDiagnoses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build filter conditions
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (req.query.status) {
      whereClause += ' AND ai.status = ?';
      params.push(req.query.status);
    }
    
    if (req.query.confidence) {
      whereClause += ' AND ai.confidence >= ?';
      params.push(parseFloat(req.query.confidence));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total FROM ai_analysis ai ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get diagnoses with scan and patient info
    const diagnoses = await getAll(
      `SELECT ai.*, 
              s.scanId, s.scanType, s.bodyPart, s.priority, s.status as scanStatus,
              p.firstName as patientFirstName, p.lastName as patientLastName, p.patientId as patientNumber,
              ma.findings as manualFindings, ma.diagnosis as manualDiagnosis, ma.recommendations as manualRecommendations
       FROM ai_analysis ai
       LEFT JOIN scans s ON ai.scanId = s.id
       LEFT JOIN patients p ON s.patientId = p.id
       LEFT JOIN manual_analysis ma ON s.id = ma.scanId
       ${whereClause}
       ORDER BY ai.createdAt DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.status(200).json({
      status: 'success',
      data: {
        diagnoses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalDiagnoses: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get diagnoses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching diagnoses'
    });
  }
};

// Get single diagnosis
exports.getDiagnosis = async (req, res) => {
  try {
    const diagnosis = await getRow(
      `SELECT ai.*, 
              s.scanId, s.scanType, s.bodyPart, s.priority, s.status as scanStatus, s.notes as scanNotes,
              p.firstName as patientFirstName, p.lastName as patientLastName, p.patientId as patientNumber,
              p.dateOfBirth as patientDateOfBirth, p.gender as patientGender,
              ma.findings as manualFindings, ma.diagnosis as manualDiagnosis, ma.recommendations as manualRecommendations,
              ma.radiologistId, ma.analysisDate as manualAnalysisDate
       FROM ai_analysis ai
       LEFT JOIN scans s ON ai.scanId = s.id
       LEFT JOIN patients p ON s.patientId = p.id
       LEFT JOIN manual_analysis ma ON s.id = ma.scanId
       WHERE ai.id = ?`,
      [req.params.id]
    );

    if (!diagnosis) {
      return res.status(404).json({
        status: 'error',
        message: 'Diagnosis not found'
      });
    }

    // Get scan images
    const images = await getAll(
      'SELECT * FROM scan_images WHERE scanId = ? ORDER BY createdAt ASC',
      [diagnosis.scanId]
    );

    // Get radiologist info if manual analysis exists
    let radiologist = null;
    if (diagnosis.radiologistId) {
      radiologist = await getRow(
        'SELECT id, firstName, lastName, email, specialization FROM users WHERE id = ?',
        [diagnosis.radiologistId]
      );
    }

    // Combine all data
    const diagnosisData = {
      ...diagnosis,
      images,
      radiologist
    };

    res.status(200).json({
      status: 'success',
      data: {
        diagnosis: diagnosisData
      }
    });
  } catch (error) {
    console.error('Get diagnosis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching diagnosis'
    });
  }
};

// Compare AI vs Manual diagnosis
exports.compareDiagnoses = async (req, res) => {
  try {
    const scanId = req.params.scanId;

    // Get AI analysis
    const aiAnalysis = await getRow(
      'SELECT * FROM ai_analysis WHERE scanId = ?',
      [scanId]
    );

    // Get manual analysis
    const manualAnalysis = await getRow(
      `SELECT ma.*, 
              u.firstName as radiologistFirstName, u.lastName as radiologistLastName,
              u.specialization as radiologistSpecialization
       FROM manual_analysis ma
       LEFT JOIN users u ON ma.radiologistId = u.id
       WHERE ma.scanId = ?`,
      [scanId]
    );

    // Get scan info
    const scan = await getRow(
      `SELECT s.*, 
              p.firstName as patientFirstName, p.lastName as patientLastName, p.patientId as patientNumber
       FROM scans s
       LEFT JOIN patients p ON s.patientId = p.id
       WHERE s.id = ?`,
      [scanId]
    );

    if (!scan) {
      return res.status(404).json({
        status: 'error',
        message: 'Scan not found'
      });
    }

    // Calculate agreement metrics
    let agreementMetrics = null;
    if (aiAnalysis && manualAnalysis) {
      // Simple text similarity (in production, you'd use more sophisticated NLP)
      const aiFindings = aiAnalysis.findings ? aiAnalysis.findings.toLowerCase() : '';
      const manualFindings = manualAnalysis.findings ? manualAnalysis.findings.toLowerCase() : '';
      
      const aiWords = aiFindings.split(/\s+/).filter(word => word.length > 2);
      const manualWords = manualFindings.split(/\s+/).filter(word => word.length > 2);
      
      const commonWords = aiWords.filter(word => manualWords.includes(word));
      const similarity = aiWords.length > 0 ? (commonWords.length / Math.max(aiWords.length, manualWords.length)) * 100 : 0;

      agreementMetrics = {
        similarity: Math.round(similarity * 100) / 100,
        commonTerms: commonWords.slice(0, 10), // Top 10 common terms
        aiConfidence: aiAnalysis.confidence || 0
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        scan,
        aiAnalysis,
        manualAnalysis,
        agreementMetrics
      }
    });
  } catch (error) {
    console.error('Compare diagnoses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error comparing diagnoses'
    });
  }
};

// Get diagnosis statistics
exports.getDiagnosisStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    // AI analysis statistics
    const aiStats = await getRow(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
        AVG(confidence) as avgConfidence,
        AVG(processingTime) as avgProcessingTime
      FROM ai_analysis 
      WHERE createdAt >= datetime("now", "-${period} days")
    `);

    // Manual analysis statistics
    const manualStats = await getRow(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN diagnosis IS NOT NULL THEN 1 END) as withDiagnosis,
        COUNT(CASE WHEN recommendations IS NOT NULL THEN 1 END) as withRecommendations
      FROM manual_analysis 
      WHERE createdAt >= datetime("now", "-${period} days")
    `);

    // Diagnosis accuracy over time
    const accuracyOverTime = await getAll(`
      SELECT 
        DATE(ai.createdAt) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN ai.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN ma.id IS NOT NULL THEN 1 END) as manualReviewed
      FROM ai_analysis ai
      LEFT JOIN manual_analysis ma ON ai.scanId = ma.scanId
      WHERE ai.createdAt >= datetime("now", "-${period} days")
      GROUP BY DATE(ai.createdAt)
      ORDER BY date ASC
    `);

    // Top diagnoses by frequency
    const topDiagnoses = await getAll(`
      SELECT 
        ma.diagnosis,
        COUNT(*) as frequency
      FROM manual_analysis ma
      WHERE ma.diagnosis IS NOT NULL 
        AND ma.createdAt >= datetime("now", "-${period} days")
      GROUP BY ma.diagnosis
      ORDER BY frequency DESC
      LIMIT 10
    `);

    res.status(200).json({
      status: 'success',
      data: {
        period: `${period} days`,
        aiAnalysis: {
          total: aiStats.total,
          completed: aiStats.completed,
          failed: aiStats.failed,
          processing: aiStats.processing,
          successRate: aiStats.total > 0 ? (aiStats.completed / aiStats.total * 100).toFixed(2) : 0,
          averageConfidence: aiStats.avgConfidence ? Math.round(aiStats.avgConfidence * 100) / 100 : 0,
          averageProcessingTime: aiStats.avgProcessingTime ? Math.round(aiStats.avgProcessingTime) : 0
        },
        manualAnalysis: {
          total: manualStats.total,
          withDiagnosis: manualStats.withDiagnosis,
          withRecommendations: manualStats.withRecommendations,
          completionRate: manualStats.total > 0 ? (manualStats.withDiagnosis / manualStats.total * 100).toFixed(2) : 0
        },
        accuracyOverTime,
        topDiagnoses
      }
    });
  } catch (error) {
    console.error('Get diagnosis stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching diagnosis statistics'
    });
  }
};

// Update diagnosis confidence
exports.updateDiagnosisConfidence = async (req, res) => {
  try {
    const { confidence, notes } = req.body;
    const diagnosisId = req.params.id;

    // Verify diagnosis exists
    const diagnosis = await getRow('SELECT id FROM ai_analysis WHERE id = ?', [diagnosisId]);
    if (!diagnosis) {
      return res.status(404).json({
        status: 'error',
        message: 'Diagnosis not found'
      });
    }

    // Update confidence
    await runQuery(
      'UPDATE ai_analysis SET confidence = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [confidence, diagnosisId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Diagnosis confidence updated successfully'
    });
  } catch (error) {
    console.error('Update diagnosis confidence error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating diagnosis confidence'
    });
  }
};

// Get diagnosis recommendations
exports.getDiagnosisRecommendations = async (req, res) => {
  try {
    const scanId = req.params.scanId;

    // Get AI recommendations
    const aiRecommendations = await getRow(
      'SELECT recommendations FROM ai_analysis WHERE scanId = ?',
      [scanId]
    );

    // Get manual recommendations
    const manualRecommendations = await getRow(
      'SELECT recommendations FROM manual_analysis WHERE scanId = ?',
      [scanId]
    );

    // Get scan info
    const scan = await getRow(
      'SELECT scanType, bodyPart FROM scans WHERE id = ?',
      [scanId]
    );

    if (!scan) {
      return res.status(404).json({
        status: 'error',
        message: 'Scan not found'
      });
    }

    // Combine recommendations
    const recommendations = {
      scan,
      ai: aiRecommendations?.recommendations || null,
      manual: manualRecommendations?.recommendations || null,
      combined: []
    };

    // Add AI recommendations
    if (aiRecommendations?.recommendations) {
      recommendations.combined.push({
        source: 'AI Analysis',
        recommendations: aiRecommendations.recommendations
      });
    }

    // Add manual recommendations
    if (manualRecommendations?.recommendations) {
      recommendations.combined.push({
        source: 'Radiologist Review',
        recommendations: manualRecommendations.recommendations
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        recommendations
      }
    });
  } catch (error) {
    console.error('Get diagnosis recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching diagnosis recommendations'
    });
  }
};
