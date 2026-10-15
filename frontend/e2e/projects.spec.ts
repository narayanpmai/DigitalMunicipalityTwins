import { test, expect } from '@playwright/test';

test.describe('Projects Module Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login sequence
    await page.goto('/login');
    await page.locator('.dt-select').selectOption('all');
    await page.locator('input[type="email"]').fill('super_admin@p5digital.local');
    await page.locator('input[type="password"]').fill('Admin@P5Digital2024!');
    await page.locator('button[type="submit"]').click();
    
    // Ensure we are logged in
    await expect(page).not.toHaveURL(/.*login/);
    
    // Navigate to Projects Module
    await page.goto('/super-admin.html#/projects');
  });

  test('should load projects page and its tabs', async ({ page }) => {
    // The projects page should have a header
    await expect(page.locator('text=/योजना तथा परियोजना व्यवस्थापन/i').first()).toBeVisible({ timeout: 10000 });
    
    // Check for standard tabs
    await expect(page.locator('text=/नयाँ योजना/i').first()).toBeVisible();
    await expect(page.locator('text=/कार्यान्वयन/i').first()).toBeVisible();
  });

  test('should allow searching for a project', async ({ page }) => {
    // There should be a search input
    const searchInput = page.locator('input[placeholder*="खोज्नुहोस्"]');
    await expect(searchInput).toBeVisible();
    
    // Fill the search input
    await searchInput.fill('परीक्षण योजना');
    
    // Assuming searching might filter a list, we just verify the input takes value
    await expect(searchInput).toHaveValue('परीक्षण योजना');
  });
});
