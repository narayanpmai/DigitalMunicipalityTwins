import { chromium } from '@playwright/test';
import path from 'path';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  const artifactDir = 'C:/Users/UNepal/.gemini/antigravity-ide/brain/4de8d0bc-6177-4811-9217-e0f9084e964e';

  // 1. Mobile PWA Verification with Ama Yangri Route Switch
  console.log('1. Launching mobile context for PWA verification...');
  const mobileCtx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });

  const page = await mobileCtx.newPage();
  await page.goto('http://localhost:8080/pwa?tab=trekking', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Click on "🚩 २. आमायाङ्ग्री पिक (३,७७१m)" switcher tab
  console.log('2. Clicking "🚩 २. आमायाङ्ग्री पिक (३,७७१m)" switcher button...');
  const ayTabBtn = page.locator('button:has-text("आमायाङ्ग्री")').first();
  if (await ayTabBtn.count() > 0) {
    await ayTabBtn.click();
    await page.waitForTimeout(2000);
  }

  // Screenshot 1: Mobile Ama Yangri Top Banner, Metrics, and Action Bar
  await page.screenshot({ path: path.join(artifactDir, 'mobile_ama_yangri_top.png') });
  console.log('Saved mobile_ama_yangri_top.png');

  // Screenshot 2: Click "🚩 आमायाङ्ग्री चुचुरो (3,771m)" button to focus on summit
  console.log('3. Clicking "🚩 आमायाङ्ग्री चुचुरो" button...');
  const summitBtn = page.locator('button:has-text("आमायाङ्ग्री चुचुरो")').first();
  if (await summitBtn.count() > 0) {
    await summitBtn.click();
    await page.waitForTimeout(2500);
  }

  await page.evaluate(() => window.scrollTo(0, 310));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_ama_yangri_map_summit.png') });
  console.log('Saved mobile_ama_yangri_map_summit.png');

  // Screenshot 3: Ama Yangri Heritage & Viewpoint Cards
  console.log('4. Scrolling to Ama Yangri Heritage Cards...');
  const heritageHeader = page.locator('h3:has-text("आमायाङ्ग्री सांस्कृतिक तथा प्राकृतिक आकर्षण")');
  if (await heritageHeader.count() > 0) {
    await heritageHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'mobile_ama_yangri_heritage_cards.png') });
    console.log('Saved mobile_ama_yangri_heritage_cards.png');
  }

  // Screenshot 4: Tarkeghyang Hotels & Homestays
  console.log('5. Scrolling to Tarkeghyang Hotels & Lodges...');
  const hotelHeader = page.locator('h3:has-text("तार्केघ्याङका होटल तथा ह्योल्मो होमस्टेहरू")');
  if (await hotelHeader.count() > 0) {
    await hotelHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'mobile_ama_yangri_hotels.png') });
    console.log('Saved mobile_ama_yangri_hotels.png');
  }

  await mobileCtx.close();

  // 2. Desktop GIS Map Verification
  console.log('6. Launching desktop context for /app/gis-map verification...');
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto('http://localhost:8080/app/gis-map', { waitUntil: 'load', timeout: 30000 });
  await desktopPage.waitForTimeout(3000);

  // Click Ama Yangri button in floating control bar
  const dAyBtn = desktopPage.locator('button:has-text("आमायाङ्ग्री पिक")').first();
  if (await dAyBtn.count() > 0) {
    await dAyBtn.click();
    console.log('Clicked Ama Yangri focus button in desktop GIS Map');
    await desktopPage.waitForTimeout(2500);
  }

  await desktopPage.screenshot({ path: path.join(artifactDir, 'gis_map_ama_yangri_desktop.png') });
  console.log('Saved gis_map_ama_yangri_desktop.png');

  await desktopCtx.close();
  await browser.close();
  console.log('Ama Yangri verification completed successfully!');
}

main().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
