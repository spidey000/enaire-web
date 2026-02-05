// Test RSVP START button on Netlify
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('=== Testing RSVP START button ===\n');
  await page.goto('https://enaire-estudio.netlify.app/#/syllabus', { waitUntil: 'networkidle' });

  console.log('Waiting for RSVP banner to load...');
  await page.waitForTimeout(3000);

  // Check initial state
  const initialContent = await page.locator('#page-content').innerHTML();
  console.log('Initial state - Has spritz-reader-ui:', initialContent.includes('spritz-reader-ui'));
  console.log('Initial state - Has spritz-start-screen:', initialContent.includes('spritz-start-screen'));

  // Take screenshot before clicking START
  await page.screenshot({ path: 'rsvp-before-start.png' });
  console.log('\nScreenshot saved: rsvp-before-start.png');

  // Click START button
  console.log('\nClicking START button...');
  try {
    await page.click('.spritz-start-btn', { timeout: 5000 });
    console.log('✅ START button clicked');
  } catch (e) {
    console.error('❌ Could not find or click START button:', e.message);
    await browser.close();
    return;
  }

  // Wait for UI to change
  console.log('Waiting 3 seconds for UI update...');
  await page.waitForTimeout(3000);

  // Take screenshot after clicking START
  await page.screenshot({ path: 'rsvp-after-start.png' });
  console.log('Screenshot saved: rsvp-after-start.png');

  // Check state after clicking
  const afterContent = await page.locator('#page-content').innerHTML();
  console.log('\n=== AFTER CLICKING START ===');
  console.log('Has spritz-reader-ui visible:', afterContent.includes('spritz-reader-ui'));
  console.log('Reader UI display style:', afterContent.includes('display: none') ? 'hidden' : 'visible');
  console.log('Has spritz-word (word display):', afterContent.includes('spritz-word'));
  console.log('Word text content contains:', afterContent.includes('Ready') ? 'Still "Ready"' : 'Different content');

  // Get the spritz-word element text
  try {
    const wordText = await page.locator('#spritzWord').textContent();
    console.log('\nCurrent word in display:', wordText);
  } catch (e) {
    console.log('Could not find #spritzWord element');
  }

  await browser.close();
})();
