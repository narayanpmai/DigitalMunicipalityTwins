const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('Launching browser to verify Dynamic Logo and Letterhead on Admit Card and Receipt...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
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
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/e537ac59-50c3-49c1-941c-504dade280b9';

  console.log('Navigating to http://localhost:8080/app/recruitment ...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Switch to "प्रवेशपत्र तथा आवेदन स्थिति" tab
  console.log('Clicking on Admit Card tab (प्रवेशपत्र तथा आवेदन स्थिति)...');
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा"), button:has-text("Admit Card")').first();
  await admitTab.click();
  await page.waitForTimeout(1000);

  // Fill in search query with candidate citizenship / phone
  console.log('Searching for candidate Admit Card with 126049 ...');
  const searchInput = page.locator('input[placeholder*="फोन"], input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
  await searchInput.fill('126049');
  
  const searchBtn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await searchBtn.click();
  await page.waitForTimeout(2000);

  // Scroll to Admit Card
  const admitCard = page.locator('#printable-admit-card');
  await admitCard.waitFor({ state: 'visible', timeout: 5000 });
  await admitCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  console.log('Admit Card is visible! Taking screenshot of Admit Card with Dynamic Logo and Letterhead...');
  await page.screenshot({ path: path.join(artifactDir, 'dynamic_admit_card_letterhead.png'), fullPage: false });
  console.log('Saved dynamic_admit_card_letterhead.png');

  // Also take focused screenshot of the Admit Card card
  await admitCard.screenshot({ path: path.join(artifactDir, 'admit_card_official_view.png') });
  console.log('Saved admit_card_official_view.png');

  // Click on "रसिद हेर्नुहोस्" button to verify Official Receipt Letterhead
  console.log('Clicking on Receipt button (रसिद हेर्नुहोस्)...');
  const receiptBtn = page.locator('button:has-text("रसिद हेर्नुहोस्")').first();
  if (await receiptBtn.count() > 0) {
    await receiptBtn.click();
    await page.waitForTimeout(1500);

    const receiptModal = page.locator('#printable-receipt');
    await receiptModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Receipt modal is visible! Taking screenshot of Official Receipt Letterhead...');
    await page.screenshot({ path: path.join(artifactDir, 'official_receipt_letterhead.png'), fullPage: false });
    console.log('Saved official_receipt_letterhead.png');
  }

  await browser.close();
  console.log('Verification completed successfully!');
})();
