import { chromium } from '@playwright/test';
import path from 'path';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  const artifactDir = 'C:/Users/UNepal/.gemini/antigravity-ide/brain/4de8d0bc-6177-4811-9217-e0f9084e964e';

  console.log('1. Navigating to Mobile Citizen PWA at http://localhost:8080/pwa?tab=trekking...');
  await page.goto('http://localhost:8080/pwa?tab=trekking', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 1. Capture Top View: Mobile Bar, 6-Dock Navigation, Trekking Banner, Metrics, Quick Actions
  await page.screenshot({ path: path.join(artifactDir, 'mobile_pwa_trek_top.png') });
  console.log('Saved mobile_pwa_trek_top.png');

  // 2. Scroll to Map
  await page.evaluate(() => window.scrollTo(0, 310));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_pwa_trek_map.png') });
  console.log('Saved mobile_pwa_trek_map.png');

  // 3. Click "✨ ५ पवित्र कुण्डहरू" button
  console.log('3. Clicking "✨ ५ पवित्र कुण्डहरू" button to focus on lakes...');
  const lakesBtn = page.locator('button:has-text("५ पवित्र कुण्डहरू")').first();
  if (await lakesBtn.count() > 0) {
    await lakesBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(artifactDir, 'mobile_pwa_lakes_focus.png') });
    console.log('Saved mobile_pwa_lakes_focus.png');
  }

  // 4. Scroll to Sacred Lakes Cards
  console.log('4. Scrolling to 5 Sacred Lakes cards...');
  await page.evaluate(() => window.scrollTo(0, 850));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_pwa_lakes_cards.png') });
  console.log('Saved mobile_pwa_lakes_cards.png');

  // 5. Scroll directly to Hotel Directory and Emergency SOS
  console.log('5. Scrolling to Hotels and Emergency Assistance...');
  const hotelSection = page.locator('h3:has-text("होटल, लज तथा विश्रामस्थल")');
  if (await hotelSection.count() > 0) {
    await hotelSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'mobile_pwa_hotel_directory_shot.png') });
    console.log('Saved mobile_pwa_hotel_directory_shot.png');
  }

  const amsSection = page.locator('text=लेक लाग्ने (Altitude Sickness / AMS)');
  if (await amsSection.count() > 0) {
    await amsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'mobile_pwa_emergency_ams_shot.png') });
    console.log('Saved mobile_pwa_emergency_ams_shot.png');
  }

  await browser.close();
  console.log('Mobile PWA verification completed successfully.');
}

main().catch(err => {
  console.error('Error during mobile verification:', err);
  process.exit(1);
});
