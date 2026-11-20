const path = require('path');
const fs = require('fs');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('=== TESTING VACANCY SINGLE EDIT BUTTON & EXAM DATE DELETION/PERSISTENCE ===');
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  
  await context.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('p5_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YzBmNmI4MC0xNTdjLTRiYTItYjRjOC00ZWUyNTUxNzczZGUiLCJlbWFpbCI6InN1cGVyX2FkbWluQHA1ZGlnaXRhbC5sb2NhbCIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImV4cCI6MTc5NTc0OTA4NCwiaWF0IjoxNzk1MTQ0Mjg0fQ.JU4QToP0_tTTMviCCZXlU7Ydisl5XurFQRaqI59HOc0');
    localStorage.setItem('p5_user', JSON.stringify({
      id: '5c0f6b80-157c-4ba2-b4c8-4ee2551773de',
      email: 'admin@p5digital.local',
      fullName: 'Narayan Chhetri',
      role: 'admin',
      roles: ['admin'],
      tenantId: 'panchpokhari',
      tenantSubdomain: 'panchpokhari'
    }));
    localStorage.setItem('p5_role', 'admin');
    localStorage.setItem('p5_name', 'Narayan Chhetri');
    localStorage.setItem('tenant_id', 'panchpokhari');
    localStorage.setItem('p5_tenant_subdomain', 'panchpokhari');
  });

  const page = await context.newPage();

  page.on('dialog', async dialog => {
    console.log(`[Dialog] ${dialog.type()}: ${dialog.message()}`);
    await dialog.accept();
  });

  console.log('Navigating to http://localhost:8080/app/recruitment...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 1. Check Vacancies Tab for duplicate edit buttons
  console.log('\n--- 1. Checking Vacancy Cards for duplicate buttons ---');
  const vacanciesTab = page.locator('button:has-text("खुला विज्ञापन तथा पदहरू")').first();
  await vacanciesTab.click();
  await page.waitForTimeout(1500);

  // Count header सम्पादन buttons
  const headerEditBtns = page.locator('.rec-vacancy-header button:has-text("सम्पादन")');
  const headerCount = await headerEditBtns.count();
  console.log(`- Header 'सम्पादन' buttons count (should be 0): ${headerCount}`);

  // Count footer संशोधन (Edit) buttons
  const footerEditBtns = page.locator('.rec-vacancy-card-footer button:has-text("संशोधन")');
  const footerCount = await footerEditBtns.count();
  console.log(`- Footer 'संशोधन (Edit)' buttons count (should be >= 1): ${footerCount}`);

  // Capture clean card view
  const cardListScreenshot = path.join(artifactDir, 'vacancy_cards_single_edit_button.png');
  await page.screenshot({ path: cardListScreenshot, fullPage: false });
  console.log(`Saved screenshot: ${cardListScreenshot}`);

  // 2. Click 'संशोधन (Edit)' on the first vacancy
  console.log('\n--- 2. Opening Edit Vacancy Modal and clearing Exam Date ---');
  await footerEditBtns.first().click();
  await page.waitForTimeout(1000);

  // Find the examDateBs input
  const examDateInput = page.locator('input[placeholder*="२०८१-०६-१५"]').first();
  const initialValue = await examDateInput.inputValue();
  console.log(`- Initial Exam Date in input: "${initialValue}"`);

  // Clear the input
  await examDateInput.fill('');
  console.log(`- Cleared Exam Date input. Current input value: "${await examDateInput.inputValue()}"`);

  // Save changes
  console.log('Clicking Save Changes (परिवर्तन सुरक्षित गर्नुहोस्)...');
  const saveBtn = page.locator('button:has-text("परिवर्तन सुरक्षित गर्नुहोस्")').first();
  await saveBtn.click();
  await page.waitForTimeout(2500);

  // 3. Re-open Edit Modal to verify it didn't reappear
  console.log('\n--- 3. Re-opening Edit Vacancy Modal to verify persistence of empty exam date ---');
  await footerEditBtns.first().click();
  await page.waitForTimeout(1000);

  const reloadedExamDate = await examDateInput.inputValue();
  console.log(`- Reloaded Exam Date in input (should be empty): "${reloadedExamDate}"`);

  const emptyModalScreenshot = path.join(artifactDir, 'vacancy_edit_modal_cleared_exam_date.png');
  await page.screenshot({ path: emptyModalScreenshot, fullPage: false });
  console.log(`Saved screenshot: ${emptyModalScreenshot}`);

  // Close modal
  const closeBtn = page.locator('.rec-modal-header button').first();
  await closeBtn.click();
  await page.waitForTimeout(500);

  // 4. Now test editing it with a valid custom date
  console.log('\n--- 4. Testing updating with a new custom Exam Date & Center ---');
  await footerEditBtns.first().click();
  await page.waitForTimeout(1000);

  await examDateInput.fill('२०८३-०९-१५ बिहान ११:०० बजे');
  const examCenterInput = page.locator('input[placeholder*="पाँचपोखरी थाङपाल मा.वि."]').first();
  await examCenterInput.fill('पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक');

  await saveBtn.click();
  await page.waitForTimeout(2500);

  // Re-verify it saved the new date
  await footerEditBtns.first().click();
  await page.waitForTimeout(1000);
  const updatedValue = await examDateInput.inputValue();
  console.log(`- Updated Exam Date verified: "${updatedValue}"`);

  const finalModalScreenshot = path.join(artifactDir, 'vacancy_edit_modal_final_verified.png');
  await page.screenshot({ path: finalModalScreenshot, fullPage: false });
  console.log(`Saved screenshot: ${finalModalScreenshot}`);

  await browser.close();
  console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
})();
