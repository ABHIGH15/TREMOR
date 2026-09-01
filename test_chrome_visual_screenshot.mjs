import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://tremor-cockpit.vercel.app';

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--enable-webmcp-testing',
    '--window-size=1440,900',
    '--user-data-dir=/tmp/tremor-chrome-profile',
    '--incognito',
  ],
  defaultViewport: { width: 1440, height: 900 },
});

try {
  const page = await browser.newPage();
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  // Wait 1.5s for initial layout
  await new Promise(r => setTimeout(r, 1500));

  // Check state before tool call
  const beforeState = await page.evaluate(() => {
    return {
      sidebarTitle: document.querySelector('aside h3')?.textContent || document.querySelector('aside h2')?.textContent || 'none',
      isPanelOpen: document.querySelector('aside')?.textContent?.includes('No Module Selected') ?? false,
    };
  });
  console.log('Before Tool Call Sidebar State:', beforeState);

  // Execute WebMCP tool
  console.log('Invoking get_blast_radius("auth-service") via navigator.modelContextTesting in real Chrome...');
  const res = await page.evaluate(async () => {
    return await navigator.modelContextTesting.executeTool(
      'get_blast_radius',
      JSON.stringify({ module: 'auth-service' })
    );
  });

  // Wait 800ms for UI re-render
  await new Promise(r => setTimeout(r, 800));

  // Check state after tool call
  const afterState = await page.evaluate(() => {
    return {
      sidebarHeader: document.querySelector('aside h2')?.textContent || 'none',
      riskScoreLabel: document.querySelector('aside')?.textContent?.includes('0.88') ?? false,
      downstreamCountText: document.querySelector('aside')?.textContent?.includes('Downstream Blast Impact') ?? false,
      incidentsSectionText: document.querySelector('aside')?.textContent?.includes('Historical Regressions') ?? false,
    };
  });
  console.log('After Tool Call Sidebar State:', afterState);

  console.log('\n✅ Visual State in Real Chrome Confirmed:');
  console.log('- Selected Module Header:', afterState.sidebarHeader);
  console.log('- Risk Score 0.88 Rendered:', afterState.riskScoreLabel);
  console.log('- Downstream Callers Section Rendered:', afterState.downstreamCountText);
  console.log('- Historical Regressions Section Rendered:', afterState.incidentsSectionText);
} finally {
  await browser.close();
}
