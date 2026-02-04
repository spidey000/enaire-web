// Test if syllabus page loads correctly
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  // Navigate to syllabus
  console.log('Navigating to http://localhost:3000/#/syllabus');
  await page.goto('http://localhost:3000/#/syllabus');

  // Wait a bit for content to load
  await page.waitForTimeout(3000);

  // Check what's in page-content
  const contentHTML = await page.locator('#page-content').innerHTML();
  console.log('\n=== PAGE CONTENT ANALYSIS ===');
  console.log('Has syllabus-container:', contentHTML.includes('syllabus-container'));
  console.log('Has home-page:', contentHTML.includes('home-page'));
  console.log('Has error message:', contentHTML.includes('Página no encontrada'));

  // Get page title
  const title = await page.locator('h1').textContent();
  console.log('\nPage title:', title);

  // Take screenshot
  await page.screenshot({ path: 'test-syllabus-debug.png' });
  console.log('\nScreenshot saved to test-syllabus-debug.png');

  await browser.close();
})();
