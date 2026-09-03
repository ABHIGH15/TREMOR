import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { mkdirSync, existsSync } from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = resolve('./verification/tool-lifecycle');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

console.log('🚀 Building application and launching Vite preview on port 4173...');
const preview = spawn('npx', ['vite', 'preview', '--port', '4173'], {
  cwd: resolve('.'),
  stdio: 'pipe',
});

await new Promise(r => setTimeout(r, 2500));

try {
  console.log('🌐 Launching real Google Chrome with WebMCP testing flag...');
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

  const page = await browser.newPage();
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2500));

  // --- STEP 1: Verify Initial 6 Registered Tools ---
  console.log('\n======================================================');
  console.log('🔍 STEP 1: Initial Discovery (All 6 Tools Registered)');
  console.log('======================================================');
  let tools = await page.evaluate(async () => {
    return await navigator.modelContextTesting.listTools();
  });
  console.log(`Initial tools count: ${tools.length} (expected 6)`);
  tools.forEach((t, i) => console.log(`  ${i + 1}. [${t.name}]`));
  if (tools.length !== 6) throw new Error(`Expected 6 tools, got ${tools.length}`);

  // --- STEP 2: Agent Invokes flag_for_review ---
  console.log('\n======================================================');
  console.log('⚡ STEP 2: Agent Invokes flag_for_review (Lockout Triggered)');
  console.log('======================================================');
  await page.evaluate(async () => {
    await navigator.modelContextTesting.executeTool(
      'flag_for_review',
      JSON.stringify({
        module: 'auth-service',
        risk_notes: 'Sliding session TTL refactor risks Redis cache stampede',
        proposed_action: 'Perform Redis cache replication sync before TTL change',
      })
    );
  });
  await new Promise(r => setTimeout(r, 800));

  // --- STEP 3: Verify 5 Remaining Tools (Check names & flag_for_review presence) ---
  console.log('\n======================================================');
  console.log('🔒 STEP 3: Verify Tool Lockout State (6 -> 5 Tools)');
  console.log('======================================================');
  tools = await page.evaluate(async () => {
    return await navigator.modelContextTesting.listTools();
  });
  console.log(`Remaining tools count: ${tools.length} (expected 5)`);
  console.log('Active Tools on document.modelContext:');
  const toolNames = tools.map(t => t.name);
  toolNames.forEach((name, i) => console.log(`  ${i + 1}. [${name}]`));

  const hasFlagForReview = toolNames.includes('flag_for_review');
  const hasSimulate = toolNames.includes('simulate_change_impact');

  console.log(`\nVerification Checks:`);
  console.log(`  - Is 'flag_for_review' present?: ${hasFlagForReview} (REQUIRED: true)`);
  console.log(`  - Is 'simulate_change_impact' unregistered?: ${!hasSimulate} (REQUIRED: true)`);

  if (!hasFlagForReview) throw new Error("CRITICAL BUG: 'flag_for_review' was dropped!");
  if (hasSimulate) throw new Error("CRITICAL BUG: 'simulate_change_impact' was NOT unregistered!");

  // Screenshot 1: Locked 5-tool state with pending review badge
  await page.screenshot({ path: `${OUT_DIR}/lifecycle-5tools-locked.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/lifecycle-5tools-locked.png`);

  // --- STEP 4: Human Clicks Confirm / Approve ---
  console.log('\n======================================================');
  console.log('👤 STEP 4: Human Engineer Clicks Confirm / Approve');
  console.log('======================================================');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Confirm / Approve'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Screenshot 2: Counterfactual Replay banner
  const hasCounterfactual = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('Counterfactual Replay'));
  });
  console.log(`Is Counterfactual Replay banner visible?: ${hasCounterfactual} (REQUIRED: true)`);
  await page.screenshot({ path: `${OUT_DIR}/lifecycle-counterfactual-replay.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/lifecycle-counterfactual-replay.png`);
  if (!hasCounterfactual) throw new Error('Counterfactual Replay banner was NOT visible!');

  // --- STEP 5: Verify Restoration of simulate_change_impact ---
  console.log('\n======================================================');
  console.log('🔓 STEP 5: Verify Tool Restoration (5 -> 6 Tools)');
  console.log('======================================================');
  await new Promise(r => setTimeout(r, 1000));
  tools = await page.evaluate(async () => {
    return await navigator.modelContextTesting.listTools();
  });
  console.log(`Restored tools count: ${tools.length} (expected 6)`);
  const restoredNames = tools.map(t => t.name);
  restoredNames.forEach((name, i) => console.log(`  ${i + 1}. [${name}]`));

  const isRestored = restoredNames.includes('simulate_change_impact');
  console.log(`Is 'simulate_change_impact' restored?: ${isRestored} (REQUIRED: true)`);
  if (!isRestored) throw new Error("'simulate_change_impact' was NOT restored!");

  // Screenshot 3: Restored state
  await page.screenshot({ path: `${OUT_DIR}/lifecycle-6tools-restored.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/lifecycle-6tools-restored.png`);

  console.log('\n======================================================');
  console.log('🎉 BLOCK 2 TOOL LIFECYCLE & REPLAY FULLY VERIFIED!');
  console.log('======================================================');
  await browser.close();
} finally {
  preview.kill();
}
