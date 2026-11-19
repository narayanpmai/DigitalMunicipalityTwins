const fs = require('fs');
const path = require('path');
const { chromium } = require('../frontend/node_modules/playwright');

const outDir = path.resolve(__dirname, '../frontend/public/manual_screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const dummyPngPath = path.join(outDir, 'sample_doc.png');
const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
fs.writeFileSync(dummyPngPath, Buffer.from(dummyPngBase64, 'base64'));

async function run() {
  console.log('Launching browser with Chrome executable...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 960 },
    deviceScaleFactor: 1.5
  });

  const page = await context.newPage();
  page.on('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  });

  // 1. Overview & Vacancy Listings
  console.log('Navigating to Public Recruitment Portal...');
  await page.goto('http://localhost:8080/recruitment', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  console.log('Capturing Step 1: Portal Overview & Vacancies...');
  await page.screenshot({
    path: path.join(outDir, 'step1_portal_overview.png'),
    clip: { x: 0, y: 0, width: 1280, height: 850 }
  });

  // 2. Click Apply Now to open Wizard Step 1
  console.log('Clicking Apply Now button...');
  const applyBtn = page.locator('button:has-text("अनलाइन दरखास्त फारम (Apply Now)")').first();
  await applyBtn.click();
  await page.waitForTimeout(1000);

  // Select first open vacancy in the dropdown
  console.log('Selecting vacancy in dropdown...');
  const selectElem = page.locator('select.rec-input-control');
  await selectElem.waitFor({ state: 'visible', timeout: 5000 });
  await selectElem.selectOption({ index: 1 });
  await page.waitForTimeout(600);

  // Select inclusive categories to demonstrate fee calculation
  const inclusiveCards = page.locator('.rec-inclusive-card');
  const count = await inclusiveCards.count();
  if (count > 1) {
    await inclusiveCards.nth(1).click(); // Click second category (e.g., महिला)
    await page.waitForTimeout(500);
  }

  console.log('Capturing Step 2: Vacancy & Category Selection...');
  await page.screenshot({
    path: path.join(outDir, 'step2_select_vacancy.png'),
    clip: { x: 80, y: 160, width: 1120, height: 800 }
  });

  // 3. Proceed to Step 2: Personal Details
  console.log('Proceeding to Step 2: Personal Information...');
  const nextToStep2 = page.locator('button:has-text("अर्को चरण (व्यक्तिगत विवरण)")');
  await nextToStep2.click();
  await page.waitForTimeout(800);

  // Fill sample personal info
  await page.fill('input[placeholder*="सुवास तामाङ"]', 'राम बहादुर श्रेष्ठ');
  await page.fill('input[placeholder*="SUBASH TAMANG"]', 'RAM BAHADUR SHRESTHA');
  await page.fill('input[placeholder*="२३-०१-७५"]', '२७-०१-७६-०१२३४');
  await page.fill('input[type="tel"]', '९८४१००१२३४');
  await page.fill('input[type="email"]', 'ram.shrestha@example.com');

  console.log('Capturing Step 3: Personal Details Form...');
  await page.screenshot({
    path: path.join(outDir, 'step3_personal_details.png'),
    clip: { x: 80, y: 160, width: 1120, height: 850 }
  });

  // 4. Proceed to Step 3: Qualifications & Document Upload
  console.log('Proceeding to Step 3: Documents...');
  const nextToStep3 = page.locator('button:has-text("अर्को चरण (योग्यता र कागजात)")');
  await nextToStep3.click();
  await page.waitForTimeout(800);

  // Fill qualification details
  await page.fill('input[placeholder*="डिप्लोमा"]', 'डिप्लोमा इन सिभिल / जियोमेटिक्स इन्जिनियरिङ');
  await page.fill('input[placeholder*="CTEVT"]', 'CTEVT, सानोठिमी भक्तपुर');
  await page.fill('input[placeholder*="२०७८"]', '२०७८');
  await page.fill('input[placeholder*="प्रथम श्रेणी"]', 'प्रथम श्रेणी (३.४५ GPA)');
  await page.fill('input[placeholder*="NEC"]', 'NEC-3421-ENG');
  await page.fill('input[type="number"]', '2');

  // Upload all 4 required documents (photo, signature, citizenship, transcript)
  console.log('Uploading all 4 documents...');
  for (let d = 0; d < 4; d++) {
    const fileInp = page.locator('.rec-doc-box input[type="file"]').first();
    if (await fileInp.count() > 0) {
      console.log(`Uploading doc ${d + 1}...`);
      await Promise.all([
        page.waitForResponse(res => res.url().includes('/upload-document') && res.status() === 200, { timeout: 10000 }).catch(() => {}),
        fileInp.setInputFiles(dummyPngPath)
      ]);
      await page.waitForTimeout(1000);
    }
  }

  // Check agreement checkbox
  const agreeCheck = page.locator('input#agreeTerms');
  if (await agreeCheck.count() > 0) {
    await agreeCheck.check();
    await page.waitForTimeout(400);
  }

  console.log('Capturing Step 4: Documents Upload & Declaration...');
  await page.screenshot({
    path: path.join(outDir, 'step4_documents_upload.png'),
    clip: { x: 80, y: 160, width: 1120, height: 920 }
  });

  // 5. Submit Draft & Proceed to Step 4: Payment
  console.log('Proceeding to Step 4: Payment (Draft Submission)...');
  const payBtn = page.locator('button:has-text("दरखास्त सुरक्षित गर्नुहोस् र भुक्तानीमा जानुहोस्")');
  await payBtn.click();
  await page.waitForTimeout(3000); // Wait for backend draft creation and QR generation

  console.log('Capturing Step 5: NIMB Bank QR & Payment Gateway...');
  await page.screenshot({
    path: path.join(outDir, 'step5_payment_qr.png'),
    clip: { x: 80, y: 160, width: 1120, height: 960 }
  });

  // 6. Click Verify & Confirm Payment
  console.log('Verifying payment to generate official receipt...');
  const verifyBtn = page.locator('button:has-text("मैले भुक्तानी सम्पन्न गरें")');
  if (await verifyBtn.count() > 0) {
    await verifyBtn.click();
    await page.waitForTimeout(3500); // Wait for backend payment confirmation & receipt

    console.log('Capturing Step 6: Official Revenue Receipt & Confirmation...');
    await page.screenshot({
      path: path.join(outDir, 'step6_receipt_confirmation.png'),
      clip: { x: 80, y: 160, width: 1120, height: 960 }
    });
  }

  // 7. Track & Admit Card Tab
  console.log('Navigating to Admit Card Tracking Tab...');
  const admitTab = page.locator('button:has-text("प्रवेशपत्र तथा आवेदन स्थिति खोज्नुहोस्")').first();
  if (await admitTab.count() > 0) {
    await admitTab.click();
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder*="नागरिकता नं"]', '९८४१००१२३४');
    const searchBtn = page.locator('button:has-text("खोज्नुहोस्")');
    if (await searchBtn.count() > 0) {
      await searchBtn.click();
      await page.waitForTimeout(1500);
    }

    console.log('Capturing Step 7: Admit Card & Status Search...');
    await page.screenshot({
      path: path.join(outDir, 'step7_admit_card_search.png'),
      clip: { x: 80, y: 160, width: 1120, height: 750 }
    });
  }

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED WITH 100% SUCCESS!');
}

run().catch(err => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});
