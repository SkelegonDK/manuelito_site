import { test, expect, type Page } from '@playwright/test';

/**
 * Mobile Navigation Performance Test Suite
 * 
 * This test suite focuses on performance testing of the mobile navigation system,
 * including timing measurements, performance benchmarks, and stress testing.
 */

interface PerformanceMetrics {
  openTime: number;
  closeTime: number;
  totalAnimationTime: number;
  memoryUsage?: number;
  frameRate?: number;
}

interface NavigationState {
  isAnimating: boolean;
  isActive: boolean;
  hasHamburger: boolean;
  hasMenu: boolean;
}

class MobileNavigationPerformanceTester {
  private page: Page;
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Start performance measurement
   */
  startMeasurement(): void {
    this.startTime = performance.now();
  }

  /**
   * End performance measurement and return duration
   */
  endMeasurement(): number {
    return performance.now() - this.startTime;
  }

  /**
   * Get current navigation state from JavaScript
   */
  async getNavigationState(): Promise<NavigationState> {
    return await this.page.evaluate(() => {
      if ((window as any).mobileNav) {
        return (window as any).mobileNav.getState();
      }
      return {
        isAnimating: false,
        isActive: false,
        hasHamburger: false,
        hasMenu: false
      };
    });
  }

  /**
   * Wait for animation to complete
   */
  async waitForAnimationComplete(): Promise<void> {
    await this.page.waitForFunction(() => {
      if ((window as any).mobileNav) {
        return !(window as any).mobileNav.getState().isAnimating;
      }
      return true;
    }, { timeout: 10000 });
  }

  /**
   * Measure menu open performance
   */
  async measureMenuOpen(): Promise<number> {
    const hamburger = this.page.locator('[data-testid="mobile-hamburger"]');
    
    // Ensure menu is closed first
    const initialState = await this.getNavigationState();
    if (initialState.isActive) {
      await this.closeMenu();
    }

    // Start measurement
    this.startMeasurement();
    
    // Click hamburger to open
    await hamburger.click();
    
    // Wait for animation to complete
    await this.waitForAnimationComplete();
    
    // End measurement
    const openTime = this.endMeasurement();
    
    // Verify menu is open
    await expect(this.page.locator('[data-testid="mobile-navigation"]')).toHaveClass(/menu-open/);
    
    return openTime;
  }

  /**
   * Measure menu close performance
   */
  async measureMenuClose(): Promise<number> {
    const hamburger = this.page.locator('[data-testid="mobile-hamburger"]');
    
    // Ensure menu is open first using force method
    const initialState = await this.getNavigationState();
    if (!initialState.isActive) {
      await this.forceOpenMenu();
    }

    // Start measurement
    this.startMeasurement();
    
    // Click hamburger to close
    await hamburger.click();
    
    // Wait for animation to complete
    await this.waitForAnimationComplete();
    
    // End measurement
    const closeTime = this.endMeasurement();
    
    // Verify menu is closed
    await expect(this.page.locator('[data-testid="mobile-navigation"]')).not.toHaveClass(/menu-open/);
    
    return closeTime;
  }

  /**
   * Open menu programmatically
   */
  async openMenu(): Promise<void> {
    await this.page.evaluate(() => {
      if ((window as any).mobileNav) {
        (window as any).mobileNav.forceOpenMenu();
      }
    });
    await this.waitForAnimationComplete();
  }

  /**
   * Close menu programmatically
   */
  async closeMenu(): Promise<void> {
    await this.page.evaluate(() => {
      if ((window as any).mobileNav) {
        (window as any).mobileNav.forceCloseMenu();
      }
    });
    await this.waitForAnimationComplete();
  }
  
  /**
   * Force open menu for testing
   */
  async forceOpenMenu(): Promise<void> {
    await this.page.evaluate(() => {
      if ((window as any).mobileNav) {
        (window as any).mobileNav.forceOpenMenu();
      }
    });
    await this.waitForAnimationComplete();
  }
  
  /**
   * Force close menu for testing
   */
  async forceCloseMenu(): Promise<void> {
    await this.page.evaluate(() => {
      if ((window as any).mobileNav) {
        (window as any).mobileNav.forceCloseMenu();
      }
    });
    await this.waitForAnimationComplete();
  }

  /**
   * Collect performance metrics for a single open/close cycle
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    const openTime = await this.measureMenuOpen();
    const closeTime = await this.measureMenuClose();
    
    const metrics: PerformanceMetrics = {
      openTime,
      closeTime,
      totalAnimationTime: openTime + closeTime
    };

    // Try to collect memory usage if available
    try {
      const memoryInfo = await this.page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return undefined;
      });
      if (memoryInfo) {
        metrics.memoryUsage = memoryInfo;
      }
    } catch (error) {
      // Memory API not available, skip
    }

    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * Get average performance metrics
   */
  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      throw new Error('No metrics collected yet');
    }

    const total = this.metrics.reduce((acc, metric) => ({
      openTime: acc.openTime + metric.openTime,
      closeTime: acc.closeTime + metric.closeTime,
      totalAnimationTime: acc.totalAnimationTime + metric.totalAnimationTime,
      memoryUsage: acc.memoryUsage ? (acc.memoryUsage + (metric.memoryUsage || 0)) : undefined,
      frameRate: acc.frameRate ? (acc.frameRate + (metric.frameRate || 0)) : undefined
    }), {
      openTime: 0,
      closeTime: 0,
      totalAnimationTime: 0,
      memoryUsage: 0,
      frameRate: 0
    });

    const count = this.metrics.length;
    return {
      openTime: total.openTime / count,
      closeTime: total.closeTime / count,
      totalAnimationTime: total.totalAnimationTime / count,
      memoryUsage: total.memoryUsage ? total.memoryUsage / count : undefined,
      frameRate: total.frameRate ? total.frameRate / count : undefined
    };
  }

  /**
   * Clear collected metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

test.describe('Mobile Navigation Performance Tests', () => {
  let performanceTester: MobileNavigationPerformanceTester;

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage and wait for mobile navigation to be ready
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-hamburger"]');
    
    // Wait for mobile navigation to initialize
    await page.waitForFunction(() => {
      return !!(window as any).mobileNav;
    }, { timeout: 10000 });
    
    performanceTester = new MobileNavigationPerformanceTester(page);
  });

  test('should open mobile menu within performance threshold', async ({ page }) => {
    const openTime = await performanceTester.measureMenuOpen();
    
    // Performance threshold: menu should open within 800ms (500ms animation + 300ms buffer)
    expect(openTime).toBeLessThan(800);
    
    console.log(`Menu open time: ${openTime.toFixed(2)}ms`);
  });

  test('should close mobile menu within performance threshold', async ({ page }) => {
    const closeTime = await performanceTester.measureMenuClose();
    
    // Performance threshold: menu should close within 800ms (500ms animation + 300ms buffer)
    expect(closeTime).toBeLessThan(800);
    
    console.log(`Menu close time: ${closeTime.toFixed(2)}ms`);
  });

  test('should complete open/close cycle within performance threshold', async ({ page }) => {
    const metrics = await performanceTester.collectMetrics();
    
    // Performance threshold: total cycle should complete within 1200ms
    expect(metrics.totalAnimationTime).toBeLessThan(1200);
    
    console.log(`Total cycle time: ${metrics.totalAnimationTime.toFixed(2)}ms`);
    console.log(`Open time: ${metrics.openTime.toFixed(2)}ms`);
    console.log(`Close time: ${metrics.closeTime.toFixed(2)}ms`);
  });

  test('should maintain consistent performance across multiple cycles', async ({ page }) => {
    const cycles = 5;
    const metrics: PerformanceMetrics[] = [];
    
    // Collect metrics for multiple cycles
    for (let i = 0; i < cycles; i++) {
      const cycleMetrics = await performanceTester.collectMetrics();
      metrics.push(cycleMetrics);
      
      // Small delay between cycles
      await page.waitForTimeout(100);
    }
    
    // Calculate variance in performance
    const avgOpenTime = metrics.reduce((sum, m) => sum + m.openTime, 0) / cycles;
    const openTimeVariance = metrics.reduce((sum, m) => sum + Math.pow(m.openTime - avgOpenTime, 2), 0) / cycles;
    const openTimeStdDev = Math.sqrt(openTimeVariance);
    
    // Performance should be consistent (low variance)
    expect(openTimeStdDev).toBeLessThan(100); // Standard deviation should be less than 100ms
    
    console.log(`Average open time: ${avgOpenTime.toFixed(2)}ms`);
    console.log(`Open time standard deviation: ${openTimeStdDev.toFixed(2)}ms`);
  });

  test('should handle rapid interactions without performance degradation', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const rapidClicks = 10;
    const clickInterval = 50; // 50ms between clicks
    
    // Perform rapid clicks
    for (let i = 0; i < rapidClicks; i++) {
      await hamburger.click();
      await page.waitForTimeout(clickInterval);
    }
    
    // Wait for any pending animations to complete
    await performanceTester.waitForAnimationComplete();
    
    // Verify navigation state is stable
    const finalState = await performanceTester.getNavigationState();
    expect(finalState.isAnimating).toBe(false);
    
    console.log(`Completed ${rapidClicks} rapid clicks without performance degradation`);
  });

  test('should handle navigation link clicks efficiently', async ({ page }) => {
    // Open menu first
    await performanceTester.openMenu();
    
    const navLinks = page.locator('[data-testid="mobile-navigation"] a');
    const linkCount = await navLinks.count();
    
    // Test each navigation link
    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && href !== '/') {
        // Start measurement
        performanceTester.startMeasurement();
        
        // Click link
        await link.click();
        
        // Wait for navigation and menu close
        await page.waitForURL(`**${href}`);
        await performanceTester.waitForAnimationComplete();
        
        // End measurement
        const navigationTime = performanceTester.endMeasurement();
        
        // Navigation should complete within reasonable time
        expect(navigationTime).toBeLessThan(2000);
        
        console.log(`Navigation to ${href}: ${navigationTime.toFixed(2)}ms`);
        
        // Go back to homepage for next test
        await page.goto('/');
        await page.waitForSelector('[data-testid="mobile-hamburger"]');
        await page.waitForFunction(() => {
          return !!(window as any).mobileNav;
        });
        
        // Reopen menu
        await performanceTester.openMenu();
      }
    }
  });

  test('should maintain performance under memory pressure', async ({ page }) => {
    // Simulate memory pressure by creating many DOM elements
    await page.evaluate(() => {
      // Create temporary elements to simulate memory pressure
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.textContent = `Test element ${i}`;
        document.body.appendChild(div);
      }
    });
    
    // Test performance under memory pressure
    const metrics = await performanceTester.collectMetrics();
    
    // Performance should still be within acceptable range
    expect(metrics.totalAnimationTime).toBeLessThan(1500);
    
    // Clean up
    await page.evaluate(() => {
      const testElements = document.querySelectorAll('div[textContent*="Test element"]');
      testElements.forEach(el => el.remove());
    });
    
    console.log(`Performance under memory pressure: ${metrics.totalAnimationTime.toFixed(2)}ms`);
  });

  test('should handle theme switching without performance impact', async ({ page }) => {
    // Test performance in light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    
    const lightThemeMetrics = await performanceTester.collectMetrics();
    
    // Switch to dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    
    const darkThemeMetrics = await performanceTester.collectMetrics();
    
    // Performance should be similar in both themes
    const performanceDifference = Math.abs(lightThemeMetrics.totalAnimationTime - darkThemeMetrics.totalAnimationTime);
    expect(performanceDifference).toBeLessThan(200); // Difference should be less than 200ms
    
    console.log(`Light theme performance: ${lightThemeMetrics.totalAnimationTime.toFixed(2)}ms`);
    console.log(`Dark theme performance: ${darkThemeMetrics.totalAnimationTime.toFixed(2)}ms`);
    console.log(`Performance difference: ${performanceDifference.toFixed(2)}ms`);
  });

  test('should provide detailed performance metrics', async ({ page }) => {
    // Collect comprehensive metrics
    const metrics = await performanceTester.collectMetrics();
    
    // Verify all required metrics are present
    expect(metrics.openTime).toBeGreaterThan(0);
    expect(metrics.closeTime).toBeGreaterThan(0);
    expect(metrics.totalAnimationTime).toBeGreaterThan(0);
    
    // Log detailed metrics
    console.log('=== Performance Metrics ===');
    console.log(`Open Time: ${metrics.openTime.toFixed(2)}ms`);
    console.log(`Close Time: ${metrics.closeTime.toFixed(2)}ms`);
    console.log(`Total Animation Time: ${metrics.totalAnimationTime.toFixed(2)}ms`);
    if (metrics.memoryUsage) {
      console.log(`Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
    if (metrics.frameRate) {
      console.log(`Frame Rate: ${metrics.frameRate.toFixed(2)}fps`);
    }
    
    // Performance should meet minimum requirements
    expect(metrics.openTime).toBeLessThan(800);
    expect(metrics.closeTime).toBeLessThan(800);
    expect(metrics.totalAnimationTime).toBeLessThan(1200);
  });

  test('should keep hamburger button clickable when menu is open', async ({ page }) => {
    // This test verifies that the pointer events issue is fixed
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    
    // Open menu first
    await performanceTester.forceOpenMenu();
    
    // Verify menu is open
    await expect(page.locator('[data-testid="mobile-navigation"]')).toHaveClass(/menu-open/);
    
    // Try to click hamburger button while menu is open
    // This should work without the pointer events issue
    await hamburger.click();
    
    // Wait for animation to complete
    await performanceTester.waitForAnimationComplete();
    
    // Verify menu is now closed
    await expect(page.locator('[data-testid="mobile-navigation"]')).not.toHaveClass(/menu-open/);
    
    console.log('Hamburger button remains clickable when menu is open - pointer events issue fixed');
  });
});

test.describe('Mobile Navigation Stress Tests', () => {
  test('should handle continuous rapid interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-hamburger"]');
    
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const iterations = 20;
    
    // Perform many rapid interactions
    for (let i = 0; i < iterations; i++) {
      await hamburger.click();
      await page.waitForTimeout(100); // Small delay
    }
    
    // Wait for final animation to complete
    await page.waitForFunction(() => {
      if ((window as any).mobileNav) {
        return !(window as any).mobileNav.getState().isAnimating;
      }
      return true;
    }, { timeout: 10000 });
    
    // Verify system is still stable
    const finalState = await page.evaluate(() => {
      if ((window as any).mobileNav) {
        return (window as any).mobileNav.getState();
      }
      return { isAnimating: false, isActive: false };
    });
    
    expect(finalState.isAnimating).toBe(false);
    console.log(`Completed ${iterations} rapid interactions without system failure`);
  });

  test('should handle navigation during animations', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-hamburger"]');
    
    // Start opening menu
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    await hamburger.click();
    
    // Immediately try to close (during animation)
    await page.waitForTimeout(100);
    await hamburger.click();
    
    // Wait for animation to complete
    await page.waitForFunction(() => {
      if ((window as any).mobileNav) {
        return !(window as any).mobileNav.getState().isAnimating;
      }
      return true;
    }, { timeout: 10000 });
    
    // Verify final state is consistent
    const finalState = await page.evaluate(() => {
      if ((window as any).mobileNav) {
        return (window as any).mobileNav.getState();
      }
      return { isAnimating: false, isActive: false };
    });
    
    expect(finalState.isAnimating).toBe(false);
    console.log('Successfully handled navigation during animation');
  });
});
