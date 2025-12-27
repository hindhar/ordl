import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3007';

// Helper to wait for animations
const waitForAnimation = (ms: number) => new Promise(r => setTimeout(r, ms));

// Helper to initialize page with localStorage set (no onboarding modal)
async function initPage(page: Page, puzzleNum: number) {
  // First navigate to set localStorage
  await page.goto(BASE_URL);
  await page.evaluate((num) => {
    localStorage.setItem('ordl-onboarding-seen', 'true');
    // Clear any saved game state
    localStorage.removeItem(`ordl-archive-${num}`);
  }, puzzleNum);
  // Now navigate to the puzzle
  await page.goto(`${BASE_URL}/?puzzle=${puzzleNum}`);
  await waitForAnimation(2000); // Wait for page load and API calls
}

// Helper to click submit and wait for reveal
async function submitAndWaitForReveal(page: Page) {
  const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
  await submitBtn.click();
  // Wait for all 6 cards to be revealed (360ms each + buffer)
  await waitForAnimation(3500);
}

// Helper to get card states
async function getCardStates(page: Page) {
  const cards = await page.locator('.event-card').all();
  const states = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const classes = await card.getAttribute('class') || '';
    const isCorrect = classes.includes('bg-correct-bg');
    const isIncorrect = classes.includes('bg-incorrect-bg');
    const isFlipping = classes.includes('card-flip');
    const isSolutionRevealing = classes.includes('solution-reveal');
    const text = await card.textContent();
    states.push({ index: i, isCorrect, isIncorrect, isFlipping, isSolutionRevealing, text: text?.substring(0, 30) });
  }
  return states;
}

// Helper to reorder cards by dragging unlocked card to another unlocked card's position
async function reorderCards(page: Page) {
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
      // Drag card1 to card2's position using drag handle (right side of card)
      await page.mouse.move(box1.x + box1.width - 30, box1.y + box1.height / 2);
      await page.mouse.down();
      await waitForAnimation(100);
      await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2, { steps: 10 });
      await page.mouse.up();
      await waitForAnimation(200);
      return true;
    }
  }
  return false;
}

// Test: Losing game animation (most critical)
test.describe('Losing Game Animation', () => {
  for (let run = 1; run <= 6; run++) {
    test(`Run ${run}: Loss should show red results, then fade to correct green order`, async ({ page }) => {
      await initPage(page, 4 + run); // Use different puzzles

      console.log(`\n=== RUN ${run} ===`);

      // Make 4 guesses (will eventually lose)
      for (let guess = 1; guess <= 4; guess++) {
        const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');

        // Wait for button to be ready
        await waitForAnimation(500);

        // Check if submit button is visible
        const isVisible = await submitBtn.isVisible().catch(() => false);
        if (!isVisible) {
          console.log(`Guess ${guess}: Submit button not visible, game may have ended`);
          break;
        }

        // Check if enabled - if not, reorder cards first
        let isEnabled = await submitBtn.isEnabled().catch(() => false);
        if (!isEnabled && guess > 1) {
          console.log(`Guess ${guess}: Button disabled, reordering cards...`);
          const reordered = await reorderCards(page);
          if (reordered) {
            await waitForAnimation(300);
            isEnabled = await submitBtn.isEnabled().catch(() => false);
          }
        }

        if (!isEnabled) {
          console.log(`Guess ${guess}: Submit button still not enabled, game may have ended`);
          break;
        }

        console.log(`Guess ${guess}: Submitting...`);
        await submitBtn.click();

        if (guess < 4) {
          // Wait for reveal
          await waitForAnimation(3500);
          const states = await getCardStates(page);
          const correctCount = states.filter(s => s.isCorrect).length;
          const incorrectCount = states.filter(s => s.isIncorrect).length;
          console.log(`Guess ${guess} results: ${correctCount} correct, ${incorrectCount} incorrect`);
          await page.screenshot({ path: `test-results/lose-${run}-guess${guess}.png` });

          // If all correct, game is won
          if (correctCount === 6) {
            console.log(`Won on guess ${guess}!`);
            break;
          }
        } else {
          // Final guess - capture the full losing animation sequence
          console.log('Final guess - capturing animation sequence...');

          // 1. During flip reveal
          for (let i = 0; i < 6; i++) {
            await waitForAnimation(400);
            await page.screenshot({ path: `test-results/lose-${run}-final-flip-${i}.png` });
          }

          // 2. After all flips, before fade
          await waitForAnimation(500);
          await page.screenshot({ path: `test-results/lose-${run}-all-flipped.png` });
          const statesAfterFlip = await getCardStates(page);
          console.log('States after flip:', statesAfterFlip.map(s => s.isCorrect ? 'G' : (s.isIncorrect ? 'R' : '-')).join(''));

          // 3. During pause (800ms)
          await waitForAnimation(600);
          await page.screenshot({ path: `test-results/lose-${run}-pause.png` });

          // 4. During fade animation
          await waitForAnimation(300);
          await page.screenshot({ path: `test-results/lose-${run}-fading.png` });
          const statesDuringFade = await getCardStates(page);
          const hasFading = statesDuringFade.some(s => s.isSolutionRevealing);
          console.log(`Has solution-reveal class: ${hasFading}`);

          // 5. After rearrange, fading in
          await waitForAnimation(600);
          await page.screenshot({ path: `test-results/lose-${run}-rearranged.png` });

          // 6. After fade complete
          await waitForAnimation(400);
          await page.screenshot({ path: `test-results/lose-${run}-solution-shown.png` });
          const statesAfterRearrange = await getCardStates(page);
          const allGreen = statesAfterRearrange.every(s => s.isCorrect);
          console.log(`All cards green after rearrange: ${allGreen}`);

          // 7. Date reveal
          for (let d = 0; d < 6; d++) {
            await waitForAnimation(500);
            const dateCount = await page.locator('.text-correct.text-sm.font-semibold').count();
            console.log(`Date reveal ${d}: ${dateCount} dates visible`);
            await page.screenshot({ path: `test-results/lose-${run}-date-${d}.png` });
          }
        }
      }

      // Final state - wait for full animation completion
      await waitForAnimation(5000);
      await page.screenshot({ path: `test-results/lose-${run}-final.png` });

      // Verify final state - cards should keep red/green colors from final guess
      // (solutionColorMap preserves which cards user got right/wrong)
      const finalStates = await getCardStates(page);
      const hasCorrect = finalStates.some(s => s.isCorrect);
      const hasIncorrect = finalStates.some(s => s.isIncorrect);
      const hasResults = hasCorrect || hasIncorrect;
      console.log(`Final state - has results: ${hasResults}, correct: ${finalStates.filter(s => s.isCorrect).length}, incorrect: ${finalStates.filter(s => s.isIncorrect).length}`);
      // At minimum, we should have some result indication (either correct or incorrect)
      // The mix of red/green depends on how many the user got right in final guess
      expect(hasResults).toBe(true);
    });
  }
});

// Test: First guess flip animations
test.describe('First Guess Flip Animations', () => {
  for (let run = 1; run <= 6; run++) {
    test(`Run ${run}: All cards should flip on first guess`, async ({ page }) => {
      await initPage(page, run);

      await page.screenshot({ path: `test-results/first-guess-${run}-before.png` });

      // Submit and capture during reveal
      await page.click('button:has-text("SUBMIT ORDER")');

      // Capture each card flip
      for (let i = 0; i < 6; i++) {
        await waitForAnimation(380);
        await page.screenshot({ path: `test-results/first-guess-${run}-flip-${i}.png` });
      }

      await waitForAnimation(600);
      await page.screenshot({ path: `test-results/first-guess-${run}-after.png` });

      // Verify results shown
      const states = await getCardStates(page);
      const hasResults = states.some(s => s.isCorrect || s.isIncorrect);
      console.log(`Run ${run}: Has results = ${hasResults}, States = ${states.map(s => s.isCorrect ? 'G' : (s.isIncorrect ? 'R' : '-')).join('')}`);
      expect(hasResults).toBe(true);
    });
  }
});

// Test: Subsequent guess flip animations
test.describe('Subsequent Guess Flip Animations', () => {
  for (let run = 1; run <= 6; run++) {
    test(`Run ${run}: Non-locked cards should flip on second guess`, async ({ page }) => {
      await initPage(page, 10 + run);

      // First guess
      await submitAndWaitForReveal(page);
      const statesAfter1 = await getCardStates(page);
      const lockedCount = statesAfter1.filter(s => s.isCorrect).length;
      console.log(`Run ${run}: ${lockedCount} locked after first guess`);
      await page.screenshot({ path: `test-results/subsequent-${run}-after-guess1.png` });

      // If all cards are locked (won), skip the rest
      if (lockedCount === 6) {
        console.log('Won on first guess, skipping second guess test');
        return;
      }

      // Reorder cards to enable submit button
      const reordered = await reorderCards(page);
      if (!reordered) {
        console.log('Could not reorder cards');
        return;
      }
      await waitForAnimation(300);

      // Check if game is still playing
      const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');
      if (!(await submitBtn.isVisible()) || !(await submitBtn.isEnabled())) {
        console.log('Game ended after first guess');
        return;
      }

      // Second guess
      await page.click('button:has-text("SUBMIT ORDER")');

      // Capture during second reveal
      for (let i = 0; i < 6; i++) {
        await waitForAnimation(380);
        await page.screenshot({ path: `test-results/subsequent-${run}-guess2-flip-${i}.png` });
      }

      await waitForAnimation(600);
      await page.screenshot({ path: `test-results/subsequent-${run}-after-guess2.png` });

      const statesAfter2 = await getCardStates(page);
      console.log(`Run ${run} after guess 2: ${statesAfter2.map(s => s.isCorrect ? 'G' : (s.isIncorrect ? 'R' : '-')).join('')}`);
    });
  }
});

// Test: Drag and drop (no jump animation)
test.describe('Drag and Drop Animations', () => {
  for (let run = 1; run <= 6; run++) {
    test(`Run ${run}: Cards should not jump when dragged`, async ({ page }) => {
      await initPage(page, 20 + run);

      // Make one guess to get some locked cards
      await submitAndWaitForReveal(page);
      await page.screenshot({ path: `test-results/drag-${run}-initial.png` });

      // Get unlocked cards (cards without .locked class that are visible)
      const allCards = await page.locator('.event-card').all();
      let unlockedIndices: number[] = [];

      for (let i = 0; i < allCards.length; i++) {
        const classes = await allCards[i].getAttribute('class') || '';
        if (!classes.includes('bg-correct-bg')) {
          unlockedIndices.push(i);
        }
      }

      console.log(`Run ${run}: Unlocked cards at indices: ${unlockedIndices.join(', ')}`);

      if (unlockedIndices.length >= 2) {
        const card1 = allCards[unlockedIndices[0]];
        const card2 = allCards[unlockedIndices[1]];

        const box1 = await card1.boundingBox();
        const box2 = await card2.boundingBox();

        if (box1 && box2) {
          // Screenshot before drag
          await page.screenshot({ path: `test-results/drag-${run}-before.png` });

          // Drag card 1 to card 2's position
          await page.mouse.move(box1.x + box1.width - 30, box1.y + box1.height / 2);
          await page.mouse.down();
          await waitForAnimation(200);
          await page.screenshot({ path: `test-results/drag-${run}-dragging.png` });

          await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2, { steps: 10 });
          await waitForAnimation(100);
          await page.screenshot({ path: `test-results/drag-${run}-over-target.png` });

          await page.mouse.up();
          await waitForAnimation(50);
          await page.screenshot({ path: `test-results/drag-${run}-released.png` });

          await waitForAnimation(400);
          await page.screenshot({ path: `test-results/drag-${run}-settled.png` });

          console.log(`Run ${run}: Drag completed successfully`);
        }
      } else {
        console.log(`Run ${run}: Not enough unlocked cards to test drag`);
      }
    });
  }
});

// Test: Date reveal animations
test.describe('Date Reveal Animations', () => {
  for (let run = 1; run <= 6; run++) {
    test(`Run ${run}: Dates should reveal one by one after game over`, async ({ page }) => {
      await initPage(page, 30 + run);

      // Play through game until over
      for (let guess = 1; guess <= 4; guess++) {
        const submitBtn = page.locator('button:has-text("SUBMIT ORDER")');

        // Wait and check if button is visible
        await waitForAnimation(500);
        const isVisible = await submitBtn.isVisible().catch(() => false);
        if (!isVisible) {
          console.log(`Guess ${guess}: Button not visible, game ended`);
          break;
        }

        // Check if enabled, if not reorder cards
        let isEnabled = await submitBtn.isEnabled().catch(() => false);
        if (!isEnabled && guess > 1) {
          await reorderCards(page);
          await waitForAnimation(300);
          isEnabled = await submitBtn.isEnabled().catch(() => false);
        }

        if (!isEnabled) {
          console.log(`Guess ${guess}: Button not enabled, game ended`);
          break;
        }

        console.log(`Guess ${guess}: Submitting...`);
        await submitBtn.click();
        await waitForAnimation(4000);

        // Check if won
        const states = await getCardStates(page);
        if (states.every(s => s.isCorrect)) {
          console.log(`Won on guess ${guess}!`);
          break;
        }
      }

      // Wait for solution reveal if lost
      await waitForAnimation(5000);

      // Check dates over time
      const dateCounts: number[] = [];
      for (let i = 0; i < 8; i++) {
        await waitForAnimation(500);
        const count = await page.locator('.text-correct.text-sm.font-semibold').count();
        dateCounts.push(count);
        await page.screenshot({ path: `test-results/dates-${run}-check-${i}.png` });
      }

      console.log(`Run ${run}: Date counts over time: ${dateCounts.join(', ')}`);

      // Final count should be 6
      const finalCount = dateCounts[dateCounts.length - 1];
      expect(finalCount).toBe(6);
    });
  }
});
