import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1400, height: 920 } });
  const page = await context.newPage();

  // Set Auth state
  await page.goto('http://localhost:8080/');
  await page.evaluate(() => {
    localStorage.setItem('p5_token', 'jwt_test_token_valid');
    localStorage.setItem('p5_role', 'admin');
    localStorage.setItem('p5_user', JSON.stringify({ id: 'admin-1', role: 'admin', fullName: 'Super Admin', email: 'admin@panchpokhari.gov.np' }));
  });

  // Navigate to GIS map
  await page.goto('http://localhost:8080/app/gis-map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Find a school pin specifically (mortarboard emoji 🎓)
  const schoolOpened = await page.evaluate(() => {
    const pins = Array.from(document.querySelectorAll('.custom-gis-pin'));
    const schoolPin = pins.find(p => p.textContent && p.textContent.includes('🎓')) || pins[0];
    if (schoolPin) {
      schoolPin.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    }
    return false;
  });

  console.log('School marker clicked:', schoolOpened);
  await page.waitForTimeout(1500);

  // Take screenshot
  await page.screenshot({ path: 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5\\gis_map_school_popup_verified.png' });
  console.log('Saved gis_map_school_popup_verified.png');

  // Check detail button text inside the popup
  const schoolBtnText = await page.evaluate(() => {
    const btn = document.querySelector('.gis-detail-page-btn');
    return btn ? btn.textContent : null;
  });
  console.log('School Popup Detail Button:', schoolBtnText);

  // Also test clicking the detail button to verify navigation works!
  await page.evaluate(() => {
    const btn = document.querySelector('.gis-detail-page-btn');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2500);
  console.log('Current URL after clicking detail button:', page.url());
  await page.screenshot({ path: 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\003f00d0-7676-492b-bdc7-b42b82deb4f5\\gis_map_navigated_school_detail.png' });

  await browser.close();
}

main().catch(console.error);
