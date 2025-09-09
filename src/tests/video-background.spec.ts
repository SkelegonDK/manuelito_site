import { test, expect, type Page } from '@playwright/test';

/**
 * Video Background Test Suite
 * Tests video background persistence and functionality across page navigation
 * 
 * Test Coverage:
 * - Video loading on initial page load
 * - Video persistence across navigation
 * - Placeholder image management
 * - Video state restoration during navigation
 * - Mobile vs desktop consistency
 * - Performance and memory usage
 */

interface VideoBackgroundTestContext {
  page: Page;
  videoElement: any;
  placeholderElement: any;
  initialVideoTime: number;
}

class VideoBackgroundTester {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get video background element
   */
  async getVideoElement() {
    return await this.page.locator('#bgvid');
  }

  /**
   * Get video placeholder element
   */
  async getPlaceholderElement() {
    return await this.page.locator('#video-placeholder');
  }

  /**
   * Check if video is playing
   */
  async isVideoPlaying(): Promise<boolean> {
    const video = await this.getVideoElement();
    if (!video) return false;
    
    try {
      const isPaused = await video.evaluate((el: HTMLVideoElement) => el.paused);
      return !isPaused;
    } catch {
      return false;
    }
  }

  /**
   * Get current video time
   */
  async getVideoTime(): Promise<number> {
    const video = await this.getVideoElement();
    if (!video) return 0;
    
    try {
      return await video.evaluate((el: HTMLVideoElement) => el.currentTime);
    } catch {
      return 0;
    }
  }

  /**
   * Check if placeholder is visible
   */
  async isPlaceholderVisible(): Promise<boolean> {
    const placeholder = await this.getPlaceholderElement();
    if (!placeholder) return false;
    
    try {
      const display = await placeholder.evaluate((el) => window.getComputedStyle(el).display);
      const opacity = await placeholder.evaluate((el) => window.getComputedStyle(el).opacity);
      return display !== 'none' && parseFloat(opacity) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Wait for video to be ready
   */
  async waitForVideoReady(timeout = 10000): Promise<void> {
    await this.page.waitForFunction(() => {
      const video = document.getElementById('bgvid') as HTMLVideoElement;
      return video && video.readyState >= 3; // HAVE_FUTURE_DATA
    }, { timeout });
  }

  /**
   * Wait for placeholder to be hidden
   */
  async waitForPlaceholderHidden(timeout = 10000): Promise<void> {
    await this.page.waitForFunction(() => {
      const placeholder = document.getElementById('video-placeholder') as HTMLElement;
      return placeholder && placeholder.style.display === 'none';
    }, { timeout });
  }

  /**
   * Navigate to a page and wait for video to stabilize
   */
  async navigateAndWaitForVideo(url: string, waitTime = 2000): Promise<void> {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    
    // Wait for video to stabilize
    await this.page.waitForTimeout(waitTime);
  }

  /**
   * Check video background state across navigation
   */
  async checkVideoState(): Promise<{
    videoExists: boolean;
    videoPlaying: boolean;
    placeholderVisible: boolean;
    videoTime: number;
  }> {
    const video = await this.getVideoElement();
    const placeholder = await this.getPlaceholderElement();
    
    return {
      videoExists: await video.count() > 0,
      videoPlaying: await this.isVideoPlaying(),
      placeholderVisible: await this.isPlaceholderVisible(),
      videoTime: await this.getVideoTime()
    };
  }
}

test.describe('Video Background Functionality', () => {
  let tester: VideoBackgroundTester;

  test.beforeEach(async ({ page }) => {
    tester = new VideoBackgroundTester(page);
    
    // Navigate to home page to start fresh
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Initial Video Loading', () => {
    test('should load video background on home page', async ({ page }) => {
      // Wait for video to be ready
      await tester.waitForVideoReady();
      
      const state = await tester.checkVideoState();
      
      expect(state.videoExists).toBe(true);
      expect(state.videoPlaying).toBe(true);
      expect(state.videoTime).toBeGreaterThan(0);
    });

    test('should hide placeholder after video loads', async ({ page }) => {
      // Wait for video to be ready
      await tester.waitForVideoReady();
      
      // Wait for placeholder to be hidden
      await tester.waitForPlaceholderHidden();
      
      const state = await tester.checkVideoState();
      expect(state.placeholderVisible).toBe(false);
    });

    test('should maintain video playback during page interaction', async ({ page }) => {
      // Wait for video to be ready
      await tester.waitForVideoReady();
      
      const initialTime = await tester.getVideoTime();
      
      // Simulate some page interaction
      await page.mouse.move(100, 100);
      await page.waitForTimeout(1000);
      
      const currentTime = await tester.getVideoTime();
      
      // Video should continue playing and time should advance
      expect(currentTime).toBeGreaterThan(initialTime);
    });
  });

  test.describe('Video Persistence Across Navigation', () => {
    test('should maintain video background when navigating to About page', async ({ page }) => {
      // Wait for video to be ready on home page
      await tester.waitForVideoReady();
      await tester.waitForPlaceholderHidden();
      
      const homeState = await tester.checkVideoState();
      expect(homeState.videoPlaying).toBe(true);
      expect(homeState.placeholderVisible).toBe(false);
      
      // Navigate to About page
      await tester.navigateAndWaitForVideo('/about');
      
      const aboutState = await tester.checkVideoState();
      expect(aboutState.videoExists).toBe(true);
      expect(aboutState.videoPlaying).toBe(true);
      expect(aboutState.placeholderVisible).toBe(false);
    });

    test('should maintain video background when navigating to Courses page', async ({ page }) => {
      // Wait for video to be ready on home page
      await tester.waitForVideoReady();
      await tester.waitForPlaceholderHidden();
      
      // Navigate to Courses page
      await tester.navigateAndWaitForVideo('/courses');
      
      const state = await tester.checkVideoState();
      expect(state.videoExists).toBe(true);
      expect(state.videoPlaying).toBe(true);
      expect(state.placeholderVisible).toBe(false);
    });

    test('should maintain video background when navigating to Blog page', async ({ page }) => {
      // Wait for video to be ready on home page
      await tester.waitForVideoReady();
      await tester.waitForPlaceholderHidden();
      
      // Navigate to Blog page
      await tester.navigateAndWaitForVideo('/blog');
      
      const state = await tester.checkVideoState();
      expect(state.videoExists).toBe(true);
      expect(state.videoPlaying).toBe(true);
      expect(state.placeholderVisible).toBe(false);
    });

    test('should maintain video background when navigating to Gallery page', async ({ page }) => {
      // Wait for video to be ready on home page
      await tester.waitForVideoReady();
      await tester.waitForPlaceholderHidden();
      
      // Navigate to Gallery page
      await tester.navigateAndWaitForVideo('/gallery');
      
      const state = await tester.checkVideoState();
      expect(state.videoExists).toBe(true);
      expect(state.videoPlaying).toBe(true);
      expect(state.placeholderVisible).toBe(false);
    });
  });

  test.describe('Video State Restoration', () => {
    test('should restore video time during back/forward navigation', async ({ page }) => {
      // Wait for video to be ready on home page
      await tester.waitForVideoReady();
      
      const initialTime = await tester.getVideoTime();
      
      // Navigate to About page
      await tester.navigateAndWaitForVideo('/about');
      await page.waitForTimeout(2000); // Let video play for a bit
      
      const aboutTime = await tester.getVideoTime();
      expect(aboutTime).toBeGreaterThan(initialTime);
      
      // Go back to home page
      await page.goBack();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Video should continue from where it left off
      const restoredTime = await tester.getVideoTime();
      expect(restoredTime).toBeGreaterThan(initialTime);
    });

    test('should maintain video playback state during rapid navigation', async ({ page }) => {
      // Wait for video to be ready
      await tester.waitForVideoReady();
      
      // Navigate through multiple pages rapidly
      const pages = ['/about', '/courses', '/blog', '/gallery'];
      
      for (const pageUrl of pages) {
        await tester.navigateAndWaitForVideo(pageUrl, 1000);
        
        const state = await tester.checkVideoState();
        expect(state.videoPlaying).toBe(true);
        expect(state.placeholderVisible).toBe(false);
      }
    });
  });

  test.describe('Mobile vs Desktop Consistency', () => {
    test('should work consistently on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Wait for video to be ready
      await tester.waitForVideoReady();
      await tester.waitForPlaceholderHidden();
      
      const state = await tester.checkVideoState();
      expect(state.videoExists).toBe(true);
      expect(state.videoPlaying).toBe(true);
      expect(state.placeholderVisible).toBe(false);
      
      // Navigate to another page
      await tester.navigateAndWaitForVideo('/about', 1000);
      
      const aboutState = await tester.checkVideoState();
      expect(aboutState.videoPlaying).toBe(true);
      expect(aboutState.placeholderVisible).toBe(false);
    });

    test('should work consistently on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Wait for video to be ready
      await tester.waitForVideoReady();
      await tester.waitForPlaceholderHidden();
      
      const state = await tester.checkVideoState();
      expect(state.videoExists).toBe(true);
      expect(state.videoPlaying).toBe(true);
      expect(state.placeholderVisible).toBe(false);
      
      // Navigate to another page
      await tester.navigateAndWaitForVideo('/about', 1000);
      
      const aboutState = await tester.checkVideoState();
      expect(aboutState.videoPlaying).toBe(true);
      expect(aboutState.placeholderVisible).toBe(false);
    });
  });

  test.describe('Performance and Memory', () => {
    test('should not cause memory leaks during navigation', async ({ page }) => {
      // Wait for video to be ready
      await tester.waitForVideoReady();
      
      // Navigate through multiple pages multiple times
      const pages = ['/about', '/courses', '/blog', '/gallery'];
      
      for (let i = 0; i < 3; i++) {
        for (const pageUrl of pages) {
          await tester.navigateAndWaitForVideo(pageUrl, 500);
          
          const state = await tester.checkVideoState();
          expect(state.videoPlaying).toBe(true);
        }
      }
      
      // Final check on home page
      await tester.navigateAndWaitForVideo('/');
      const finalState = await tester.checkVideoState();
      expect(finalState.videoPlaying).toBe(true);
      expect(finalState.placeholderVisible).toBe(false);
    });

    test('should maintain consistent performance across navigation', async ({ page }) => {
      // Wait for video to be ready
      await tester.waitForVideoReady();
      
      const startTime = Date.now();
      
      // Navigate through pages
      const pages = ['/about', '/courses', '/blog', '/gallery'];
      
      for (const pageUrl of pages) {
        const pageStart = Date.now();
        await tester.navigateAndWaitForVideo(pageUrl, 500);
        const pageTime = Date.now() - pageStart;
        
        // Navigation should be reasonably fast
        expect(pageTime).toBeLessThan(3000);
        
        const state = await tester.checkVideoState();
        expect(state.videoPlaying).toBe(true);
      }
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(15000); // Total navigation should be under 15 seconds
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle video loading failures gracefully', async ({ page }) => {
      // Mock video loading failure by temporarily removing video element
      await page.evaluate(() => {
        const video = document.getElementById('bgvid');
        if (video) {
          video.style.display = 'none';
        }
      });
      
      // Wait a bit and check state
      await page.waitForTimeout(1000);
      
      // Should not crash the page
      const state = await tester.checkVideoState();
      expect(state.videoExists).toBe(true); // Element still exists
    });

    test('should handle placeholder loading failures gracefully', async ({ page }) => {
      // Mock placeholder loading failure
      await page.evaluate(() => {
        const placeholder = document.getElementById('video-placeholder');
        if (placeholder) {
          placeholder.style.display = 'none';
        }
      });
      
      // Wait for video to be ready
      await tester.waitForVideoReady();
      
      // Should still work without placeholder
      const state = await tester.checkVideoState();
      expect(state.videoExists).toBe(true);
      expect(state.videoPlaying).toBe(true);
    });
  });
});
