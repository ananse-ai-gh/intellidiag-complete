const { initDatabase } = require('../src/lib/database');
const https = require('https');
const http = require('http');

// Simple HTTP client for making requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

async function setupDashboard() {
    try {
        console.log('Initializing database...');
        await initDatabase();
        console.log('Database initialized successfully!');
        
        console.log('Setting up sample data...');
        try {
            const response = await makeRequest('http://localhost:3000/api/init/sample-data', {
                method: 'POST',
                body: {}
            });
            
            console.log('Sample data setup result:', response.data);
            
            if (response.data.status === 'success') {
                console.log('✅ Sample data created successfully!');
                console.log(`   - ${response.data.data.usersCreated} users created`);
                console.log(`   - ${response.data.data.patientsCreated} patients created`);
                console.log(`   - ${response.data.data.scansCreated} scans created`);
                console.log(`   - ${response.data.data.aiAnalysesCreated} AI analyses created`);
            } else if (response.data.status === 'info') {
                console.log('ℹ️  Sample data already exists');
            } else {
                console.log('❌ Error creating sample data:', response.data.message);
            }
        } catch (error) {
            console.log('❌ Could not connect to the API server. Make sure the development server is running.');
            console.log('   Run: npm run dev');
            console.log('   Then try this setup script again.');
            return;
        }
        
        console.log('\n🎉 Dashboard setup completed!');
        console.log('\nYou can now access the dashboard with:');
        console.log('- Admin: admin@intellidiag.com / admin123');
        console.log('- Doctor: doctor.smith@intellidiag.com / password123');
        console.log('- Radiologist: radiologist.jones@intellidiag.com / password123');
        console.log('\nMake sure to start the development server with: npm run dev');
        
    } catch (error) {
        console.error('❌ Error setting up dashboard:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Make sure you have Node.js installed');
        console.log('2. Run "npm install" to install dependencies');
        console.log('3. Start the development server with "npm run dev"');
        console.log('4. Then run this setup script again');
    }
}

setupDashboard();
