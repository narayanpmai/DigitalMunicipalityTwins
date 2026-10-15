import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Basic check to see if the app loads and has a title
  await expect(page).toHaveTitle(/P5 Digital Twin/i);
});

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  // Check if login elements are visible
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
