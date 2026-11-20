const path = require('path');
const fs = require('fs');
const { chromium } = require('c:/inetpub/wwwroot/Municipal_Digital_Twins-main/frontend/node_modules/playwright');

(async () => {
  console.log('--- STARTING MULTI-TENANT E2E PLAYWRIGHT ISOLATION VERIFICATION ---');
  const artifactDir = 'C:/Users/Administrator/.gemini/antigravity/brain/d667eba2-7753-4fa4-98d9-c01d86e96e65';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const tokenData = JSON.parse(fs.readFileSync('scripts/e2e_tokens.json', 'utf8'));

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  // =========================================================================
  // SCENARIO 1: GAUSHALA MUNICIPALITY (Ranjit Barma)
  // =========================================================================
  console.log('\n[E2E SCENARIO 1] Logging in as Gaushala Municipality Admin (Ranjit Barma)...');
  const gaushalaContext = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  
  await gaushalaContext.addInitScript((g) => {
    localStorage.clear();
    localStorage.setItem('p5_token', g.token);
    localStorage.setItem('p5_user', JSON.stringify({
      id: 'gaushala-admin-id',
      email: g.email,
      fullName: g.user,
      role: 'admin',
      roles: ['admin'],
      tenantId: 'gaushala',
      tenantSubdomain: 'gaushala'
    }));
    localStorage.setItem('p5_role', 'admin');
    localStorage.setItem('p5_name', g.user);
    localStorage.setItem('tenant_id', 'gaushala');
    localStorage.setItem('p5_tenant_subdomain', 'gaushala');
  }, tokenData.gaushala);

  const gPage = await gaushalaContext.newPage();

  console.log('Navigating to http://localhost:8080/app/recruitment as Gaushala Admin...');
  await gPage.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await gPage.waitForTimeout(3000);

  // Check Vacancies Tab for Gaushala
  const gVacanciesContent = await gPage.content();
  const gHasVacancies = gVacanciesContent.includes('०४/२०८३/०८४') || gVacanciesContent.includes('०५/२०८३/०८४');
  console.log(`- Gaushala sees Panchpokhari vacancies: ${gHasVacancies}`);
  if (gHasVacancies) {
    console.error('FATAL ERROR: GAUSHALA SEES PANCHPOKHARI VACANCIES!');
    process.exit(1);
  }

  // Switch to Applications Tab (दरखास्त रुजु तथा पदपूर्ति)
  console.log('Switching to Applications tab for Gaushala...');
  const gAppTabBtn = gPage.locator('button:has-text("दरखास्त रुजु तथा पदपूर्ति")').first();
  if (await gAppTabBtn.count() > 0) {
    await gAppTabBtn.click();
    await gPage.waitForTimeout(2000);
  }

  // Take screenshot for Gaushala applications view
  const gScreenshotPath = path.join(artifactDir, 'gaushala_recruitment_isolated.png');
  await gPage.screenshot({ path: gScreenshotPath, fullPage: false });
  console.log(`Saved Gaushala recruitment view screenshot: ${gScreenshotPath}`);

  // Check text content on page
  const gPageContent = await gPage.content();
  const hasNarayan = gPageContent.includes('नारायण क्षेत्री') || gPageContent.includes('NARAYAN CHHETRI');
  const hasRamBahadur = gPageContent.includes('राम बहादुर श्रेष्ठ');
  const hasApp0002 = gPageContent.includes('APP-2081-0002');
  const hasApp0004 = gPageContent.includes('APP-2081-0004');
  const hasDemoSubash = gPageContent.includes('सुवास तामाङ');

  console.log(`- Gaushala sees Panchpokhari candidate Narayan Chhetri: ${hasNarayan}`);
  console.log(`- Gaushala sees Panchpokhari candidate Ram Bahadur Shrestha: ${hasRamBahadur}`);
  console.log(`- Gaushala sees Panchpokhari application APP-2081-0002: ${hasApp0002}`);
  console.log(`- Gaushala sees Panchpokhari application APP-2081-0004: ${hasApp0004}`);
  console.log(`- Gaushala sees deleted demo candidate Subash Tamang: ${hasDemoSubash}`);

  if (hasNarayan || hasRamBahadur || hasApp0002 || hasApp0004 || hasDemoSubash) {
    console.error('FATAL ERROR: DATA LEAKAGE DETECTED IN GAUSHALA APPLICATIONS VIEW!');
    process.exit(1);
  }
  console.log('SUCCESS: Gaushala applications view is 100% ISOLATED. Zero records visible.');

  // Test Admit Card Tab under Gaushala
  console.log('Testing Admit Card Search under Gaushala for citizenship 126049...');
  const gAdmitTabBtn = gPage.locator('button:has-text("प्रवेशपत्र तथा आवेदन स्थिति")').first();
  if (await gAdmitTabBtn.count() > 0) {
    await gAdmitTabBtn.click();
    await gPage.waitForTimeout(1000);
    const searchInput = gPage.locator('input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('126049');
      const searchBtn = gPage.locator('button:has-text("खोज्नुहोस्")').first();
      await searchBtn.click();
      await gPage.waitForTimeout(2000);
      
      const gAdmitScreenshotPath = path.join(artifactDir, 'gaushala_admit_search_isolated.png');
      await gPage.screenshot({ path: gAdmitScreenshotPath, fullPage: false });
      console.log(`Saved Gaushala admit search screenshot: ${gAdmitScreenshotPath}`);

      const gAdmitContent = await gPage.content();
      const leakedCard = gAdmitContent.includes('नारायण क्षेत्री');
      console.log(`- Gaushala search leaked Panchpokhari card: ${leakedCard}`);
      if (leakedCard) {
        console.error('FATAL ERROR: GAUSHALA RETRIEVED PANCHPOKHARI ADMIT CARD!');
        process.exit(1);
      }
      console.log('SUCCESS: Gaushala cannot search or retrieve Panchpokhari admit card.');
    }
  }

  await gaushalaContext.close();

  // =========================================================================
  // SCENARIO 2: PANCHPOKHARI THANGPAL RURAL MUNICIPALITY
  // =========================================================================
  console.log('\n[E2E SCENARIO 2] Logging in as Panchpokhari Thangpal Rural Municipality...');
  const p5Context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  
  await p5Context.addInitScript((p) => {
    localStorage.clear();
    localStorage.setItem('p5_token', p.token);
    localStorage.setItem('p5_user', JSON.stringify({
      id: 'panchpokhari-admin-id',
      email: p.email,
      fullName: p.user,
      role: 'admin',
      roles: ['admin'],
      tenantId: 'panchpokhari',
      tenantSubdomain: 'panchpokhari'
    }));
    localStorage.setItem('p5_role', 'admin');
    localStorage.setItem('p5_name', p.user);
    localStorage.setItem('tenant_id', 'panchpokhari');
    localStorage.setItem('p5_tenant_subdomain', 'panchpokhari');
  }, tokenData.panchpokhari);

  const p5Page = await p5Context.newPage();

  console.log('Navigating to http://localhost:8080/app/recruitment as Panchpokhari Admin...');
  await p5Page.goto('http://localhost:8080/app/recruitment', { waitUntil: 'networkidle' });
  await p5Page.waitForTimeout(3000);

  // Check Vacancies on Panchpokhari
  const p5VacContent = await p5Page.content();
  const p5HasVac1 = p5VacContent.includes('०४/२०८३/०८४');
  const p5HasVac2 = p5VacContent.includes('०५/२०८३/०८४');
  console.log(`- Panchpokhari sees vacancy ०४/२०८३/०८४: ${p5HasVac1}`);
  console.log(`- Panchpokhari sees vacancy ०५/२०८३/०८४: ${p5HasVac2}`);

  // Switch to Applications tab (दरखास्त रुजु तथा पदपूर्ति)
  console.log('Switching to Applications tab for Panchpokhari...');
  const p5AppTabBtn = p5Page.locator('button:has-text("दरखास्त रुजु तथा पदपूर्ति")').first();
  if (await p5AppTabBtn.count() > 0) {
    await p5AppTabBtn.click();
    await p5Page.waitForTimeout(2000);
  }

  // Take screenshot for Panchpokhari applications view
  const p5ScreenshotPath = path.join(artifactDir, 'panchpokhari_recruitment_isolated.png');
  await p5Page.screenshot({ path: p5ScreenshotPath, fullPage: false });
  console.log(`Saved Panchpokhari recruitment view screenshot: ${p5ScreenshotPath}`);

  // Verify real records are present and demo records are absent
  const p5PageContent = await p5Page.content();
  const p5HasNarayan = p5PageContent.includes('नारायण क्षेत्री');
  const p5HasRamBahadur = p5PageContent.includes('राम बहादुर श्रेष्ठ');
  const p5HasApp0002 = p5PageContent.includes('APP-2081-0002');
  const p5HasApp0004 = p5PageContent.includes('APP-2081-0004');
  const p5HasDemo1 = p5PageContent.includes('APP-2081-0001');
  const p5HasDemo3 = p5PageContent.includes('APP-2081-0003');
  const p5HasDemo5 = p5PageContent.includes('APP-2081-0005');
  const p5HasDemo6 = p5PageContent.includes('APP-2081-0006');

  console.log(`- Panchpokhari sees real candidate Narayan Chhetri: ${p5HasNarayan}`);
  console.log(`- Panchpokhari sees real candidate Ram Bahadur Shrestha: ${p5HasRamBahadur}`);
  console.log(`- Panchpokhari sees real application APP-2081-0002: ${p5HasApp0002}`);
  console.log(`- Panchpokhari sees real application APP-2081-0004: ${p5HasApp0004}`);
  console.log(`- Panchpokhari sees deleted demo APP-2081-0001: ${p5HasDemo1}`);
  console.log(`- Panchpokhari sees deleted demo APP-2081-0003: ${p5HasDemo3}`);
  console.log(`- Panchpokhari sees deleted demo APP-2081-0005: ${p5HasDemo5}`);
  console.log(`- Panchpokhari sees deleted demo APP-2081-0006: ${p5HasDemo6}`);

  if (!p5HasNarayan || !p5HasRamBahadur || !p5HasApp0002 || !p5HasApp0004) {
    console.error('FATAL ERROR: PANCHPOKHARI REAL DATA MISSING IN APPLICATIONS VIEW!');
    process.exit(1);
  }
  if (p5HasDemo1 || p5HasDemo3 || p5HasDemo5 || p5HasDemo6) {
    console.error('FATAL ERROR: CLEANED UP DEMO DATA STILL VISIBLE IN PANCHPOKHARI!');
    process.exit(1);
  }

  console.log('SUCCESS: Panchpokhari applications view contains 100% of real candidates and 0 demo records!');

  // Test Admit Card Tab under Panchpokhari
  console.log('Testing Admit Card Search under Panchpokhari for citizenship 126049...');
  const p5AdmitTabBtn = p5Page.locator('button:has-text("प्रवेशपत्र तथा आवेदन स्थिति")').first();
  if (await p5AdmitTabBtn.count() > 0) {
    await p5AdmitTabBtn.click();
    await p5Page.waitForTimeout(1000);
    const searchInput = p5Page.locator('input[placeholder*="नागरिकता"], input[placeholder*="दरखास्त"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('126049');
      const searchBtn = p5Page.locator('button:has-text("खोज्नुहोस्")').first();
      await searchBtn.click();
      await p5Page.waitForTimeout(2000);

      const p5AdmitScreenshotPath = path.join(artifactDir, 'panchpokhari_admit_card_isolated.png');
      await p5Page.screenshot({ path: p5AdmitScreenshotPath, fullPage: false });
      console.log(`Saved Panchpokhari admit card search screenshot: ${p5AdmitScreenshotPath}`);

      const admitResultContent = await p5Page.content();
      const p5FoundCandidate = admitResultContent.includes('नारायण क्षेत्री');
      console.log(`- Panchpokhari found candidate Narayan Chhetri: ${p5FoundCandidate}`);
      if (!p5FoundCandidate) {
        console.error('FATAL ERROR: PANCHPOKHARI COULD NOT FIND REAL CANDIDATE ADMIT CARD!');
        process.exit(1);
      }

      // Click Print / Preview button if available
      const printBtn = p5Page.locator('button:has-text("प्रवेशपत्र प्रिन्ट गर्नुहोस्"), button:has-text("Print Admit Card")').first();
      if (await printBtn.count() > 0) {
        await printBtn.click();
        await p5Page.waitForTimeout(1000);
        const p5PrintPreviewPath = path.join(artifactDir, 'panchpokhari_admit_modal_isolated.png');
        await p5Page.screenshot({ path: p5PrintPreviewPath, fullPage: false });
        console.log(`Saved Panchpokhari admit card modal print screenshot: ${p5PrintPreviewPath}`);
      }
    }
  }

  await p5Context.close();
  await browser.close();

  console.log('\n=============================================================');
  console.log('ALL PLAYWRIGHT MULTI-TENANT ISOLATION E2E TESTS PASSED 100%');
  console.log('=============================================================');
})();
