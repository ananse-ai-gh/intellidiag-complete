#!/bin/bash

echo "🚀 Setting up IntelliDiag Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p uploads

# Copy environment file
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Initialize database
echo "🗄️  Initializing database..."
npm run db:init

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the server: npm run dev"
echo "3. Access the API at: http://localhost:5000"
echo "4. Check health: http://localhost:5000/api/health"
echo ""
echo "🔑 Default admin credentials:"
echo "   Email: admin@intellidiag.com"
echo "   Password: admin123"
echo ""
echo "🌐 Frontend should be running at: http://localhost:3000"
