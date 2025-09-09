import { test, expect } from '@playwright/test';

test.describe('Basic Navigation Tests', () => {
  test('should load homepage and display navigation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page loads successfully
    await expect(page).toHaveTitle(/Manuel Thomsen/);
    
    // Check for desktop navigation (should be visible on desktop)
    const desktopNav = page.locator('ul.hidden.md\\:flex');
    await expect(desktopNav).toBeVisible();
    
    // Check for mobile hamburger (should be hidden on desktop)
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    await expect(hamburger).toBeHidden();
    
    console.log('✅ Desktop navigation test passed');
  });

  test('should display mobile navigation on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Mobile hamburger should be visible
    const hamburger = page.locator('[data-testid="mobile-hamburger"]');
    await expect(hamburger).toBeVisible();
    
    // Desktop navigation should be hidden
    const desktopNav = page.locator('ul.hidden.md\\:flex');
    await expect(desktopNav).toBeHidden();
    
    console.log('✅ Mobile navigation test passed');
  });

  test('should open and close mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
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
    await expect(hamburger).toHaveClass(/is-active/);
    
    // Close menu (try direct JavaScript approach first)
    await page.evaluate(() => {
      const burger = document.querySelector('[data-testid="mobile-hamburger"]') as HTMLElement | null;
      type WithMobileNav = Window & { mobileNav?: { toggleMenu: () => void } };
      const w = window as WithMobileNav;
      if (burger && w.mobileNav) {
        console.log('Manually triggering toggle via mobileNav');
        w.mobileNav.toggleMenu();
      } else if (burger) {
        console.log('Fallback: direct click event');
        burger.click();
      }
    });
    
    await page.waitForTimeout(700); // Increased wait time for animation
    
    // Menu should be closed
    await expect(mobileNav).toHaveCSS('height', '0px');
    await expect(hamburger).not.toHaveClass(/is-active/);
    
    console.log('✅ Mobile menu toggle test passed');
  });

  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const links = [
      { href: '/about', expectedTitle: /About/ },
      { href: '/courses', expectedTitle: /Courses/ },
      { href: '/blog', expectedTitle: /Blog/ }
    ];
    
    // Determine if we're on mobile or desktop viewport
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;
    
    for (const link of links) {
      if (isMobile) {
        // Mobile navigation: use hamburger menu
        const hamburger = page.locator('[data-testid="mobile-hamburger"]');
        const mobileNav = page.locator('[data-testid="mobile-navigation"]');
        
        // Open mobile menu
        await hamburger.click();
        await page.waitForTimeout(700);
        
        // Click navigation link in mobile menu
        await mobileNav.locator(`a[href="${link.href}"]`).click();
        await page.waitForLoadState('networkidle');
        
        // Note: Menu should close automatically after navigation
      } else {
        // Desktop navigation: use desktop nav links
        const desktopNavLink = page.locator(`ul.hidden.md\\:flex a[data-nav-link="${link.href}"]`);
        await desktopNavLink.click();
        await page.waitForLoadState('networkidle');
      }
      
      await page.waitForTimeout(300); // Extra wait for navigation to complete
      
      // Verify navigation occurred
      expect(page.url()).toContain(link.href);
      await expect(page).toHaveTitle(link.expectedTitle);
      
      console.log(`✅ Navigation to ${link.href} test passed`);
    }
  });
});
