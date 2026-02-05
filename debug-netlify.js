// Debug Netlify deployment - take screenshot and analyze
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('=== Navigating to https://enaire-estudio.netlify.app/#/syllabus ===\n');
  await page.goto('https://enaire-estudio.netlify.app/#/syllabus', { waitUntil: 'networkidle' });

  console.log('Waiting 5 seconds for content...');
  await page.waitForTimeout(5000);

  // Take screenshot
  await page.screenshot({
    path: 'debug-syllabus.png',
    fullPage: true
  });

  // Check page-content
  const pageContent = await page.locator('#page-content').innerHTML();

  console.log('\n=== PAGE ANALYSIS ===');
  console.log('Has content:', pageContent.length > 0);
  console.log('Has syllabus-container:', pageContent.includes('syllabus-container'));
  console.log('Has sidebar:', pageContent.includes('sidebar-modules'));
  console.log('Has spritz-banner:', pageContent.includes('spritz-banner'));
  console.log('Has error:', pageContent.includes('Página no encontrada') || pageContent.includes('not found'));

  // Check if modules are loading
  console.log('\n=== CHECKING MODULES ===');
  const hasModules = pageContent.includes('Entorno Profesional') || pageContent.includes('Aerodinámica');
  console.log('Has modules:', hasModules);

  // Check RSVP banner
  console.log('\n=== CHECKING RSVP BANNER ===');
  const hasRSVP = pageContent.includes('spritz-banner') || pageContent.includes('Speed Reading');
  console.log('RSVP banner present:', hasRSVP);

  if (hasRSVP) {
    const hasStartButton = pageContent.includes('spritz-start-btn') || pageContent.includes('START');
    console.log('START button present:', hasStartButton);
  }

  // Get body text preview
  const bodyText = await page.locator('body').textContent();
  console.log('\n=== PAGE PREVIEW (first 400 chars) ===');
  console.log(bodyText.substring(0, 400));

  await browser.close();
  console.log('\n✅ Screenshot saved: debug-syllabus.png');
})();
