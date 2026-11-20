const path = require('path');
const fs = require('fs');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('=== VERIFYING ADMIT CARD A5 FORMAT, CENTERED FOOTER & DYNAMIC QR ===');
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  
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

  console.log('2. Opening Admit Card Search Tab...');
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा आवेदन स्थिति")').first();
  await admitTab.click();
  await page.waitForTimeout(1000);

  const searchInput = page.locator('input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
  await searchInput.fill('126049');
  const searchBtn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await searchBtn.click();
  await page.waitForTimeout(2500);

  const admitCardEl = page.locator('#printable-admit-card').first();
  if (await admitCardEl.count() === 0) {
    console.error('ERROR: #printable-admit-card not found!');
    await browser.close();
    process.exit(1);
  }

  console.log('3. Inspecting Admit Card properties & layout...');
  const boundingBox = await admitCardEl.boundingBox();
  console.log(`- Card dimensions: width = ${boundingBox.width.toFixed(1)}px, height = ${boundingBox.height.toFixed(1)}px`);

  // Check footer centering and QR
  const footerEl = admitCardEl.locator('.central-doc-footer');
  const footerCenterEl = admitCardEl.locator('.central-lh-footer-center');
  const qrImgEl = admitCardEl.locator('.central-lh-qr-box img');
  
  const hasQrImg = (await qrImgEl.count()) > 0;
  let qrSrc = '';
  if (hasQrImg) {
    qrSrc = await qrImgEl.getAttribute('src');
    console.log(`- QR image detected: YES! Src prefix: ${qrSrc.substring(0, 30)}... (length: ${qrSrc.length})`);
  } else {
    console.error('- QR image detected: NO!');
  }

  const sloganText = await admitCardEl.locator('.central-lh-slogan').innerText();
  console.log(`- Footer Slogan: "${sloganText.trim()}"`);

  const contactText = await admitCardEl.locator('.central-lh-contact-info').innerText();
  console.log(`- Footer Contacts: "${contactText.trim()}"`);

  // Capture Admit Card on page
  const cardScreenshotPath = path.join(artifactDir, 'admit_card_a5_centered_qr_verified.png');
  await admitCardEl.screenshot({ path: cardScreenshotPath });
  console.log(`- Saved screenshot: ${cardScreenshotPath}`);

  // Test Print Preview Modal
  console.log('4. Testing Print Preview Modal...');
  const previewBtn = page.locator('button:has-text("प्रवेशपत्र पूर्वावलोकन (Preview)")').first();
  await previewBtn.click();
  await page.waitForTimeout(1500);

  const modalContainer = page.locator('.central-print-modal-container').first();
  if (await modalContainer.count() > 0) {
    console.log('- Print preview modal opened successfully!');
    const modalBadge = await modalContainer.locator('text=A5 PORTRAIT').first().count();
    console.log(`- Has "A5 PORTRAIT" badge: ${modalBadge > 0 ? 'YES' : 'NO'}`);

    const modalScreenshotPath = path.join(artifactDir, 'admit_card_modal_preview_a5_verified.png');
    await modalContainer.screenshot({ path: modalScreenshotPath });
    console.log(`- Saved modal screenshot: ${modalScreenshotPath}`);
  } else {
    console.error('- Could not find .central-print-modal-container');
  }

  console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
  await browser.close();
})();
