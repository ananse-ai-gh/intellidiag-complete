const { initDatabase, db } = require('../config/database');

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing IntelliDiag SQLite database...');
    await initDatabase();
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - patients');
    console.log('   - medical_history');
    console.log('   - allergies');
    console.log('   - medications');
    console.log('   - scans');
    console.log('   - scan_images');
    console.log('   - ai_analysis');
    console.log('   - manual_analysis');
    console.log('');
    console.log('🔑 Default admin user created:');
    console.log('   Email: admin@intellidiag.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('📁 Database file location: backend/data/intellidiag.db');
    console.log('');
    console.log('🎯 You can now start the server with: npm run dev');
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('🔒 Database connection closed.');
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
};

initializeDatabase();
