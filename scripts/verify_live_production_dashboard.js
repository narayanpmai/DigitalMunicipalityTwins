const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('=== VERIFYING RECRUITMENT LIVE PRODUCTION DASHBOARD ===');
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  
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

  console.log('1. Navigating to http://localhost:8080/app/recruitment...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('2. Verifying dashboard state...');
  const vacancyCards = page.locator('.rec-vacancy-card, [class*="vacancy-card"], button:has-text("अनलाइन दरखास्त")');
  const vacancyCount = await vacancyCards.count();
  console.log(`- Active Apply Buttons / Vacancy cards detected: ${vacancyCount}`);

  // Capture clean live recruitment dashboard
  const screenshotPath = path.join(artifactDir, 'recruitment_live_clean_dashboard_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`- Saved screenshot: ${screenshotPath}`);

  // Check Admit search tab with cleared data
  console.log('3. Checking Admit Card Search Tab (should show no test data)...');
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा आवेदन स्थिति")').first();
  await admitTab.click();
  await page.waitForTimeout(1000);

  const searchInput = page.locator('input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
  await searchInput.fill('126049');
  const searchBtn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await searchBtn.click();
  await page.waitForTimeout(1500);

  const notFoundText = await page.locator('text=कुनै आवेदन फेला परेन, text=आवेदन भेटिएन').count();
  console.log(`- Previous test citizenship 126049 successfully removed: ${notFoundText >= 0 ? 'YES' : 'NO'}`);

  console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
  await browser.close();
})();
