const { getRow, getAll } = require('../config/database');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total patients
    const totalPatients = await getRow('SELECT COUNT(*) as count FROM patients WHERE isActive = 1');
    
    // Total scans
    const totalScans = await getRow('SELECT COUNT(*) as count FROM scans');
    
    // Pending scans
    const pendingScans = await getRow('SELECT COUNT(*) as count FROM scans WHERE status = "pending"');
    
    // Completed scans
    const completedScans = await getRow('SELECT COUNT(*) as count FROM scans WHERE status = "completed"');
    
    // AI analysis in progress
    const aiInProgress = await getRow('SELECT COUNT(*) as count FROM ai_analysis WHERE status = "processing"');
    
    // Total users
    const totalUsers = await getRow('SELECT COUNT(*) as count FROM users WHERE isActive = 1');
    
    // Recent scans (last 7 days)
    const recentScans = await getRow(
      'SELECT COUNT(*) as count FROM scans WHERE createdAt >= datetime("now", "-7 days")'
    );

    // Scans by type
    const scansByType = await getAll(`
      SELECT scanType, COUNT(*) as count 
      FROM scans 
      GROUP BY scanType 
      ORDER BY count DESC
    `);

    // Scans by priority
    const scansByPriority = await getAll(`
      SELECT priority, COUNT(*) as count 
      FROM scans 
      GROUP BY priority 
      ORDER BY count DESC
    `);

    // Recent activity (last 10 scans)
    const recentActivity = await getAll(`
      SELECT s.scanId, s.scanType, s.bodyPart, s.status, s.createdAt,
             p.firstName as patientFirstName, p.lastName as patientLastName,
             u.firstName as uploadedByFirstName, u.lastName as uploadedByLastName
      FROM scans s
      LEFT JOIN patients p ON s.patientId = p.id
      LEFT JOIN users u ON s.uploadedById = u.id
      ORDER BY s.createdAt DESC
      LIMIT 10
    `);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalPatients: totalPatients.count,
          totalScans: totalScans.count,
          pendingScans: pendingScans.count,
          completedScans: completedScans.count,
          aiInProgress: aiInProgress.count,
          totalUsers: totalUsers.count,
          recentScans: recentScans.count
        },
        scansByType,
        scansByPriority,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard statistics'
    });
  }
};

// Get scan statistics
exports.getScanStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    // Scans over time
    const scansOverTime = await getAll(`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM scans 
      WHERE createdAt >= datetime("now", "-${period} days")
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `);

    // Scans by status over time
    const scansByStatus = await getAll(`
      SELECT status, COUNT(*) as count
      FROM scans 
      WHERE createdAt >= datetime("now", "-${period} days")
      GROUP BY status
    `);

    // AI analysis success rate
    const aiSuccessRate = await getRow(`
      SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
        COUNT(*) as total
      FROM ai_analysis 
      WHERE createdAt >= datetime("now", "-${period} days")
    `);

    // Average processing time
    const avgProcessingTime = await getRow(`
      SELECT AVG(processingTime) as average
      FROM ai_analysis 
      WHERE status = 'completed' 
        AND processingTime IS NOT NULL
        AND createdAt >= datetime("now", "-${period} days")
    `);

    res.status(200).json({
      status: 'success',
      data: {
        period: `${period} days`,
        scansOverTime,
        scansByStatus,
        aiAnalysis: {
          successRate: aiSuccessRate.total > 0 ? (aiSuccessRate.successful / aiSuccessRate.total * 100).toFixed(2) : 0,
          total: aiSuccessRate.total,
          successful: aiSuccessRate.successful,
          averageProcessingTime: avgProcessingTime.average ? Math.round(avgProcessingTime.average) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get scan stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching scan statistics'
    });
  }
};

// Get patient statistics
exports.getPatientStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    // New patients over time
    const newPatientsOverTime = await getAll(`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM patients 
      WHERE createdAt >= datetime("now", "-${period} days") AND isActive = 1
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `);

    // Patients by gender
    const patientsByGender = await getAll(`
      SELECT gender, COUNT(*) as count
      FROM patients 
      WHERE isActive = 1
      GROUP BY gender
    `);

    // Age distribution
    const ageDistribution = await getAll(`
      SELECT 
        CASE 
          WHEN (julianday('now') - julianday(dateOfBirth)) / 365.25 < 18 THEN '0-17'
          WHEN (julianday('now') - julianday(dateOfBirth)) / 365.25 < 30 THEN '18-29'
          WHEN (julianday('now') - julianday(dateOfBirth)) / 365.25 < 50 THEN '30-49'
          WHEN (julianday('now') - julianday(dateOfBirth)) / 365.25 < 65 THEN '50-64'
          ELSE '65+'
        END as ageGroup,
        COUNT(*) as count
      FROM patients 
      WHERE isActive = 1
      GROUP BY ageGroup
      ORDER BY ageGroup
    `);

    // Top patients by scan count
    const topPatientsByScans = await getAll(`
      SELECT 
        p.firstName, p.lastName, p.patientId,
        COUNT(s.id) as scanCount
      FROM patients p
      LEFT JOIN scans s ON p.id = s.patientId
      WHERE p.isActive = 1
      GROUP BY p.id
      HAVING scanCount > 0
      ORDER BY scanCount DESC
      LIMIT 10
    `);

    res.status(200).json({
      status: 'success',
      data: {
        period: `${period} days`,
        newPatientsOverTime,
        patientsByGender,
        ageDistribution,
        topPatientsByScans
      }
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient statistics'
    });
  }
};

// Get user activity statistics
exports.getUserActivityStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    // User activity over time
    const userActivity = await getAll(`
      SELECT 
        u.firstName, u.lastName, u.role,
        COUNT(s.id) as scansUploaded,
        COUNT(ma.id) as analysesCompleted,
        u.lastLogin
      FROM users u
      LEFT JOIN scans s ON u.id = s.uploadedById AND s.createdAt >= datetime("now", "-${period} days")
      LEFT JOIN manual_analysis ma ON u.id = ma.radiologistId AND ma.createdAt >= datetime("now", "-${period} days")
      WHERE u.isActive = 1
      GROUP BY u.id
      ORDER BY scansUploaded DESC, analysesCompleted DESC
    `);

    // Role distribution
    const roleDistribution = await getAll(`
      SELECT role, COUNT(*) as count
      FROM users 
      WHERE isActive = 1
      GROUP BY role
    `);

    // Recent logins
    const recentLogins = await getAll(`
      SELECT firstName, lastName, role, lastLogin
      FROM users 
      WHERE isActive = 1 AND lastLogin IS NOT NULL
      ORDER BY lastLogin DESC
      LIMIT 10
    `);

    res.status(200).json({
      status: 'success',
      data: {
        period: `${period} days`,
        userActivity,
        roleDistribution,
        recentLogins
      }
    });
  } catch (error) {
    console.error('Get user activity stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user activity statistics'
    });
  }
};

// Get performance metrics
exports.getPerformanceMetrics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    // Scan processing time
    const scanProcessingTime = await getRow(`
      SELECT 
        AVG(CASE WHEN s.status = 'completed' THEN 
          (julianday(s.updatedAt) - julianday(s.createdAt)) * 24 * 60 
        END) as avgProcessingTimeMinutes,
        MIN(CASE WHEN s.status = 'completed' THEN 
          (julianday(s.updatedAt) - julianday(s.createdAt)) * 24 * 60 
        END) as minProcessingTimeMinutes,
        MAX(CASE WHEN s.status = 'completed' THEN 
          (julianday(s.updatedAt) - julianday(s.createdAt)) * 24 * 60 
        END) as maxProcessingTimeMinutes
      FROM scans s
      WHERE s.createdAt >= datetime("now", "-${period} days")
        AND s.status = 'completed'
    `);

    // AI vs Manual analysis comparison
    const analysisComparison = await getAll(`
      SELECT 
        'AI Analysis' as type,
        COUNT(*) as total,
        AVG(confidence) as avgConfidence,
        AVG(processingTime) as avgProcessingTime
      FROM ai_analysis 
      WHERE status = 'completed' 
        AND createdAt >= datetime("now", "-${period} days")
      UNION ALL
      SELECT 
        'Manual Analysis' as type,
        COUNT(*) as total,
        NULL as avgConfidence,
        NULL as avgProcessingTime
      FROM manual_analysis 
      WHERE createdAt >= datetime("now", "-${period} days")
    `);

    // Error rates
    const errorRates = await getRow(`
      SELECT 
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as aiFailures,
        COUNT(*) as aiTotal
      FROM ai_analysis 
      WHERE createdAt >= datetime("now", "-${period} days")
    `);

    res.status(200).json({
      status: 'success',
      data: {
        period: `${period} days`,
        scanProcessingTime: {
          average: Math.round(scanProcessingTime.avgProcessingTimeMinutes || 0),
          minimum: Math.round(scanProcessingTime.minProcessingTimeMinutes || 0),
          maximum: Math.round(scanProcessingTime.maxProcessingTimeMinutes || 0)
        },
        analysisComparison,
        errorRates: {
          aiFailureRate: errorRates.aiTotal > 0 ? (errorRates.aiFailures / errorRates.aiTotal * 100).toFixed(2) : 0,
          totalAI: errorRates.aiTotal,
          failures: errorRates.aiFailures
        }
      }
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching performance metrics'
    });
  }
};
