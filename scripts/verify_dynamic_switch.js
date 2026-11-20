const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('Testing Dynamic switching from Palika Setup (localStorage)...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });

  const validAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YzBmNmI4MC0xNTdjLTRiYTItYjRjOC00ZWUyNTUxNzczZGUiLCJlbWFpbCI6InN1cGVyX2FkbWluQHA1ZGlnaXRhbC5sb2NhbCIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImV4cCI6MTc5NTc0OTA4NCwiaWF0IjoxNzk1MTQ0Mjg0fQ.JU4QToP0_tTTMviCCZXlU7Ydisl5XurFQRaqI59HOc0';

  // Inject a simulated Palika Setup override
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

    // Simulate Palika Setup saving custom settings
    localStorage.setItem('palika_settings_panchpokhari', JSON.stringify({
      palika_name: 'पाँचपोखरी थाङपाल गाउँपालिका (आधिकारिक सेटअप)',
      palika_name_en: 'PANCHPOKHARI THANGPAL RURAL MUNICIPALITY',
      address: 'गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप',
      province: 'बागमती प्रदेश'
    }));
  }, validAdminToken);

  const page = await context.newPage();
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Click on Admit Card tab
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा"), button:has-text("Admit Card")').first();
  await admitTab.click();
  await page.waitForTimeout(1000);

  // Search candidate
  const searchInput = page.locator('input[placeholder*="फोन"], input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
  await searchInput.fill('126049');
  const searchBtn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await searchBtn.click();
  await page.waitForTimeout(2000);

  const headingText = await page.locator('.rec-admit-title-main').first().innerText();
  console.log('Dynamic Heading in Admit Card:', headingText);

  if (headingText.includes('आधिकारिक सेटअप')) {
    console.log('SUCCESS: Palika Setup dynamic update was successfully rendered in Admit Card!');
  } else {
    console.error('FAILURE: Palika Setup dynamic update not found!');
  }

  await browser.close();
})();
