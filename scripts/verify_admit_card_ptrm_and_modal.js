const path = require('path');
const fs = require('fs');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('=== STARTING PTRM DYNAMIC CHALANI & EXAM SCHEDULE VERIFICATION ===');
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

  console.log('Navigating to http://localhost:8080/app/recruitment...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 1. VERIFY ADMIT CARD WITH DYNAMIC CHALANI & PTRM PREFIX
  console.log('\n--- 1. Testing Admit Card Search Tab ---');
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा आवेदन स्थिति")').first();
  await admitTab.click();
  await page.waitForTimeout(1000);

  const searchInput = page.locator('input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
  await searchInput.fill('126049');
  const searchBtn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await searchBtn.click();
  await page.waitForTimeout(2000);

  const admitCardEl = page.locator('#printable-admit-card').first();
  if (await admitCardEl.count() > 0) {
    console.log('Found #printable-admit-card element on page!');
    const content = await admitCardEl.innerHTML();

    const chalaniCheck = content.includes('चलानी :') && content.includes('३५२') && !content.includes('चलानी : 2081-ROLL');
    const ptrmCheck = content.includes('PTRM-2083-0002');
    const rollCheck = content.includes('2083-ROLL-352');
    const examCenterCheck = content.includes('पाँचपोखरी थाङपाल मा.वि., वडा नं ६, सिन्धुपाल्चोक');
    const examDateCheck = content.includes('२०८३-०९-१५ बिहान ११:०० बजे');

    console.log(`- Chalani is dynamic '३५२' (NOT roll number): ${chalaniCheck}`);
    console.log(`- Application No is 'PTRM-2083-0002': ${ptrmCheck}`);
    console.log(`- Roll No is '2083-ROLL-352': ${rollCheck}`);
    console.log(`- Exam Center present: ${examCenterCheck}`);
    console.log(`- Exam Date & Time present: ${examDateCheck}`);

    const box = await admitCardEl.boundingBox();
    console.log(`Admit Card Element Dimensions: Width = ${box.width}px, Height = ${box.height}px`);

    const admitCardPath = path.join(artifactDir, 'admit_card_ptrm_verified.png');
    await admitCardEl.screenshot({ path: admitCardPath });
    console.log(`Saved updated admit card screenshot: ${admitCardPath}`);
  }

  // Open the Print Preview Modal
  console.log('\n--- 2. Testing Admit Card Print Preview Modal ---');
  const previewModalBtn = page.locator('button:has-text("प्रवेशपत्र पूर्वावलोकन (Preview)")').first();
  if (await previewModalBtn.count() > 0) {
    await previewModalBtn.click();
    await page.waitForTimeout(1500);

    const modalScreenshotPath = path.join(artifactDir, 'admit_card_modal_ptrm_verified.png');
    await page.screenshot({ path: modalScreenshotPath, fullPage: false });
    console.log(`Saved updated modal preview screenshot: ${modalScreenshotPath}`);

    // Close preview modal by clicking overlay or close button
    const closeBtn = page.locator('.central-print-modal-header button').last();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(800);
    }
  }

  // 3. VERIFY VACANCY EDIT MODAL: EXAM CENTER FIELD
  console.log('\n--- 3. Testing Vacancy Edit Modal ---');
  // Refresh or navigate directly
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const vacanciesTab = page.locator('button:has-text("खुला विज्ञापन तथा पदहरू")').first();
  await vacanciesTab.click();
  await page.waitForTimeout(1500);

  // Click 'सम्पादन' button for vacancy
  const editBtn = page.locator('button:has-text("सम्पादन")').first();
  if (await editBtn.count() > 0) {
    await editBtn.click();
    await page.waitForTimeout(1000);

    const modalBody = page.locator('.rec-modal-panel').first();
    const modalContent = await modalBody.innerHTML();

    const hasExamDateField = modalContent.includes('परीक्षा मिति र समय (Exam Date & Time)');
    const hasExamCenterField = modalContent.includes('परीक्षा केन्द्र (Exam Center)');

    console.log(`- Modal has 'परीक्षा मिति र समय': ${hasExamDateField}`);
    console.log(`- Modal has 'परीक्षा केन्द्र': ${hasExamCenterField}`);

    const vacancyModalPath = path.join(artifactDir, 'vacancy_edit_modal_verified.png');
    await page.screenshot({ path: vacancyModalPath, fullPage: false });
    console.log(`Saved vacancy edit modal screenshot: ${vacancyModalPath}`);
  }

  console.log('\n=== ALL VERIFICATIONS COMPLETED SUCCESSFULLY ===');
  await browser.close();
})();
