// This script uses ffmpeg to generate a poster image from the first frame of a video
// Run with: node scripts/generate-video-poster.js

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const videoPath = path.join(__dirname, '../public/sky.mp4');
const posterPath = path.join(__dirname, '../public/video-poster.jpg');

// Check if video exists
if (!fs.existsSync(videoPath)) {
  console.error(`Video file not found: ${videoPath}`);
  process.exit(1);
}

// Command to extract the first frame
const command = `ffmpeg -i "${videoPath}" -vframes 1 -q:v 2 "${posterPath}"`;

console.log(`Generating poster image from ${videoPath}...`);

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.log(`ffmpeg output: ${stderr}`);
  }
  
  console.log(`Poster image generated successfully: ${posterPath}`);
}); 