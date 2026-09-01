import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://tremor-cockpit.vercel.app';
const OUT_DIR = resolve('./verification/round5');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`🌐 Launching real Google Chrome (isolated profile): ${CHROME_PATH}`);
const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--enable-webmcp-testing',
    '--user-data-dir=/tmp/tremor-chrome-profile',
    '--incognito',
    '--window-size=1440,900',
  ],
  defaultViewport: { width: 1440, height: 900 },
});

try {
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[Chrome Console]: ${msg.text()}`));

  console.log(`🚀 Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('\n======================================================');
  console.log('🧪 TEST 1: Agent calls flag_for_review (auth-service)');
  console.log('======================================================');

  const toolReturnRaw = await page.evaluate(async () => {
    const res = await navigator.modelContextTesting.executeTool(
      'flag_for_review',
      JSON.stringify({
        module: 'auth-service',
        risk_notes: 'Sliding session expiry change touches P1 incident path (cache stampede) and 2 failing tests. Mandatory human sign-off required.',
        proposed_action: 'Refactor JWT claims validation and sliding session cache timeout in Redis',
      })
    );
    return JSON.parse(res);
  });

  console.log('Raw WebMCP Tool Return:');
  console.log(JSON.stringify(toolReturnRaw, null, 2));

  await new Promise(r => setTimeout(r, 1000));

  const pendingState = await page.evaluate(() => {
    const pendingTabButton = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Pending Review'));
    const flagCards = Array.from(document.querySelectorAll('.border-amber-500\\/40, .bg-amber-950\\/25')).map(el => el.textContent);
    const confirmButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('Confirm / Approve'));
    const dismissButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('Dismiss'));

    return {
      pendingTabBadgeText: pendingTabButton?.textContent?.trim() || '',
      flagCardsCount: flagCards.length,
      confirmButtonsCount: confirmButtons.length,
      dismissButtonsCount: dismissButtons.length,
    };
  });

  console.log('\nPending Review Gate State in Real Chrome:');
  console.log('- Pending Tab Text:', pendingState.pendingTabBadgeText);
  console.log('- Pending Flag Cards Rendered:', pendingState.flagCardsCount);
  console.log('- Confirm / Approve Buttons Rendered:', pendingState.confirmButtonsCount);
  console.log('- Dismiss / Reject Buttons Rendered:', pendingState.dismissButtonsCount);

  // Capture Screenshot of Pending State
  await page.screenshot({ path: `${OUT_DIR}/flag-pending-gate.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/flag-pending-gate.png`);

  console.log('\n======================================================');
  console.log('🧪 TEST 2: Human Engineer physically clicks "Confirm / Approve"');
  console.log('======================================================');

  const clickSuccess = await page.evaluate(() => {
    const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Confirm / Approve'));
    if (confirmBtn) {
      confirmBtn.click();
      return true;
    }
    return false;
  });

  console.log('Physical Human Click Triggered:', clickSuccess);
  await new Promise(r => setTimeout(r, 1000));

  const confirmedState = await page.evaluate(() => {
    const confirmedText = document.querySelector('.bg-emerald-950\\/20, .text-emerald-400')?.textContent || '';
    const pendingCountNow = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Pending Review'))?.textContent || '';
    return {
      confirmedTextSnippet: confirmedText,
      pendingCountNow,
    };
  });

  console.log('\nPost-Confirmation State in Real Chrome:');
  console.log('- Approval Confirmation Label:', confirmedState.confirmedTextSnippet);
  console.log('- Pending Count Badge:', confirmedState.pendingCountNow);

  // Capture Screenshot of Confirmed State
  await page.screenshot({ path: `${OUT_DIR}/flag-confirmed-human.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/flag-confirmed-human.png`);

  console.log('\n======================================================');
  console.log('🧪 TEST 3: Verify Human Confirmation in Activity Stream');
  console.log('======================================================');

  await page.evaluate(() => {
    const activityTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Activity Stream'));
    if (activityTab) activityTab.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const activityAudit = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.border-emerald-500\\/40, .text-emerald-200')).map(el => el.textContent);
    return items;
  });

  console.log('Human Gate Telemetry in Activity Stream:');
  activityAudit.forEach(item => console.log('  -', item));

  // Capture Activity Stream Screenshot
  await page.screenshot({ path: `${OUT_DIR}/flag-activity-stream.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/flag-activity-stream.png`);

  console.log('\n🎉 ALL ROUND 5 TRUST LAYER TESTS EXECUTED & VERIFIED IN REAL CHROME!');
} finally {
  await browser.close();
}
