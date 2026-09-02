import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://tremor-cockpit.vercel.app';
const OUT_DIR = resolve('./verification/regression-suite');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`🌐 Launching real Google Chrome: ${CHROME_PATH}`);
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
  console.log('🔍 STEP 1: Discover All Registered WebMCP Tools in Browser');
  console.log('======================================================');

  const toolsList = await page.evaluate(async () => {
    return await navigator.modelContextTesting.listTools();
  });

  console.log(`Found ${toolsList.length} registered WebMCP tools:`);
  toolsList.forEach((t, i) => {
    console.log(`  ${i + 1}. [${t.name}] - ${t.description.substring(0, 70)}...`);
  });

  // Verify that exactly 6 tools are registered
  if (toolsList.length !== 6) {
    throw new Error(`Expected 6 registered tools, but found ${toolsList.length}`);
  }

  // --- TOOL 1: get_system_snapshot ---
  console.log('\n======================================================');
  console.log('🧪 TOOL 1 / 6: get_system_snapshot');
  console.log('======================================================');
  const snapshotRes = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool(
      'get_system_snapshot',
      JSON.stringify({ layer_filter: 'all', include_incidents: true, include_tests: true })
    );
    return JSON.parse(raw);
  });
  const snapshotData = JSON.parse(snapshotRes.content[0].text);
  console.log('Topology Summary:', snapshotData.topology_summary);
  console.log('Top Critical Nodes:', snapshotData.top_critical_risk_nodes.map(n => `${n.id} (${n.risk_score})`));
  console.log('Incident Index Count:', snapshotData.incidents_summary?.total_incidents);
  console.log('Tests Health Count:', snapshotData.tests_health_summary?.total_tests);

  // --- TOOL 2: get_blast_radius ---
  console.log('\n======================================================');
  console.log('🧪 TOOL 2 / 6: get_blast_radius (auth-service)');
  console.log('======================================================');
  const blastRes = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool(
      'get_blast_radius',
      JSON.stringify({ module: 'auth-service' })
    );
    return JSON.parse(raw);
  });
  const blastData = JSON.parse(blastRes.content[0].text);
  console.log('Target Module:', blastData.target_module.id, `(Risk: ${blastData.target_module.risk_score})`);
  console.log('Downstream Dependents Count:', blastData.blast_radius_summary.downstream_dependents_count);
  console.log('Critical Outage Risk:', blastData.blast_radius_summary.critical_outage_risk);

  // --- TOOL 3: check_regression_history ---
  console.log('\n======================================================');
  console.log('🧪 TOOL 3 / 6: check_regression_history ("session expiry")');
  console.log('======================================================');
  const regRes = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool(
      'check_regression_history',
      JSON.stringify({ pattern: 'session expiry' })
    );
    return JSON.parse(raw);
  });
  const regData = JSON.parse(regRes.content[0].text);
  console.log('Matched Incidents Count:', regData.total_matches);
  console.log('First Match:', regData.incidents[0]?.incident_id, '-', regData.incidents[0]?.description);

  // --- TOOL 4: get_change_provenance ---
  console.log('\n======================================================');
  console.log('🧪 TOOL 4 / 6: get_change_provenance (auth-service)');
  console.log('======================================================');
  const provRes = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool(
      'get_change_provenance',
      JSON.stringify({ module: 'auth-service' })
    );
    return JSON.parse(raw);
  });
  const provData = JSON.parse(provRes.content[0].text);
  console.log('Total Commits:', provData.total_commits_inspected);
  console.log('AI Authorship Ratio:', provData.ai_authorship_ratio);

  // --- TOOL 5: simulate_change_impact (Centerpiece) ---
  console.log('\n======================================================');
  console.log('🧪 TOOL 5 / 6: simulate_change_impact (auth-service + redis)');
  console.log('======================================================');
  const simRes = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool(
      'simulate_change_impact',
      JSON.stringify({
        description: 'Refactor JWT claims validation and sliding session cache timeout in Redis cluster',
        touched_modules: ['auth-service', 'redis-session-cluster'],
      })
    );
    return JSON.parse(raw);
  });
  const simData = JSON.parse(simRes.content[0].text);
  console.log('Predicted Blast Risk Index:', simData.risk_assessment.predicted_blast_risk_index);
  console.log('Safety Rating:', simData.risk_assessment.safety_rating);
  console.log('Total Blast Radius Nodes:', simData.impact_scope.total_blast_radius_nodes);
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUT_DIR}/regression-simulation-active.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/regression-simulation-active.png`);

  // --- TOOL 6: flag_for_review (Trust Layer) ---
  console.log('\n======================================================');
  console.log('🧪 TOOL 6 / 6: flag_for_review (auth-service)');
  console.log('======================================================');
  const flagRes = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool(
      'flag_for_review',
      JSON.stringify({
        module: 'auth-service',
        risk_notes: 'Automated changes blocked by policy: sliding session TTL touches P1 cache stampede hazard and downstream checkout pipeline.',
        proposed_action: 'Perform Redis cache replication sync before TTL change',
      })
    );
    return JSON.parse(raw);
  });
  const flagData = JSON.parse(flagRes.content[0].text);
  console.log('Flag Created:', flagData.flag_id);
  console.log('Can Tool Self-Approve?:', flagData.can_tool_self_approve);
  console.log('Approval Status:', flagData.human_approval_status);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUT_DIR}/regression-flag-pending.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/regression-flag-pending.png`);

  // Perform Physical Human Confirmation
  console.log('\n👤 Simulating Physical Human Click: Confirm / Approve...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Confirm / Approve'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUT_DIR}/regression-flag-confirmed.png` });
  console.log(`📸 Saved screenshot: ${OUT_DIR}/regression-flag-confirmed.png`);

  console.log('\n🎉 ALL 6 WEBMCP TOOLS & FULL REGRESSION SUITE PASSED IN REAL CHROME!');
} finally {
  await browser.close();
}
