#!/bin/bash

# Video Optimization Script for Mobile Devices
# This script creates optimized WebM and MP4 versions for mobile and desktop

echo "🎬 Video Optimization Script for Mobile Devices"
echo "=============================================="

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first:"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    echo "   Windows: Download from https://ffmpeg.org/download.html"
    exit 1
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
    ORIGINAL_SIZE=$(du -h "$INPUT_VIDEO" | cut -f1)
    MOBILE_SIZE=$(du -h "$OUTPUT_DIR/sky-mobile.webm" | cut -f1)
    
    echo "📊 File sizes:"
    echo "   Original MP4: $ORIGINAL_SIZE"
    echo "   Mobile WebM:  $MOBILE_SIZE"
else
    echo "❌ Failed to create mobile WebM version"
fi

echo ""

# Create optimized MP4 version for desktop (H.264 codec)
echo "🔄 Creating optimized MP4 version for desktop..."
ffmpeg -i "$INPUT_VIDEO" \
    -c:v libx264 \
    -crf 23 \
    -preset medium \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
    -c:a aac \
    -b:a 128k \
    -movflags +faststart \
    -y \
    "$OUTPUT_DIR/sky-desktop.mp4"

if [ $? -eq 0 ]; then
    echo "✅ Desktop MP4 created successfully"
    
    # Get file sizes
    DESKTOP_SIZE=$(du -h "$OUTPUT_DIR/sky-desktop.mp4" | cut -f1)
    
    echo "📊 File sizes:"
    echo "   Original MP4: $ORIGINAL_SIZE"
    echo "   Mobile WebM:  $MOBILE_SIZE"
    echo "   Desktop MP4:  $DESKTOP_SIZE"
else
    echo "❌ Failed to create desktop MP4 version"
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
    COMPRESSED_SIZE=$(du -h "$OUTPUT_DIR/sky-mobile-compressed.webm" | cut -f1)
    
    echo "📊 Final file sizes:"
    echo "   Original MP4:     $ORIGINAL_SIZE"
    echo "   Mobile WebM:      $MOBILE_SIZE"
    echo "   Desktop MP4:      $DESKTOP_SIZE"
    echo "   Compressed WebM:  $COMPRESSED_SIZE"
    
    # Calculate compression ratios
    echo ""
    echo "📈 Compression ratios:"
    echo "   Mobile WebM:      $(echo "scale=1; $(stat -f%z "$OUTPUT_DIR/sky-mobile.webm") * 100 / $(stat -f%z "$INPUT_VIDEO")" | bc)% of original"
    echo "   Compressed WebM:  $(echo "scale=1; $(stat -f%z "$OUTPUT_DIR/sky-mobile-compressed.webm") * 100 / $(stat -f%z "$INPUT_VIDEO")" | bc)% of original"
else
    echo "❌ Failed to create ultra-compressed mobile WebM version"
fi

echo ""
echo "🎯 Optimization complete!"
echo ""
echo "📱 For mobile devices, use:"
echo "   - sky-mobile.webm (balanced quality/size)"
echo "   - sky-mobile-compressed.webm (maximum compression)"
echo ""
echo "🖥️ For desktop devices, use:"
echo "   - sky-desktop.mp4 (high quality)"
echo ""
echo "💡 Update your VideoBackground component to use these optimized files"
