import { test, expect, Page } from '@playwright/test';

/**
 * Edge case tests for flip animations and color preservation
 * Tests various scenarios to catch intermittent issues
 */

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

// Monitor flips with detailed timing
async function monitorFlipsDetailed(page: Page): Promise<{ index: number; flipped: boolean; firstSeen: number }[]> {
  const results = Array.from({ length: 6 }, (_, i) => ({ index: i, flipped: false, firstSeen: -1 }));
  const startTime = Date.now();

  for (let i = 0; i < 80; i++) { // 4 seconds monitoring
    const cards = await page.locator('.event-card').all();
    for (let j = 0; j < cards.length; j++) {
      const classes = await cards[j].getAttribute('class') || '';
      if (classes.includes('card-flip') && !results[j].flipped) {
        results[j].flipped = true;
        results[j].firstSeen = Date.now() - startTime;
      }
    }
    await waitForAnimation(50);
  }

  return results;
}

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

test.describe('Edge Cases - Various Puzzle Scenarios', () => {
  // Test a wide variety of puzzles to catch different locked position combinations
  const puzzlesToTest = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30];

  for (const puzzleNum of puzzlesToTest) {
    test(`Puzzle ${puzzleNum}: Full game through 4 guesses`, async ({ page }) => {
      await initPage(page, puzzleNum);

      console.log(`\n===== PUZZLE ${puzzleNum} =====`);

      for (let guess = 1; guess <= 4; guess++) {
        const lockedBefore = await getLockedPositions(page);
        console.log(`\nGuess ${guess} - Locked before: [${lockedBefore.join(',')}]`);

        const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
        if (!(await submitBtn.isVisible().catch(() => false))) {
          console.log(`Game ended (won earlier)`);
          break;
        }

        if (guess > 1) {
          const isEnabled = await submitBtn.isEnabled().catch(() => false);
          if (!isEnabled) {
            await reorderCards(page);
            await waitForAnimation(300);
          }
        }

        if (!(await submitBtn.isEnabled().catch(() => false))) {
          console.log(`Cannot submit on guess ${guess}`);
          break;
        }

        await submitBtn.click();
        const flipResults = await monitorFlipsDetailed(page);

        // Log detailed timing
        console.log('Flip results:');
        for (const r of flipResults) {
          const shouldFlip = !lockedBefore.includes(r.index);
          const status = r.flipped === shouldFlip ? 'OK' : 'FAIL';
          console.log(`  Card ${r.index}: ${r.flipped ? 'flipped' : 'no flip'} at ${r.firstSeen}ms [${status}]`);

          if (shouldFlip) {
            expect(r.flipped, `Card ${r.index} should flip on guess ${guess}`).toBe(true);
          }
        }

        await waitForAnimation(500);
        const lockedAfter = await getLockedPositions(page);

        if (lockedAfter.length === 6) {
          console.log(`Won on guess ${guess}!`);
          break;
        }
      }
    });
  }
});

test.describe('Rapid Fire Tests - Stress Test Flipping', () => {
  // Run the same puzzle multiple times to catch race conditions
  for (let iteration = 1; iteration <= 10; iteration++) {
    test(`Iteration ${iteration}: Rapid replay puzzle 40`, async ({ page }) => {
      await initPage(page, 40);

      for (let guess = 1; guess <= 4; guess++) {
        const locked = await getLockedPositions(page);

        const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
        if (!(await submitBtn.isVisible().catch(() => false))) break;

        if (guess > 1 && !(await submitBtn.isEnabled().catch(() => false))) {
          await reorderCards(page);
          await waitForAnimation(200);
        }

        if (!(await submitBtn.isEnabled().catch(() => false))) break;

        await submitBtn.click();

        // Faster monitoring for stress test
        const flipped = [false, false, false, false, false, false];
        for (let i = 0; i < 40; i++) {
          const cards = await page.locator('.event-card').all();
          for (let j = 0; j < cards.length; j++) {
            const classes = await cards[j].getAttribute('class') || '';
            if (classes.includes('card-flip')) {
              flipped[j] = true;
            }
          }
          await waitForAnimation(50);
        }

        // Verify unlocked cards flipped
        for (let i = 0; i < 6; i++) {
          if (!locked.includes(i)) {
            expect(flipped[i], `Iter ${iteration}, Guess ${guess}: Card ${i} should flip`).toBe(true);
          }
        }

        await waitForAnimation(400);

        if ((await getLockedPositions(page)).length === 6) break;
      }
    });
  }
});

test.describe('First and Last Card Focus', () => {
  // Specifically test cards at positions 0 and 5 (first and last)
  for (let puzzleNum = 80; puzzleNum <= 90; puzzleNum++) {
    test(`Puzzle ${puzzleNum}: Focus on first (0) and last (5) cards`, async ({ page }) => {
      await initPage(page, puzzleNum);

      const flipLog: { guess: number; card0: boolean; card5: boolean }[] = [];

      for (let guess = 1; guess <= 4; guess++) {
        const locked = await getLockedPositions(page);

        const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
        if (!(await submitBtn.isVisible().catch(() => false))) break;

        if (guess > 1 && !(await submitBtn.isEnabled().catch(() => false))) {
          await reorderCards(page);
          await waitForAnimation(200);
        }

        if (!(await submitBtn.isEnabled().catch(() => false))) break;

        await submitBtn.click();

        // Monitor card 0 and card 5 specifically
        let card0Flipped = false;
        let card5Flipped = false;

        for (let i = 0; i < 60; i++) {
          const cards = await page.locator('.event-card').all();
          if (cards.length >= 6) {
            const class0 = await cards[0].getAttribute('class') || '';
            const class5 = await cards[5].getAttribute('class') || '';
            if (class0.includes('card-flip')) card0Flipped = true;
            if (class5.includes('card-flip')) card5Flipped = true;
          }
          await waitForAnimation(50);
        }

        flipLog.push({ guess, card0: card0Flipped, card5: card5Flipped });

        // Verify
        const card0ShouldFlip = !locked.includes(0);
        const card5ShouldFlip = !locked.includes(5);

        if (card0ShouldFlip) {
          expect(card0Flipped, `Guess ${guess}: Card 0 should flip`).toBe(true);
        }
        if (card5ShouldFlip) {
          expect(card5Flipped, `Guess ${guess}: Card 5 should flip`).toBe(true);
        }

        await waitForAnimation(400);

        if ((await getLockedPositions(page)).length === 6) break;
      }

      console.log(`Puzzle ${puzzleNum} flip log:`, flipLog);
    });
  }
});
