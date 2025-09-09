/**
 * Video Background Component Test Script
 * Run this in the browser console to test the video background functionality
 */

console.log('🎬 Testing Video Background Component...');

// Test 1: Check if component is accessible
if (window.videoBackground) {
  console.log('✅ VideoBackground component found');
  
  // Test 2: Check video state
  const state = window.videoBackground.getVideoState();
  console.log('📊 Video State:', state);
  
  // Test 3: Check if video element is ready
  const isReady = window.videoBackground.isVideoElementReady();
  console.log('🎥 Video Element Ready:', isReady);
  
  // Test 4: Check session storage
  const videoReady = sessionStorage.getItem('videoReady');
  const videoTime = sessionStorage.getItem('videoTime');
  console.log('💾 Session Storage:', { videoReady, videoTime });
  
  // Test 5: Check DOM elements
  const video = document.getElementById('bgvid');
  const placeholder = document.getElementById('video-placeholder');
  console.log('🏗️ DOM Elements:', {
    video: !!video,
    placeholder: !!placeholder,
    videoReadyState: video?.readyState,
    placeholderDisplay: placeholder?.style.display,
    placeholderOpacity: placeholder?.style.opacity
  });
  
  // Test 6: Force play (if needed)
  if (video && video.paused) {
    console.log('▶️ Attempting to force play video...');
    window.videoBackground.forcePlay();
  }
  
} else {
  console.log('❌ VideoBackground component not found');
  
  // Check if video elements exist
  const video = document.getElementById('bgvid');
  const placeholder = document.getElementById('video-placeholder');
  
  if (video && placeholder) {
    console.log('🎥 Video elements found but component not initialized');
    console.log('Video readyState:', video.readyState);
    console.log('Video paused:', video.paused);
    console.log('Placeholder display:', placeholder.style.display);
  } else {
    console.log('❌ Video elements not found');
  }
}

// Test 7: Navigation simulation
console.log('🧪 To test navigation persistence:');
console.log('1. Navigate to another page (e.g., /about)');
console.log('2. Return to this page');
console.log('3. Run this test again to check state persistence');

// Test 8: Performance check
if (performance && performance.memory) {
  console.log('💾 Memory Usage:', {
    usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
    totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB'
  });
}

console.log('🎬 Video Background Component Test Complete');
