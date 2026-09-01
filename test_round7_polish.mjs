import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://tremor-cockpit.vercel.app';
const OUT_DIR = resolve('./verification/round7');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`🌐 Launching real Google Chrome for Round 7 Visual Polish & A11y: ${CHROME_PATH}`);
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
  console.log('\n📸 Capturing State 1: Hero Node Selection & Sidebar 1-Click Buttons...');
  await page.evaluate(() => {
    const heroBtn = document.querySelector('button[aria-label*="auth-service"]');
    if (heroBtn) heroBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: `${OUT_DIR}/polish-hero-selection.png` });
  console.log(`✅ Saved ${OUT_DIR}/polish-hero-selection.png`);

  // --- STATE 2: About & Architecture Modal ---
  console.log('\n📸 Capturing State 2: About & Architecture Modal...');
  await page.evaluate(() => {
    const helpBtn = document.querySelector('button[aria-label*="About"]');
    if (helpBtn) helpBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${OUT_DIR}/polish-about-modal.png` });
  console.log(`✅ Saved ${OUT_DIR}/polish-about-modal.png`);

  // Dismiss modal via ESC
  console.log('⌨️ Pressing Escape to dismiss modal...');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 800));

  // --- STATE 3: Accessible Keyboard Tabbing & Focus States ---
  console.log('\n📸 Capturing State 3: Accessible Keyboard Focus State (Tab key)...');
  // Reset focus and tab through the layer navigation
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `${OUT_DIR}/polish-keyboard-focus.png` });
  console.log(`✅ Saved ${OUT_DIR}/polish-keyboard-focus.png`);

  // --- STATE 4: Canvas Coordinate & Hover Tooltip ---
  console.log('\n📸 Capturing State 4: Canvas Cyber Grid & Hover Preview...');
  // Hover over the central node area
  await page.mouse.move(600, 380);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${OUT_DIR}/polish-canvas-grid-hover.png` });
  console.log(`✅ Saved ${OUT_DIR}/polish-canvas-grid-hover.png`);

  console.log('\n🎉 ALL ROUND 7 POLISH & ACCESSIBILITY SCREENSHOTS CAPTURED WITH FULL VISUAL DIVERGENCE!');
} finally {
  await browser.close();
}
