const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('Launching Chrome browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/e537ac59-50c3-49c1-941c-504dade280b9';

  console.log('Navigating to Admin Recruitment Dashboard...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Take screenshot of Admin Dashboard showing 2-line tabs
  await page.screenshot({ path: path.join(artifactDir, 'admin_2line_tabs_preview.png'), fullPage: false });
  console.log('Saved admin_2line_tabs_preview.png');

  // Click on Applications Tab (दरखास्त रुजु तथा पदपूर्ति)
  console.log('Clicking on Applications Desk Tab...');
  const appTab = page.locator('.rec-tab-card:has-text("दरखास्त रुजु")').first();
  await appTab.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(artifactDir, 'admin_applications_with_hrms_badge.png'), fullPage: false });
  console.log('Saved admin_applications_with_hrms_badge.png');

  // Click Onboard button for an un-onboarded candidate
  console.log('Opening Onboarding Modal...');
  const onboardBtn = page.locator('.rec-icon-btn-onboard').first();
  if (await onboardBtn.count() > 0) {
    await onboardBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'candidate_onboard_modal.png'), fullPage: false });
    console.log('Saved candidate_onboard_modal.png');
  }

  // Check HRMS page
  console.log('Navigating to HRMS (/app/employees)...');
  await page.goto('http://localhost:8080/app/employees', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactDir, 'hrms_employee_created.png'), fullPage: false });
  console.log('Saved hrms_employee_created.png');

  await browser.close();
  console.log('All verification screenshots captured successfully!');
})().catch(console.error);
