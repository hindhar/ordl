import { test, expect, Page } from '@playwright/test';

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

test.describe('Flip Animation Debug', () => {
  // Run multiple times to catch intermittent issues
  for (let run = 1; run <= 10; run++) {
    test(`Run ${run}: First guess - all 6 cards should flip`, async ({ page }) => {
      await initPage(page, 40 + run);

    // Start monitoring and click submit
    const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
    await submitBtn.click();

    const flipped = await monitorFlips(page);
    console.log('First guess flips:', flipped);
    console.log('Cards that flipped:', flipped.filter(f => f).length);

    // All 6 cards should have flipped
    expect(flipped.every(f => f)).toBe(true);
    });
  }

  test('Second guess - only unlocked cards should flip', async ({ page }) => {
    await initPage(page, 51);

    // First guess
    console.log('=== FIRST GUESS ===');
    let submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
    await submitBtn.click();

    const firstFlipped = await monitorFlips(page);
    console.log('First guess flips:', firstFlipped);

    // Get locked positions after first guess
    await waitForAnimation(500);
    const cards = await page.locator('.event-card').all();
    const lockedAfterFirst: number[] = [];
    for (let i = 0; i < cards.length; i++) {
      const classes = await cards[i].getAttribute('class') || '';
      if (classes.includes('bg-correct-bg')) {
        lockedAfterFirst.push(i);
      }
    }
    console.log('Locked positions after first guess:', lockedAfterFirst);

    // Reorder to enable submit
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
      }
    }

    // Second guess
    console.log('=== SECOND GUESS ===');
    submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
    if (await submitBtn.isVisible() && await submitBtn.isEnabled()) {
      await submitBtn.click();

      const secondFlipped = await monitorFlips(page);
      console.log('Second guess flips:', secondFlipped);

      // Check which cards SHOULD have flipped (unlocked ones)
      const shouldHaveFlipped = secondFlipped.map((_, i) => !lockedAfterFirst.includes(i));
      console.log('Should have flipped:', shouldHaveFlipped);

      // Verify: unlocked cards flipped, locked cards didn't
      for (let i = 0; i < 6; i++) {
        if (lockedAfterFirst.includes(i)) {
          // Locked card should NOT flip
          if (secondFlipped[i]) {
            console.log(`WARNING: Locked card at index ${i} flipped when it shouldn't have`);
          }
        } else {
          // Unlocked card SHOULD flip
          if (!secondFlipped[i]) {
            console.log(`ERROR: Unlocked card at index ${i} did NOT flip!`);
          }
          expect(secondFlipped[i]).toBe(true);
        }
      }
    }
  });

  test('Third and fourth guess - check all unlocked cards flip', async ({ page }) => {
    await initPage(page, 52);

    for (let guess = 1; guess <= 4; guess++) {
      console.log(`\n=== GUESS ${guess} ===`);

      // Get current locked positions
      const cards = await page.locator('.event-card').all();
      const lockedBefore: number[] = [];
      for (let i = 0; i < cards.length; i++) {
        const classes = await cards[i].getAttribute('class') || '';
        if (classes.includes('bg-correct-bg')) {
          lockedBefore.push(i);
        }
      }
      console.log('Locked before guess:', lockedBefore);

      const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
      if (!(await submitBtn.isVisible()) || !(await submitBtn.isEnabled())) {
        // Need to reorder
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
          }
        }
      }

      const submitBtnRetry = page.locator('button:has-text("SUBMIT ORDER")');
      if (await submitBtnRetry.isVisible() && await submitBtnRetry.isEnabled()) {
        await submitBtnRetry.click();

        const flipped = await monitorFlips(page);
        console.log('Flips:', flipped);

        // Check each unlocked card flipped
        let allUnlockedFlipped = true;
        for (let i = 0; i < 6; i++) {
          if (!lockedBefore.includes(i) && !flipped[i]) {
            console.log(`ERROR: Card ${i} was unlocked but did NOT flip!`);
            allUnlockedFlipped = false;
          }
        }

        if (!allUnlockedFlipped) {
          await page.screenshot({ path: `test-results/flip-debug-guess${guess}-fail.png` });
        }

        await waitForAnimation(500);
      } else {
        console.log('Game ended or button not available');
        break;
      }
    }
  });
});
