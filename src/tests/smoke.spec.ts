import { test, expect } from '@playwright/test';

// Fast smoke checks for critical routes and navigation.
// Intentionally minimal: aims for <10s total on a typical machine.

test('smoke: home loads without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();

  // Ensure no console errors on initial render
  expect(consoleErrors, `Console errors on home: ${consoleErrors.join('\n')}`).toHaveLength(0);
});

test('smoke: navigate to About', async ({ page }) => {
  await page.goto('/about');
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('main')).toBeVisible();
});

test('smoke: navigate to Courses', async ({ page }) => {
  await page.goto('/courses');
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.getByRole('main')).toBeVisible();
});

test('smoke: navigate to Blog and open a post link if present', async ({ page }) => {
  await page.goto('/blog');
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole('main')).toBeVisible();

  // If there are post links, click the first to ensure detail navigation works
  const firstPost = page.locator('a[href^="/blog/"]').first();
  if (await firstPost.count()) {
    await firstPost.click();
    await expect(page).toHaveURL(/\/blog\//);
    await expect(page.locator('article').first()).toBeVisible();
  }
});


