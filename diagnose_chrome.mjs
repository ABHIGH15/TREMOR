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
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  const diag = await page.evaluate(() => {
    return {
      docModelContext: typeof document.modelContext,
      navModelContext: typeof navigator.modelContext,
      navTesting: typeof navigator.modelContextTesting,
      docKeys: document.modelContext ? Object.keys(document.modelContext) : [],
    };
  });

  console.log('Chrome Native Diagnosis:', diag);
} finally {
  await browser.close();
}
