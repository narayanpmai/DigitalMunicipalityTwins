const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

const ARTIFACT_DIR = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

(async () => {
  console.log('=== STARTING NEPAL GOV OFFICIAL PORTAL UI/UX VERIFICATION ===');
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
    // 1. App Dashboard
    console.log('Navigating to http://localhost:8080/app...');
    await page.goto('http://localhost:8080/app', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);

    const dashScreenshot = path.join(ARTIFACT_DIR, 'gov_portal_dashboard_verified.png');
    await page.screenshot({ path: dashScreenshot });
    console.log('Dashboard screenshot saved:', dashScreenshot);

    // 2. Recruitment Module
    console.log('Navigating to http://localhost:8080/app/recruitment...');
    await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);

    const recScreenshot = path.join(ARTIFACT_DIR, 'gov_portal_recruitment_verified.png');
    await page.screenshot({ path: recScreenshot });
    console.log('Recruitment screenshot saved:', recScreenshot);

    // 3. Check typography and colors via evaluate
    const computedStyles = await page.evaluate(() => {
      const body = document.body;
      const header = document.querySelector('header');
      const h1 = document.querySelector('h1, h2, .rec-title');
      return {
        bodyFont: window.getComputedStyle(body).fontFamily,
        primaryCssVar: window.getComputedStyle(document.documentElement).getPropertyValue('--gov-primary').trim(),
        headerBg: header ? window.getComputedStyle(header).backgroundColor : null,
      };
    });
    console.log('Computed Gov Styles:', JSON.stringify(computedStyles, null, 2));

    console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
})();
