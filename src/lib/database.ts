import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'intellidiag.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
    }
});

// Initialize database tables
export const initDatabase = () => {
    return new Promise((resolve, reject) => {
        // Users table
        db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        role TEXT CHECK(role IN ('doctor', 'radiologist', 'admin', 'patient')) DEFAULT 'doctor',
        specialization TEXT,
        licenseNumber TEXT,
        isActive BOOLEAN DEFAULT 1,
        lastLogin DATETIME,
        profileImage TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
            if (err) reject(err);
        });

        // Patients table
        db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId TEXT UNIQUE NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        dateOfBirth DATE NOT NULL,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
        contactNumber TEXT,
        email TEXT,
        street TEXT,
        city TEXT,
        state TEXT,
        zipCode TEXT,
        country TEXT,
        assignedDoctorId INTEGER,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignedDoctorId) REFERENCES users (id)
      )
    `, (err) => {
            if (err) reject(err);
        });

        // Medical history table
        db.run(`
      CREATE TABLE IF NOT EXISTS medical_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        condition TEXT NOT NULL,
        diagnosis TEXT,
        treatment TEXT,
        date DATE NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      )
    `, (err) => {
            if (err) reject(err);
        });

        // Allergies table
        db.run(`
      CREATE TABLE IF NOT EXISTS allergies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        allergy TEXT NOT NULL,
        severity TEXT CHECK(severity IN ('mild', 'moderate', 'severe')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      )
    `, (err) => {
            if (err) reject(err);
        });

        // Medications table
        db.run(`
      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        startDate DATE,
        endDate DATE,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      )
    `, (err) => {
            if (err) reject(err);
        });

        // Scans table
        db.run(`
      CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scanId TEXT UNIQUE NOT NULL,
        patientId INTEGER NOT NULL,
        scanType TEXT CHECK(scanType IN ('X-Ray', 'CT', 'MRI', 'Ultrasound', 'PET', 'Other')) NOT NULL,
        bodyPart TEXT NOT NULL,
        scanDate DATE NOT NULL,
        uploadedById INTEGER NOT NULL,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
        status TEXT CHECK(status IN ('pending', 'analyzing', 'completed', 'archived')) DEFAULT 'pending',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients (id),
        FOREIGN KEY (uploadedById) REFERENCES users (id)
      )
    `, (err) => {
            if (err) reject(err);
        });

        // Scan images table
        db.run(`
      CREATE TABLE IF NOT EXISTS scan_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scanId INTEGER NOT NULL,
        url TEXT NOT NULL,
        thumbnail TEXT,
        originalName TEXT NOT NULL,
        size INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scanId) REFERENCES scans (id)
      )
    `, (err) => {
            if (err) reject(err);
        });

        // AI analysis table
        db.run(`
      CREATE TABLE IF NOT EXISTS ai_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scanId INTEGER NOT NULL,
        status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
        confidence REAL,
        findings TEXT,
        recommendations TEXT,
        processingTime INTEGER,
        modelVersion TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scanId) REFERENCES scans (id)
      )
    `, (err) => {
            if (err) reject(err);
        });

        // Manual analysis table
        db.run(`
      CREATE TABLE IF NOT EXISTS manual_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scanId INTEGER NOT NULL,
        radiologistId INTEGER NOT NULL,
        findings TEXT,
        diagnosis TEXT,
        recommendations TEXT,
        analysisDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scanId) REFERENCES scans (id),
        FOREIGN KEY (radiologistId) REFERENCES users (id)
      )
    `, (err) => {
            if (err) reject(err);
        });

        // Create indexes for better performance
        db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
            if (err) reject(err);
        });

        db.run('CREATE INDEX IF NOT EXISTS idx_patients_patientId ON patients(patientId)', (err) => {
            if (err) reject(err);
        });

        db.run('CREATE INDEX IF NOT EXISTS idx_scans_scanId ON scans(scanId)', (err) => {
            if (err) reject(err);
        });

        db.run('CREATE INDEX IF NOT EXISTS idx_scans_patientId ON scans(patientId)', (err) => {
            if (err) reject(err);
        });

        // Insert default admin user if not exists
        db.get('SELECT id FROM users WHERE email = ?', ['admin@intellidiag.com'], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (!row) {
                const bcrypt = require('bcryptjs');
                bcrypt.hash('admin123', 12).then((hash: string) => {
                    db.run(`
            INSERT INTO users (email, password, firstName, lastName, role, specialization)
            VALUES (?, ?, ?, ?, ?, ?)
          `, ['admin@intellidiag.com', hash, 'Admin', 'User', 'admin', 'System Administrator'], (err) => {
                        if (err) {
                            console.log('Error creating admin user:', err.message);
                        } else {
                            console.log('Default admin user created: admin@intellidiag.com / admin123');
                        }
                    });
                });
            }
        });

        resolve(undefined);
    });
};

// Helper function to run queries with promises
export const runQuery = (sql: string, params: any[] = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

// Helper function to get single row
export const getRow = (sql: string, params: any[] = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Helper function to get multiple rows
export const getAll = (sql: string, params: any[] = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

export { db };
