// This script checks if the optimization was successful
// Run with: node scripts/check-optimization.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const assetsDir = path.join(__dirname, '../src/assets');
const optimizedDir = path.join(__dirname, '../public/optimized');
const publicDir = path.join(__dirname, '../public');

console.log('Checking optimization status...\n');

// Check if optimized directory exists
if (!fs.existsSync(optimizedDir)) {
  console.error('❌ Optimized directory not found. Run "npm run optimize" first.');
  process.exit(1);
}

// Check optimized images
const imageFiles = fs.readdirSync(assetsDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
});

console.log(`Found ${imageFiles.length} original images`);

let optimizedCount = 0;
let totalSavings = 0;
let totalOriginalSize = 0;
let totalOptimizedSize = 0;

for (const file of imageFiles) {
  const baseName = path.basename(file, path.extname(file));
  const originalPath = path.join(assetsDir, file);
  const webpPath = path.join(optimizedDir, `${baseName}.webp`);
  
  if (fs.existsSync(webpPath)) {
    optimizedCount++;
    
    const originalSize = fs.statSync(originalPath).size;
    const optimizedSize = fs.statSync(webpPath).size;
    const savings = originalSize - optimizedSize;
    const savingsPercent = (savings / originalSize * 100).toFixed(2);
    
    totalOriginalSize += originalSize;
    totalOptimizedSize += optimizedSize;
    totalSavings += savings;
    
    console.log(`✅ ${file} optimized: ${(originalSize / 1024).toFixed(2)} KB → ${(optimizedSize / 1024).toFixed(2)} KB (${savingsPercent}% reduction)`);
  } else {
    console.log(`❌ ${file} not optimized`);
  }
}

// Check video optimization
const originalVideoPath = path.join(assetsDir, 'sky.mp4');
const optimizedVideoPath = path.join(publicDir, 'sky.mp4');
const webmVideoPath = path.join(publicDir, 'sky.webm');
const posterPath = path.join(publicDir, 'video-poster.jpg');

if (fs.existsSync(originalVideoPath)) {
  console.log('\nChecking video optimization:');
  
  if (fs.existsSync(optimizedVideoPath)) {
    const originalSize = fs.statSync(originalVideoPath).size;
    const optimizedSize = fs.statSync(optimizedVideoPath).size;
    const savings = originalSize - optimizedSize;
    const savingsPercent = (savings / originalSize * 100).toFixed(2);
    
    console.log(`✅ MP4 video optimized: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(optimizedSize / 1024 / 1024).toFixed(2)} MB (${savingsPercent}% reduction)`);
  } else {
    console.log('❌ MP4 video not optimized');
  }
  
  if (fs.existsSync(webmVideoPath)) {
    console.log('✅ WebM video created');
  } else {
    console.log('❌ WebM video not created');
  }
  
  if (fs.existsSync(posterPath)) {
    console.log('✅ Video poster created');
  } else {
    console.log('❌ Video poster not created');
  }
} else {
  console.log('\n❓ Original video not found in assets directory');
}

// Summary
console.log('\nOptimization Summary:');
console.log(`Images: ${optimizedCount}/${imageFiles.length} optimized`);
if (optimizedCount > 0) {
  const totalSavingsPercent = (totalSavings / totalOriginalSize * 100).toFixed(2);
  console.log(`Total size reduction: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB → ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB (${totalSavingsPercent}% reduction)`);
}

if (optimizedCount === imageFiles.length && 
    (fs.existsSync(optimizedVideoPath) || !fs.existsSync(originalVideoPath))) {
  console.log('\n✅ Optimization complete! Your site should now load faster.');
} else {
  console.log('\n⚠️ Some assets are not optimized. Run "npm run optimize" to optimize all assets.');
} 