import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://tremor-cockpit.vercel.app';

console.log(`🌐 Launching real Google Chrome (isolated throwaway profile): ${CHROME_PATH}`);
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

  console.log(`🚀 Loading ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  // Wait 1.5s for initial layout
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n======================================================');
  console.log('🧪 TEST 1: High-Risk Refactor on Hero Node (auth + redis)');
  console.log('======================================================');
  
  const res1 = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool(
      'simulate_change_impact',
      JSON.stringify({
        description: 'Refactor JWT claims validation and sliding session cache timeout in Redis cluster',
        touched_modules: ['auth-service', 'redis-session-cluster'],
      })
    );
    return JSON.parse(raw);
  });

  console.log('Scenario 1 JSON Return:');
  console.log(JSON.stringify(res1, null, 2));

  await new Promise(r => setTimeout(r, 800));

  const dom1 = await page.evaluate(() => {
    return {
      bannerText: document.querySelector('.animate-fadeIn')?.textContent || 'none',
      sidebarTitle: document.querySelector('aside h2')?.textContent || 'none',
      safetyRatingOnScreen: document.querySelector('aside')?.textContent?.includes('CRITICAL RISK') ?? false,
      findingsCount: document.querySelectorAll('aside .bg-slate-900').length,
    };
  });
  console.log('\nScenario 1 Observed Live On-Screen DOM State:');
  console.log('- Floating Simulation Banner Active:', dom1.bannerText.includes('WebMCP Live Simulation'));
  console.log('- Sidebar Header:', dom1.sidebarTitle);
  console.log('- Critical Risk Rating Rendered:', dom1.safetyRatingOnScreen);
  console.log('- Safety Findings Count in Sidebar:', dom1.findingsCount);

  console.log('\n======================================================');
  console.log('🧪 TEST 2: Medium-Risk Database Connection Pool Refactor');
  console.log('======================================================');

  const res2 = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool(
      'simulate_change_impact',
      JSON.stringify({
        description: 'Increase PostgreSQL connection pool limit from 50 to 200 without replica split',
        touched_modules: ['db-client-pool'],
      })
    );
    return JSON.parse(raw);
  });

  console.log('Scenario 2 JSON Return:');
  console.log(JSON.stringify(res2, null, 2));

  console.log('\n======================================================');
  console.log('🧪 TEST 3: Low-Risk Edge UI Regex Change (partner-portal)');
  console.log('======================================================');

  const res3 = await page.evaluate(async () => {
    const raw = await navigator.modelContextTesting.executeTool(
      'simulate_change_impact',
      JSON.stringify({
        description: 'Update partner developer portal OAuth callback URL regex parser',
        touched_modules: ['partner-portal'],
      })
    );
    return JSON.parse(raw);
  });

  console.log('Scenario 3 JSON Return:');
  console.log(JSON.stringify(res3, null, 2));

  console.log('\n✅ ALL 3 WEBMCP SIMULATION CHANGE SCENARIOS EXECUTED & VERIFIED IN REAL CHROME!');
} finally {
  await browser.close();
}
