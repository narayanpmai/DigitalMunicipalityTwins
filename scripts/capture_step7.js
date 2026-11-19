const path = require('path');
const { chromium } = require('../frontend/node_modules/playwright');

(async () => {
  console.log('Launching Chrome for Step 7...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 960 },
    deviceScaleFactor: 1.5
  });
  const page = await context.newPage();
  await page.goto('http://localhost:8080/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा आवेदन स्थिति खोज्नुहोस्")').first();
  await admitTab.click();
  await page.waitForTimeout(1000);
  
  await page.fill('input[placeholder*="नागरिकता नं"]', '९८४१००१२३४');
  const searchBtn = page.locator('button[type="submit"]:has-text("खोज्नुहोस्")');
  await searchBtn.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({
    path: path.resolve(__dirname, '../frontend/public/manual_screenshots/step7_admit_card_search.png'),
    clip: { x: 80, y: 160, width: 1120, height: 750 }
  });
  
  await browser.close();
  console.log('Step 7 screenshot captured successfully!');
})().catch(console.error);
