#!/usr/bin/env node

/**
 * ZapCash Deployment Script
 * Helps build and deploy the app for app store submission
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 ZapCash Deployment Script');
console.log('============================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log(`📦 Project: ${packageJson.name}`);
console.log(`📝 Version: ${packageJson.version}\n`);

// Step 1: Install dependencies
console.log('1️⃣ Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 2: Run type check
console.log('2️⃣ Running TypeScript type check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful\n');
} catch (error) {
  console.error('❌ TypeScript errors found:', error.message);
  console.log('⚠️  Please fix TypeScript errors before deploying\n');
}

// Step 3: Run linting
console.log('3️⃣ Running ESLint...');
try {
  execSync('npm run lint:fix', { stdio: 'inherit' });
  console.log('✅ Linting completed\n');
} catch (error) {
  console.log('⚠️  Linting completed with warnings\n');
}

// Step 4: Build production version
console.log('4️⃣ Building production version...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Production build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 5: Check build output
console.log('5️⃣ Checking build output...');
const buildDir = 'build';
if (fs.existsSync(buildDir)) {
  const buildFiles = fs.readdirSync(buildDir);
  console.log(`✅ Build directory created with ${buildFiles.length} files/folders`);
  
  // Check for essential files
  const essentialFiles = ['index.html', 'static', 'manifest.json'];
  const missingFiles = essentialFiles.filter(file => !buildFiles.includes(file));
  
  if (missingFiles.length === 0) {
    console.log('✅ All essential files present\n');
  } else {
    console.log(`⚠️  Missing files: ${missingFiles.join(', ')}\n`);
  }
} else {
  console.error('❌ Build directory not found');
  process.exit(1);
}

// Step 6: Generate deployment info
console.log('6️⃣ Generating deployment information...');
const deploymentInfo = {
  project: packageJson.name,
  version: packageJson.version,
  buildDate: new Date().toISOString(),
  buildSize: getDirectorySize(buildDir),
  features: [
    'PWA Support',
    'Real-time Notifications',
    'Group Payments',
    'Analytics Dashboard',
    'Stripe Integration',
    'AI Insights',
    'Security Features'
  ],
  platforms: ['Web', 'Android (PWA)', 'iOS (PWA)'],
  requirements: {
    node: '>=14.0.0',
    npm: '>=6.0.0'
  }
};

fs.writeFileSync(
  path.join(buildDir, 'deployment-info.json'),
  JSON.stringify(deploymentInfo, null, 2)
);

console.log('✅ Deployment information generated\n');

// Step 7: Display next steps
console.log('🎯 Next Steps for App Store Deployment:');
console.log('======================================\n');

console.log('📱 Google Play Store:');
console.log('1. Create Google Play Console account ($25)');
console.log('2. Install Bubblewrap: npm install -g @bubblewrap/cli');
console.log('3. Generate TWA: bubblewrap init --manifest=https://your-domain.com/manifest.json');
console.log('4. Build AAB: bubblewrap build');
console.log('5. Upload to Google Play Console\n');

console.log('🍎 Apple App Store:');
console.log('1. Join Apple Developer Program ($99/year)');
console.log('2. Create iOS app in Xcode');
console.log('3. Configure WKWebView for your PWA');
console.log('4. Upload to App Store Connect\n');

console.log('🌐 Web Deployment:');
console.log('1. Deploy to hosting platform (Netlify, Vercel, etc.)');
console.log('2. Configure custom domain');
console.log('3. Enable HTTPS');
console.log('4. Test PWA installation\n');

console.log('📋 Pre-Launch Checklist:');
console.log('• App icons created (all sizes)');
console.log('• Screenshots captured');
console.log('• Privacy policy created');
console.log('• Terms of service created');
console.log('• App tested on multiple devices');
console.log('• Performance optimized\n');

console.log('🚀 Your ZapCash app is ready for deployment!');
console.log('Build directory: ./build');
console.log('Deployment guide: ./deployment-guide.md\n');

// Helper function to get directory size
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      files.forEach(file => {
        calculateSize(path.join(itemPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return formatBytes(totalSize);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
