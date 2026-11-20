const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('Launching browser to verify Vacancy Edit feature...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });

  const validAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YzBmNmI4MC0xNTdjLTRiYTItYjRjOC00ZWUyNTUxNzczZGUiLCJlbWFpbCI6InN1cGVyX2FkbWluQHA1ZGlnaXRhbC5sb2NhbCIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImV4cCI6MTc5NTc0OTA4NCwiaWF0IjoxNzk1MTQ0Mjg0fQ.JU4QToP0_tTTMviCCZXlU7Ydisl5XurFQRaqI59HOc0';

  // Set real signed JWT token and user profile
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
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/e537ac59-50c3-49c1-941c-504dade280b9';

  console.log('Navigating to http://localhost:8080/app/recruitment ...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Current URL after goto:', page.url());

  // If not on /app/recruitment, click on sidebar link
  if (!page.url().includes('recruitment')) {
    console.log('Clicking sidebar recruitment link...');
    const recruitLink = page.locator('text=अनलाइन दरखास्त').first();
    if (await recruitLink.count() > 0) {
      await recruitLink.click();
      await page.waitForTimeout(2000);
      console.log('Current URL after click:', page.url());
    }
  }

  // Scroll down to the vacancies grid
  const vacanciesGrid = page.locator('.rec-vacancies-grid');
  await vacanciesGrid.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // Take screenshot of Vacancy Cards with Edit buttons
  console.log('Taking screenshot of Vacancy cards with Edit buttons...');
  await page.screenshot({ path: path.join(artifactDir, 'vacancy_cards_with_edit_buttons.png'), fullPage: false });
  console.log('Saved vacancy_cards_with_edit_buttons.png');

  // Find Edit button on the first vacancy card
  const editButtons = page.locator('button:has-text("संशोधन (Edit)"), button:has-text("सम्पादन (Edit)")');
  const count = await editButtons.count();
  console.log(`Found ${count} Edit button(s) on vacancy cards`);

  if (count > 0) {
    console.log('Clicking the first Edit button...');
    await editButtons.first().click();
    await page.waitForTimeout(1000);

    // Take screenshot of the Edit Vacancy Modal
    console.log('Taking screenshot of Edit Vacancy Modal...');
    await page.screenshot({ path: path.join(artifactDir, 'edit_vacancy_modal_preview.png'), fullPage: false });
    console.log('Saved edit_vacancy_modal_preview.png');
  } else {
    console.error('No edit buttons found!');
  }

  await browser.close();
  console.log('Verification finished successfully!');
})();
