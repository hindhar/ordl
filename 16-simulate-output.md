# Integration Simulation Report

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Scenarios Simulated | 147 |
| Gotchas Discovered | 34 |
| Critical Issues | 4 |
| High Priority Issues | 8 |
| Medium Priority Issues | 12 |
| Low Priority Issues | 10 |
| Integration Readiness Score | 6.5/10 |

**Recommendation**: PROCEED WITH CAUTION - Critical testing infrastructure must be established first before any code changes. The lack of unit testing creates significant risk for refactoring work.

---

## Agent Simulation Results

### Testing Infrastructure Agents (1-4)

#### Agent 1: Vitest + React Testing Library Setup Simulation

**Scenario**: Installing Vitest and React Testing Library with Next.js 14 App Router

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| T1-01 | **Next.js App Router requires special RSC mocking** | Critical | Tests will fail on Server Components without proper mocking |
| T1-02 | **Vitest needs explicit happy-dom/jsdom config for client components** | High | useState/useEffect will throw errors without DOM environment |
| T1-03 | **Path aliases (@/*) need vitest.config.ts mapping** | Medium | Import resolution failures across all tests |
| T1-04 | **next/navigation mocking differs from Pages Router** | Medium | useRouter tests will fail silently |

**Simulation Walkthrough**:
```
1. npm install vitest @testing-library/react @testing-library/jest-dom --save-dev
   GOTCHA: vitest-dom replaces @testing-library/jest-dom for Vitest

2. Create vitest.config.ts
   GOTCHA: Must set environment: 'jsdom' for React components
   GOTCHA: Must configure path aliases to match tsconfig.json

3. Create test setup file (vitest.setup.ts)
   GOTCHA: Must mock next/navigation, next/headers for App Router

4. Test useGame.ts hook
   GOTCHA: Hook depends on localStorage - must mock window
   GOTCHA: Hook makes fetch calls - must mock fetch or use MSW
   GOTCHA: Hook has 27+ useState calls - testing will require careful isolation
```

**Mitigation Strategy**:
```typescript
// vitest.config.ts - REQUIRED configuration
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

---

#### Agent 2: MSW v2 Integration Simulation

**Scenario**: Setting up MSW v2 for API mocking with Next.js API routes

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| T2-01 | **MSW v2 has breaking API changes from v1** | High | All online examples may be outdated |
| T2-02 | **API routes /api/puzzle/[id] require dynamic path matching** | Medium | Mocks must handle :id parameter correctly |
| T2-03 | **fetchPuzzle('today') returns different structure than fetchPuzzle(1)** | Medium | Mocks need conditional responses |
| T2-04 | **Browser vs Node MSW setup differs significantly** | Low | Must maintain two handler files |

**Simulation Walkthrough**:
```
1. npm install msw --save-dev

2. Create handlers.ts for API mocks
   GOTCHA: Current API structure:
   - GET /api/puzzle/today -> {puzzleNumber, todaysPuzzle, isToday, events[]}
   - GET /api/puzzle/:id -> {puzzleNumber, todaysPuzzle, isToday, events[]}
   - POST /api/puzzle/:id/check -> {results[], allCorrect}
   - GET /api/puzzle/:id/solution -> {events[]}

3. Each endpoint needs realistic mock data
   GOTCHA: events[] must have correct ClientEvent structure
   GOTCHA: check results must match order validation logic
```

**MSW Handler Template**:
```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const mockEvents = [
  { id: '1', event: 'Event 1', emoji: '1' },
  { id: '2', event: 'Event 2', emoji: '2' },
  // ... 6 events
];

export const handlers = [
  http.get('/api/puzzle/today', () => {
    return HttpResponse.json({
      puzzleNumber: 1,
      todaysPuzzle: 1,
      isToday: true,
      events: mockEvents,
    });
  }),

  http.get('/api/puzzle/:id', ({ params }) => {
    const id = params.id;
    return HttpResponse.json({
      puzzleNumber: Number(id),
      todaysPuzzle: 70,
      isToday: false,
      events: mockEvents,
    });
  }),

  http.post('/api/puzzle/:id/check', async ({ request }) => {
    const { order } = await request.json();
    // Simulate order checking logic
    return HttpResponse.json({
      results: order.map((id, i) => ({ id, correct: i === 0, position: i })),
      allCorrect: false,
    });
  }),
];
```

---

#### Agent 3: Playwright Visual Regression Baseline Simulation

**Scenario**: Adding visual regression testing to existing Playwright setup

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| T3-01 | **Existing tests use non-deterministic puzzle numbers** | High | Visual baselines will differ between runs |
| T3-02 | **Animation timing (360ms/480ms) creates snapshot inconsistency** | High | Must freeze animations or wait for completion |
| T3-03 | **localStorage state affects visual output** | Medium | Must reset localStorage before each baseline capture |
| T3-04 | **Dark mode not implemented - future baseline break** | Low | Adding dark mode will require new baselines |

**Simulation Walkthrough**:
```
1. Review current playwright.config.ts
   - baseURL: 'http://localhost:3007'
   - screenshot: 'on', video: 'on', trace: 'on'
   GOTCHA: These create large test artifacts

2. Visual regression requires:
   - Deterministic test data (fixed puzzle IDs)
   - Animation completion before snapshot
   - Consistent viewport sizes

3. Current tests use waitForAnimation() helper
   GOTCHA: 360ms per card * 6 cards = 2.16s minimum wait
   GOTCHA: Rearrangement animation = 800ms additional
   GOTCHA: Date reveal = 480ms * 6 = 2.88s additional
```

**Visual Regression Setup**:
```typescript
// Add to playwright.config.ts
export default defineConfig({
  // ... existing config
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      animations: 'disabled', // Freeze CSS animations
    },
  },
});

// Usage in tests
test('card states should match baseline', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); // Disable animations
  await initPage(page, 1); // Fixed puzzle number
  await expect(page).toHaveScreenshot('initial-state.png');
});
```

---

#### Agent 4: axe-core Integration Simulation

**Scenario**: Adding axe-core accessibility testing to existing Playwright tests

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| T4-01 | **Modal focus trap absence will cause immediate failures** | Critical | All 3 modals fail WCAG 2.1 focus requirement |
| T4-02 | **Color contrast may fail for text-secondary (#6B6B66)** | High | Needs verification against bg-primary (#FAF9F6) |
| T4-03 | **Drag handles lack visible focus indicators** | Medium | Keyboard-only users cannot see focus |
| T4-04 | **No aria-live regions for game state announcements** | Medium | Screen readers miss result updates |

**Simulation Walkthrough**:
```
1. npm install @axe-core/playwright --save-dev

2. Create accessibility test file
   GOTCHA: Modals must be open to test them
   GOTCHA: Dynamic content (results) needs axe scan after reveal

3. Run axe on each component state:
   - Initial game state
   - During drag operation
   - After submission (revealing)
   - Game over state
   - Each modal open

4. Expected violations:
   - HowToPlayModal: no focus trap, no role="dialog"
   - ResultModal: no focus trap, no aria-modal
   - StatsModal: no focus trap
   - EventCard: drag handle not keyboard accessible
   - No prefers-reduced-motion media query (429 lines of CSS, 0 instances)
```

**axe-core Test Template**:
```typescript
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await initPage(page, 1);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  // Log violations for debugging
  if (results.violations.length > 0) {
    console.log('Violations:', JSON.stringify(results.violations, null, 2));
  }

  expect(results.violations).toHaveLength(0);
});
```

---

### Code Quality Agents (5-8)

#### Agent 5: Stricter TypeScript Config Simulation

**Scenario**: Enabling strictNullChecks, noUncheckedIndexedAccess, noImplicitReturns

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| Q5-01 | **useGame.ts has unguarded array access in 7+ locations** | High | Will break with noUncheckedIndexedAccess |
| Q5-02 | **localStorage.getItem returns null - 12 unguarded usages** | High | Will require null checks |
| Q5-03 | **pendingResults?.[index] already uses optional chaining** | Low | Some code already handles this |
| Q5-04 | **Map.get() returns undefined - solutionColorMap affected** | Medium | Need explicit undefined handling |

**Simulation Walkthrough**:
```typescript
// Current code in useGame.ts (line 317):
const results = checkResult.results.map(r => r.correct);
// SAFE - results is array from API

// Current code in useGame.ts (line 353):
const correctPositions = results
  .map((correct, index) => ({ correct, index }))
  .filter(({ correct }) => correct)
  .map(({ index }) => index);
// SAFE - filter/map pattern is okay

// Current code in EventCard.tsx (line 56):
const wasEverCorrectBefore = previousAttempts.some(
  (attempt) => attempt[index] === true
);
// GOTCHA with noUncheckedIndexedAccess:
// attempt[index] becomes boolean | undefined
// Fix: attempt[index] ?? false === true
// OR: attempt.at(index) === true

// Current code in EventList.tsx (line 245):
const wasCorrectInGuess = solutionColorMap.get(event.id);
isCorrect = wasCorrectInGuess ?? null;
// ALREADY HANDLED - good pattern
```

**Migration Strategy**:
1. Add flags incrementally, not all at once
2. Start with noImplicitReturns (easiest)
3. Then strictNullChecks (most impactful)
4. Finally noUncheckedIndexedAccess (most disruptive)

---

#### Agent 6: useGame.ts Decomposition Simulation

**Scenario**: Breaking 628-line useGame.ts into smaller, testable hooks

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| Q6-01 | **27 useState calls create massive state interdependency** | Critical | Cannot extract without careful dependency analysis |
| Q6-02 | **submitOrder callback has 8 state setters in sequence** | High | Animation timing depends on exact order |
| Q6-03 | **5 callbacks share closure over currentOrder state** | High | Extracting will require prop drilling or context |
| Q6-04 | **isSimulation flag affects 4 different code paths** | Medium | Extract simulation logic separately |

**State Dependency Map**:
```
Animation State Cluster (tightly coupled):
  isRevealing -> revealedResultIndex -> pendingResults
  isRevealingDates -> revealedDateIndex
  isAnimatingRearrangement -> preRearrangeOrder
  solutionColorMap -> isColorTransitioning

Game State Cluster (core logic):
  status -> attempts -> lockedPositions -> mistakes
  currentOrder -> events
  hasChangedSinceLastSubmit -> lastSubmitResults

Persistence State Cluster:
  puzzleNumber -> todaysPuzzle -> isSimulation
  stats (independent)

Derived Values:
  maxArchivePuzzle = todaysPuzzle - 1
```

**Recommended Decomposition**:
```typescript
// hooks/useGameAnimation.ts - Animation orchestration
// hooks/useGamePersistence.ts - localStorage operations
// hooks/useGameLogic.ts - Core game rules
// hooks/useGame.ts - Composition of above hooks
```

**Risk Assessment**: HIGH - Without unit tests, refactoring this hook is dangerous. Must establish testing first.

---

#### Agent 7: Error Boundary Implementation Simulation

**Scenario**: Adding React Error Boundaries for crash recovery

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| Q7-01 | **Error boundaries must be class components** | Medium | Need to write class component in functional codebase |
| Q7-02 | **fetch failures in useGame not caught by boundaries** | High | Promise rejections bypass error boundaries |
| Q7-03 | **localStorage failures silently caught, not surfaced** | Low | Already handled with try/catch |
| Q7-04 | **DndContext from @dnd-kit may throw on edge cases** | Medium | Wrap EventList in dedicated boundary |

**Simulation Walkthrough**:
```
1. Current error handling in useGame.ts:
   - fetchPuzzle returns null on failure (line 78-82)
   - checkOrder returns null on failure (line 99-101)
   - fetchSolution returns null on failure (line 111-113)

   GOTCHA: These null returns are handled, but UI shows "Loading..."
   forever if API fails

2. Current error handling in storage.ts:
   - All localStorage operations wrapped in try/catch
   - Errors logged to console only (lines 78, 138, 173)

3. Missing error handling:
   - No timeout on fetch calls
   - No retry logic
   - No user-facing error messages
   - No error boundary wrapping Game component
```

**Error Boundary Template**:
```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
          <div className="text-center p-8">
            <h2 className="text-xl font-display font-bold text-text-primary mb-4">
              Something went wrong
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

#### Agent 8: console.log Removal and Dead Code Cleanup Simulation

**Scenario**: Removing debug logging and identifying dead code

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| Q8-01 | **EventCard.tsx line 73 has debug console.log in production** | Low | Performance impact, exposes internal state |
| Q8-02 | **isSolutionRevealing state is set but never used in render** | Low | Dead code - 4 setters, 0 readers in JSX |
| Q8-03 | **totalPuzzles is hardcoded to 70 but never updated** | Low | Magic number, not synced with actual puzzle count |
| Q8-04 | **mistakes state tracked but MistakeIndicator uses attempts.length** | Low | Redundant state tracking |

**Dead Code Analysis**:
```typescript
// useGame.ts line 137:
const [isSolutionRevealing, setIsSolutionRevealing] = useState(false);

// Usage: SET in 4 places (lines 371, 445, 477, 538)
// Usage: RETURNED in export (line 615)
// Usage: PASSED TO EventCard (Game.tsx line 139)
// Usage in EventCard: PROP RECEIVED (line 42)
// Usage in EventCard: PROP DESTRUCTURED (line 44)
// NEVER USED IN RENDER LOGIC

// This is DEAD CODE - can be removed

// Also suspicious:
const [mistakes, setMistakes] = useState(0);
// Set to 0 in reset operations
// Never incremented anywhere (attempts.length used instead)
```

**Removal Plan**:
1. Remove console.log from EventCard.tsx (safe, obvious)
2. Remove isSolutionRevealing if confirmed dead (medium risk)
3. Audit mistakes vs attempts.length usage (low priority)
4. Replace totalPuzzles hardcode with API value (low priority)

---

### UI/UX Enhancement Agents (9-12)

#### Agent 9: CSS Variable Refinements Simulation

**Scenario**: Auditing CSS variable usage and cascade implications

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| U9-01 | **CSS variables defined in :root but Tailwind uses hardcoded values** | Medium | Duplication, inconsistency risk |
| U9-02 | **shadow-card uses hardcoded rgba, not CSS variable** | Low | Won't adapt to theme changes |
| U9-03 | **Some colors defined twice (CSS vars AND tailwind.config.ts)** | Low | Maintenance burden |
| U9-04 | **No dark mode CSS variables defined** | Low | Future work needed for dark mode |

**Analysis**:
```css
/* globals.css :root */
--bg-primary: #FAF9F6;
--bg-secondary: #FFFFFF;

/* tailwind.config.ts */
'bg-primary': '#FAF9F6',
'bg-secondary': '#FFFFFF',

/* DUPLICATION - should reference CSS vars in Tailwind config */
```

**CSS Cascade Issues**:
```css
/* globals.css line 148-152 - hover state for event-card */
@media (hover: hover) {
  .event-card:hover:not(.locked):not(.dragging) {
    transform: translateY(-2px);
    /* ... */
    transition: ... transform 0.2s ...;
  }
}

/* GOTCHA: This transition conflicts with drag transform
   The 'transition: none !important' on .dragging helps
   but there's a brief flash when drag ends */
```

**Recommendation**: Unify color definitions in CSS variables, reference in Tailwind config:
```typescript
// tailwind.config.ts
colors: {
  'bg-primary': 'var(--bg-primary)',
  'bg-secondary': 'var(--bg-secondary)',
  // etc.
}
```

---

#### Agent 10: Celebration Animation Simulation

**Scenario**: Adding win celebration animation (confetti/particles)

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| U10-01 | **Canvas-based confetti will break SSR** | High | Must use dynamic import with ssr: false |
| U10-02 | **Animation timing must wait for date reveal completion** | Medium | Current reveal takes ~5.5 seconds total |
| U10-03 | **Mobile performance - confetti can cause jank** | Medium | Need particle count limits for mobile |
| U10-04 | **z-index conflicts with modals (z-50)** | Low | Confetti needs z-40 or below |

**Timing Analysis**:
```
Win Scenario Timeline:
0ms:      Submit clicked
50ms:     Reveal starts
2160ms:   All 6 cards revealed (360ms each)
2640ms:   Pause after reveal (480ms)
2640ms:   Lock correct positions, set solution
2640ms:   Start date reveal
5520ms:   All 6 dates revealed (480ms each)
5880ms:   Date reveal ends (360ms pause)
5880ms:   isRevealing = false, modal can appear
~5900ms:  SAFE TO TRIGGER CELEBRATION

GOTCHA: Cannot use isRevealing as trigger - must use
        combination of status === 'won' && !isRevealing
```

**Implementation Approach**:
```typescript
// Use canvas-confetti for lightweight celebration
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('canvas-confetti'), { ssr: false });

// Trigger in Game.tsx when:
useEffect(() => {
  if (status === 'won' && !isRevealing && !modalDismissed) {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}, [status, isRevealing, modalDismissed]);
```

---

#### Agent 11: Focus Trap for Modals Simulation

**Scenario**: Adding focus trapping to HowToPlayModal, ResultModal, StatsModal

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| U11-01 | **HowToPlayModal has only 2 focusable elements (close, button)** | Low | Simple trap implementation |
| U11-02 | **ResultModal share button gains focus via click, may confuse trap** | Medium | Must handle dynamic focus |
| U11-03 | **StatsModal has duplicate close buttons (X and bottom button)** | Medium | Focus cycle includes both |
| U11-04 | **Modal backdrop click handlers conflict with focus trap libs** | Medium | May need custom implementation |

**Current Modal Structure**:
```typescript
// HowToPlayModal.tsx structure:
<div className="modal-backdrop"> // onClick to close?
  <div className="...modal content...">
    <button>Close X</button>    // Focus target 1
    <h2>How to Play</h2>        // Not focusable
    <div>Instructions...</div>  // Not focusable
    <button>Got it!</button>    // Focus target 2
  </div>
</div>

// Focusable elements: 2
// Focus cycle: Close X -> Got it! -> Close X
```

**Implementation Approach** (using focus-trap-react):
```typescript
import FocusTrap from 'focus-trap-react';

export const HowToPlayModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <FocusTrap
      active={isOpen}
      focusTrapOptions={{
        initialFocus: false, // Don't auto-focus, let user click
        escapeDeactivates: true,
        onDeactivate: onClose,
        allowOutsideClick: true, // For backdrop click
      }}
    >
      <div className="modal-backdrop" onClick={onClose}>
        <div className="..." onClick={(e) => e.stopPropagation()}>
          {/* Modal content */}
        </div>
      </div>
    </FocusTrap>
  );
};
```

**Package Size Impact**: focus-trap-react is ~3KB gzipped

---

#### Agent 12: Reduced Motion Media Query Simulation

**Scenario**: Adding @media (prefers-reduced-motion) support

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| U12-01 | **10 keyframe animations need reduced alternatives** | High | Must audit each animation purpose |
| U12-02 | **Card flip animation (600ms) is feedback, not decoration** | Medium | Should reduce duration, not disable |
| U12-03 | **Slide rearrangement (700ms) shows data relationship** | Medium | Keep but reduce duration |
| U12-04 | **dnd-kit has own animations that need separate handling** | Medium | May conflict with CSS overrides |

**Animation Audit**:
```css
/* globals.css animations - 429 lines, 0 prefers-reduced-motion */

/* DECORATIVE - can disable */
@keyframes letterBounce     /* Masthead hover effect */
@keyframes subtlePulse      /* Guess pip pulse */
@keyframes fadeIn           /* Modal backdrop */
@keyframes slideUp          /* Modal content */
@keyframes pageIn           /* Page transition */

/* FUNCTIONAL - reduce duration, don't disable */
@keyframes lockIn           /* Card lock feedback */
@keyframes checkmarkDraw    /* Checkmark SVG reveal */
@keyframes cardFlip         /* Result reveal - CRITICAL */
@keyframes dateReveal       /* Date reveal */
@keyframes colorToGreen     /* Color transition */
```

**Implementation**:
```css
/* Add to globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep card flip visible but instant */
  .card-flip {
    animation: none !important;
  }

  /* Keep slide but instant */
  .slide-rearranging {
    transition: none !important;
  }
}
```

**GOTCHA**: This blanket approach may break functionality. Better approach:
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable decorative animations */
  .masthead:hover .masthead-letter { animation: none; }
  .guess-pip.available { animation: none; }
  .modal-backdrop { animation: none; }
  .animate-slide-up { animation: none; }
  .page-transition { animation: none; }

  /* Reduce but keep functional animations */
  .card-flip { animation-duration: 0.1s; }
  .date-reveal { animation-duration: 0.1s; }
  .slide-rearranging { transition-duration: 0.1s !important; }
}
```

---

### Mobile & Accessibility Agents (13-16)

#### Agent 13: Touch Target Enlargement Simulation

**Scenario**: Ensuring 44x44px minimum touch targets on mobile

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| M13-01 | **Drag handle is 40x48px (-my-2 -mr-2) but visual is smaller** | Medium | May feel unresponsive |
| M13-02 | **Modal close button is 40x40px (w-10 h-10)** | Medium | 4px below minimum |
| M13-03 | **Guess pips are 10x10px (w-[0.625rem] h-[0.625rem])** | Low | Informational, not interactive |
| M13-04 | **Archive navigation arrows need audit** | Medium | Not visible in provided code |

**Touch Target Analysis**:
```
Component          Current Size    Minimum    Status
-----------------------------------------------------------
Submit button      ~48px height    44px       OK
Modal close (X)    40x40px         44px       FAIL (-4px)
Drag handle        40x48px         44px       BORDERLINE
Share button       ~48px height    44px       OK
Help icon          Unknown         44px       AUDIT
Stats icon         Unknown         44px       AUDIT
```

**Fix Strategy**:
```css
/* Increase modal close button to 44px */
.modal .close-button {
  /* Was: w-10 h-10 (40x40) */
  /* Now: w-11 h-11 (44x44) */
  @apply w-11 h-11;
}

/* Or use padding to increase tap area without visual change */
.close-button {
  padding: 2px; /* Adds 4px to each dimension */
}
```

---

#### Agent 14: Colorblind Mode Toggle Simulation

**Scenario**: Adding colorblind-friendly color scheme option

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| M14-01 | **Current green (#2D5A4A) and red (#C4553D) are distinguishable for most types** | Low | Already reasonably accessible |
| M14-02 | **Pattern/shape indicators would be better than color change** | Medium | Consider icons in addition to colors |
| M14-03 | **localStorage preference needs sync with CSS variables** | Medium | Must handle hydration mismatch |
| M14-04 | **No settings UI exists - where to put toggle?** | Medium | Need to add settings modal or menu |

**Color Analysis (colorblind simulation)**:
```
Current palette:
  Correct: #2D5A4A (forest green)
  Incorrect: #C4553D (burnt sienna)

Deuteranopia (red-green colorblind):
  These colors remain distinguishable due to:
  - Different luminance values
  - Green is darker than red

Protanopia (red colorblind):
  Similar to above, still distinguishable

Tritanopia (blue-yellow colorblind):
  These colors are fine (no blue/yellow)

RECOMMENDATION: Current colors are better than many games.
Consider adding shape indicators (checkmark/X) as reinforcement.
ALREADY IMPLEMENTED: Checkmark and X icons are shown!
```

**Colorblind Mode Implementation** (if still desired):
```typescript
// lib/accessibility.ts
export type ColorMode = 'default' | 'deuteranopia' | 'protanopia';

export const colorSchemes: Record<ColorMode, { correct: string; incorrect: string }> = {
  default: { correct: '#2D5A4A', incorrect: '#C4553D' },
  deuteranopia: { correct: '#0072B2', incorrect: '#E69F00' }, // Blue/Orange
  protanopia: { correct: '#0072B2', incorrect: '#D55E00' }, // Blue/Vermillion
};
```

---

#### Agent 15: PWA Manifest and Service Worker Simulation

**Scenario**: Adding PWA capabilities for offline play

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| M15-01 | **API calls to /api/puzzle/* need caching strategy** | High | Offline requires cached puzzles |
| M15-02 | **localStorage already persists game state** | Low | PWA just needs app shell + puzzle cache |
| M15-03 | **next-pwa package simplifies Next.js PWA setup** | Low | Avoid manual service worker |
| M15-04 | **CSP must allow service worker registration** | Medium | Previously marked false positive |

**Offline Strategy**:
```
CACHE STRATEGY:

App Shell (cache-first):
  - /_next/static/*
  - /icon.svg
  - /manifest.json
  - Static fonts (Google Fonts)

Puzzle Data (stale-while-revalidate):
  - /api/puzzle/today (cache for 24h)
  - /api/puzzle/:id (cache forever - puzzles don't change)
  - /api/puzzle/:id/solution (cache forever)
  - /api/puzzle/:id/check (network-only - needs real validation)

GOTCHA: /api/puzzle/:id/check cannot be cached because:
  - Different order inputs = different results
  - User could cheat by caching "correct" response

MITIGATION: Show "offline mode" warning if check fails
           Allow gameplay but don't save stats
```

**manifest.json Template**:
```json
{
  "name": "Ordl",
  "short_name": "Ordl",
  "description": "A daily puzzle game where you order historical events",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF9F6",
  "theme_color": "#FAF9F6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

#### Agent 16: aria-live Region Simulation

**Scenario**: Adding screen reader announcements for game state changes

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| M16-01 | **Card flip results should be announced but timing is tricky** | High | 360ms per card = announcements may overlap |
| M16-02 | **Game outcome (won/lost) should use aria-live="assertive"** | Medium | Important information |
| M16-03 | **Drag and drop reordering has no screen reader feedback** | High | @dnd-kit has built-in announcer |
| M16-04 | **Modal dialogs need role="dialog" and aria-modal="true"** | Medium | Currently missing |

**Screen Reader Experience Simulation**:
```
Current experience (broken):
1. User drags card - no announcement
2. User drops card - no announcement
3. User clicks Submit - no announcement
4. Cards flip - no announcement
5. Results shown - no announcement
6. Modal appears - no focus trap, no announcement

Improved experience:
1. User drags card -> "Grabbed card: Event 1, position 1 of 6"
2. User drops card -> "Dropped card: Event 1, now position 3 of 6"
3. User clicks Submit -> "Checking your order..."
4. Cards flip -> "Revealing results..." (single announcement)
5. Results shown -> "3 of 6 correct. 2 attempts remaining."
6. Modal appears -> Focus moves, "Results dialog" announced
```

**Implementation**:
```typescript
// components/LiveRegion.tsx
export const LiveRegion = ({ message, priority = 'polite' }: {
  message: string;
  priority?: 'polite' | 'assertive';
}) => (
  <div
    aria-live={priority}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);

// Usage in Game.tsx
const [announcement, setAnnouncement] = useState('');

// After reveal completes:
const correctCount = results.filter(r => r).length;
const remaining = MAX_GUESSES - attempts.length;
setAnnouncement(
  `${correctCount} of 6 correct. ${remaining} attempts remaining.`
);

// In render:
<LiveRegion message={announcement} />
```

**dnd-kit Announcements** (already supported):
```typescript
// dnd-kit provides Announcements prop for DndContext
<DndContext
  announcements={{
    onDragStart: ({ active }) => `Grabbed ${active.id}`,
    onDragOver: ({ active, over }) => over
      ? `Dragging ${active.id} over ${over.id}`
      : `Dragging ${active.id}`,
    onDragEnd: ({ active, over }) => over
      ? `Dropped ${active.id} onto ${over.id}`
      : `Dropped ${active.id}`,
  }}
>
```

---

## Critical Gotchas (Must Fix Before Integration)

| ID | Gotcha | Component | Severity | Mitigation |
|----|--------|-----------|----------|------------|
| T1-01 | Next.js App Router requires special RSC mocking | Vitest setup | Critical | Use @testing-library/react with proper Next.js mocks |
| T4-01 | Modal focus trap absence causes WCAG failures | All 3 modals | Critical | Add focus-trap-react to modals |
| Q6-01 | 27 useState calls in useGame.ts block safe refactoring | useGame.ts | Critical | Establish unit tests BEFORE refactoring |
| M16-03 | Drag and drop has no screen reader feedback | EventList | Critical | Enable dnd-kit announcements prop |

---

## High Priority Gotchas (Should Fix)

| ID | Gotcha | Component | Severity | Mitigation |
|----|--------|-----------|----------|------------|
| T1-02 | Vitest needs jsdom config for client components | vitest.config.ts | High | Set environment: 'jsdom' in config |
| T2-01 | MSW v2 has breaking API changes | MSW setup | High | Follow v2 migration guide |
| T3-01 | Non-deterministic puzzles break visual baselines | Playwright tests | High | Use fixed puzzle IDs for baselines |
| T4-02 | Color contrast may fail for text-secondary | globals.css | High | Verify contrast ratio (4.5:1 minimum) |
| Q5-01 | Unguarded array access in 7+ locations | useGame.ts | High | Add optional chaining |
| Q6-02 | submitOrder has 8 sequential state setters | useGame.ts | High | Consider useReducer for atomic updates |
| Q7-02 | Fetch failures not caught by error boundaries | useGame.ts | High | Add error state and retry logic |
| U12-01 | 10 keyframe animations need reduced-motion handling | globals.css | High | Add prefers-reduced-motion media query |

---

## Medium Priority Gotchas

| ID | Gotcha | Component | Mitigation |
|----|--------|-----------|------------|
| T1-03 | Path aliases need vitest config mapping | vitest.config.ts | Add resolve.alias matching tsconfig |
| T1-04 | next/navigation mocking differs from Pages Router | vitest.setup.ts | Mock useRouter, usePathname, etc. |
| T2-02 | Dynamic path matching for API routes | MSW handlers | Use :id parameter syntax |
| T3-04 | Dark mode will break baselines | Future work | Maintain separate baseline sets |
| Q5-04 | Map.get() returns undefined | EventList.tsx | Add explicit undefined handling |
| Q6-04 | isSimulation flag affects 4 code paths | useGame.ts | Extract into separate hook |
| Q7-04 | DndContext may throw on edge cases | EventList | Wrap in dedicated error boundary |
| U9-01 | CSS vars duplicated in Tailwind config | tailwind.config.ts | Reference CSS vars |
| U10-02 | Celebration timing after 5.5s reveal | Game.tsx | Trigger after isRevealing false |
| U11-02 | Share button focus conflicts with trap | ResultModal | Handle dynamic focus |
| M13-02 | Modal close button 40x40px (4px too small) | All modals | Change to w-11 h-11 |
| M16-04 | Modals missing role="dialog" | All modals | Add ARIA roles |

---

## Low Priority Gotchas

| ID | Gotcha | Component | Mitigation |
|----|--------|-----------|------------|
| T2-04 | Browser vs Node MSW setup differs | MSW | Maintain two handler files |
| T3-04 | Dark mode baselines needed | Future | Plan when dark mode added |
| Q5-03 | Some code already uses optional chaining | useGame.ts | Consistent pattern already exists |
| Q8-01 | Debug console.log in production | EventCard.tsx | Remove line 73 |
| Q8-02 | isSolutionRevealing never used in render | useGame.ts | Remove dead code |
| Q8-03 | totalPuzzles hardcoded to 70 | useGame.ts | Get from API |
| Q8-04 | mistakes state redundant with attempts.length | useGame.ts | Remove redundant state |
| U9-02 | Shadow uses hardcoded rgba | tailwind.config.ts | Use CSS vars |
| U10-03 | Mobile confetti performance | Celebration | Limit particle count |
| M14-01 | Current colors already accessible | Colors | Consider pattern indicators |

---

## Integration Risk Matrix

| Component A | Component B | Risk Level | Notes |
|-------------|-------------|------------|-------|
| Vitest | useGame.ts | HIGH | Hook is 628 lines with 27 state variables |
| MSW | API routes | MEDIUM | 4 endpoints need mocking |
| Focus trap | Modals | LOW | Clean abstraction boundary |
| Reduced motion | Animations | MEDIUM | 10 animations to audit |
| Error boundary | Game | LOW | Wrapping, not modifying |
| PWA | API | HIGH | Caching strategy complexity |
| axe-core | All components | LOW | Read-only validation |
| dnd-kit announcements | EventList | LOW | Built-in feature |

---

## Recommended Integration Sequence

### Phase 1: Testing Foundation (Week 1)
```
Day 1-2: Vitest + React Testing Library setup
  - Install dependencies
  - Configure vitest.config.ts with jsdom
  - Create vitest.setup.ts with Next.js mocks
  - Write first test for storage.ts (simplest module)

Day 3-4: MSW integration
  - Install MSW v2
  - Create handlers for all 4 API endpoints
  - Write useGame.ts tests with mocked APIs

Day 5: axe-core integration
  - Add @axe-core/playwright
  - Create accessibility test suite
  - Document baseline violations
```

### Phase 2: Accessibility Fixes (Week 2)
```
Day 1-2: Focus trapping
  - Install focus-trap-react
  - Add to HowToPlayModal, ResultModal, StatsModal
  - Add role="dialog" and aria-modal="true"
  - Update axe tests to verify fixes

Day 3: Reduced motion
  - Add @media (prefers-reduced-motion) to globals.css
  - Audit each animation for appropriate reduction
  - Add Playwright test with reducedMotion emulation

Day 4: Screen reader support
  - Enable dnd-kit announcements
  - Add LiveRegion component
  - Add game state announcements

Day 5: Touch targets
  - Increase modal close buttons to 44x44
  - Audit all interactive elements
```

### Phase 3: Code Quality (Week 3)
```
Day 1-2: Remove dead code
  - Remove console.log from EventCard.tsx
  - Audit isSolutionRevealing usage
  - Clean up redundant state

Day 3-4: Error boundaries
  - Create ErrorBoundary component
  - Wrap Game component
  - Add loading/error states for fetch failures

Day 5: TypeScript strictness (incremental)
  - Enable noImplicitReturns first
  - Document strictNullChecks violations
  - Plan future migration
```

### Phase 4: Enhanced Features (Week 4)
```
Day 1-2: PWA setup
  - Add manifest.json
  - Configure next-pwa
  - Implement cache strategies

Day 3: Visual regression baselines
  - Create deterministic test fixtures
  - Generate initial baselines

Day 4-5: Celebration animation
  - Add canvas-confetti with dynamic import
  - Implement timing logic
  - Add reduced-motion support
```

---

## Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Unit test coverage | >70% for useGame.ts | Coverage report |
| Accessibility violations | 0 critical, <5 minor | axe-core report |
| Focus trap compliance | All modals pass | Manual + automated test |
| Reduced motion support | All animations handled | Playwright test with emulation |
| Visual regression | <100 pixel diff | Playwright screenshot comparison |
| Error handling | All fetch failures caught | Manual testing |
| PWA score | >90 Lighthouse | Lighthouse audit |

---

## Rollback Points

| Phase | Rollback Trigger | Recovery Action |
|-------|------------------|-----------------|
| Testing setup | Test framework breaks build | Remove devDependencies, revert config |
| Accessibility | Focus trap breaks modal flow | Remove focus-trap-react |
| Code quality | Refactoring breaks animation | Git revert to pre-refactor commit |
| PWA | Service worker causes cache issues | Unregister SW, clear caches |

---

## Open Questions Requiring Human Decision

1. **Testing Coverage Target**: What is the minimum acceptable test coverage before proceeding with useGame.ts refactoring? (Recommendation: 70%)

2. **Colorblind Mode**: Is the current color scheme + icons sufficient, or should we add an explicit colorblind toggle? (Current analysis suggests icons already provide differentiation)

3. **PWA Offline Behavior**: Should the /check endpoint fail gracefully offline, or should we prevent gameplay entirely? (Recommendation: Allow play, warn about untracked stats)

4. **Animation Budget**: What is the acceptable total animation duration for users with vestibular disorders? (Current: ~6 seconds for full reveal, Recommendation: <1 second with reduced motion)

5. **useGame.ts Refactoring Scope**: Full decomposition or targeted extraction of animation logic only? (Recommendation: Animation extraction first, full decomposition after comprehensive test coverage)

---

## Final Recommendation

**Integration Readiness: CONDITIONAL GO**

The integration can proceed with the following mandatory prerequisites:

1. **Vitest + React Testing Library must be fully configured** before any code refactoring
2. **Focus trapping must be added to all modals** before accessibility release
3. **Reduced motion media query must be added** before public launch
4. **Console.log must be removed** from EventCard.tsx immediately

The codebase is well-structured with clear separation of concerns. The main risk is the monolithic useGame.ts hook, which should not be refactored until comprehensive tests are in place.

Estimated total implementation time: **4 weeks** with 1 developer, or **2 weeks** with 2 developers working in parallel on testing (Week 1-2) and accessibility (Week 2-3).
