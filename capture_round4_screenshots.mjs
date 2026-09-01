import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://tremor-cockpit.vercel.app';
const OUT_DIR = resolve('./verification/round4');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`🌐 Launching Chrome (throwaway profile): ${CHROME_PATH}`);
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
  console.log(`🚀 Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // --- SCENARIO 1: CRITICAL RISK ---
  console.log('📸 Capturing Scenario 1: CRITICAL RISK (auth-service + redis)...');
  await page.evaluate(async () => {
    await navigator.modelContextTesting.executeTool(
      'simulate_change_impact',
      JSON.stringify({
        description: 'Refactor JWT claims validation and sliding session cache timeout in Redis cluster',
        touched_modules: ['auth-service', 'redis-session-cluster'],
      })
    );
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUT_DIR}/scenario1-critical.png` });
  console.log(`✅ Saved ${OUT_DIR}/scenario1-critical.png`);

  // --- SCENARIO 2: ELEVATED RISK ---
  console.log('📸 Capturing Scenario 2: ELEVATED RISK (order-processor async webhooks)...');
  await page.evaluate(async () => {
    await navigator.modelContextTesting.executeTool(
      'simulate_change_impact',
      JSON.stringify({
        description: 'Refactor order state transition engine to asynchronous webhook dispatch',
        touched_modules: ['order-processor'],
      })
    );
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUT_DIR}/scenario2-elevated.png` });
  console.log(`✅ Saved ${OUT_DIR}/scenario2-elevated.png`);

  // --- SCENARIO 3: DB CONNECTION POOL ---
  console.log('📸 Capturing Scenario 3: ELEVATED/MODERATE DB POOL (db-client-pool)...');
  await page.evaluate(async () => {
    await navigator.modelContextTesting.executeTool(
      'simulate_change_impact',
      JSON.stringify({
        description: 'Increase PostgreSQL connection pool limit from 50 to 200 without replica split',
        touched_modules: ['db-client-pool'],
      })
    );
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUT_DIR}/scenario3-db-pool.png` });
  console.log(`✅ Saved ${OUT_DIR}/scenario3-db-pool.png`);

  // --- SCENARIO 4: LOW RISK ---
  console.log('📸 Capturing Scenario 4: LOW RISK (partner-portal regex)...');
  await page.evaluate(async () => {
    await navigator.modelContextTesting.executeTool(
      'simulate_change_impact',
      JSON.stringify({
        description: 'Update partner developer portal OAuth callback URL regex parser',
        touched_modules: ['partner-portal'],
      })
    );
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUT_DIR}/scenario4-low.png` });
  console.log(`✅ Saved ${OUT_DIR}/scenario4-low.png`);

  console.log('\n🎉 ALL 4 ROUND 4 SCREENSHOTS CAPTURED SUCCESSFULLY!');
} finally {
  await browser.close();
}
