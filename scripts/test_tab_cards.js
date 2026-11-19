const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('Launching browser with valid super_admin auth...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  
  // Set auth credentials with exact role: super_admin
  await context.addInitScript(() => {
    localStorage.setItem('p5_token', 'mock_admin_token_2081');
    localStorage.setItem('p5_user', JSON.stringify({
      id: 'admin-1',
      fullName: 'Narayan Chhetri',
      role: 'super_admin',
      roles: ['super_admin', 'admin'],
      email: 'admin@panchpokhari.gov.np'
    }));
    localStorage.setItem('p5_role', 'super_admin');
    localStorage.setItem('p5_name', 'Narayan Chhetri');
  });

  const page = await context.newPage();
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/e537ac59-50c3-49c1-941c-504dade280b9';

  console.log('Navigating to Admin Recruitment Dashboard...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  console.log('Current URL:', page.url());
  await page.screenshot({ path: path.join(artifactDir, 'admin_2line_tabs_preview.png'), fullPage: false });
  console.log('Saved admin_2line_tabs_preview.png');

  // Verify tab cards
  const cards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.rec-tab-card')).map(e => e.innerText.replace(/\n/g, ' '));
  });
  console.log('Total tab cards found:', cards.length);
  cards.forEach((c, i) => console.log(`Card ${i + 1}: ${c}`));

  // Click Applications Tab
  console.log('Clicking on Applications Desk Tab...');
  const cardElements = await page.$$('.rec-tab-card');
  if (cardElements.length >= 2) {
    await cardElements[1].click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(artifactDir, 'admin_applications_with_hrms_badge.png'), fullPage: false });
    console.log('Saved admin_applications_with_hrms_badge.png');

    // Click Onboard button for an un-onboarded candidate
    const onboardBtn = await page.$('.rec-icon-btn-onboard');
    if (onboardBtn) {
      console.log('Clicking Onboard button...');
      await onboardBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(artifactDir, 'candidate_onboard_modal.png'), fullPage: false });
      console.log('Saved candidate_onboard_modal.png');
    }
  }

  // Go to HRMS
  console.log('Navigating to HRMS (/app/employees)...');
  await page.goto('http://localhost:8080/app/employees', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactDir, 'hrms_employee_created.png'), fullPage: false });
  console.log('Saved hrms_employee_created.png');

  await browser.close();
  console.log('Verification process completed successfully!');
})().catch(console.error);
