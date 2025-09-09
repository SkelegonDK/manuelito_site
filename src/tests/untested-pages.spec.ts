import { test, expect } from '@playwright/test';

test.describe('Untested Pages Coverage', () => {
  
  test('should load gallery page correctly', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Gallery/);
    
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Gallery');
    
    // Check for design entries
    const designEntries = page.locator('article');
    await expect(designEntries).toHaveCount(1);
    
    // Check for tech pills
    const techPills = page.locator('span.bg-bluey');
    await expect(techPills).toHaveCount(1);
    
    console.log('✅ Gallery page test passed');
  });

  test('should load courses index page correctly', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Courses/);
    
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toHaveText('On site GEN-AI Training');
    
    // Check for course cards
    const courseCards = page.locator('.grid > li');
    await expect(courseCards).toHaveCount(4);
    
    // Check for course titles
    const courseTitles = page.locator('h4');
    await expect(courseTitles).toHaveCount(4);
    
    console.log('✅ Courses index page test passed');
  });

  test('should load about page correctly', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/About/);
    
    // Check for About component content
    const aboutContent = page.locator('main');
    await expect(aboutContent).toBeVisible();
    
    // Check for toolbelt section (if present)
    const toolbelt = page.locator('.toolbelt, [class*="toolbelt"]');
    if (await toolbelt.count() > 0) {
      await expect(toolbelt.first()).toBeVisible();
    }
    
    console.log('✅ About page test passed');
  });

  test('should load individual course pages correctly', async ({ page }) => {
    // First get the list of courses
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Get course links
    const courseLinks = page.locator('a[href^="/courses/"]');
    const courseCount = await courseLinks.count();
    
    if (courseCount === 0) {
      console.log('No individual course pages found, skipping test');
      return;
    }
    
    // Test the first course
    const firstCourseLink = courseLinks.first();
    const href = await firstCourseLink.getAttribute('href');
    
    if (href) {
      await firstCourseLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check that we're on a course page
      expect(page.url()).toContain('/courses/');
      
      // Check for course content
      const courseContent = page.locator('main');
      await expect(courseContent).toBeVisible();
      
      console.log(`✅ Individual course page test passed: ${href}`);
    }
  });

  test('should load individual blog post pages correctly', async ({ page }) => {
    // First get the list of blog posts
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Get blog post links
    const blogLinks = page.locator('a[href^="/blog/"]');
    const blogCount = await blogLinks.count();
    
    if (blogCount === 0) {
      console.log('No individual blog posts found, skipping test');
      return;
    }
    
    // Test the first blog post
    const firstBlogLink = blogLinks.first();
    const href = await firstBlogLink.getAttribute('href');
    
    if (href) {
      await firstBlogLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check that we're on a blog post page
      expect(page.url()).toContain('/blog/');
      
      // Check for blog content
      const blogContent = page.locator('main');
      await expect(blogContent).toBeVisible();
      
      console.log(`✅ Individual blog post test passed: ${href}`);
    }
  });

  test('should have consistent navigation across all pages', async ({ page }) => {
    const pages = ['/', '/about', '/courses', '/blog', '/gallery'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Check for consistent header elements
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // Check for consistent footer elements
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      
      // Check for theme toggle (if present)
      const themeToggle = page.locator('#themeToggle');
      if (await themeToggle.count() > 0) {
        await expect(themeToggle.first()).toBeVisible();
      }
      
      console.log(`✅ Navigation consistency check passed for: ${pagePath}`);
    }
  });
});
