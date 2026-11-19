const path = require('path');
const { chromium } = require('../frontend/node_modules/playwright');

(async () => {
  console.log('Launching browser for verification screenshots...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 950 });

  // 1. Capture Public View
  console.log('Navigating to Public Portal...');
  await page.goto('http://localhost:8080/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.resolve(__dirname, '../frontend/public/manual_screenshots/public_view_cleaned.png'),
    clip: { x: 0, y: 0, width: 1280, height: 650 }
  });

  // 2. Capture Admin View
  console.log('Navigating to Admin Dashboard...');
  await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.resolve(__dirname, '../frontend/public/manual_screenshots/admin_dashboard_cleaned.png'),
    clip: { x: 0, y: 0, width: 1280, height: 650 }
  });

  await browser.close();
  console.log('Both verification screenshots captured successfully!');
})().catch(console.error);
