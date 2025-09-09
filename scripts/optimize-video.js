// This script uses ffmpeg to optimize the video file and generate a WebM version
// Run with: node scripts/optimize-video.js

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const originalVideoPath = path.join(__dirname, '../src/assets/sky.mp4');
const optimizedMp4Path = path.join(__dirname, '../public/sky.mp4');
const webmPath = path.join(__dirname, '../public/sky.webm');
const posterPath = path.join(__dirname, '../public/video-poster.jpg');

// Check if original video exists
if (!fs.existsSync(originalVideoPath)) {
  console.error(`Original video file not found: ${originalVideoPath}`);
  process.exit(1);
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Function to run ffmpeg with better error handling and progress reporting
function runFfmpeg(args, description) {
  return new Promise((resolve, reject) => {
    console.log(`Starting: ${description}...`);
    
    const ffmpeg = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let lastProgressLine = '';
    
    // Handle stdout (not usually used by ffmpeg)
    ffmpeg.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
    });
    
    // Handle stderr (where ffmpeg outputs progress)
    ffmpeg.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Extract and print progress information
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.includes('time=')) {
          process.stdout.write(`\r${description}: ${line.trim()}`);
          lastProgressLine = line;
        }
      }
    });
    
    // Handle process completion
    ffmpeg.on('close', (code) => {
      console.log(`\n${description} completed with code ${code}`);
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`ffmpeg exited with code ${code}\nOutput: ${output}`));
      }
    });
    
    // Handle process errors
    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to start ffmpeg process: ${err.message}`));
    });
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      ffmpeg.kill('SIGTERM');
      reject(new Error(`${description} timed out after 10 minutes`));
    }, 10 * 60 * 1000); // 10 minute timeout
    
    // Clear timeout when process completes
    ffmpeg.on('close', () => clearTimeout(timeout));
  });
}

// Main function to run the optimization process
async function optimizeVideo() {
  try {
    // Check if files already exist and get their stats
    const originalStats = fs.statSync(originalVideoPath);
    const originalSizeMB = (originalStats.size / 1024 / 1024).toFixed(2);
    console.log(`Original video size: ${originalSizeMB} MB`);
    
    // Generate high-quality poster from the video
    console.log('Generating video poster...');
    const posterArgs = [
      '-i', originalVideoPath,
      '-vf', 'thumbnail,scale=1920:-1',
      '-frames:v', '1',
      '-q:v', '2', // High quality JPEG
      '-y',
      posterPath
    ];
    
    await runFfmpeg(posterArgs, 'Video poster generation');
    console.log(`Video poster saved to: ${posterPath}`);
    
    // MP4 optimization with minimal compression (high quality)
    const mp4Args = [
      '-i', originalVideoPath,
      '-c:v', 'libx264',
      '-crf', '18', // Lower CRF means higher quality (18 is visually lossless)
      '-preset', 'slow', // Slower preset = better compression at same quality
      '-c:a', 'aac',
      '-b:a', '192k', // Higher audio bitrate
      '-movflags', 'faststart', // Optimize for web streaming
      '-y',
      optimizedMp4Path
    ];
    
    await runFfmpeg(mp4Args, 'MP4 optimization');
    
    // Get optimized MP4 stats
    const mp4Stats = fs.statSync(optimizedMp4Path);
    const mp4SizeMB = (mp4Stats.size / 1024 / 1024).toFixed(2);
    
    // Check if user wants to create WebM version (optional)
    const createWebM = process.argv.includes('--webm');
    
    if (createWebM) {
      // WebM creation with reasonable quality
      const webmArgs = [
        '-i', optimizedMp4Path,
        '-c:v', 'libvpx-vp9',
        '-crf', '23', // Higher quality (less aggressive compression)
        '-b:v', '0',
        '-deadline', 'good',
        '-cpu-used', '1', // Slower encoding, better quality
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-y',
        webmPath
      ];
      
      await runFfmpeg(webmArgs, 'WebM creation');
      
      // Get WebM stats
      const webmStats = fs.statSync(webmPath);
      const webmSizeMB = (webmStats.size / 1024 / 1024).toFixed(2);
      
      // Print results with WebM
      console.log(`\nFile size comparison:`);
      console.log(`Original MP4: ${originalSizeMB} MB`);
      console.log(`Optimized MP4: ${mp4SizeMB} MB`);
      console.log(`WebM: ${webmSizeMB} MB`);
      console.log(`MP4 Reduction: ${(100 - (mp4Stats.size / originalStats.size * 100)).toFixed(2)}%`);
      console.log(`WebM Reduction: ${(100 - (webmStats.size / originalStats.size * 100)).toFixed(2)}%`);
    } else {
      // Print results without WebM
      console.log(`\nFile size comparison:`);
      console.log(`Original MP4: ${originalSizeMB} MB`);
      console.log(`Optimized MP4: ${mp4SizeMB} MB`);
      console.log(`MP4 Reduction: ${(100 - (mp4Stats.size / originalStats.size * 100)).toFixed(2)}%`);
      console.log(`\nNote: WebM version was not created. Use --webm flag to create it.`);
    }
    
    console.log('\nOptimization completed successfully!');
  } catch (error) {
    console.error(`Error during video optimization: ${error.message}`);
    process.exit(1);
  }
}

// Run the optimization process
optimizeVideo(); 