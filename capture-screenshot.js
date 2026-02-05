// Capture screenshot of Netlify deployment
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport size
  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('Navigating to https://enaire-estudio.netlify.app/#/syllabus...');

  // Navigate to the syllabus page
  await page.goto('https://enaire-estudio.netlify.app/#/syllabus', { waitUntil: 'networkidle' });

  // Wait for content to load
  console.log('Waiting for page to load...');
  await page.waitForTimeout(5000);

  // Take full page screenshot
  await page.screenshot({
    path: 'netlify-syllabus-screenshot.png',
    fullPage: true
  });

  // Get page title
  try {
    const title = await page.locator('h1').first().textContent({ timeout: 2000 });
    console.log('Page title:', title);
  } catch (e) {
    console.log('No h1 found, checking body content...');
  }

  // Get body text to check for errors
  const bodyText = await page.locator('body').textContent();
  const preview = bodyText.substring(0, 200);

  console.log('\n=== PAGE PREVIEW ===');
  console.log(preview);
  console.log('...\n');

  // Check for errors
  if (bodyText.includes('404') || bodyText.includes('Page not found') || bodyText.includes('Página no encontrada') || bodyText.includes('page not found')) {
    console.log('❌ ERROR: 404/Not Found page detected!');
  } else if (bodyText.includes('ENAIRE Study') || bodyText.includes('Temario') || bodyText.includes('Módulos')) {
    console.log('✅ SUCCESS: ENAIRE Study content detected!');
  } else {
    console.log('⚠️  WARNING: Unexpected page content');
  }

  await browser.close();
  console.log('\nScreenshot saved to: netlify-syllabus-screenshot.png');
})();
