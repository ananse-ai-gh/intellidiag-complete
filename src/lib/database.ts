import sqlite3 from 'sqlite3';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// Database configuration
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
const usePostgres = isProduction && isVercel && process.env.POSTGRES_URL;

// Lazy-loaded database connections
let sqliteDb: sqlite3.Database | null = null;
let postgresPool: Pool | null = null;

// Initialize SQLite database (lazy loading)
const initSQLite = () => {
  if (sqliteDb) return sqliteDb;
  
  // Don't initialize during build time
  if (isBuildTime) {
    console.log('Skipping SQLite initialization during build time');
    return null;
  }
  
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const dbPath = path.join(dataDir, 'intellidiag.db');
  
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err.message);
    } else {
      console.log('Connected to SQLite database at:', dbPath);
      sqliteDb?.run('PRAGMA foreign_keys = ON');
    }
  });
  
  return sqliteDb;
};

// Initialize PostgreSQL connection (lazy loading)
const initPostgres = () => {
  if (postgresPool) return postgresPool;
  
  // Don't initialize during build time
  if (isBuildTime) {
    console.log('Skipping PostgreSQL initialization during build time');
    return null;
  }
  
  postgresPool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  console.log('Connected to PostgreSQL database');
  return postgresPool;
};

// Get the appropriate database connection
const getDb = () => {
  if (usePostgres) {
    return initPostgres();
  } else {
    return initSQLite();
  }
};

// Initialize database tables
export const initDatabase = async () => {
  // Don't initialize during build time
  if (isBuildTime) {
    console.log('Skipping database initialization during build time');
    return Promise.resolve();
  }
  
  if (usePostgres) {
    return initPostgresDatabase();
  } else {
    return initSQLiteDatabase();
  }
};

// SQLite database initialization
const initSQLiteDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = initSQLite();
    if (!db) {
      resolve(undefined);
      return;
    }

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

    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
      if (err) reject(err);
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_patients_patientId ON patients(patientId)', (err) => {
      if (err) reject(err);
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_scans_scanId ON scans(scanId)', (err) => {
      if (err) reject(err);
    });

    // Insert default admin user
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

// PostgreSQL database initialization
const initPostgresDatabase = async () => {
  const pool = initPostgres();
  if (!pool) {
    return Promise.resolve();
  }
  
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        role TEXT CHECK(role IN ('doctor', 'radiologist', 'admin', 'patient')) DEFAULT 'doctor',
        specialization TEXT,
        licenseNumber TEXT,
        isActive BOOLEAN DEFAULT true,
        lastLogin TIMESTAMP,
        profileImage TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Patients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
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
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignedDoctorId) REFERENCES users (id)
      )
    `);

    // Scans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        scanId TEXT UNIQUE NOT NULL,
        patientId INTEGER NOT NULL,
        scanType TEXT CHECK(scanType IN ('X-Ray', 'CT', 'MRI', 'Ultrasound', 'PET', 'Other')) NOT NULL,
        bodyPart TEXT NOT NULL,
        scanDate DATE NOT NULL,
        uploadedById INTEGER NOT NULL,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
        status TEXT CHECK(status IN ('pending', 'analyzing', 'completed', 'archived')) DEFAULT 'pending',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients (id),
        FOREIGN KEY (uploadedById) REFERENCES users (id)
      )
    `);

    // AI analysis table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_analysis (
        id SERIAL PRIMARY KEY,
        scanId INTEGER NOT NULL,
        status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
        confidence REAL,
        findings TEXT,
        recommendations TEXT,
        processingTime INTEGER,
        modelVersion TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scanId) REFERENCES scans (id)
      )
    `);

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_patients_patientId ON patients(patientId)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_scans_scanId ON scans(scanId)');

    // Insert default admin user
    const adminUser = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@intellidiag.com']);
    
    if (adminUser.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin123', 12);
      
      await pool.query(`
        INSERT INTO users (email, password, firstName, lastName, role, specialization)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['admin@intellidiag.com', hash, 'Admin', 'User', 'admin', 'System Administrator']);
      
      console.log('Default admin user created: admin@intellidiag.com / admin123');
    }

    console.log('PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
    throw error;
  }
};

// Unified query functions
export const runQuery = async (sql: string, params: any[] = []) => {
  if (isBuildTime) {
    throw new Error('Database operations not available during build time');
  }
  
  if (usePostgres) {
    const pool = getDb() as Pool;
    if (!pool) throw new Error('PostgreSQL not available');
    const result = await pool.query(sql, params);
    return { id: result.rows[0]?.id || 0, changes: result.rowCount || 0 };
  } else {
    const db = getDb() as sqlite3.Database;
    if (!db) throw new Error('SQLite not available');
    return new Promise<{ id: number; changes: number }>((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }
};

export const getRow = async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
  if (isBuildTime) {
    throw new Error('Database operations not available during build time');
  }
  
  if (usePostgres) {
    const pool = getDb() as Pool;
    if (!pool) throw new Error('PostgreSQL not available');
    const result = await pool.query(sql, params);
    return result.rows[0] as T || null;
  } else {
    const db = getDb() as sqlite3.Database;
    if (!db) throw new Error('SQLite not available');
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }
};

export const getAll = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  if (isBuildTime) {
    throw new Error('Database operations not available during build time');
  }
  
  if (usePostgres) {
    const pool = getDb() as Pool;
    if (!pool) throw new Error('PostgreSQL not available');
    const result = await pool.query(sql, params);
    return result.rows as T[];
  } else {
    const db = getDb() as sqlite3.Database;
    if (!db) throw new Error('SQLite not available');
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }
};

// Export database connection for compatibility (lazy loaded)
export const db = getDb();