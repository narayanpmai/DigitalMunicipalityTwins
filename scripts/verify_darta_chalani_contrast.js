const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

const ARTIFACT_DIR = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

(async () => {
  console.log('=== STARTING DARTA CHALANI CONTRAST VERIFICATION ===');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

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
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:8080/app/darta-chalani...');
    await page.goto('http://localhost:8080/app/darta-chalani', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);

    const contrastInfo = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const hero = h1 ? h1.closest('div[style*="linear-gradient"]') : null;
      return {
        h1Color: h1 ? window.getComputedStyle(h1).color : null,
        h1Text: h1 ? h1.innerText : null,
        heroBg: hero ? window.getComputedStyle(hero).backgroundImage || window.getComputedStyle(hero).backgroundColor : null,
      };
    });
    console.log('Darta Chalani Header Contrast:', JSON.stringify(contrastInfo, null, 2));

    const screenshotPath = path.join(ARTIFACT_DIR, 'darta_chalani_contrast_fixed_verified.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Saved screenshot:', screenshotPath);
    console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
