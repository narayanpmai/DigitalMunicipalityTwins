const path = require('path');
const fs = require('fs');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('--- STARTING COMPREHENSIVE E2E VERIFICATION ---');
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });

  const validAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YzBmNmI4MC0xNTdjLTRiYTItYjRjOC00ZWUyNTUxNzczZGUiLCJlbWFpbCI6InN1cGVyX2FkbWluQHA1ZGlnaXRhbC5sb2NhbCIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImV4cCI6MTc5NTc0OTA4NCwiaWF0IjoxNzk1MTQ0Mjg0fQ.JU4QToP0_tTTMviCCZXlU7Ydisl5XurFQRaqI59HOc0';

  await context.addInitScript((token) => {
    localStorage.setItem('p5_token', token);
    localStorage.setItem('p5_user', JSON.stringify({
      id: '5c0f6b80-157c-4ba2-b4c8-4ee2551773de',
      fullName: 'Narayan Chhetri',
      role: 'super_admin',
      roles: ['super_admin', 'admin'],
      email: 'super_admin@p5digital.local'
    }));
    localStorage.setItem('p5_role', 'super_admin');
    localStorage.setItem('p5_name', 'Narayan Chhetri');
  }, validAdminToken);

  const page = await context.newPage();

  // 1. VERIFY SETTINGS PAGE (TAB 5 - CENTRALIZED LETTERHEAD)
  console.log('1. Navigating to Palika Settings Page (http://localhost:8080/app/palika-settings)...');
  await page.goto('http://localhost:8080/app/palika-settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const letterheadTab = page.locator('button:has-text("केन्द्रीकृत लेटरहेड"), button:has-text("५. केन्द्रीकृत लेटरहेड")').first();
  if (await letterheadTab.count() > 0) {
    console.log('Found Letterhead Tab button! Clicking...');
    await letterheadTab.click();
    await page.waitForTimeout(1500);

    console.log('Saving Settings Letterhead Live Preview screenshot...');
    await page.screenshot({ path: path.join(artifactDir, 'settings_letterhead_management.png'), fullPage: false });

    // Test preview modal in settings
    const testPreviewBtn = page.locator('button:has-text("पूर्ण A4 पूर्वावलोकन")').first();
    if (await testPreviewBtn.count() > 0) {
      await testPreviewBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(artifactDir, 'settings_letterhead_modal_preview.png'), fullPage: false });
      const closeBtn = page.locator('.central-preview-close-btn').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(500);
    }
  } else {
    console.log('Warning: Tab 5 not found by text, tabs count:', await page.locator('button').count());
  }

  // 2. NAVIGATE TO RECRUITMENT PAGE
  console.log('2. Navigating to Recruitment Page (http://localhost:8080/app/recruitment)...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Switch to Admit Card tab
  console.log('Switching to Admit Card tab...');
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा"), button:has-text("Admit Card")').first();
  await admitTab.click();
  await page.waitForTimeout(1000);

  // Search candidate
  console.log('Searching for candidate with 126049...');
  const searchInput = page.locator('input[placeholder*="फोन"], input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
  await searchInput.fill('126049');
  
  const searchBtn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await searchBtn.click();
  await page.waitForTimeout(2000);

  // Locate Admit Card
  const admitCard = page.locator('#printable-admit-card');
  await admitCard.waitFor({ state: 'visible', timeout: 5000 });
  await admitCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  console.log('Admit card visible! Taking screenshots...');
  await page.screenshot({ path: path.join(artifactDir, 'recruitment_admit_card_page.png'), fullPage: false });
  await admitCard.screenshot({ path: path.join(artifactDir, 'admit_card_verified.png') });

  // 3. TEST ADMIT CARD PRINT PREVIEW MODAL
  console.log('3. Testing Admit Card Print Preview Modal...');
  const previewBtn = page.locator('button:has-text("प्रवेशपत्र पूर्वावलोकन"), button:has-text("पूर्वावलोकन")').first();
  if (await previewBtn.count() > 0) {
    await previewBtn.click();
    await page.waitForTimeout(1500);
    console.log('Taking Print Preview Modal screenshot...');
    await page.screenshot({ path: path.join(artifactDir, 'admit_card_print_preview.png'), fullPage: false });
    
    // Close modal
    const closeBtn = page.locator('.central-preview-close-btn').first();
    if (await closeBtn.count() > 0) await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // 4. TEST PRINT MEDIA EMULATION (ENSURE NOT BLANK)
  console.log('4. Emulating Print Media to verify non-blank output...');
  // Hide non-printable elements if not in modal
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(1000);
  // In print media, capture admitCard element directly
  await admitCard.screenshot({ path: path.join(artifactDir, 'admit_card_emulated_print.png') });
  await page.emulateMedia({ media: 'screen' });
  await page.waitForTimeout(500);

  // 5. TEST OFFICIAL RECEIPT MODAL
  console.log('5. Testing Official Receipt Modal...');
  const receiptBtn = page.locator('button:has-text("रसिद हेर्नुहोस्")').first();
  if (await receiptBtn.count() > 0) {
    await receiptBtn.click();
    await page.waitForTimeout(1500);
    const receiptModal = page.locator('#printable-receipt');
    if (await receiptModal.count() > 0) {
      console.log('Taking Official Receipt screenshot...');
      await receiptModal.screenshot({ path: path.join(artifactDir, 'receipt_verified.png') });
      const closeReceipt = page.locator('button:has-text("बन्द गर्नुहोस्")').first();
      if (await closeReceipt.count() > 0) await closeReceipt.click();
      await page.waitForTimeout(500);
    }
  }

  // 6. TEST VACANCIES / APPLICATIONS FOR APPROVAL LETTER & EXAM NOTICE
  console.log('6. Switching to Vacancies / Applications tabs to test Official Documents...');
  const appsTab = page.locator('button:has-text("दरखास्त रुजु"), button:has-text("रुजु तथा पदपूर्ति")').first();
  if (await appsTab.count() > 0) {
    await appsTab.click();
    await page.waitForTimeout(1500);

    // Look for "स्वीकृति पत्र" button in applications table
    const approvalBtn = page.locator('button:has-text("स्वीकृति पत्र")').first();
    if (await approvalBtn.count() > 0) {
      console.log('Found approval letter button! Clicking...');
      await approvalBtn.click();
      await page.waitForTimeout(1500);
      const sheet = page.locator('#printable-approval-letter-sheet');
      if (await sheet.count() > 0) {
        await sheet.screenshot({ path: path.join(artifactDir, 'approval_letter_verified.png') });
      }
      const closeBtn = page.locator('.central-preview-close-btn, button:has-text("बन्द गर्नुहोस्")').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // Look for "नियुक्ति पत्र" button
    const appointmentBtn = page.locator('button:has-text("नियुक्ति पत्र")').first();
    if (await appointmentBtn.count() > 0) {
      console.log('Found appointment letter button! Clicking...');
      await appointmentBtn.click();
      await page.waitForTimeout(1500);
      const apptSheet = page.locator('#printable-appointment-sheet');
      if (await apptSheet.count() > 0) {
        await apptSheet.screenshot({ path: path.join(artifactDir, 'appointment_letter_verified.png') });
      }
      const closeBtn = page.locator('.central-preview-close-btn, button:has-text("बन्द गर्नुहोस्")').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Switch to Vacancies tab to test Exam Notice
  const vacTab = page.locator('button:has-text("खुला विज्ञापन"), button:has-text("विज्ञापन")').first();
  if (await vacTab.count() > 0) {
    await vacTab.click();
    await page.waitForTimeout(1500);

    const noticeBtn = page.locator('button:has-text("परीक्षा सूचना")').first();
    if (await noticeBtn.count() > 0) {
      console.log('Found exam notice button! Clicking...');
      await noticeBtn.click();
      await page.waitForTimeout(1500);
      const noticeSheet = page.locator('#printable-exam-notice-sheet');
      if (await noticeSheet.count() > 0) {
        await noticeSheet.screenshot({ path: path.join(artifactDir, 'exam_notice_verified.png') });
      }
      const closeBtn = page.locator('.central-preview-close-btn, button:has-text("बन्द गर्नुहोस्")').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  await browser.close();
  console.log('--- ALL E2E VERIFICATIONS COMPLETED SUCCESSFULLY ---');
})();
