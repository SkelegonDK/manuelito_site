import { test, expect, type Page } from '@playwright/test';

/**
 * Comprehensive Navigation Test Suite
 * Tests for both desktop and mobile navigation functionality
 * Converted from hamburger-menu.test.js and enhanced with Playwright
 */

// Test data for navigation links (updated to remove services)
const navigationLinks = [
  { href: '/', text: 'Home', expectedTitle: /Manuel Thomsen/ },
  { href: '/about', text: 'About Me', expectedTitle: /About/ },
  { href: '/courses', text: 'Courses', expectedTitle: /Courses/ },
  { href: '/gallery', text: 'Gallery', expectedTitle: /Gallery/ },
  { href: '/blog', text: 'Blog', expectedTitle: /Blog/ }
];

// Helper function to wait for page to be fully loaded
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Additional wait for animations
}

// Helper function to reliably close hamburger menu
async function closeHamburgerMenu(page: Page) {
  await page.evaluate(() => {
    const burger = document.querySelector('[data-testid="mobile-hamburger"]') as HTMLButtonElement | null;
    if (burger && (window as any).mobileNav && typeof (window as any).mobileNav.toggleMenu === 'function') {
      (window as any).mobileNav.toggleMenu();
    } else if (burger) {
      burger.click();
    }
  });
  await page.waitForTimeout(700);
}

test.describe('Desktop Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should display desktop navigation on desktop viewport', async ({ page }) => {
    // Desktop navigation should be visible
    const desktopNav = page.locator('ul.hidden.md\\:flex');
    await expect(desktopNav).toBeVisible();
    
    // Mobile hamburger should be hidden
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    await expect(hamburger).toBeHidden();
  });

  test('should have all expected navigation links in desktop nav', async ({ page }) => {
    for (const link of navigationLinks) {
      const navLink = page.locator(`a[href="${link.href}"]`).first();
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveText(link.text);
    }
  });

  test('should navigate to correct pages when desktop nav links are clicked', async ({ page }) => {
    for (const link of navigationLinks) {
      // Skip home since we're already there
      if (link.href === '/') continue;
      
      // Click the navigation link
      await page.locator(`a[href="${link.href}"]`).first().click();
      await waitForPageLoad(page);
      
      // Verify URL
      expect(page.url()).toContain(link.href);
      
      // Verify page title contains expected text
      await expect(page).toHaveTitle(link.expectedTitle);
      
      // Go back to home for next test
      await page.goto('/');
      await waitForPageLoad(page);
    }
  });

  test('should have theme toggle button visible on desktop', async ({ page }) => {
    const themeToggle = page.locator('.hidden.md\\:block').locator('button');
    await expect(themeToggle).toBeVisible();
  });

  test('should preload navigation links on hover', async ({ page }) => {
    // Test hover behavior on a navigation link
    const aboutLink = page.locator('a[href="/about"]').first();
    await aboutLink.hover();
    
    // Wait a moment for any preloading to occur
    await page.waitForTimeout(100);
    
    // The link should still be visible and clickable
    await expect(aboutLink).toBeVisible();
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should display hamburger menu on mobile viewport', async ({ page }) => {
    // Hamburger button should be visible
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    await expect(hamburger).toBeVisible();
    
    // Desktop navigation should be hidden
    const desktopNav = page.locator('ul.hidden.md\\:flex');
    await expect(desktopNav).toBeHidden();
  });

  test('should have proper ARIA attributes on hamburger button', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    
    await expect(hamburger).toHaveAttribute('aria-label', 'Toggle mobile menu');
    await expect(hamburger).toHaveAttribute('aria-controls', 'mobile-navigation');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should open mobile menu when hamburger is clicked', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Initially menu should be closed
    await expect(mobileNav).toHaveCSS('height', '0px');
    
    // Click hamburger to open menu
    await hamburger.click();
    await page.waitForTimeout(700); // Increased wait time for animation
    
    // Menu should be open (height should be viewport height minus header height)
    const viewportHeight = page.viewportSize()?.height || 667;
    const headerHeight = 80; // 5rem = 80px
    const expectedMenuHeight = viewportHeight - headerHeight;
    await expect(mobileNav).toHaveCSS('height', `${expectedMenuHeight}px`);
    await expect(mobileNav).toHaveClass(/menu-open/);
    await expect(hamburger).toHaveClass(/is-active/);
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    
    // Body should have overflow hidden to prevent scrolling
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  });

  test('should close mobile menu when hamburger is clicked again', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Open menu first
    await hamburger.click();
    await page.waitForTimeout(700);
    await expect(mobileNav).toHaveClass(/menu-open/);
    
    // Close menu
    await closeHamburgerMenu(page);
    
    // Menu should be closed
    await expect(mobileNav).toHaveCSS('height', '0px');
    await expect(mobileNav).not.toHaveClass(/menu-open/);
    await expect(hamburger).not.toHaveClass(/is-active/);
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    
    // Body overflow should be restored
    await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
  });

  test('should have all navigation links in mobile menu', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    
    // Open mobile menu
    await hamburger.click();
    await page.waitForTimeout(700);
    
    // Check all navigation links are present
    for (const link of navigationLinks) {
      const navLink = page.locator('[data-testid="mobile-navigation"]').locator(`a[href="${link.href}"]`);
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveText(link.text);
    }
  });

  test('should navigate correctly when mobile nav links are clicked', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    
    for (const link of navigationLinks) {
      // Skip home since we're already there for the first iteration
      if (link.href === '/') continue;
      
      // Go to home page first
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Open mobile menu
      await hamburger.click();
      await page.waitForTimeout(700);
      
      // Click navigation link
      await page.locator('[data-testid="mobile-navigation"]').locator(`a[href="${link.href}"]`).click();
      await waitForPageLoad(page);
      
      // Verify navigation occurred
      expect(page.url()).toContain(link.href);
      await expect(page).toHaveTitle(link.expectedTitle);
      
      // Menu should be closed after navigation
      const mobileNav = page.locator('[data-testid="mobile-navigation"]');
      await expect(mobileNav).toHaveCSS('height', '0px');
    }
  });

  test('should close mobile menu when clicking outside', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Open menu
    await hamburger.click();
    await page.waitForTimeout(700);
    await expect(mobileNav).toHaveClass(/menu-open/);
    
    // Click outside the menu (on the body)
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(700);
    
    // Menu should be closed
    await expect(mobileNav).toHaveCSS('height', '0px');
    await expect(hamburger).not.toHaveClass(/is-active/);
  });

  test('should close mobile menu when Escape key is pressed', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Open menu
    await hamburger.click();
    await page.waitForTimeout(700);
    await expect(mobileNav).toHaveClass(/menu-open/);
    
    // Press Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    
    // Menu should be closed
    await expect(mobileNav).toHaveCSS('height', '0px');
    await expect(hamburger).not.toHaveClass(/is-active/);
  });

  test('should not close mobile menu when clicking inside menu', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Open menu
    await hamburger.click();
    await page.waitForTimeout(700);
    await expect(mobileNav).toHaveClass(/menu-open/);
    
    // Click inside the menu (but not on a link)
    await mobileNav.locator('ul').click();
    await page.waitForTimeout(300);
    
    // Menu should still be open
    await expect(mobileNav).toHaveClass(/menu-open/);
    await expect(hamburger).toHaveClass(/is-active/);
  });

  test('should have proper z-index layering', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Open menu
    await hamburger.click();
    await page.waitForTimeout(700);
    
    // Check z-index values
    await expect(mobileNav).toHaveCSS('z-index', '3000');
    
    // Hamburger should also have high z-index
    const hamburgerZIndex = await hamburger.evaluate(el => 
      window.getComputedStyle(el).getPropertyValue('z-index')
    );
    expect(parseInt(hamburgerZIndex)).toBeGreaterThanOrEqual(4000);
  });

  test('should have backdrop blur effect', async ({ page }) => {
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Open menu
    await hamburger.click();
    await page.waitForTimeout(700);
    
    // Check for backdrop blur class
    await expect(mobileNav).toHaveClass(/backdrop-blur-md/);
    
    // Check background color with transparency
    const bgColor = await mobileNav.evaluate(el => 
      window.getComputedStyle(el).getPropertyValue('background-color')
    );
    
    // Should have some transparency (rgba or hsla)
    expect(bgColor).toMatch(/rgba|hsla/);
  });
});

test.describe('Responsive Navigation Behavior', () => {
  test('should switch between desktop and mobile nav based on viewport', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Start with desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const desktopNav = page.locator('ul.hidden.md\\:flex');
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    
    // Desktop nav should be visible, hamburger hidden
    await expect(desktopNav).toBeVisible();
    await expect(hamburger).toBeHidden();
    
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    
    // Mobile nav should be visible, desktop nav hidden
    await expect(hamburger).toBeVisible();
    await expect(desktopNav).toBeHidden();
    
    // Switch back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);
    
    // Desktop nav should be visible again
    await expect(desktopNav).toBeVisible();
    await expect(hamburger).toBeHidden();
  });

  test('should close mobile menu when switching to desktop viewport', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Start with mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Open mobile menu
    await hamburger.click();
    await page.waitForTimeout(700);
    await expect(mobileNav).toHaveClass(/menu-open/);
    
    // Switch to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);
    
    // Mobile menu should be closed/hidden
    await expect(hamburger).toBeHidden();
    
    // Body overflow should be restored
    await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
  });
});

test.describe('Navigation Accessibility', () => {
  test('should be keyboard navigable on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Tab through navigation links
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through links with Tab
    for (const link of navigationLinks) {
      if (link.href === '/') continue; // Skip home since we're already there
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Press Enter to activate link
      await page.keyboard.press('Enter');
      await waitForPageLoad(page);
      expect(page.url()).toContain(link.href);
      
      // Go back to test next link
      await page.goBack();
      await waitForPageLoad(page);
      
      await page.keyboard.press('Tab');
    }
  });

  test('should be keyboard navigable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);
    
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    
    // Tab to hamburger button
    await page.keyboard.press('Tab');
    await expect(hamburger).toBeFocused();
    
    // Press Enter to open menu
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    await expect(mobileNav).toHaveClass(/menu-open/);
    
    // Should be able to tab through mobile nav links
    await page.keyboard.press('Tab');
    const firstLink = page.locator('[data-testid="mobile-navigation"] a').first();
    await expect(firstLink).toBeFocused();
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Tab to first navigation link
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check that focus is visible (should have outline or similar)
    const outline = await focusedElement.evaluate(el => 
      window.getComputedStyle(el).getPropertyValue('outline')
    );
    
    // Should have some form of focus indicator
    expect(outline).not.toBe('none');
  });
});

test.describe('Navigation Performance', () => {
  test('should load navigation quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await waitForPageLoad(page);
    
    const loadTime = Date.now() - startTime;
    
    // Navigation should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Navigation elements should be visible
    const hasDesktopNav = await page.locator('ul.hidden.md\\:flex').isVisible();
    const hasMobileNav = await page.locator('[data-testid="mobile-hamburger"]').isVisible();
    
    // At least one navigation should be visible
    expect(hasDesktopNav || hasMobileNav).toBe(true);
  });

  test('should handle rapid menu toggles without breaking', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);
    
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    
    // Rapidly toggle menu multiple times
    for (let i = 0; i < 5; i++) {
      await hamburger.click();
      await page.waitForTimeout(100); // Short wait
      await hamburger.click();
      await page.waitForTimeout(100);
    }
    
    // Menu should still be functional
    await hamburger.click();
    await page.waitForTimeout(700);
    await expect(mobileNav).toHaveClass(/menu-open/);
    
    await hamburger.click();
    await page.waitForTimeout(700);
    await expect(mobileNav).not.toHaveClass(/menu-open/);
  });
});
