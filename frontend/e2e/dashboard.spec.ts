import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  // Use a beforeEach to login once per test block, or test.beforeAll to login once.
  test.beforeEach(async ({ page }) => {
    // Login sequence
    await page.goto('/login');
    await page.locator('.dt-select').selectOption('all');
    await page.locator('input[type="email"]').fill('super_admin@p5digital.local');
    await page.locator('input[type="password"]').fill('Admin@P5Digital2024!');
    await page.locator('button[type="submit"]').click();
    
    // Ensure we are off the login page
    await expect(page).not.toHaveURL(/.*login/);
    
    // Explicitly navigate to the dashboard (often / or /dashboard or /app)
    await page.goto('/super-admin.html');
  });

  test('dashboard should load main summary widgets', async ({ page }) => {
    // Wait for network idle or a specific widget to be visible
    // Since this might be a React app fetching data, we check for common text.
    await expect(page.locator('text=/कुल/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('sidebar navigation should be visible', async ({ page }) => {
    // Most dashboards have a nav or aside element
    await expect(page.locator('nav, aside, .sidebar')).toBeVisible();
  });
});
