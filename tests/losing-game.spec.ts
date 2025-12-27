import { test, expect, Page } from '@playwright/test';

// Test configuration - focused on LOSING scenarios only
const BASE_URL = 'http://localhost:3007';
const waitForAnimation = (ms: number) => new Promise(r => setTimeout(r, ms));

async function initPage(page: Page, puzzleNum: number) {
  await page.goto(BASE_URL);
  await page.evaluate((num) => {
    localStorage.setItem('ordl-onboarding-seen', 'true');
    localStorage.removeItem(`ordl-archive-${num}`);
  }, puzzleNum);
  await page.goto(`${BASE_URL}/?puzzle=${puzzleNum}`);
  await waitForAnimation(2000);
}

// Monitor which cards get the card-flip class during reveal
async function monitorFlips(page: Page): Promise<boolean[]> {
  const flipped = [false, false, false, false, false, false];

  // Check each card every 50ms for 3 seconds
  for (let i = 0; i < 60; i++) {
    const cards = await page.locator('.event-card').all();
    for (let j = 0; j < cards.length; j++) {
      const classes = await cards[j].getAttribute('class') || '';
      if (classes.includes('card-flip')) {
        flipped[j] = true;
      }
    }
    await waitForAnimation(50);
  }

  return flipped;
}

// Get locked positions (cards with green background)
async function getLockedPositions(page: Page): Promise<number[]> {
  const cards = await page.locator('.event-card').all();
  const locked: number[] = [];
  for (let i = 0; i < cards.length; i++) {
    const classes = await cards[i].getAttribute('class') || '';
    if (classes.includes('bg-correct-bg')) {
      locked.push(i);
    }
  }
  return locked;
}

// Get card colors after animation
async function getCardColors(page: Page): Promise<{ index: number; isGreen: boolean; isRed: boolean }[]> {
  const cards = await page.locator('.event-card').all();
  const colors = [];
  for (let i = 0; i < cards.length; i++) {
    const classes = await cards[i].getAttribute('class') || '';
    colors.push({
      index: i,
      isGreen: classes.includes('bg-correct-bg'),
      isRed: classes.includes('bg-incorrect-bg'),
    });
  }
  return colors;
}

// Reorder unlocked cards to enable submit button
async function reorderCards(page: Page): Promise<boolean> {
  const allCards = await page.locator('.event-card').all();
  const unlockedIndices: number[] = [];

  for (let i = 0; i < allCards.length; i++) {
    const classes = await allCards[i].getAttribute('class') || '';
    if (!classes.includes('bg-correct-bg')) {
      unlockedIndices.push(i);
    }
  }

  if (unlockedIndices.length >= 2) {
    const card1 = allCards[unlockedIndices[0]];
    const card2 = allCards[unlockedIndices[1]];
    const box1 = await card1.boundingBox();
    const box2 = await card2.boundingBox();

    if (box1 && box2) {
      await page.mouse.move(box1.x + box1.width - 30, box1.y + box1.height / 2);
      await page.mouse.down();
      await waitForAnimation(100);
      await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2, { steps: 10 });
      await page.mouse.up();
      await waitForAnimation(300);
      return true;
    }
  }
  return false;
}

test.describe('Losing Game - Complete Flip and Color Tests', () => {

  // Run multiple times to catch intermittent issues
  for (let run = 1; run <= 5; run++) {
    test(`Run ${run}: All 4 guesses - verify flips and final colors`, async ({ page }) => {
      await initPage(page, 60 + run); // Use puzzles 61-65

      console.log(`\n========== RUN ${run} ==========`);

      const flipHistory: { guess: number; locked: number[]; flipped: boolean[]; expected: boolean[] }[] = [];
      let lastLockedPositions: number[] = [];

      // Play through all 4 guesses
      for (let guess = 1; guess <= 4; guess++) {
        console.log(`\n--- GUESS ${guess} ---`);

        // Get locked positions BEFORE this guess
        const lockedBefore = await getLockedPositions(page);
        console.log(`Locked positions before guess ${guess}:`, lockedBefore);

        // Check if submit button is available
        const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
        const isVisible = await submitBtn.isVisible().catch(() => false);

        if (!isVisible) {
          console.log(`Game ended early (won before guess ${guess})`);
          break;
        }

        let isEnabled = await submitBtn.isEnabled().catch(() => false);

        // If button not enabled and not first guess, reorder cards
        if (!isEnabled && guess > 1) {
          console.log(`Reordering cards for guess ${guess}...`);
          const reordered = await reorderCards(page);
          if (reordered) {
            await waitForAnimation(300);
            isEnabled = await submitBtn.isEnabled().catch(() => false);
          }
        }

        if (!isEnabled) {
          console.log(`Button still not enabled, game may have ended`);
          break;
        }

        // Click submit and monitor flips
        await submitBtn.click();
        const flipped = await monitorFlips(page);

        // Calculate which cards SHOULD have flipped
        const expectedFlips = flipped.map((_, i) => !lockedBefore.includes(i));

        console.log(`Cards that flipped:`, flipped);
        console.log(`Cards that SHOULD flip (unlocked):`, expectedFlips);

        // Record flip history
        flipHistory.push({
          guess,
          locked: lockedBefore,
          flipped,
          expected: expectedFlips,
        });

        // Verify: every unlocked card should have flipped
        for (let i = 0; i < 6; i++) {
          if (!lockedBefore.includes(i)) {
            if (!flipped[i]) {
              console.log(`ERROR: Card ${i} was unlocked but did NOT flip on guess ${guess}!`);
              await page.screenshot({ path: `test-results/losing-run${run}-guess${guess}-flip-fail.png` });
            }
            expect(flipped[i], `Card ${i} should flip on guess ${guess}`).toBe(true);
          } else {
            if (flipped[i]) {
              console.log(`WARNING: Locked card ${i} flipped on guess ${guess}`);
            }
          }
        }

        // Get new locked positions after this guess
        await waitForAnimation(500);
        lastLockedPositions = await getLockedPositions(page);
        console.log(`Locked positions after guess ${guess}:`, lastLockedPositions);

        // Check if won (all 6 locked = all correct)
        if (lastLockedPositions.length === 6) {
          console.log(`Won on guess ${guess}!`);
          break;
        }
      }

      // After all guesses, wait for full animation sequence (rearrangement + date reveal)
      console.log(`\n--- FINAL STATE CHECK ---`);
      await waitForAnimation(8000); // Wait for rearrangement and date animations

      // Take screenshot of final state
      await page.screenshot({ path: `test-results/losing-run${run}-final-state.png` });

      // Get final card colors
      const finalColors = await getCardColors(page);
      console.log('Final card colors:', finalColors);

      const greenCount = finalColors.filter(c => c.isGreen).length;
      const redCount = finalColors.filter(c => c.isRed).length;
      console.log(`Green cards: ${greenCount}, Red cards: ${redCount}`);

      // KEY ASSERTION: If the game was lost (not all 6 locked before last guess),
      // there MUST be some red cards in the final state
      const wasLoss = lastLockedPositions.length < 6;
      if (wasLoss) {
        console.log(`This was a LOSS - expecting mix of red and green`);

        // Must have at least one red card
        expect(redCount, 'Losing game should have at least one red card').toBeGreaterThan(0);

        // The number of green + red should equal 6
        expect(greenCount + redCount, 'All 6 cards should have a color').toBe(6);

        console.log(`PASS: Final state shows ${greenCount} green and ${redCount} red cards`);
      } else {
        console.log(`This was a WIN - all cards should be green`);
        expect(greenCount).toBe(6);
      }

      // Log flip history summary
      console.log('\n--- FLIP HISTORY SUMMARY ---');
      for (const entry of flipHistory) {
        const flipSuccess = entry.flipped.every((f, i) =>
          entry.locked.includes(i) ? !f : f
        );
        console.log(`Guess ${entry.guess}: ${flipSuccess ? 'PASS' : 'FAIL'} - ` +
          `Locked: [${entry.locked.join(',')}], ` +
          `Flipped: [${entry.flipped.map(f => f ? 'Y' : 'N').join(',')}]`);
      }
    });
  }

  // Specific test: Force a loss scenario with detailed color tracking
  test('Detailed loss: Track colors through rearrangement', async ({ page }) => {
    await initPage(page, 70);

    console.log('\n========== DETAILED LOSS TEST ==========');

    // Play through 4 guesses, capturing state at each point
    for (let guess = 1; guess <= 4; guess++) {
      const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');

      if (!(await submitBtn.isVisible().catch(() => false))) break;

      if (guess > 1) {
        const isEnabled = await submitBtn.isEnabled().catch(() => false);
        if (!isEnabled) {
          await reorderCards(page);
          await waitForAnimation(300);
        }
      }

      if (!(await submitBtn.isEnabled().catch(() => false))) break;

      console.log(`\n--- Guess ${guess} ---`);
      await submitBtn.click();

      // Wait for flip animation
      await waitForAnimation(3500);

      // Capture state after flip reveal
      const colorsAfterFlip = await getCardColors(page);
      console.log(`Colors after flip:`, colorsAfterFlip.map(c => c.isGreen ? 'G' : c.isRed ? 'R' : '-').join(''));

      await page.screenshot({ path: `test-results/detailed-loss-guess${guess}-after-flip.png` });

      const locked = await getLockedPositions(page);
      if (locked.length === 6) {
        console.log('Won!');
        return; // Test passes for wins
      }
    }

    // After guess 4, we should see the loss animation
    console.log('\n--- LOSS ANIMATION SEQUENCE ---');

    // Capture immediately after guess 4 flip
    await page.screenshot({ path: `test-results/detailed-loss-after-guess4.png` });
    let colors = await getCardColors(page);
    console.log('Colors after guess 4:', colors.map(c => c.isGreen ? 'G' : c.isRed ? 'R' : '-').join(''));

    // Wait for pause before rearrangement (1000ms in code)
    await waitForAnimation(1200);
    await page.screenshot({ path: `test-results/detailed-loss-before-rearrange.png` });
    colors = await getCardColors(page);
    console.log('Colors before rearrange:', colors.map(c => c.isGreen ? 'G' : c.isRed ? 'R' : '-').join(''));

    // Wait for rearrangement (800ms)
    await waitForAnimation(1000);
    await page.screenshot({ path: `test-results/detailed-loss-during-rearrange.png` });
    colors = await getCardColors(page);
    console.log('Colors during rearrange:', colors.map(c => c.isGreen ? 'G' : c.isRed ? 'R' : '-').join(''));

    // Wait for post-rearrange pause (800ms)
    await waitForAnimation(1000);
    await page.screenshot({ path: `test-results/detailed-loss-after-rearrange.png` });
    colors = await getCardColors(page);
    console.log('Colors after rearrange:', colors.map(c => c.isGreen ? 'G' : c.isRed ? 'R' : '-').join(''));

    // Wait for date reveal
    await waitForAnimation(4000);
    await page.screenshot({ path: `test-results/detailed-loss-final.png` });
    colors = await getCardColors(page);
    console.log('Final colors:', colors.map(c => c.isGreen ? 'G' : c.isRed ? 'R' : '-').join(''));

    // CRITICAL ASSERTION
    const greenCount = colors.filter(c => c.isGreen).length;
    const redCount = colors.filter(c => c.isRed).length;

    console.log(`\nFinal: ${greenCount} green, ${redCount} red`);

    // Must have at least one red card (since we lost)
    expect(redCount, 'Lost game must show at least one red card').toBeGreaterThan(0);
    expect(greenCount + redCount, 'All cards must have a color').toBe(6);
  });
});
