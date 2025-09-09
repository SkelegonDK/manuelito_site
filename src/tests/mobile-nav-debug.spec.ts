import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation Debug', () => {
  test('should debug mobile navigation height calculation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for mobile navigation to be initialized
    await page.waitForFunction(() => {
      return (window as any).mobileNav !== undefined;
    }, { timeout: 5000 });
    
    // Get mobile navigation element
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Check that the element exists but is initially hidden (height: 0)
    await expect(mobileNav).toBeAttached();
    await expect(mobileNav).toHaveCSS('height', '0px');
    
    // Check initial state
    const initialHeight = await mobileNav.evaluate(el => {
      const computedStyle = window.getComputedStyle(el);
      return {
        height: computedStyle.height,
        classList: el.classList.toString(),
        styleHeight: (el as HTMLElement).style.height
      };
    });
    
    console.log('Initial mobile nav state:', initialHeight);
    
    // Click hamburger button
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    await hamburger.click();
    
    // Wait for animation
    await page.waitForTimeout(700);
    
    // Check open state
    const openHeight = await mobileNav.evaluate(el => {
      const computedStyle = window.getComputedStyle(el);
      return {
        height: computedStyle.height,
        classList: el.classList.toString(),
        styleHeight: (el as HTMLElement).style.height,
        viewportHeight: window.innerHeight,
        bodyHeight: document.body.clientHeight
      };
    });
    
    console.log('Open mobile nav state:', openHeight);
    
    // Check if menu-open class is present
    const hasMenuOpenClass = await mobileNav.evaluate(el => 
      el.classList.contains('menu-open')
    );
    
    console.log('Has menu-open class:', hasMenuOpenClass);
    
    // Verify the height calculation - now expecting viewport height - 80px
    const expectedHeight = 667 - 80; // viewport height - header height
    const actualHeight = parseInt(openHeight.height);
    
    console.log(`Expected height: ${expectedHeight}px, Actual height: ${actualHeight}px`);
    
    // Basic assertions - updated for new height calculation
    expect(hasMenuOpenClass).toBe(true);
    expect(actualHeight).toBe(expectedHeight); // Should be exactly 587px for 667px viewport
    
    // Test the new getMenuState method if available
    const menuState = await page.evaluate(() => {
      if ((window as any).mobileNav) {
        return (window as any).mobileNav.getMenuState();
      }
      return null;
    });
    
    if (menuState) {
      console.log('Menu state from utility:', menuState);
      expect(menuState.hasMenuOpenClass).toBe(true);
      expect(menuState.isVisible).toBe(true);
    }
  });
});
