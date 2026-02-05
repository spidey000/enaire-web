// Test Netlify deployment with console logging
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const context = browser.contexts()[0];

  // Enable console logging
  const logs = [];
  page.on('console', msg => {
    logs.push(msg.text());
    console.log('BROWSER:', msg.text());
  });

  // Enable error logging
  page.on('pageerror', error => {
    console.error('BROWSER ERROR:', error.message);
  });

  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('Navigating to https://enaire-estudio.netlify.app/#/syllabus...\n');
  await page.goto('https://enaire-estudio.netlify.app/#/syllabus', { waitUntil: 'networkidle' });

  console.log('Waiting 5 seconds for content...');
  await page.waitForTimeout(5000);

  // Check what's in the page-content div
  const pageContent = await page.locator('#page-content').innerHTML();
  console.log('\n=== PAGE CONTENT ANALYSIS ===');
  console.log('Has syllabus-container:', pageContent.includes('syllabus-container'));
  console.log('Has home-page:', pageContent.includes('home-page'));
  console.log('Has error message:', pageContent.includes('Página no encontrada') || pageContent.includes('Page not found'));
  console.log('Has ENAIRE Study:', pageContent.includes('ENAIRE Study'));

  // Get first 300 chars of content
  console.log('\n=== CONTENT PREVIEW ===');
  const textContent = await page.locator('#page-content').textContent();
  console.log(textContent.substring(0, 300));

  await browser.close();
})();
