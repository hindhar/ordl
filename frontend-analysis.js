const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 1. Main game page
    console.log('\n=== Capturing Main Game Page ===');
    await page.screenshot({ path: '/tmp/chronle-main.png', fullPage: true });
    console.log('✅ Main page captured');

    // 2. Find and click Help button (?)
    console.log('\n=== Capturing How to Play Modal ===');
    const helpButton = page.locator('button').filter({ hasText: '?' });
    if (await helpButton.count() > 0) {
      await helpButton.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: '/tmp/chronle-help.png', fullPage: true });
      console.log('✅ Help modal captured');

      // Close modal - try ESC key or close button
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      console.log('⚠️ Help button not found');
    }

    // 3. Find and click Stats button
    console.log('\n=== Capturing Stats Modal ===');
    const statsButton = page.locator('button[aria-label*="stat"], button[aria-label*="Stat"]');
    if (await statsButton.count() > 0) {
      await statsButton.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: '/tmp/chronle-stats.png', fullPage: true });
      console.log('✅ Stats modal captured');

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      console.log('⚠️ Stats button not found');
    }

    // 4. Accessibility analysis
    console.log('\n=== Accessibility Analysis ===');

    // Check all buttons
    const allButtons = await page.locator('button').all();
    console.log(`Total buttons found: ${allButtons.length}`);

    let buttonSizes = [];
    for (let i = 0; i < allButtons.length; i++) {
      const box = await allButtons[i].boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        const meetsMinimum = box.width >= 44 && box.height >= 44;
        const width = Math.round(box.width);
        const height = Math.round(box.height);
        buttonSizes.push({ index: i, width, height, meetsMinimum });
      }
    }

    console.log('\nButton sizes (44px minimum):');
    buttonSizes.forEach(b => {
      console.log(`  Button ${b.index + 1}: ${b.width}x${b.height}px ${b.meetsMinimum ? '✅' : '⚠️ TOO SMALL'}`);
    });

    // 5. Capture card state
    console.log('\n=== Card Analysis ===');
    const cards = await page.locator('[data-card-id], [draggable="true"], .event-card').all();
    console.log(`Found ${cards.length} cards`);

    if (cards.length > 0) {
      await page.screenshot({ path: '/tmp/chronle-cards.png' });
      console.log('✅ Card state captured');
    }

    // 6. Test keyboard navigation
    console.log('\n=== Testing Keyboard Navigation ===');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.screenshot({ path: '/tmp/chronle-focus.png' });
    console.log('✅ Focus state captured');

    console.log('\n✅ Frontend analysis complete!');
    console.log('\nScreenshots saved to /tmp/:');
    console.log('  - chronle-main.png');
    console.log('  - chronle-help.png');
    console.log('  - chronle-stats.png');
    console.log('  - chronle-cards.png');
    console.log('  - chronle-focus.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
