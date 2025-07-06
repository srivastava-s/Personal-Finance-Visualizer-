#!/bin/bash

echo "🚀 Starting Personal Finance Visualizer (Next.js + MongoDB)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install npm from https://nodejs.org/"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "Please copy env.example to .env.local and configure your MongoDB connection"
    echo ""
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
fi

# Start the development server
echo "🌐 Starting development server..."
echo ""
echo "Personal Finance Visualizer will be available at:"
echo "http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev 