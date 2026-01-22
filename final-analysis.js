const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Close initial modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    console.log('\n=== Testing Drag & Drop ===');

    // Find draggable elements
    const cards = await page.locator('.event-card').all();
    console.log(`Found ${cards.length} event cards`);

    if (cards.length >= 2) {
      // Get positions of first two cards
      const card1Box = await cards[0].boundingBox();
      const card2Box = await cards[1].boundingBox();

      if (card1Box && card2Box) {
        console.log('Testing drag from card 1 to card 2 position...');

        // Capture before drag
        await page.screenshot({ path: '/tmp/chronle-before-interaction.png' });

        // Perform drag
        await page.mouse.move(card1Box.x + card1Box.width / 2, card1Box.y + card1Box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(100);

        // Capture during drag
        await page.screenshot({ path: '/tmp/chronle-during-drag.png' });

        await page.mouse.move(card2Box.x + card2Box.width / 2, card2Box.y + card2Box.height / 2, { steps: 10 });
        await page.waitForTimeout(100);
        await page.mouse.up();
        await page.waitForTimeout(500);

        // Capture after drag
        await page.screenshot({ path: '/tmp/chronle-after-drag.png' });
        console.log('✅ Drag interaction captured');
      }
    }

    console.log('\n=== Color Contrast Analysis ===');
    const colors = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        bgPrimary: root.getPropertyValue('--bg-primary').trim(),
        bgSecondary: root.getPropertyValue('--bg-secondary').trim(),
        textPrimary: root.getPropertyValue('--text-primary').trim(),
        textSecondary: root.getPropertyValue('--text-secondary').trim(),
        textTertiary: root.getPropertyValue('--text-tertiary').trim(),
        accent: root.getPropertyValue('--accent').trim(),
        correct: root.getPropertyValue('--correct').trim(),
        incorrect: root.getPropertyValue('--incorrect').trim(),
      };
    });

    console.log('Color Palette:');
    Object.entries(colors).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log('\n=== Testing Focus Indicators ===');
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.screenshot({ path: '/tmp/chronle-focus-header.png' });
    console.log('✅ Header button focus captured');

    // Check if focus outline is visible
    const hasFocusOutline = await page.evaluate(() => {
      const activeEl = document.activeElement;
      if (!activeEl) return false;
      const styles = window.getComputedStyle(activeEl);
      return styles.outline !== 'none' && styles.outline !== '' ||
             styles.boxShadow.includes('0 0 0');
    });
    console.log(`Focus outline visible: ${hasFocusOutline ? '✅ Yes' : '⚠️ No'}`);

    console.log('\n=== Testing Submit Button ===');
    const submitButton = page.locator('button:has-text("SUBMIT ORDER")');
    const submitBox = await submitButton.boundingBox();
    if (submitBox) {
      console.log(`Submit button size: ${Math.round(submitBox.width)}x${Math.round(submitBox.height)}px`);
      console.log(`Meets 44px minimum: ${submitBox.height >= 44 ? '✅' : '⚠️'}`);
    }

    // Hover over submit button
    await submitButton.hover();
    await page.waitForTimeout(200);
    await page.screenshot({ path: '/tmp/chronle-submit-hover.png' });
    console.log('✅ Submit button hover state captured');

    console.log('\n=== Responsive Design Check ===');
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/chronle-mobile.png', fullPage: true });
    console.log('✅ Mobile view captured (375x667)');

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/chronle-tablet.png', fullPage: true });
    console.log('✅ Tablet view captured (768x1024)');

    console.log('\n✅ All analysis complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
