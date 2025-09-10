const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

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

// Helper function to run queries with promises
const runQuery = (sql, params = []) => {
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
const getRow = (sql, params = []) => {
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

// Initialize database tables
const initDatabase = () => {
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
                bcrypt.hash('admin123', 12).then((hash) => {
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

async function setupDatabase() {
    try {
        console.log('🔧 Initializing database...');
        await initDatabase();
        console.log('✅ Database initialized successfully!');
        
        // Wait a moment for tables to be created
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if sample data already exists
        const existingPatients = await getRow('SELECT COUNT(*) as count FROM patients');
        const existingScans = await getRow('SELECT COUNT(*) as count FROM scans');
        
        if (existingPatients?.count > 0 || existingScans?.count > 0) {
            console.log('ℹ️  Sample data already exists');
            db.close();
            return;
        }

        console.log('📝 Creating comprehensive test data...');

        // Create sample users
        const users = [
            {
                email: 'doctor.smith@intellidiag.com',
                password: await bcrypt.hash('password123', 12),
                firstName: 'John',
                lastName: 'Smith',
                role: 'doctor',
                specialization: 'Cardiology'
            },
            {
                email: 'radiologist.jones@intellidiag.com',
                password: await bcrypt.hash('password123', 12),
                firstName: 'Sarah',
                lastName: 'Jones',
                role: 'radiologist',
                specialization: 'Neuroradiology'
            },
            {
                email: 'doctor.wilson@intellidiag.com',
                password: await bcrypt.hash('password123', 12),
                firstName: 'Michael',
                lastName: 'Wilson',
                role: 'doctor',
                specialization: 'Orthopedics'
            },
            {
                email: 'radiologist.brown@intellidiag.com',
                password: await bcrypt.hash('password123', 12),
                firstName: 'Emily',
                lastName: 'Brown',
                role: 'radiologist',
                specialization: 'Chest Radiology'
            }
        ];

        const userIds = [];
        for (const user of users) {
            const result = await runQuery(
                'INSERT INTO users (email, password, firstName, lastName, role, specialization) VALUES (?, ?, ?, ?, ?, ?)',
                [user.email, user.password, user.firstName, user.lastName, user.role, user.specialization]
            );
            userIds.push(result.id);
        }
        console.log(`✅ Created ${users.length} users`);

        // Create sample patients
        const patients = [
            {
                patientId: 'P001',
                firstName: 'Emma',
                lastName: 'Johnson',
                dateOfBirth: '1985-03-15',
                gender: 'female',
                contactNumber: '+1234567890',
                email: 'emma.johnson@email.com',
                assignedDoctorId: userIds[0]
            },
            {
                patientId: 'P002',
                firstName: 'David',
                lastName: 'Brown',
                dateOfBirth: '1978-07-22',
                gender: 'male',
                contactNumber: '+1234567891',
                email: 'david.brown@email.com',
                assignedDoctorId: userIds[0]
            },
            {
                patientId: 'P003',
                firstName: 'Sarah',
                lastName: 'Davis',
                dateOfBirth: '1992-11-08',
                gender: 'female',
                contactNumber: '+1234567892',
                email: 'sarah.davis@email.com',
                assignedDoctorId: userIds[2]
            },
            {
                patientId: 'P004',
                firstName: 'Michael',
                lastName: 'Chen',
                dateOfBirth: '1980-05-12',
                gender: 'male',
                contactNumber: '+1234567893',
                email: 'michael.chen@email.com',
                assignedDoctorId: userIds[2]
            },
            {
                patientId: 'P005',
                firstName: 'Lisa',
                lastName: 'Wilson',
                dateOfBirth: '1988-09-30',
                gender: 'female',
                contactNumber: '+1234567894',
                email: 'lisa.wilson@email.com',
                assignedDoctorId: userIds[0]
            },
            {
                patientId: 'P006',
                firstName: 'Robert',
                lastName: 'Taylor',
                dateOfBirth: '1975-12-03',
                gender: 'male',
                contactNumber: '+1234567895',
                email: 'robert.taylor@email.com',
                assignedDoctorId: userIds[1]
            },
            {
                patientId: 'P007',
                firstName: 'Jennifer',
                lastName: 'Anderson',
                dateOfBirth: '1990-04-18',
                gender: 'female',
                contactNumber: '+1234567896',
                email: 'jennifer.anderson@email.com',
                assignedDoctorId: userIds[1]
            },
            {
                patientId: 'P008',
                firstName: 'James',
                lastName: 'Martinez',
                dateOfBirth: '1983-08-25',
                gender: 'male',
                contactNumber: '+1234567897',
                email: 'james.martinez@email.com',
                assignedDoctorId: userIds[3]
            }
        ];

        const patientIds = [];
        for (const patient of patients) {
            const result = await runQuery(
                'INSERT INTO patients (patientId, firstName, lastName, dateOfBirth, gender, contactNumber, email, assignedDoctorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [patient.patientId, patient.firstName, patient.lastName, patient.dateOfBirth, patient.gender, patient.contactNumber, patient.email, patient.assignedDoctorId]
            );
            patientIds.push(result.id);
        }
        console.log(`✅ Created ${patients.length} patients`);

        // Create comprehensive sample scans with various types and statuses
        const scans = [
            // Today's scans (for "Today's Inference" metric)
            {
                scanId: 'SCAN-001',
                patientId: patientIds[0],
                scanType: 'X-Ray',
                bodyPart: 'Chest',
                scanDate: new Date().toISOString().split('T')[0], // Today
                uploadedById: userIds[0],
                priority: 'medium',
                status: 'completed',
                notes: 'Routine chest X-ray for respiratory assessment'
            },
            {
                scanId: 'SCAN-002',
                patientId: patientIds[1],
                scanType: 'MRI',
                bodyPart: 'Brain',
                scanDate: new Date().toISOString().split('T')[0], // Today
                uploadedById: userIds[1],
                priority: 'high',
                status: 'completed',
                notes: 'Brain MRI for neurological evaluation'
            },
            {
                scanId: 'SCAN-003',
                patientId: patientIds[2],
                scanType: 'CT',
                bodyPart: 'Spine',
                scanDate: new Date().toISOString().split('T')[0], // Today
                uploadedById: userIds[2],
                priority: 'medium',
                status: 'analyzing',
                notes: 'Spine CT for back pain assessment'
            },
            {
                scanId: 'SCAN-004',
                patientId: patientIds[3],
                scanType: 'X-Ray',
                bodyPart: 'Knee',
                scanDate: new Date().toISOString().split('T')[0], // Today
                uploadedById: userIds[2],
                priority: 'low',
                status: 'pending',
                notes: 'Knee X-ray for injury evaluation'
            },
            {
                scanId: 'SCAN-005',
                patientId: patientIds[4],
                scanType: 'Ultrasound',
                bodyPart: 'Abdomen',
                scanDate: new Date().toISOString().split('T')[0], // Today
                uploadedById: userIds[0],
                priority: 'urgent',
                status: 'pending',
                notes: 'Abdominal ultrasound for pain assessment'
            },
            {
                scanId: 'SCAN-006',
                patientId: patientIds[0],
                scanType: 'CT',
                bodyPart: 'Chest',
                scanDate: new Date().toISOString().split('T')[0], // Today
                uploadedById: userIds[0],
                priority: 'high',
                status: 'completed',
                notes: 'Chest CT for detailed lung assessment'
            },
            {
                scanId: 'SCAN-007',
                patientId: patientIds[1],
                scanType: 'MRI',
                bodyPart: 'Spine',
                scanDate: new Date().toISOString().split('T')[0], // Today
                uploadedById: userIds[1],
                priority: 'medium',
                status: 'analyzing',
                notes: 'Spine MRI for detailed evaluation'
            },
            // Recent scans (not today)
            {
                scanId: 'SCAN-008',
                patientId: patientIds[5],
                scanType: 'X-Ray',
                bodyPart: 'Chest',
                scanDate: '2024-01-20',
                uploadedById: userIds[1],
                priority: 'medium',
                status: 'completed',
                notes: 'Follow-up chest X-ray'
            },
            {
                scanId: 'SCAN-009',
                patientId: patientIds[6],
                scanType: 'MRI',
                bodyPart: 'Brain',
                scanDate: '2024-01-19',
                uploadedById: userIds[1],
                priority: 'high',
                status: 'completed',
                notes: 'Brain MRI for headache evaluation'
            },
            {
                scanId: 'SCAN-010',
                patientId: patientIds[7],
                scanType: 'CT',
                bodyPart: 'Abdomen',
                scanDate: '2024-01-18',
                uploadedById: userIds[3],
                priority: 'urgent',
                status: 'completed',
                notes: 'Abdominal CT for acute pain'
            }
        ];

        const scanIds = [];
        for (const scan of scans) {
            const result = await runQuery(
                'INSERT INTO scans (scanId, patientId, scanType, bodyPart, scanDate, uploadedById, priority, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [scan.scanId, scan.patientId, scan.scanType, scan.bodyPart, scan.scanDate, scan.uploadedById, scan.priority, scan.status, scan.notes]
            );
            scanIds.push(result.id);
        }
        console.log(`✅ Created ${scans.length} scans`);

        // Create comprehensive AI analysis with realistic processing times
        const aiAnalyses = [
            {
                scanId: scanIds[0],
                status: 'completed',
                confidence: 94.5,
                findings: 'Normal cardiac silhouette, clear lung fields, no evidence of pneumonia or pleural effusion',
                recommendations: 'No immediate intervention required. Follow up in 6 months for routine assessment.',
                processingTime: 2300, // 2.3 seconds
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[1],
                status: 'completed',
                confidence: 91.2,
                findings: 'Normal brain parenchyma, no mass lesions or hemorrhage detected',
                recommendations: 'Normal brain MRI. Continue current treatment plan.',
                processingTime: 4700, // 4.7 seconds
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[2],
                status: 'processing',
                confidence: 0,
                findings: '',
                recommendations: '',
                processingTime: 0,
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[5],
                status: 'completed',
                confidence: 88.7,
                findings: 'Mild emphysematous changes in upper lobes, no acute findings',
                recommendations: 'Consider pulmonary function tests. Smoking cessation counseling recommended.',
                processingTime: 3100, // 3.1 seconds
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[6],
                status: 'processing',
                confidence: 0,
                findings: '',
                recommendations: '',
                processingTime: 0,
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[7],
                status: 'completed',
                confidence: 96.3,
                findings: 'Clear lung fields, no evidence of pneumonia or pleural effusion',
                recommendations: 'Normal chest X-ray findings.',
                processingTime: 1800, // 1.8 seconds
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[8],
                status: 'completed',
                confidence: 89.1,
                findings: 'Small enhancing lesion in right frontal lobe, no mass effect',
                recommendations: 'Follow-up MRI recommended in 3 months to assess stability.',
                processingTime: 5200, // 5.2 seconds
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[9],
                status: 'completed',
                confidence: 92.8,
                findings: 'Appendicitis confirmed, no perforation detected',
                recommendations: 'Surgical consultation recommended for appendectomy.',
                processingTime: 2900, // 2.9 seconds
                modelVersion: 'v2.1'
            }
        ];

        for (const analysis of aiAnalyses) {
            await runQuery(
                'INSERT INTO ai_analysis (scanId, status, confidence, findings, recommendations, processingTime, modelVersion) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [analysis.scanId, analysis.status, analysis.confidence, analysis.findings, analysis.recommendations, analysis.processingTime, analysis.modelVersion]
            );
        }
        console.log(`✅ Created ${aiAnalyses.length} AI analyses`);

        console.log('\n🎉 Comprehensive database setup completed successfully!');
        console.log('\n📊 Dashboard Metrics Preview:');
        console.log('- Today\'s Inferences: 7 (from today\'s scans)');
        console.log('- Avg Inference Time: ~3.1s (calculated from processing times)');
        console.log('- Critical Cases: 2 (urgent priority scans)');
        console.log('- Total Patients: 8');
        console.log('- Total Scans: 10');
        console.log('- AI Models: 4 (X-Ray, MRI, CT, Ultrasound)');
        
        console.log('\n📋 Login Credentials:');
        console.log('- Admin: admin@intellidiag.com / admin123');
        console.log('- Doctor: doctor.smith@intellidiag.com / password123');
        console.log('- Radiologist: radiologist.jones@intellidiag.com / password123');
        console.log('\n🚀 Start the development server with: npm run dev');
        
        // Close database connection
        db.close();
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure you have Node.js installed');
        console.log('2. Run "npm install" to install dependencies');
        console.log('3. Check that the data directory is writable');
        db.close();
    }
}

setupDatabase();
