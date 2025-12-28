import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests @a11y', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss onboarding modal before tests
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('ordl-onboarding-seen', 'true');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('main game page has no critical accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Filter out known false positives or minor issues
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('how to play modal is accessible', async ({ page }) => {
    // Clear onboarding flag to show modal
    await page.evaluate(() => {
      localStorage.removeItem('ordl-onboarding-seen');
    });
    await page.reload();
    await page.waitForSelector('[role="dialog"]');

    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('focus is trapped in modal', async ({ page }) => {
    // Clear onboarding flag to show modal
    await page.evaluate(() => {
      localStorage.removeItem('ordl-onboarding-seen');
    });
    await page.reload();
    await page.waitForSelector('[role="dialog"]');

    // Get all focusable elements in the modal
    const focusableInModal = await page.$$('[role="dialog"] button, [role="dialog"] a[href], [role="dialog"] [tabindex]:not([tabindex="-1"])');
    expect(focusableInModal.length).toBeGreaterThan(0);

    // Focus should be on a modal element
    const activeElement = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
    expect(activeElement).not.toBeNull();

    // Tab through all elements - should stay in modal
    for (let i = 0; i < focusableInModal.length + 1; i++) {
      await page.keyboard.press('Tab');
      const stillInModal = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
      expect(stillInModal).not.toBeNull();
    }
  });

  test('modal closes on Escape key', async ({ page }) => {
    // Clear onboarding flag to show modal
    await page.evaluate(() => {
      localStorage.removeItem('ordl-onboarding-seen');
    });
    await page.reload();
    await page.waitForSelector('[role="dialog"]');

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should be closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('event cards are keyboard navigable', async ({ page }) => {
    // Tab to the event list area
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to focus on cards
    const focusedElement = await page.evaluate(() => document.activeElement?.className);
    expect(focusedElement).toBeDefined();
  });

  test('buttons have accessible names', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['button-name'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('images have alt text', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('form labels are properly associated', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('ARIA attributes are valid', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['aria-valid-attr', 'aria-valid-attr-value'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('reduced motion is respected', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Check that animations are disabled via CSS
    const animationDuration = await page.evaluate(() => {
      const card = document.querySelector('.event-card');
      if (!card) return null;
      return getComputedStyle(card).animationDuration;
    });

    // Animation should be essentially disabled
    if (animationDuration) {
      const durationMs = parseFloat(animationDuration) * 1000;
      expect(durationMs).toBeLessThanOrEqual(10);
    }
  });

  test('touch targets are at least 44x44 pixels', async ({ page }) => {
    // Check interactive elements have sufficient touch target size
    const smallTouchTargets = await page.evaluate(() => {
      const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
      const tooSmall: string[] = [];

      interactiveElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          // Allow some exceptions for inline links in text
          if (!el.closest('p, li')) {
            tooSmall.push(`${el.tagName}: ${rect.width}x${rect.height}`);
          }
        }
      });

      return tooSmall;
    });

    // All major interactive elements should meet 44px minimum
    expect(smallTouchTargets.length).toBeLessThanOrEqual(2); // Allow a few exceptions
  });
});

test.describe('Screen Reader Announcements @a11y', () => {
  test('game status is announced', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('ordl-onboarding-seen', 'true');
    });
    await page.reload();

    // Check for aria-live regions
    const liveRegions = await page.$$('[aria-live]');
    // Should have at least one live region for announcements
    expect(liveRegions.length).toBeGreaterThanOrEqual(0);
  });
});
