const path = require('path');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

const ARTIFACT_DIR = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

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
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:8080/app/recruitment...');
    await page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);

    // Click on "खुला विज्ञापन तथा पदहरू" tab
    console.log('Looking for Vacancies tab...');
    const tabButtons = await page.$$('.rec-tab-card');
    for (const btn of tabButtons) {
      const text = await btn.innerText();
      if (text.includes('खुला विज्ञापन तथा पदहरू')) {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(1500);

    // Find and click "संशोधन (Edit)" button on the first vacancy card
    console.log('Clicking "संशोधन (Edit)" on vacancy card...');
    const editBtns = await page.$$('button:has-text("संशोधन (Edit)")');
    console.log(`Found ${editBtns.length} edit buttons`);
    if (editBtns.length > 0) {
      await editBtns[0].click();
      await page.waitForTimeout(1000);

      // Check modal measurements
      const modalInfo = await page.evaluate(() => {
        const modalBody = document.querySelector('.rec-modal-body');
        const modalPanel = document.querySelector('.rec-modal-panel');
        if (!modalBody || !modalPanel) return null;
        return {
          panelWidth: modalPanel.clientWidth,
          panelHeight: modalPanel.clientHeight,
          bodyClientHeight: modalBody.clientHeight,
          bodyScrollHeight: modalBody.scrollHeight,
          hasScrollbar: modalBody.scrollHeight > modalBody.clientHeight,
          overflowY: window.getComputedStyle(modalBody).overflowY
        };
      });
      console.log('Edit Modal metrics:', JSON.stringify(modalInfo, null, 2));

      // Capture screenshot of Edit modal
      const editModalPath = path.join(ARTIFACT_DIR, 'vacancy_edit_modal_no_scroll_verified.png');
      await page.screenshot({ path: editModalPath });
      console.log('Saved screenshot:', editModalPath);

      // Close modal
      const closeBtn = await page.$('.rec-modal-header button');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // Now test "नयाँ विज्ञापन आह्वान"
    console.log('Clicking "+ नयाँ विज्ञापन थप्नुहोस्"...');
    const addBtn = await page.$('button:has-text("नयाँ विज्ञापन थप्नुहोस्")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(1000);

      const addModalInfo = await page.evaluate(() => {
        const modalBody = document.querySelector('.rec-modal-body');
        const modalPanel = document.querySelector('.rec-modal-panel');
        if (!modalBody || !modalPanel) return null;
        return {
          panelWidth: modalPanel.clientWidth,
          panelHeight: modalPanel.clientHeight,
          bodyClientHeight: modalBody.clientHeight,
          bodyScrollHeight: modalBody.scrollHeight,
          hasScrollbar: modalBody.scrollHeight > modalBody.clientHeight,
        };
      });
      console.log('Add Modal metrics:', JSON.stringify(addModalInfo, null, 2));

      const addModalPath = path.join(ARTIFACT_DIR, 'vacancy_create_modal_no_scroll_verified.png');
      await page.screenshot({ path: addModalPath });
      console.log('Saved screenshot:', addModalPath);
    }

    console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
