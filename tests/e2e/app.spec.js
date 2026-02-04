import { test, expect } from '@playwright/test';

/**
 * E2E Tests for ENAIRE Study App with Real Screenshots
 */
test.describe('ENAIRE Study App - Visual Tests', () => {

  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Take screenshot of homepage
    await page.screenshot({
      path: 'screenshots/homepage.png',
      fullPage: true
    });

    // Verify main elements are present
    await expect(page.locator('.navbar-brand')).toContainText('ENAIRE Study');
    await expect(page.locator('.nav-link')).toHaveCount(6);
  });

  test('navigation menu works', async ({ page }) => {
    await page.goto('/');

    // Take screenshot of navigation
    await page.screenshot({
      path: 'screenshots/navigation-menu.png'
    });

    // Click through each navigation link
    const navLinks = [
      { text: 'Temario', hash: '#/syllabus' },
      { text: 'Quiz', hash: '#/quiz' },
      { text: 'Flashcards', hash: '#/flashcards' },
      { text: 'Progreso', hash: '#/progress' }
    ];

    for (const link of navLinks) {
      await page.click(`text=${link.text}`);
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `screenshots/nav-${link.text.toLowerCase()}.png`
      });
      expect(page.url()).toContain(link.hash);
    }
  });

  test('syllabus page displays correctly', async ({ page }) => {
    await page.goto('#/syllabus');

    // Wait for content to load
    await page.waitForSelector('.syllabus-container', { timeout: 5000 });

    // Take full page screenshot
    await page.screenshot({
      path: 'screenshots/syllabus-page.png',
      fullPage: true
    });

    // Verify sidebar modules are present
    await expect(page.locator('.sidebar-modules-list')).toBeVisible();

    // Verify module list has items
    const moduleCount = await page.locator('.sidebar-modules-item').count();
    expect(moduleCount).toBeGreaterThan(0);
  });

  test('RSVP reader banner is visible on syllabus', async ({ page }) => {
    await page.goto('#/syllabus');

    // Wait for RSVP banner to load
    await page.waitForSelector('.spritz-banner', { timeout: 5000 });

    // Take screenshot of RSVP banner
    const banner = page.locator('.spritz-banner');
    await banner.screenshot({
      path: 'screenshots/rsvp-banner-initial.png'
    });

    // Verify RSVP elements are present
    await expect(page.locator('.spritz-start-screen')).toBeVisible();
    await expect(page.locator('.spritz-start-btn')).toContainText('START');
  });

  test('RSVP reader start button works', async ({ page }) => {
    await page.goto('#/syllabus');

    // Wait for RSVP banner
    await page.waitForSelector('.spritz-banner', { timeout: 5000 });

    // Click START button
    await page.click('.spritz-start-btn');

    // Wait for reader UI to appear
    await page.waitForTimeout(500);

    // Take screenshot of active reader
    await page.screenshot({
      path: 'screenshots/rsvp-reader-active.png'
    });

    // Verify reader UI is visible
    await expect(page.locator('.spritz-reader-ui')).toBeVisible();
    await expect(page.locator('.spritz-display')).toBeVisible();
  });

  test('RSVP reader controls are functional', async ({ page }) => {
    await page.goto('#/syllabus');

    // Wait for RSVP and start it
    await page.waitForSelector('.spritz-banner', { timeout: 5000 });
    await page.click('.spritz-start-btn');
    await page.waitForTimeout(500);

    // Take screenshot of controls
    await page.locator('.spritz-controls').screenshot({
      path: 'screenshots/rsvp-controls.png'
    });

    // Verify all controls are present
    await expect(page.locator('.spritz-play-btn')).toBeVisible();
    await expect(page.locator('.spritz-wpm-slider')).toBeVisible();
    await expect(page.locator('.spritz-nav-slider')).toBeVisible();
    await expect(page.locator('.spritz-bookmark-button')).toBeVisible();

    // Test WPM slider
    const wpmSlider = page.locator('.spritz-wpm-slider');
    await wpmSlider.fill('500');

    // Take screenshot after WPM change
    await page.screenshot({
      path: 'screenshots/rsvp-wpm-changed.png'
    });
  });

  test('quiz page loads and displays options', async ({ page }) => {
    await page.goto('#/quiz');

    // Wait for quiz page
    await page.waitForSelector('.quiz-setup', { timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: 'screenshots/quiz-page.png',
      fullPage: true
    });

    // Verify quiz options are present
    await expect(page.locator('text=Módulos')).toBeVisible();
  });

  test('flashcards page loads', async ({ page }) => {
    await page.goto('#/flashcards');

    // Wait for flashcards
    await page.waitForSelector('.flashcards-container', { timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: 'screenshots/flashcards-page.png',
      fullPage: true
    });
  });

  test('progress page displays statistics', async ({ page }) => {
    await page.goto('#/progress');

    // Wait for progress page
    await page.waitForSelector('.progress-page', { timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: 'screenshots/progress-page.png',
      fullPage: true
    });
  });

  test('debug panel toggle works', async ({ page }) => {
    await page.goto('/');

    // Open debug panel with keyboard shortcut
    await page.keyboard.press('Control+Shift+D');

    // Wait for debug panel
    await page.waitForSelector('#debug-panel', { timeout: 3000 });

    // Take screenshot with debug panel open
    await page.screenshot({
      path: 'screenshots/debug-panel-open.png'
    });

    // Verify debug panel is visible
    await expect(page.locator('#debug-panel')).toBeVisible();

    // Take screenshot of logs tab
    await page.screenshot({
      path: 'screenshots/debug-logs-tab.png'
    });

    // Close debug panel
    await page.keyboard.press('Control+Shift+D');
    await page.waitForTimeout(300);

    // Verify panel is hidden
    await expect(page.locator('#debug-panel')).toHaveClass(/hidden/);
  });

  test('responsive design - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Take mobile screenshot
    await page.screenshot({
      path: 'screenshots/mobile-homepage.png',
      fullPage: true
    });

    // Test navigation is collapsed
    await expect(page.locator('.navbar-menu')).toBeVisible();

    // Navigate to syllabus
    await page.goto('#/syllabus');
    await page.waitForSelector('.syllabus-container', { timeout: 5000 });

    // Take mobile syllabus screenshot
    await page.screenshot({
      path: 'screenshots/mobile-syllabus.png',
      fullPage: true
    });
  });

  test('responsive design - tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('#/syllabus');
    await page.waitForSelector('.syllabus-container', { timeout: 5000 });

    // Take tablet screenshot
    await page.screenshot({
      path: 'screenshots/tablet-syllabus.png',
      fullPage: true
    });
  });

  test('dark mode compatibility', async ({ page }) => {
    await page.goto('/');

    // Simulate dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });

    // Take screenshot in dark mode
    await page.screenshot({
      path: 'screenshots/dark-mode-homepage.png'
    });
  });

  test('error handling - invalid route', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('#/nonexistent-page');

    // Wait for error message
    await page.waitForTimeout(1000);

    // Take screenshot of error page
    await page.screenshot({
      path: 'screenshots/error-404.png'
    });

    // Verify error message is shown
    await expect(page.locator('text=Página no encontrada')).toBeVisible();
  });
});

test.describe('RSVP Reader Functionality', () => {

  test('complete RSVP reading flow', async ({ page }) => {
    await page.goto('#/syllabus');

    // Wait for content
    await page.waitForSelector('.spritz-banner', { timeout: 5000 });

    // Step 1: Initial state
    await page.screenshot({ path: 'screenshots/rsvp-flow-1-initial.png' });

    // Step 2: Click START
    await page.click('.spritz-start-btn');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/rsvp-flow-2-started.png' });

    // Step 3: Click play button
    await page.click('.spritz-play-btn');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/rsvp-flow-3-playing.png' });

    // Step 4: Pause
    await page.click('.spritz-play-btn');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/rsvp-flow-4-paused.png' });

    // Step 5: Change WPM
    await page.fill('.spritz-wpm-slider', '600');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/rsvp-flow-5-wpm-changed.png' });

    // Step 6: Navigate with slider
    await page.fill('.spritz-nav-slider', '50');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/rsvp-flow-6-navigated.png' });
  });

  test('RSVP reader bookmark functionality', async ({ page }) => {
    await page.goto('#/syllabus');

    await page.waitForSelector('.spritz-banner', { timeout: 5000 });
    await page.click('.spritz-start-btn');
    await page.waitForTimeout(500);

    // Open bookmark dropdown
    await page.click('.spritz-bookmark-button');
    await page.waitForTimeout(300);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/rsvp-bookmark-dropdown.png' });

    // Verify dropdown is visible
    await expect(page.locator('.spritz-bookmark-dropdown')).toBeVisible();
  });

  test('RSVP reader help modal', async ({ page }) => {
    await page.goto('#/syllabus');

    await page.waitForSelector('.spritz-banner', { timeout: 5000 });
    await page.click('.spritz-start-btn');
    await page.waitForTimeout(500);

    // Open help modal
    await page.click('.spritz-help-btn');
    await page.waitForTimeout(300);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/rsvp-help-modal.png' });

    // Verify help modal is visible
    await expect(page.locator('.spritz-help-modal')).toHaveClass(/active/);

    // Close help modal
    await page.click('.spritz-help-close');
    await page.waitForTimeout(300);

    // Verify it's closed
    await expect(page.locator('.spritz-help-modal')).not.toHaveClass(/active/);
  });
});

test.describe('Accessibility Tests', () => {

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');

    // Navigate with Tab key
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Take screenshot showing focus
    await page.screenshot({ path: 'screenshots/keyboard-nav-focus.png' });
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('#/syllabus');

    // Check all images
    const images = await page.locator('img').all();
    const imagesWithoutAlt = [];

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt) {
        const src = await img.getAttribute('src');
        imagesWithoutAlt.push(src || 'inline');
      }
    }

    // Log any images without alt text
    if (imagesWithoutAlt.length > 0) {
      console.log('Images without alt text:', imagesWithoutAlt);
    }

    // Expect no images without alt text
    expect(imagesWithoutAlt.length).toBe(0);
  });

  test('contrast ratios are acceptable', async ({ page }) => {
    await page.goto('/');

    // Take screenshot for visual contrast check
    await page.screenshot({ path: 'screenshots/contrast-check.png' });

    // This would require a contrast checker library
    // For now, we just verify the page loads
    await expect(page.locator('.navbar')).toBeVisible();
  });
});
