import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { mkdirSync, existsSync } from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = resolve('./verification/live-repo-mode');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

console.log('🚀 Building application and launching Vite preview on port 4175...');
const preview = spawn('npx', ['vite', 'preview', '--port', '4175'], {
  cwd: resolve('.'),
  stdio: 'pipe',
});

await new Promise(r => setTimeout(r, 2500));

try {
  console.log('🌐 Launching real Google Chrome with official hackathon flag (--enable-webmcp-testing)...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webmcp-testing',
      '--user-data-dir=/tmp/tremor-chrome-live-repo-test',
      '--incognito',
      '--window-size=1440,900',
    ],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4175', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  // --- STEP 1: Verify Initial Demo Scenario ---
  console.log('\n======================================================');
  console.log('🔍 STEP 1: Initial Demo Mode Verification');
  console.log('======================================================');
  const initialNodes = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool('get_system_snapshot', JSON.stringify({}));
    const data = JSON.parse(JSON.parse(raw).content[0].text);
    return data.topology_summary.total_nodes;
  });
  console.log(`Demo mode total nodes: ${initialNodes} (expected 18)`);
  if (initialNodes !== 18) throw new Error(`Expected 18 demo nodes, got ${initialNodes}`);

  await page.screenshot({ path: `${OUT_DIR}/01-demo-mode-initial.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/01-demo-mode-initial.png`);

  // --- STEP 2: Toggle to Live GitHub Ingestion Mode ---
  console.log('\n======================================================');
  console.log('🌐 STEP 2: Switch to Live GitHub Ingestion Mode');
  console.log('======================================================');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Live GitHub Ingestion'));
    if (btn) btn.click();
  });

  // Wait for ingestion & render
  await new Promise(r => setTimeout(r, 3500));

  const hasBanner = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('Live Ingestion Mode:'));
  });
  console.log(`Is Live Ingestion banner rendered?: ${hasBanner} (REQUIRED: true)`);
  if (!hasBanner) throw new Error('Live Ingestion banner was NOT rendered!');

  // Check new node count from WebMCP get_system_snapshot
  const liveSnapshot = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool('get_system_snapshot', JSON.stringify({}));
    return JSON.parse(JSON.parse(raw).content[0].text);
  });
  console.log(`Live repo ingested nodes: ${liveSnapshot.topology_summary.total_nodes}`);
  console.log(`Live repo real edges: ${liveSnapshot.topology_summary.total_edges}`);
  console.log(`Top critical nodes in live repo:`, liveSnapshot.top_critical_risk_nodes.map(n => `${n.label} (${n.risk_score})`));

  if (liveSnapshot.topology_summary.total_nodes < 10) {
    throw new Error(`Expected at least 10 live repo nodes, got ${liveSnapshot.topology_summary.total_nodes}`);
  }
  if (liveSnapshot.topology_summary.total_edges < 10) {
    throw new Error(`Expected at least 10 real parsed edges, got ${liveSnapshot.topology_summary.total_edges}`);
  }

  await page.screenshot({ path: `${OUT_DIR}/02-live-repo-ingestion-active.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/02-live-repo-ingestion-active.png`);

  // --- STEP 3: Inspect Most Central File ---
  console.log('\n======================================================');
  console.log('🔬 STEP 3: Inspect Most Central File via Central Button');
  console.log('======================================================');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Central:'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: `${OUT_DIR}/03-central-node-inspector.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/03-central-node-inspector.png`);

  // --- STEP 4: Test WebMCP get_blast_radius on Live File ---
  console.log('\n======================================================');
  console.log('⚡ STEP 4: Test WebMCP get_blast_radius on Live File');
  console.log('======================================================');
  const blastRes = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool('get_blast_radius', JSON.stringify({
      module: 'src/types/dataset.ts',
    }));
    return JSON.parse(JSON.parse(raw).content[0].text);
  });
  console.log(`Target: ${blastRes.target_module.id} (${blastRes.target_module.label})`);
  console.log(`Downstream Dependents Count: ${blastRes.blast_radius_summary.total_impacted_services}`);
  console.log(`Downstream Modules:`, blastRes.blast_radius_summary.downstream_modules.slice(0, 5).map(m => m.label));

  if (blastRes.blast_radius_summary.total_impacted_services === 0) {
    throw new Error('Expected downstream dependents for dataset.ts, got 0!');
  }

  // --- STEP 5: Switch Back to Demo Scenario ---
  console.log('\n======================================================');
  console.log('🏢 STEP 5: Toggle Back to Demo Scenario');
  console.log('======================================================');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Demo Scenario'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const restoredNodes = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool('get_system_snapshot', JSON.stringify({}));
    const data = JSON.parse(JSON.parse(raw).content[0].text);
    return data.topology_summary.total_nodes;
  });
  console.log(`Restored demo mode total nodes: ${restoredNodes} (expected 18)`);
  if (restoredNodes !== 18) throw new Error(`Expected 18 restored demo nodes, got ${restoredNodes}`);

  await page.screenshot({ path: `${OUT_DIR}/04-restored-demo-mode.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/04-restored-demo-mode.png`);

  console.log('\n======================================================');
  console.log('🎉 LIVE REPO INGESTION & IMPORT PARSING FULLY VERIFIED IN CHROME!');
  console.log('======================================================');
  await browser.close();
} finally {
  preview.kill();
}
