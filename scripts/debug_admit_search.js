const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });

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
  page.on('dialog', async dialog => {
    console.log('DIALOG DETECTED:', dialog.type(), dialog.message());
    await dialog.dismiss();
  });
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('response', resp => {
    if (resp.url().includes('api/v1')) {
      console.log('API RESP:', resp.status(), resp.url());
    }
  });

  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  console.log('Current URL:', page.url());

  // Click on admit card tab
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा"), button:has-text("Admit Card")').first();
  await admitTab.click();
  console.log('Clicked admit card tab');
  await page.waitForTimeout(1000);

  const searchInput = page.locator('input[placeholder*="फोन"], input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
  await searchInput.fill('126049');
  console.log('Filled search query: 126049');

  const searchBtn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await searchBtn.click();
  console.log('Clicked search button');

  await page.waitForTimeout(3000);

  const admitCard = page.locator('#printable-admit-card');
  const count = await admitCard.count();
  console.log('Count of #printable-admit-card:', count);

  const alerts = await page.locator('.rec-alert, .alert').allInnerTexts();
  console.log('Alerts on page:', alerts);

  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';
  await page.screenshot({ path: path.join(artifactDir, 'debug_admit_search.png') });
  console.log('Screenshot saved to debug_admit_search.png');

  await browser.close();
})();
