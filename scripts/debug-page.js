import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    console.log("Navigating...");
    await page.goto('http://localhost:5173/#/syllabus?id=MOD_001');
    await page.waitForTimeout(3000);
    console.log("Taking debug screenshot...");
    await page.screenshot({ path: 'screenshots/debug-page.png', fullPage: true });
    
    const hasBtn = await page.$('#spritzStartBtn');
    console.log("Start button found:", !!hasBtn);
    
    if (hasBtn) {
      await page.click('#spritzStartBtn');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/debug-after-click.png', fullPage: true });
    }
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
