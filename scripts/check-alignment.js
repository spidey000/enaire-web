import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/#/syllabus?id=MOD_001');
  
  // Wait for syllabus content to load
  await page.waitForSelector('.syllabus-header');
  
  // Wait for RSVP banner to be initialized
  console.log("Waiting for #spritzStartBtn...");
  await page.waitForSelector('#spritzStartBtn');
  console.log("Clicking #spritzStartBtn...");
  await page.click('#spritzStartBtn');
  
  // Wait a bit for playback to definitely start
  console.log("Waiting for playback to start...");
  await page.waitForTimeout(2000);
  
  // Wait for a word to appear (it should have class .spritz-word-orp)
  console.log("Waiting for .spritz-word-orp...");
  await page.waitForSelector('.spritz-word-orp', { timeout: 10000 });
  console.log(".spritz-word-orp found!");
  
  // Click fullscreen
  console.log("Entering fullscreen...");
  await page.click('#spritzFullscreenBtn');
  await page.waitForTimeout(1000);
  
  // Take screenshot of the word in fullscreen
  await page.screenshot({ path: 'screenshots/rsvp-alignment-fullscreen.png' });
  console.log("Screenshot saved to screenshots/rsvp-alignment-fullscreen.png");
  
  const analysis = await page.evaluate(() => {
    const display = document.querySelector('.spritz-display');
    const word = document.querySelector('.spritz-word');
    const orp = document.querySelector('.spritz-word-orp');
    
    if (!display || !word || !orp) return "Elements not found";
    
    const displayRect = display.getBoundingClientRect();
    const orpRect = orp.getBoundingClientRect();
    
    // Relative position of ORP center to display width
    const orpCenter = orpRect.left + orpRect.width / 2;
    const relativePos = (orpCenter - displayRect.left) / displayRect.width;
    
    return {
      wordText: word.textContent,
      displayLeft: displayRect.left,
      displayWidth: displayRect.width,
      orpLeft: orpRect.left,
      orpWidth: orpRect.width,
      orpCenter: orpCenter,
      relativePos: relativePos,
      orpColor: window.getComputedStyle(orp).color,
      displayGuides: {
        before: !!window.getComputedStyle(display, '::before').content,
        after: !!window.getComputedStyle(display, '::after').content
      }
    };
  });
  
  console.log(JSON.stringify(analysis, null, 2));
  await browser.close();
})();
