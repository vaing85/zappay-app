#!/usr/bin/env node

/**
 * App Icon Generator for ZapCash
 * This script helps generate all required app icons for app store deployment
 */

const fs = require('fs');
const path = require('path');

// Required icon sizes for different platforms
const iconSizes = {
  // Web/PWA
  web: [16, 32, 48, 72, 96, 144, 192, 512],
  
  // Android
  android: [48, 72, 96, 144, 192, 512],
  
  // iOS
  ios: [20, 29, 40, 50, 57, 60, 72, 76, 80, 87, 100, 114, 120, 144, 152, 167, 180, 1024],
  
  // App Store
  appstore: [1024]
};

// Icon configuration
const iconConfig = {
  name: 'ZapCash',
  backgroundColor: '#f59e0b', // Yellow theme
  textColor: '#ffffff',
  font: 'Arial, sans-serif'
};

console.log('🎨 ZapCash App Icon Generator');
console.log('=============================\n');

console.log('📱 Required Icon Sizes:');
console.log('----------------------');

Object.entries(iconSizes).forEach(([platform, sizes]) => {
  console.log(`\n${platform.toUpperCase()}:`);
  sizes.forEach(size => {
    console.log(`  - ${size}x${size}px`);
  });
});

console.log('\n📋 Instructions:');
console.log('----------------');
console.log('1. Create a high-resolution logo (1024x1024px minimum)');
console.log('2. Use a design tool like Figma, Canva, or Adobe Illustrator');
console.log('3. Export icons in PNG format with transparent background');
console.log('4. Save icons in the following structure:');
console.log('   public/icons/');
console.log('   ├── icon-16.png');
console.log('   ├── icon-32.png');
console.log('   ├── icon-48.png');
console.log('   ├── icon-72.png');
console.log('   ├── icon-96.png');
console.log('   ├── icon-144.png');
console.log('   ├── icon-192.png');
console.log('   ├── icon-512.png');
console.log('   └── icon-1024.png');

console.log('\n🎨 Design Guidelines:');
console.log('-------------------');
console.log('• Use simple, recognizable design');
console.log('• Ensure icons work at small sizes');
console.log('• Use consistent branding colors');
console.log('• Avoid text in small icons');
console.log('• Test on different backgrounds');

console.log('\n📱 Platform-Specific Requirements:');
console.log('----------------------------------');
console.log('Google Play Store:');
console.log('• 512x512px app icon');
console.log('• 1024x500px feature graphic');
console.log('• Screenshots: 1080x1920px (phone), 1200x1920px (tablet)');

console.log('\nApple App Store:');
console.log('• 1024x1024px app icon');
console.log('• Screenshots: 1170x2532px (iPhone), 2048x2732px (iPad)');
console.log('• App preview videos (optional)');

console.log('\n🚀 Next Steps:');
console.log('--------------');
console.log('1. Create your app icons');
console.log('2. Update manifest.json with icon paths');
console.log('3. Test PWA installation');
console.log('4. Build production version');
console.log('5. Deploy to hosting platform');
console.log('6. Submit to app stores');

console.log('\n💡 Pro Tips:');
console.log('------------');
console.log('• Use SVG for scalable icons');
console.log('• Create multiple variations');
console.log('• Test on actual devices');
console.log('• Get feedback from users');
console.log('• Follow platform guidelines');

console.log('\n✨ Good luck with your app store launch! 🚀');
