#!/bin/bash

echo "🚀 Setting up IntelliDiag Next.js Project..."

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
mkdir -p public/frames

# Copy images to public directory if they exist in the old location
if [ -d "src/frames" ]; then
    echo "📸 Copying frame images to public directory..."
    cp -r src/frames/* public/frames/ 2>/dev/null || echo "No frames directory found"
fi

# Copy other images to public directory
echo "🖼️  Setting up public assets..."
cp -f src/*.png public/ 2>/dev/null || echo "No PNG files found"
cp -f src/*.jpg public/ 2>/dev/null || echo "No JPG files found"
cp -f src/*.webp public/ 2>/dev/null || echo "No WEBP files found"
cp -f src/*.ico public/ 2>/dev/null || echo "No ICO files found"

echo ""
echo "🎉 Next.js setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Access your app at: http://localhost:3000"
echo "3. Access dashboard at: http://localhost:3000/dashboard"
echo ""
echo "🔧 Available commands:"
echo "   npm run dev     - Start development server"
echo "   npm run build   - Build for production"
echo "   npm run start   - Start production server"
echo "   npm run lint    - Run ESLint"
echo ""
echo "🌐 Backend should be running at: http://localhost:5000"
echo "📁 Make sure your backend is set up and running!"
