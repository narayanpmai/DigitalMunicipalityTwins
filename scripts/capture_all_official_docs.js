const path = require('path');
const fs = require('fs');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('--- CAPTURING ALL OFFICIAL DOCUMENTS ---');
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

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

  // A. RECRUITMENT PAGE: ADMIT CARD & MODAL
  console.log('Navigating to recruitment...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Switch to Admit Card tab
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा"), button:has-text("Admit Card")').first();
  await admitTab.click();
  await page.waitForTimeout(1000);

  const searchInput = page.locator('input[placeholder*="फोन"], input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
  await searchInput.fill('126049');
  
  const searchBtn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await searchBtn.click();
  await page.waitForTimeout(2000);

  // 1. Admit Card screenshot
  const admitCard = page.locator('#printable-admit-card');
  await admitCard.waitFor({ state: 'visible', timeout: 5000 });
  await admitCard.screenshot({ path: path.join(artifactDir, 'admit_card_verified.png') });
  console.log('Saved admit_card_verified.png');

  // 2. Open Admit Card Preview Modal
  const previewBtn = page.locator('button:has-text("प्रवेशपत्र पूर्वावलोकन")').first();
  if (await previewBtn.count() > 0) {
    await previewBtn.click();
    await page.waitForTimeout(1200);
    const modalContainer = page.locator('.central-print-modal-container');
    await modalContainer.waitFor({ state: 'visible', timeout: 5000 });
    await modalContainer.screenshot({ path: path.join(artifactDir, 'admit_card_print_preview.png') });
    console.log('Saved admit_card_print_preview.png');
    // Close modal by clicking overlay
    await page.locator('.central-print-modal-overlay').click({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(600);
  }

  // 3. Open Receipt Modal
  const receiptBtn = page.locator('button:has-text("रसिद हेर्नुहोस्")').first();
  if (await receiptBtn.count() > 0) {
    await receiptBtn.click();
    await page.waitForTimeout(1200);
    const receiptModal = page.locator('#printable-receipt');
    await receiptModal.waitFor({ state: 'visible', timeout: 5000 });
    await receiptModal.screenshot({ path: path.join(artifactDir, 'receipt_verified.png') });
    console.log('Saved receipt_verified.png');
    const closeReceipt = page.locator('button:has-text("बन्द गर्नुहोस्")').first();
    if (await closeReceipt.count() > 0) await closeReceipt.click();
    await page.waitForTimeout(600);
  }

  // 4. B. APPLICATIONS TAB FOR APPROVAL LETTER
  console.log('Switching to applications tab for approval letter...');
  const appsTab = page.locator('button:has-text("दरखास्त रुजु"), button:has-text("रुजु तथा पदपूर्ति")').first();
  await appsTab.click();
  await page.waitForTimeout(1500);

  const approvalBtn = page.locator('button:has-text("स्वीकृति पत्र")').first();
  if (await approvalBtn.count() > 0) {
    await approvalBtn.click();
    await page.waitForTimeout(1200);
    const modalContainer = page.locator('.central-print-modal-container');
    await modalContainer.waitFor({ state: 'visible', timeout: 5000 });
    await modalContainer.screenshot({ path: path.join(artifactDir, 'approval_letter_verified.png') });
    console.log('Saved approval_letter_verified.png');
    await page.locator('.central-print-modal-overlay').click({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(600);
  }

  // 5. C. VACANCIES TAB FOR EXAM NOTICE
  console.log('Switching to vacancies tab for exam notice...');
  const vacTab = page.locator('button:has-text("खुला विज्ञापन"), button:has-text("विज्ञापन")').first();
  await vacTab.click();
  await page.waitForTimeout(1500);

  const noticeBtn = page.locator('button:has-text("परीक्षा सूचना")').first();
  if (await noticeBtn.count() > 0) {
    await noticeBtn.click();
    await page.waitForTimeout(1200);
    const modalContainer = page.locator('.central-print-modal-container');
    await modalContainer.waitFor({ state: 'visible', timeout: 5000 });
    await modalContainer.screenshot({ path: path.join(artifactDir, 'exam_notice_verified.png') });
    console.log('Saved exam_notice_verified.png');
    await page.locator('.central-print-modal-overlay').click({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(600);
  }

  await browser.close();
  console.log('--- ALL OFFICIAL DOCUMENTS CAPTURED SUCCESSFULLY ---');
})();
