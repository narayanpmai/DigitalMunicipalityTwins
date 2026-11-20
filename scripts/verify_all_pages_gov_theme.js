const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

const ARTIFACT_DIR = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

(async () => {
  console.log('=== MULTI-PAGE GOV THEME VERIFICATION ===');
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

  const pagesToTest = [
    { url: 'http://localhost:8080/app', name: 'Dashboard' },
    { url: 'http://localhost:8080/app/citizen-360', name: 'Citizen360' },
    { url: 'http://localhost:8080/app/recruitment', name: 'Recruitment' },
    { url: 'http://localhost:8080/app/e-office', name: 'EOffice' },
    { url: 'http://localhost:8080/app/profile', name: 'PalikaProfile' },
  ];

  const results = [];

  for (const p of pagesToTest) {
    try {
      console.log(`Checking ${p.name} (${p.url})...`);
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);

      const check = await page.evaluate(() => {
        const bodyFont = window.getComputedStyle(document.body).fontFamily;
        const rootPrimary = window.getComputedStyle(document.documentElement).getPropertyValue('--gov-primary').trim();
        const header = document.querySelector('header');
        const headerLogos = header ? header.querySelectorAll('img').length : 0;
        const activeNav = document.querySelector('aside a.active, nav a.active');
        const activeNavBg = activeNav ? window.getComputedStyle(activeNav).backgroundColor : null;

        return {
          bodyFont,
          rootPrimary,
          headerLogos,
          activeNavBg
        };
      });

      results.push({ name: p.name, ...check });
    } catch (e) {
      console.error(`Error on ${p.name}:`, e.message);
      results.push({ name: p.name, error: e.message });
    }
  }

  console.log('Results Summary:\n', JSON.stringify(results, null, 2));

  // Capture final verification snapshot of citizen-360 and e-office
  await page.goto('http://localhost:8080/app/citizen-360', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'page_citizen360_gov_theme.png') });

  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'page_recruitment_gov_theme.png') });

  console.log('=== MULTI-PAGE VERIFICATION FINISHED ===');
  await browser.close();
})();
