import { test, expect } from '@playwright/test';

test.describe('Dynamic Service Router and System Verification', () => {
  const baseURL = process.env.TEST_URL || 'http://localhost:8080';

  test('Public Portal: Dynamic Service Request flow with category filtering and receipt generation', async ({ page }) => {
    await page.goto(`${baseURL}/citizen-services`);

    // Verify page heading
    await expect(page.locator('h1')).toContainText('नागरिक सेवा तथा डिजिटल बडापत्र');

    // Ensure Dynamic Services tab is active
    const dynamicTabBtn = page.getByRole('button', { name: /एकीकृत सेवा प्रणाली/i });
    await dynamicTabBtn.click();

    // Verify Dynamic Service Router title
    await expect(page.locator('.dynamic-service-title')).toContainText('एकीकृत सेवा अनुरोध फारम');

    // Test category filter chips
    const healthChip = page.getByRole('button', { name: /स्वास्थ्य तथा ओपीडी/i });
    await healthChip.click();
    await expect(page.locator('.service-card')).toHaveCount(2);

    const allChip = page.getByRole('button', { name: /सबै सेवाहरू/i });
    await allChip.click();
    expect(await page.locator('.service-card').count()).toBeGreaterThanOrEqual(4);

    // Capture Step 1 Catalog Screenshot
    await page.screenshot({ path: 'C:/Users/Dell/.gemini/antigravity-ide/brain/003f00d0-7676-492b-bdc7-b42b82deb4f5/service_catalog_selection.png', fullPage: true });

    // Select Agriculture Farmer Registry card
    const farmerCard = page.locator('.service-card').filter({ hasText: 'कृषक सूचीकरण तथा अनुदान माग' });
    await farmerCard.click();
    await expect(farmerCard).toHaveClass(/selected/);

    // Click Next to Step 2
    await page.getByRole('button', { name: /अर्को: सेवाग्राही विवरण/i }).click();

    // Fill Step 2: Applicant details
    await page.locator('input[name="fullName"]').fill('हर्क बहादुर तामाङ');
    await page.locator('input[name="contactPhone"]').fill('9841234567');
    await page.locator('input[name="toleVillage"]').fill('भोताङ, गाम्चेत');

    // Click Next to Step 3
    await page.getByRole('button', { name: /अर्को: सेवा सम्बन्धी विवरण/i }).click();

    // Fill Step 3: Agriculture fields
    await page.locator('input[name="landAreaRopani"]').fill('3.5');
    await page.locator('input[name="majorCrops"]').fill('भोताङे आलु, किबी फल, मकै');

    // Click Next to Step 4
    await page.getByRole('button', { name: /अर्को: कागजात र पेश/i }).click();

    // Check self-declaration checkbox
    const declarationCheckbox = page.locator('input[type="checkbox"]');
    await declarationCheckbox.check();
    await expect(declarationCheckbox).toBeChecked();

    // Submit Request
    const submitBtn = page.getByRole('button', { name: /अनुरोध पेश गर्नुहोस्/i });
    await submitBtn.click();

    // Verify Step 5: Digital Acknowledgment Receipt
    await expect(page.locator('.digital-receipt-card')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.receipt-token-badge')).toContainText('टोकन / ट्र्याकिङ कोड:');
    await expect(page.locator('.receipt-details-table')).toContainText('हर्क बहादुर तामाङ');
    await expect(page.locator('.receipt-details-table')).toContainText('कृषक सूचीकरण तथा अनुदान माग');

    // Capture Step 5 Digital Receipt Screenshot
    await page.screenshot({ path: 'C:/Users/Dell/.gemini/antigravity-ide/brain/003f00d0-7676-492b-bdc7-b42b82deb4f5/digital_receipt_view.png', fullPage: true });
  });

  test('Public Registration and Admin Approval Management', async ({ page }) => {
    // 1. Visit Public Registration
    await page.goto(`${baseURL}/register`);
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();

    // 2. Admin Console Users & Roles Tab Verification
    await page.goto(`${baseURL}/login`);
    await page.locator('input[type="email"]').fill('admin@p5digital.local');
    await page.locator('input[type="password"]').fill('Admin@P5Digital2024!');
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/.*app/, { timeout: 10000 });

    // Navigate to Admin Console
    await page.goto(`${baseURL}/app/admin`);
    
    // Switch to Users tab
    const usersTabBtn = page.getByRole('button', { name: /प्रयोगकर्ता तथा भूमिका/i });
    await usersTabBtn.click();

    // Verify summary stats cards
    await expect(page.locator('.dt-card').filter({ hasText: 'जम्मा प्रयोगकर्ता खाता' })).toBeVisible();
    await expect(page.locator('.dt-card').filter({ hasText: 'सक्रिय खाताहरू' })).toBeVisible();
    await expect(page.locator('.dt-card').filter({ hasText: 'अनुमोदन पर्खिरहेका' })).toBeVisible();

    // Check filter pills
    await expect(page.getByRole('button', { name: /सबै \(/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /स्वीकृति पर्खिरहेका/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /सार्वजनिक नागरिक/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /पालिका कर्मचारी/i })).toBeVisible();

    // Capture Admin Console Users & Approvals Screenshot
    await page.screenshot({ path: 'C:/Users/Dell/.gemini/antigravity-ide/brain/003f00d0-7676-492b-bdc7-b42b82deb4f5/admin_users_approval_console.png', fullPage: true });
  });
});
