import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://tremor-cockpit.vercel.app';
const OUT_DIR = resolve('./verification/round7');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`🌐 Launching real Google Chrome for Round 7 Visual Polish verification: ${CHROME_PATH}`);
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

  // --- STATE 1: Hero Node Selection & Sidebar Action Buttons ---
  console.log('📸 Capturing State 1: Hero Node Selection with 1-Click Action Buttons...');
  await page.evaluate(() => {
    const heroBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('auth-service'));
    if (heroBtn) heroBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUT_DIR}/polish-hero-selection.png` });
  console.log(`✅ Saved ${OUT_DIR}/polish-hero-selection.png`);

  // --- STATE 2: About & Architecture Modal ---
  console.log('📸 Capturing State 2: About & Architecture Modal (Key: ?)...');
  await page.keyboard.press('/');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${OUT_DIR}/polish-about-modal.png` });
  console.log(`✅ Saved ${OUT_DIR}/polish-about-modal.png`);

  // Close modal via ESC
  console.log('⌨️ Pressing ESC to dismiss modal...');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 600));

  // --- STATE 3: Hover Tooltip Preview Card on Canvas ---
  console.log('📸 Capturing State 3: Canvas Hover Tooltip Preview Card...');
  // Move mouse to center-left of canvas
  await page.mouse.move(500, 450);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${OUT_DIR}/polish-canvas-grid-hover.png` });
  console.log(`✅ Saved ${OUT_DIR}/polish-canvas-grid-hover.png`);

  console.log('\n🎉 ALL ROUND 7 POLISH SCREENSHOTS CAPTURED SUCCESSFULLY!');
} finally {
  await browser.close();
}
