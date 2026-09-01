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
    '--user-data-dir=/tmp/tremor-chrome-profile',
    '--incognito',
  ],
});

try {
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser PageError]: ${err.message}`));

  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  // Test listTools
  const tools = await page.evaluate(async () => {
    const list = navigator.modelContextTesting?.listTools?.() || [];
    return list;
  });
  console.log('\n--- 1. Tools discovered via navigator.modelContextTesting.listTools() in real Chrome ---');
  console.log(tools);

  // Test executeTool
  console.log('\n--- 2. Executing get_blast_radius via navigator.modelContextTesting.executeTool() ---');
  const execResult = await page.evaluate(async () => {
    try {
      return await navigator.modelContextTesting.executeTool(
        'get_blast_radius',
        JSON.stringify({ module: 'auth-service' })
      );
    } catch (err) {
      return { error: err.message, stack: err.stack };
    }
  });
  console.log('Result:', execResult);

} finally {
  await browser.close();
}
