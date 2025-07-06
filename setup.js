const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Setting up Personal Finance Visualizer (Next.js + MongoDB)...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm version: ${npmVersion.trim()}`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm first.');
  process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Check if .env.local exists, if not create from example
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('\n📝 Creating .env.local from template...');
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created successfully');
    console.log('⚠️  Please update MONGODB_URI in .env.local with your MongoDB connection string');
  } catch (error) {
    console.error('❌ Failed to create .env.local');
    process.exit(1);
  }
}

// Check if MongoDB is accessible (optional)
console.log('\n🗄️  Checking MongoDB connection...');
console.log('⚠️  Make sure MongoDB is running and accessible');
console.log('   - Local MongoDB: mongodb://localhost:27017');
console.log('   - MongoDB Atlas: Use your connection string in .env.local');

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update MONGODB_URI in .env.local with your MongoDB connection string');
console.log('2. Start the development server: npm run dev');
console.log('3. Open http://localhost:3000 in your browser');
console.log('\n📚 Documentation:');
console.log('- Next.js: https://nextjs.org/docs');
console.log('- MongoDB: https://docs.mongodb.com');
console.log('- shadcn/ui: https://ui.shadcn.com');
console.log('- Recharts: https://recharts.org'); 