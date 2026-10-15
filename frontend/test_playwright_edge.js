import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Test Katari School 37
  await page.goto('http://localhost:8080/schools/37', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5\\verified_school_37_full.png', fullPage: true });
  console.log('Verified school 37 screenshot saved.');

  // Test Health H_01
  await page.goto('http://localhost:8080/facilities/h_01', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5\\verified_health_h01_full.png', fullPage: true });
  console.log('Verified health h01 screenshot saved.');

  // Test Ward W_04
  await page.goto('http://localhost:8080/facilities/w_04', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5\\verified_ward_w04_full.png', fullPage: true });
  console.log('Verified ward w04 screenshot saved.');

  // Test Tourism T_01
  await page.goto('http://localhost:8080/facilities/t_01', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5\\verified_tourism_t01_full.png', fullPage: true });
  console.log('Verified tourism t01 screenshot saved.');

  // Test GIS Map and open a marker popup
  try {
    await page.goto('http://localhost:8080/app/gis-map', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Click on the first leaflet marker
    const marker = await page.$('.custom-facility-pin');
    if (marker) {
      await marker.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5\\gis_map_popup_verified.png' });
      console.log('GIS marker popup screenshot saved.');
    } else {
      console.log('No marker found on /app/gis-map, capturing view');
      await page.screenshot({ path: 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5\\gis_map_popup_verified.png' });
    }
  } catch (err) {
    console.warn('GIS popup test warning:', err.message);
  }

  await browser.close();
  console.log('All verification complete.');
}

main().catch(console.error);
