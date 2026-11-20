const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

const ARTIFACT_DIR = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

(async () => {
  console.log('=== STARTING NAVBAR PALIKA LOGO ONLY VERIFICATION ===');
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
    console.log('Navigating to http://localhost:8080/app/citizen-360...');
    await page.goto('http://localhost:8080/app/citizen-360', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);

    const screenshotPath = path.join(ARTIFACT_DIR, 'navbar_palika_logo_only_verified.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Screenshot saved:', screenshotPath);

    const logoCount = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return 0;
      const leftDiv = header.querySelector('div');
      const imgs = leftDiv ? leftDiv.querySelectorAll('img') : [];
      return imgs.length;
    });
    console.log('Number of logos in navbar left:', logoCount);
    console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
})();
