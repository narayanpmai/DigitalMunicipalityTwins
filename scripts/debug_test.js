const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));
  page.on('response', resp => {
    if (resp.url().includes('admit-card') || resp.url().includes('recruitment')) {
      console.log('RESP:', resp.url(), resp.status());
    }
  });
  await page.goto('http://localhost:8080/app/recruitment');
  await page.waitForTimeout(2000);
  const tab = page.locator('button:has-text("प्रवेशपत्र तथा")').first();
  await tab.click();
  await page.waitForTimeout(1000);
  const input = page.locator('input[placeholder*="फोन"], input[placeholder*="नागरिकता"]').first();
  await input.fill('126049');
  const btn = page.locator('button:has-text("खोज्नुहोस्")').first();
  await btn.click();
  await page.waitForTimeout(3000);
  const cardVisible = await page.locator('#printable-admit-card').count();
  console.log('#printable-admit-card count:', cardVisible);
  await browser.close();
})();
