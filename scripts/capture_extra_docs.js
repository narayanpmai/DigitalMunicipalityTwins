const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('--- CAPTURING APPROVAL LETTER AND EXAM NOTICE ---');
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

  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. CAPTURE EXAM NOTICE FROM VACANCIES TAB (FIRST TAB)
  console.log('Capturing Exam Notice from vacancies tab...');
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

  // 2. CAPTURE APPROVAL LETTER FROM APPLICATIONS TAB
  console.log('Switching to Applications tab...');
  const appsTab = page.locator('.rec-tab-card:has-text("दरखास्त रुजु"), button:has-text("दरखास्त रुजु")').first();
  await appsTab.click();
  await page.waitForTimeout(2000);

  const approvalBtn = page.locator('button[title*="Approval Letter"], button[title*="स्वीकृति पत्र"]').first();
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

  await browser.close();
  console.log('--- CAPTURE COMPLETE ---');
})();
