/**
 * Enhanced VideoBackground Component Test Script
 * Specifically designed to test mobile vs desktop differences
 * Run this in the browser console to test the video background functionality
 */

console.log('🎬 Testing VideoBackground Component - Mobile vs Desktop...');

// Test 1: Check if component is accessible
if (window.videoBackground) {
  console.log('✅ VideoBackground component found');
  
  // Test 2: Get device information
  const deviceInfo = window.videoBackground.getDeviceInfo();
  console.log('📱 Device Info:', deviceInfo);
  
  // Test 3: Check video state with format information
  const state = window.videoBackground.getVideoState();
  console.log('📊 Video State:', state);
  
  // Test 4: Check if video element is ready
  const isReady = window.videoBackground.isVideoElementReady();
  console.log('🎥 Video Element Ready:', isReady);
  
  // Test 5: Check session storage
  const videoReady = sessionStorage.getItem('videoReady');
  const videoTime = sessionStorage.getItem('videoTime');
  const videoFormat = sessionStorage.getItem('videoFormat');
  console.log('💾 Session Storage:', { videoReady, videoTime, videoFormat });
  
  // Test 6: Check DOM elements
  const video = document.getElementById('bgvid');
  const placeholder = document.getElementById('video-placeholder');
  console.log('🏗️ DOM Elements:', {
    video: !!video,
    placeholder: !!placeholder,
    videoReadyState: video?.readyState,
    videoCurrentSrc: video?.currentSrc,
    videoFormat: video?.currentSrc?.includes('.webm') ? 'WebM' : 'MP4',
    placeholderDisplay: placeholder?.style.display,
    placeholderOpacity: placeholder?.style.opacity
  });
  
  // Test 7: Mobile-specific tests
  if (deviceInfo.isMobile) {
    console.log('📱 Running mobile-specific tests...');
    
    // Check mobile video attributes
    if (video) {
      console.log('📱 Mobile Video Attributes:', {
        playsInline: video.playsInline,
        preload: video.preload,
        autoplay: video.autoplay,
        muted: video.muted,
        loop: video.loop
      });
    }
    
    // Check if WebM is being used
    if (video?.currentSrc?.includes('.webm')) {
      console.log('✅ Mobile: Using WebM format (optimized)');
    } else if (video?.currentSrc?.includes('.mp4')) {
      console.log('📱 Mobile: Using MP4 format (fallback)');
    }
    
    // Test mobile autoplay
    if (video && video.paused) {
      console.log('▶️ Testing mobile autoplay...');
      window.videoBackground.forcePlay();
    }
    
  } else {
    console.log('🖥️ Running desktop-specific tests...');
    
    // Check desktop video attributes
    if (video) {
      console.log('🖥️ Desktop Video Attributes:', {
        playsInline: video.playsInline,
        preload: video.preload,
        autoplay: video.autoplay,
        muted: video.muted,
        loop: video.loop
      });
    }
    
    // Check if MP4 is being used
    if (video?.currentSrc?.includes('.mp4')) {
      console.log('✅ Desktop: Using MP4 format');
    }
  }
  
  // Test 8: Performance and memory check
  if (performance && performance.memory) {
    console.log('💾 Memory Usage:', {
      usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB'
    });
  }
  
  // Test 9: Video format support detection
  console.log('🔍 Video Format Support:');
  
  // Check WebM support
  const webmVideo = document.createElement('video');
  const webmSupported = webmVideo.canPlayType('video/webm; codecs="vp9"');
  console.log('WebM VP9:', webmSupported || 'Not supported');
  
  // Check MP4 support
  const mp4Supported = webmVideo.canPlayType('video/mp4; codecs="avc1.42E01E"');
  console.log('MP4 H.264:', mp4Supported || 'Not supported');
  
  // Test 10: Navigation persistence test
  console.log('🧪 Navigation Persistence Test:');
  console.log('1. Navigate to another page (e.g., /about)');
  console.log('2. Check if video continues playing');
  console.log('3. Return to this page');
  console.log('4. Run this test again to check state persistence');
  
} else {
  console.log('❌ VideoBackground component not found');
  
  // Check if video elements exist
  const video = document.getElementById('bgvid');
  const placeholder = document.getElementById('video-placeholder');
  
  if (video && placeholder) {
    console.log('🎥 Video elements found but component not initialized');
    console.log('Video readyState:', video.readyState);
    console.log('Video paused:', video.paused);
    console.log('Video currentSrc:', video.currentSrc);
    console.log('Placeholder display:', placeholder.style.display);
  } else {
    console.log('❌ Video elements not found');
  }
}

// Test 11: Viewport and device detection
console.log('📱 Viewport & Device Detection:');
console.log('Viewport width:', window.innerWidth);
console.log('Viewport height:', window.innerHeight);
console.log('User Agent:', navigator.userAgent);
console.log('Touch support:', 'ontouchstart' in window);
console.log('Mobile detection:', window.innerWidth <= 768);

// Test 12: Performance monitoring
console.log('⚡ Performance Monitoring:');
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
if (connection) {
  console.log('Connection type:', connection.effectiveType || 'unknown');
  console.log('Downlink:', connection.downlink ? connection.downlink + ' Mbps' : 'unknown');
  console.log('RTT:', connection.rtt ? connection.rtt + ' ms' : 'unknown');
} else {
  console.log('Network connection API not supported');
}

console.log('🎬 Enhanced VideoBackground Component Test Complete');
console.log('📱 Mobile users: Look for WebM format and enhanced autoplay handling');
console.log('🖥️ Desktop users: Look for MP4 format and standard autoplay');
