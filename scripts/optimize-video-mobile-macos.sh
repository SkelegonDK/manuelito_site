#!/bin/bash

# Video Optimization Script for Mobile Devices (macOS)
# This script creates optimized WebM and MP4 versions for mobile and desktop

echo "🎬 Video Optimization Script for Mobile Devices (macOS)"
echo "====================================================="

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Installing with Homebrew..."
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew is not installed. Please install Homebrew first:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    brew install ffmpeg
fi

# Input video file
INPUT_VIDEO="public/sky.mp4"
OUTPUT_DIR="public"

# Check if input video exists
if [ ! -f "$INPUT_VIDEO" ]; then
    echo "❌ Input video not found: $INPUT_VIDEO"
    exit 1
fi

echo "📁 Input video: $INPUT_VIDEO"
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Get original file size
ORIGINAL_SIZE=$(ls -lh "$INPUT_VIDEO" | awk '{print $5}')
echo "📊 Original file size: $ORIGINAL_SIZE"
echo ""

# Create optimized WebM version for mobile (VP9 codec)
echo "🔄 Creating optimized WebM version for mobile devices..."
ffmpeg -i "$INPUT_VIDEO" \
    -c:v libvpx-vp9 \
    -crf 30 \
    -b:v 1M \
    -maxrate 1.5M \
    -bufsize 2M \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
    -c:a libopus \
    -b:a 128k \
    -movflags +faststart \
    -y \
    "$OUTPUT_DIR/sky-mobile.webm"

if [ $? -eq 0 ]; then
    echo "✅ Mobile WebM created successfully"
    
    # Get file sizes
    MOBILE_SIZE=$(ls -lh "$OUTPUT_DIR/sky-mobile.webm" | awk '{print $5}')
    
    echo "📊 File sizes:"
    echo "   Original MP4: $ORIGINAL_SIZE"
    echo "   Mobile WebM:  $MOBILE_SIZE"
else
    echo "❌ Failed to create mobile WebM version"
fi

echo ""

# Create ultra-compressed mobile version (if needed)
echo "🔄 Creating ultra-compressed mobile version..."
ffmpeg -i "$INPUT_VIDEO" \
    -c:v libvpx-vp9 \
    -crf 35 \
    -b:v 500k \
    -maxrate 750k \
    -bufsize 1M \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
    -c:a libopus \
    -b:a 64k \
    -movflags +faststart \
    -y \
    "$OUTPUT_DIR/sky-mobile-compressed.webm"

if [ $? -eq 0 ]; then
    echo "✅ Ultra-compressed mobile WebM created successfully"
    
    # Get file sizes
    COMPRESSED_SIZE=$(ls -lh "$OUTPUT_DIR/sky-mobile-compressed.webm" | awk '{print $5}')
    
    echo "📊 Final file sizes:"
    echo "   Original MP4:     $ORIGINAL_SIZE"
    echo "   Mobile WebM:      $MOBILE_SIZE"
    echo "   Compressed WebM:  $COMPRESSED_SIZE"
    
    echo ""
    echo "🎯 Optimization complete!"
    echo ""
    echo "📱 For mobile devices, use:"
    echo "   - sky-mobile.webm (balanced quality/size)"
    echo "   - sky-mobile-compressed.webm (maximum compression)"
    echo ""
    echo "💡 Update your VideoBackground component to use these optimized files"
else
    echo "❌ Failed to create ultra-compressed mobile WebM version"
fi
