const path = require('path');
const fs = require('fs');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('--- STARTING ADMIT CARD NEW DESIGN & A4 FIT VERIFICATION ---');
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  
  // Login as Panchpokhari Admin to view Narayan Chhetri's Admit Card
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

  console.log('Navigating to http://localhost:8080/app/recruitment...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Switch to Admit Card Tab
  console.log('Clicking Admit Card tab (प्रवेशपत्र तथा आवेदन स्थिति)...');
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा आवेदन स्थिति")').first();
  await admitTab.click();
  await page.waitForTimeout(1000);

  // Search for citizenship 126049
  console.log('Searching for candidate 126049...');
  const searchInput = page.locator('input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
  await searchInput.fill('126049');
  const searchBtn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await searchBtn.click();
  await page.waitForTimeout(2000);

  // Check On-Page Printable Admit Card
  const admitCardEl = page.locator('#printable-admit-card').first();
  if (await admitCardEl.count() > 0) {
    console.log('Found #printable-admit-card element on page!');
    
    // Check bounding box height to verify A4 fit (A4 is ~1123px, should easily be < 1000px)
    const box = await admitCardEl.boundingBox();
    console.log(`Admit Card Element Dimensions: Width = ${box.width}px, Height = ${box.height}px`);

    // Verify text layout:
    const content = await admitCardEl.innerHTML();
    const hasBranchUnderTitle = content.includes('central-lh-branch-center') || content.includes('कर्मचारी पदपूर्ति तथा आन्तरिक परीक्षा सञ्चालन समिति');
    const hasRulesTitle = content.includes('उम्मेदवारले पालना गर्नुपर्ने नियमहरू');
    const hasRule1 = content.includes('प्रवेशपत्र र पहिचान');
    const hasRule2 = content.includes('समय पालना');
    const hasRule3 = content.includes('निषेधित सामग्री');
    const hasRule4 = content.includes('उत्तरपुस्तिका र "की"');
    const hasRule5 = content.includes('मर्यादा र हाजिर');
    const hasOfficialSig = content.includes('पदपूर्ति समिति / प्रमुख प्रशासकीय अधिकृत');

    console.log(`- Committee title present: ${hasBranchUnderTitle}`);
    console.log(`- Rules title present: ${hasRulesTitle}`);
    console.log(`- Rule 1 (प्रवेशपत्र र पहिचान): ${hasRule1}`);
    console.log(`- Rule 2 (समय पालना): ${hasRule2}`);
    console.log(`- Rule 3 (निषेधित सामग्री): ${hasRule3}`);
    console.log(`- Rule 4 (उत्तरपुस्तिका र "की"): ${hasRule4}`);
    console.log(`- Rule 5 (मर्यादा र हाजिर): ${hasRule5}`);
    console.log(`- Official Committee/CAO Signature block: ${hasOfficialSig}`);

    // Take high-res screenshot of the on-page admit card element
    const admitCardPath = path.join(artifactDir, 'admit_card_updated_layout.png');
    await admitCardEl.screenshot({ path: admitCardPath });
    console.log(`Saved updated admit card screenshot: ${admitCardPath}`);
  }

  // Open the Print Preview Modal
  console.log('Opening Print Preview Modal (प्रवेशपत्र पूर्वावलोकन)...');
  const previewModalBtn = page.locator('button:has-text("प्रवेशपत्र पूर्वावलोकन (Preview)")').first();
  if (await previewModalBtn.count() > 0) {
    await previewModalBtn.click();
    await page.waitForTimeout(1500);

    const modalScreenshotPath = path.join(artifactDir, 'admit_card_modal_preview_updated.png');
    await page.screenshot({ path: modalScreenshotPath, fullPage: false });
    console.log(`Saved updated modal preview screenshot: ${modalScreenshotPath}`);
  }

  await context.close();
  await browser.close();
  console.log('--- VERIFICATION COMPLETE ---');
})();
