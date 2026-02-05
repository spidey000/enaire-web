import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    console.log("Navigating to syllabus page...");
    await page.goto('http://localhost:4173/#/syllabus?id=MOD_001');
    
    // Wait for syllabus content to load
    await page.waitForSelector('.syllabus-header', { timeout: 10000 });
    
    // Wait for RSVP banner to be initialized
    console.log("Waiting for #spritzStartBtn...");
    await page.waitForSelector('#spritzStartBtn', { timeout: 10000 });
    console.log("Clicking #spritzStartBtn...");
    await page.click('#spritzStartBtn');
    
    // Wait for playback to start and word to appear
    console.log("Waiting for .spritz-word-orp...");
    await page.waitForSelector('.spritz-word-orp', { timeout: 15000 });
    console.log(".spritz-word-orp found!");
    
    // Take screenshot of the word
    await page.screenshot({ path: 'screenshots/rsvp-alignment-fixed.png' });
    console.log("Screenshot saved to screenshots/rsvp-alignment-fixed.png");
    
    const analysis = await page.evaluate(() => {
      const display = document.querySelector('.spritz-display');
      const word = document.querySelector('.spritz-word');
      const orp = document.querySelector('.spritz-word-orp');
      
      if (!display || !word || !orp) return "Elements not found";
      
      const displayRect = display.getBoundingClientRect();
      const orpRect = orp.getBoundingClientRect();
      
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
        fontFamily: window.getComputedStyle(word).fontFamily
      };
    });
    
    console.log(JSON.stringify(analysis, null, 2));
  } catch (err) {
    console.error("Error during check:", err);
    await page.screenshot({ path: 'screenshots/error-check-alignment.png' });
  } finally {
    await browser.close();
  }
})();
