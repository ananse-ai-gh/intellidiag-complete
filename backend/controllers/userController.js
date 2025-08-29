const { validationResult } = require('express-validator');
const { runQuery, getRow, getAll } = require('../config/database');

// Get all users with pagination and filtering
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build filter conditions
    let whereClause = 'WHERE isActive = 1';
    let params = [];

    if (req.query.search) {
      whereClause += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (req.query.role) {
      whereClause += ' AND role = ?';
      params.push(req.query.role);
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get users
    const users = await getAll(
      `SELECT id, email, firstName, lastName, role, specialization, licenseNumber, 
              isActive, lastLogin, createdAt 
       FROM users 
       ${whereClause}
       ORDER BY createdAt DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users'
    });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await getRow(
      'SELECT id, email, firstName, lastName, role, specialization, licenseNumber, isActive, lastLogin, createdAt FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user'
    });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, role, specialization, licenseNumber } = req.body;

    // Check if user already exists
    const existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const result = await runQuery(
      'INSERT INTO users (email, password, firstName, lastName, role, specialization, licenseNumber) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, role, specialization, licenseNumber]
    );

    // Get the created user
    const user = await getRow(
      'SELECT id, email, firstName, lastName, role, specialization, licenseNumber, isActive, createdAt FROM users WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating user'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const updateFields = [];
    const params = [];

    // Build dynamic update query
    Object.keys(req.body).forEach(key => {
      if (key !== 'id' && key !== 'password' && key !== 'email') {
        updateFields.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    updateFields.push('updatedAt = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await runQuery(sql, params);

    // Get updated user
    const user = await getRow(
      'SELECT id, email, firstName, lastName, role, specialization, licenseNumber, isActive, lastLogin, createdAt FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating user'
    });
  }
};

// Deactivate user
exports.deactivateUser = async (req, res) => {
  try {
    const result = await runQuery(
      'UPDATE users SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deactivating user'
    });
  }
};

// Reactivate user
exports.reactivateUser = async (req, res) => {
  try {
    const result = await runQuery(
      'UPDATE users SET isActive = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error reactivating user'
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verify user exists
    const user = await getRow('SELECT id, firstName, lastName, role FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get scans uploaded by user
    const scansUploaded = await getRow(
      'SELECT COUNT(*) as count FROM scans WHERE uploadedById = ?',
      [userId]
    );

    // Get manual analyses completed by user
    const analysesCompleted = await getRow(
      'SELECT COUNT(*) as count FROM manual_analysis WHERE radiologistId = ?',
      [userId]
    );

    // Get recent activity
    const recentScans = await getAll(
      `SELECT scanId, scanType, bodyPart, status, createdAt
       FROM scans 
       WHERE uploadedById = ? 
       ORDER BY createdAt DESC 
       LIMIT 5`,
      [userId]
    );

    const recentAnalyses = await getAll(
      `SELECT s.scanId, s.scanType, s.bodyPart, ma.analysisDate
       FROM manual_analysis ma
       LEFT JOIN scans s ON ma.scanId = s.id
       WHERE ma.radiologistId = ? 
       ORDER BY ma.analysisDate DESC 
       LIMIT 5`,
      [userId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user,
          scansUploaded: scansUploaded.count,
          analysesCompleted: analysesCompleted.count
        },
        recentScans,
        recentAnalyses
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user statistics'
    });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await getRow(
      'SELECT COUNT(*) as total FROM users WHERE role = ? AND isActive = 1',
      [role]
    );
    const total = countResult.total;

    // Get users
    const users = await getAll(
      `SELECT id, email, firstName, lastName, role, specialization, licenseNumber, 
              isActive, lastLogin, createdAt 
       FROM users 
       WHERE role = ? AND isActive = 1
       ORDER BY createdAt DESC 
       LIMIT ? OFFSET ?`,
      [role, limit, offset]
    );

    res.status(200).json({
      status: 'success',
      data: {
        role,
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users by role'
    });
  }
};
