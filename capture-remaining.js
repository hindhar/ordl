const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // The "How to Play" modal opens automatically, close it first
    console.log('\n1. Closing initial modal...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Capture game without modal
    await page.screenshot({ path: '/tmp/chronle-game-clean.png', fullPage: true });
    console.log('✅ Clean game view captured');

    // 2. Open and capture Stats modal
    console.log('\n2. Opening Stats modal...');
    const statsButton = page.locator('button[aria-label="View statistics"]');
    await statsButton.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: '/tmp/chronle-stats.png', fullPage: true });
    console.log('✅ Stats modal captured');

    // Close stats
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 3. Re-open "How to Play" for a clean capture
    console.log('\n3. Opening How to Play modal...');
    const helpButton = page.locator('button').filter({ hasText: '?' });
    await helpButton.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: '/tmp/chronle-help.png', fullPage: true });
    console.log('✅ How to Play modal captured');

    // 4. Test focus states
    console.log('\n4. Testing focus states...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.screenshot({ path: '/tmp/chronle-focus-1.png' });
    console.log('✅ Focus state 1 captured');

    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.screenshot({ path: '/tmp/chronle-focus-2.png' });
    console.log('✅ Focus state 2 captured');

    // 5. Measure buttons for accessibility
    console.log('\n5. Measuring button sizes...');
    const allButtons = await page.locator('button').all();
    console.log(`Total buttons: ${allButtons.length}`);

    let undersizedCount = 0;
    for (let i = 0; i < allButtons.length; i++) {
      const box = await allButtons[i].boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        const meetsMinimum = box.width >= 44 && box.height >= 44;
        const width = Math.round(box.width);
        const height = Math.round(box.height);

        if (!meetsMinimum) {
          undersizedCount++;
          const text = await allButtons[i].textContent();
          console.log(`⚠️ Button ${i + 1}: ${width}x${height}px - "${text?.substring(0, 20)}..."`);
        }
      }
    }

    if (undersizedCount === 0) {
      console.log('✅ All buttons meet 44px minimum touch target');
    } else {
      console.log(`⚠️ ${undersizedCount} buttons below 44px minimum`);
    }

    // 6. Check color contrast
    console.log('\n6. Checking color values...');
    const primaryBg = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
    });
    const textPrimary = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    });
    console.log(`Background: ${primaryBg}`);
    console.log(`Text: ${textPrimary}`);

    // 7. Check for reduced motion CSS
    console.log('\n7. Checking reduced-motion support...');
    const hasReducedMotion = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets)
        .flatMap(sheet => {
          try {
            return Array.from(sheet.cssRules || []);
          } catch {
            return [];
          }
        })
        .map(rule => rule.cssText)
        .join('\n');
      return styles.includes('prefers-reduced-motion');
    });
    console.log(hasReducedMotion ? '✅ Reduced motion CSS found' : '❌ No reduced motion CSS');

    console.log('\n✅ All captures complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
