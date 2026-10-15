import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show validation errors on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Select tenant
    await page.locator('.dt-select').selectOption('all');

    // Fill in wrong credentials
    await page.locator('input[type="email"]').fill('admin@wrong.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    
    // Submit the form
    await page.locator('button[type="submit"]').click();
    
    // Should show error message or stay on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should login successfully with valid credentials and navigate to dashboard', async ({ page }) => {
    await page.goto('/login');
    
    // Select tenant
    await page.locator('.dt-select').selectOption('all');

    // Use the super admin credentials
    await page.locator('input[type="email"]').fill('super_admin@p5digital.local');
    await page.locator('input[type="password"]').fill('Admin@P5Digital2024!');
    
    // Submit the form
    await page.locator('button[type="submit"]').click();
    
    // Should navigate to dashboard or main app area
    await expect(page).not.toHaveURL(/.*login/);
  });
});
