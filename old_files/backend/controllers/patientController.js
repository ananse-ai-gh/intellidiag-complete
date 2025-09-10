const { validationResult } = require('express-validator');
const { runQuery, getRow, getAll } = require('../config/database');

// Get all patients with pagination and filtering
exports.getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build filter conditions
    let whereClause = 'WHERE p.isActive = 1';
    let params = [];

    if (req.query.search) {
      whereClause += ' AND (p.firstName LIKE ? OR p.lastName LIKE ? OR p.patientId LIKE ?)';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (req.query.gender) {
      whereClause += ' AND p.gender = ?';
      params.push(req.query.gender);
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total FROM patients p ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get patients with doctor info
    const patients = await getAll(
      `SELECT p.*, 
              u.firstName as doctorFirstName, 
              u.lastName as doctorLastName, 
              u.email as doctorEmail
       FROM patients p 
       LEFT JOIN users u ON p.assignedDoctorId = u.id 
       ${whereClause}
       ORDER BY p.createdAt DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.status(200).json({
      status: 'success',
      data: {
        patients,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPatients: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patients'
    });
  }
};

// Get single patient with related data
exports.getPatient = async (req, res) => {
  try {
    const patient = await getRow(
      `SELECT p.*, 
              u.firstName as doctorFirstName, 
              u.lastName as doctorLastName, 
              u.email as doctorEmail,
              u.specialization as doctorSpecialization
       FROM patients p 
       LEFT JOIN users u ON p.assignedDoctorId = u.id 
       WHERE p.id = ? AND p.isActive = 1`,
      [req.params.id]
    );

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Get medical history
    const medicalHistory = await getAll(
      'SELECT * FROM medical_history WHERE patientId = ? ORDER BY date DESC',
      [req.params.id]
    );

    // Get allergies
    const allergies = await getAll(
      'SELECT * FROM allergies WHERE patientId = ?',
      [req.params.id]
    );

    // Get medications
    const medications = await getAll(
      'SELECT * FROM medications WHERE patientId = ? AND isActive = 1 ORDER BY startDate DESC',
      [req.params.id]
    );

    // Combine all data
    const patientData = {
      ...patient,
      medicalHistory,
      allergies: allergies.map(a => a.allergy),
      medications
    };

    res.status(200).json({
      status: 'success',
      data: {
        patient: patientData
      }
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient'
    });
  }
};

// Create new patient
exports.createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const {
      firstName, lastName, dateOfBirth, gender, contactNumber, email,
      street, city, state, zipCode, country, assignedDoctorId
    } = req.body;

    // Generate patient ID
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const patientId = `P${year}${randomNum}`;

    // Insert patient
    const result = await runQuery(
      `INSERT INTO patients (
        patientId, firstName, lastName, dateOfBirth, gender, contactNumber, email,
        street, city, state, zipCode, country, assignedDoctorId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, firstName, lastName, dateOfBirth, gender, contactNumber, email,
       street, city, state, zipCode, country, assignedDoctorId]
    );

    // Get the created patient
    const patient = await getRow('SELECT * FROM patients WHERE id = ?', [result.id]);

    res.status(201).json({
      status: 'success',
      data: {
        patient
      }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating patient'
    });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
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
      if (key !== 'id' && key !== 'patientId') {
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

    const sql = `UPDATE patients SET ${updateFields.join(', ')} WHERE id = ?`;
    await runQuery(sql, params);

    // Get updated patient
    const patient = await getRow('SELECT * FROM patients WHERE id = ?', [req.params.id]);

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient
      }
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating patient'
    });
  }
};

// Delete patient (soft delete)
exports.deletePatient = async (req, res) => {
  try {
    const result = await runQuery(
      'UPDATE patients SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting patient'
    });
  }
};

// Add medical history entry
exports.addMedicalHistory = async (req, res) => {
  try {
    const { condition, diagnosis, treatment, date } = req.body;
    const patientId = req.params.id;

    // Verify patient exists
    const patient = await getRow('SELECT id FROM patients WHERE id = ? AND isActive = 1', [patientId]);
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    const result = await runQuery(
      'INSERT INTO medical_history (patientId, condition, diagnosis, treatment, date) VALUES (?, ?, ?, ?, ?)',
      [patientId, condition, diagnosis, treatment, date]
    );

    const medicalEntry = await getRow('SELECT * FROM medical_history WHERE id = ?', [result.id]);

    res.status(201).json({
      status: 'success',
      data: {
        medicalEntry
      }
    });
  } catch (error) {
    console.error('Add medical history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding medical history'
    });
  }
};

// Add allergy
exports.addAllergy = async (req, res) => {
  try {
    const { allergy, severity } = req.body;
    const patientId = req.params.id;

    // Verify patient exists
    const patient = await getRow('SELECT id FROM patients WHERE id = ? AND isActive = 1', [patientId]);
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    const result = await runQuery(
      'INSERT INTO allergies (patientId, allergy, severity) VALUES (?, ?, ?)',
      [patientId, allergy, severity]
    );

    const allergyEntry = await getRow('SELECT * FROM allergies WHERE id = ?', [result.id]);

    res.status(201).json({
      status: 'success',
      data: {
        allergyEntry
      }
    });
  } catch (error) {
    console.error('Add allergy error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding allergy'
    });
  }
};

// Add medication
exports.addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, startDate, endDate } = req.body;
    const patientId = req.params.id;

    // Verify patient exists
    const patient = await getRow('SELECT id FROM patients WHERE id = ? AND isActive = 1', [patientId]);
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    const result = await runQuery(
      'INSERT INTO medications (patientId, name, dosage, frequency, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?)',
      [patientId, name, dosage, frequency, startDate, endDate]
    );

    const medicationEntry = await getRow('SELECT * FROM medications WHERE id = ?', [result.id]);

    res.status(201).json({
      status: 'success',
      data: {
        medicationEntry
      }
    });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding medication'
    });
  }
};
