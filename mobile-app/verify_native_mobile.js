import { chromium } from '../frontend/node_modules/@playwright/test/index.mjs';
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
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  const artifactDir = 'C:/Users/UNepal/.gemini/antigravity-ide/brain/4de8d0bc-6177-4811-9217-e0f9084e964e';

  console.log('1. Navigating to mobile-app tourism-twin at http://localhost:5176/?tab=tourism-twin...');
  await page.goto('http://localhost:5176/?tab=tourism-twin', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 3. Take screenshot of TourismHeritageTwin with the new MobileTrekExplorer
  await page.screenshot({ path: path.join(artifactDir, 'native_mobile_trek_top.png') });
  console.log('Saved native_mobile_trek_top.png');

  // 4. Scroll to view the interactive map
  console.log('4. Scrolling to map with mouse.wheel...');
  await page.mouse.wheel(0, 480);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactDir, 'native_mobile_trek_map.png') });
  console.log('Saved native_mobile_trek_map.png');

  // 5. Scroll to 5 Sacred Lakes cards
  console.log('5. Scrolling to 5 Sacred Lakes with mouse.wheel...');
  await page.mouse.wheel(0, 450);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactDir, 'native_mobile_lakes_cards.png') });
  console.log('Saved native_mobile_lakes_cards.png');

  // 6. Test Hotel & Homestay tab
  console.log('6. Clicking Hotel & Homestay tab...');
  const hotelTabBtn = page.locator('button:has-text("होटल/होमस्टे")').first();
  if (await hotelTabBtn.count() > 0) {
    await hotelTabBtn.click();
    await page.waitForTimeout(1500);

    // Screenshot top of Hotel/Homestay tab
    await page.screenshot({ path: path.join(artifactDir, 'native_mobile_hotels_top.png') });
    console.log('Saved native_mobile_hotels_top.png');

    // Scroll to see hotel cards matching web screenshot
    console.log('7. Scrolling down hotel list...');
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'native_mobile_hotels_cards.png') });
    console.log('Saved native_mobile_hotels_cards.png');

    // Scroll further down to see more cards (Tarkeghyang, Hyolmo Heaven, Panchpokhari View Lodge, Manekharka)
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'native_mobile_hotels_more_cards.png') });
    console.log('Saved native_mobile_hotels_more_cards.png');

    // Click "बुकिङ" button on the first visible booking button
    console.log('8. Opening Booking modal...');
    const bookingBtn = page.locator('button:has-text("बुकिङ")').first();
    if (await bookingBtn.count() > 0) {
      await bookingBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(artifactDir, 'native_mobile_booking_modal.png') });
      console.log('Saved native_mobile_booking_modal.png');

      // Fill in guest booking form
      console.log('9. Filling booking form...');
      const nameInput = page.locator('form input[type="text"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.click();
        await nameInput.pressSequentially('दावा लामा (पर्यटक)', { delay: 30 });
      }
      const phoneInput = page.locator('form input[type="tel"]').first();
      if (await phoneInput.count() > 0) {
        await phoneInput.click();
        await phoneInput.pressSequentially('9841556677', { delay: 30 });
      }

      // Submit booking
      const submitBtn = page.locator('button:has-text("बुकिङ अनुरोध पठाउनुहोस्")').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(artifactDir, 'native_mobile_booking_confirmed.png') });
        console.log('Saved native_mobile_booking_confirmed.png');
      }
    }
  }

  await browser.close();
  console.log('Native mobile verification finished successfully!');
}

main().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
