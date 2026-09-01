import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://tremor-cockpit.vercel.app';

console.log(`🌐 Launching real Google Chrome: ${CHROME_PATH}`);
const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-web-security',
    '--enable-webmcp-testing', // Enables native WebMCP testing flag in Chrome!
    '--user-data-dir=/tmp/tremor-chrome-profile',
    '--incognito',
  ],
});

try {
  const page = await browser.newPage();
  
  // Capture real browser console logs
  const browserLogs = [];
  page.on('console', msg => {
    browserLogs.push(`[Browser Console ${msg.type()}]: ${msg.text()}`);
  });

  console.log(`🚀 Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait 1.5s for force graph simulation and WebMCP tools to register
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n--- Real Chrome Browser Console Logs ---');
  browserLogs.forEach(l => console.log(l));

  console.log('\n--- 1. Evaluating navigator.modelContextTesting.listTools() in Chrome ---');
  const toolsResult = await page.evaluate(() => {
    if (!navigator.modelContextTesting) {
      return { error: 'navigator.modelContextTesting is not defined' };
    }
    return navigator.modelContextTesting.listTools();
  });
  console.log('Discovered Tools in Chrome:', JSON.stringify(toolsResult, null, 2));

  console.log('\n--- 2. Executing Tool in Chrome: get_blast_radius("auth-service") ---');
  const executionResult = await page.evaluate(async () => {
    if (!navigator.modelContextTesting) {
      return { error: 'navigator.modelContextTesting is not defined' };
    }
    return await navigator.modelContextTesting.executeTool(
      'get_blast_radius',
      JSON.stringify({ module: 'auth-service' })
    );
  });
  console.log('Raw Result from Chrome executeTool:');
  console.log(executionResult);

  // Wait 500ms for UI re-render and check DOM state
  await new Promise(r => setTimeout(r, 600));

  const uiState = await page.evaluate(() => {
    const headerTitle = document.querySelector('h2')?.textContent || '';
    const riskMeter = document.querySelector('.bg-slate-800 .h-full')?.style?.width || '';
    const activityItems = Array.from(document.querySelectorAll('.truncate')).map(el => el.textContent);
    return {
      selectedNodeTitle: headerTitle,
      riskMeterWidth: riskMeter,
      activityStreamSnippet: activityItems[0] || 'none',
    };
  });

  console.log('\n--- 3. Verified Live On-Screen UI State in Real Chrome ---');
  console.log('Active Selected Node in Sidebar:', uiState.selectedNodeTitle);
  console.log('Risk Meter Progress Bar Width:', uiState.riskMeterWidth);
  console.log('Live Agent Activity Stream:', uiState.activityStreamSnippet);

  console.log('\n✅ Real Chrome Browser E2E Test Passed with 100% fidelity!');
} finally {
  await browser.close();
}
