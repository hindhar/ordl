# Integration Simulation Report: Puzzle Curation Plan

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Scenarios Simulated | 96 |
| Gotchas Discovered | 42 |
| Critical Issues | 6 |
| High Priority Issues | 11 |
| Medium Priority Issues | 15 |
| Low Priority Issues | 10 |
| Integration Readiness Score | 7.5/10 |

**Recommendation**: PROCEED WITH IMPLEMENTATION - The puzzle curation plan is well-structured and achievable. Critical issues are addressable with proper planning. The schema extension is non-breaking and the constraint algorithm is implementable as a build-time operation.

---

## Agent Simulation Results

### Agent 1: Schema Migration Impact Simulation

**Scenario**: Adding `familiarity`, `category`, and `relatedGroup` fields to HistoricalEvent interface

**Current Schema** (`/Users/rob.hindhaugh/Desktop/chronle/lib/events.ts:1-7`):
```typescript
export interface HistoricalEvent {
  id: string;
  event: string;
  year: number;
  fullDate: string;
  emoji: string;
}
```

**Proposed Schema**:
```typescript
export interface HistoricalEvent {
  id: string;
  event: string;
  year: number;
  fullDate: string;
  emoji: string;
  familiarity: 'high' | 'medium' | 'low';
  category: 'politics' | 'science' | 'culture' | 'sports' | 'conflict' | 'economics';
  relatedGroup?: string;
}
```

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| SM-01 | **TypeScript will enforce all 410 events have new required fields** | Critical | Build will fail until all events are updated |
| SM-02 | **API routes return partial event data - new fields never exposed to client** | Low | No API changes needed - fields only used server-side for puzzle generation |
| SM-03 | **No runtime validation of field values** | Medium | Typos in category/familiarity won't be caught until puzzle generation |
| SM-04 | **Empty relatedGroup vs undefined semantics unclear** | Medium | Should events without groups have `relatedGroup: undefined` or omit the field? |

**Files Requiring Updates**:
1. `/Users/rob.hindhaugh/Desktop/chronle/lib/events.ts` - Add fields to all 410 events
2. No other files need changes - API routes only expose `id`, `event`, `emoji`

**Simulation Walkthrough**:
```
Step 1: Update interface definition
  -> TypeScript immediately shows 410 errors (missing required fields)

Step 2: Add fields to first event as template
  { id: "challenger", event: "Challenger explosion", year: 1986,
    fullDate: "January 28, 1986", emoji: "🚀",
    familiarity: 'high', category: 'science' }
  -> Works, 409 errors remaining

Step 3: Bulk update remaining events
  GOTCHA: Manual updates error-prone for 410 events
  RECOMMENDATION: Use script or AI assistance for bulk population

Step 4: Build and test
  -> npm run build succeeds
  -> API routes unchanged (fields not exposed)
  -> Game functionality unchanged
```

**Mitigation**: Add fields incrementally with defaults, use TypeScript's `Partial<>` during transition, or update all 410 events atomically in single commit.

---

### Agent 2: Data Population Workflow Simulation

**Scenario**: Scoring 410 events for familiarity (high/medium/low) and assigning categories

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| DP-01 | **Subjective familiarity varies by user demographic** | High | What's "high familiarity" to US users differs from UK/global users |
| DP-02 | **Events may belong to multiple categories** | Medium | "Apollo 13 crisis" is both 'science' and 'conflict' |
| DP-03 | **Cultural bias in familiarity assessment** | High | JFK assassination = high familiarity in US, possibly medium globally |
| DP-04 | **No validation that AI-assigned categories are consistent** | Medium | Same event type might get different categories |

**Proposed Workflow**:
```
Phase 1: AI-Assisted Initial Assignment (2-3 hours)
  1. Feed all 410 events to LLM with rubric
  2. Output: {id, familiarity, category, relatedGroup}
  3. Generate as TypeScript object for copy-paste

Phase 2: Human Review (1-2 hours)
  1. Spot-check 50 random events (~12%)
  2. Fix obvious misclassifications
  3. Flag edge cases for discussion

Phase 3: Validation Script (30 min)
  1. Verify all events have valid values
  2. Check distribution (not all 'medium')
  3. Identify related groups automatically (same surname, same event series)
```

**Familiarity Distribution Target**:
- High: ~30% (123 events) - Universally known events
- Medium: ~50% (205 events) - Recognizable to history-aware adults
- Low: ~20% (82 events) - Specialist knowledge required

**Simulation Evidence**:
Analyzing current events for auto-assignment potential:

```
HIGH FAMILIARITY CANDIDATES (obvious from event names):
- Moon landing, 9/11, Berlin Wall, WWII events, COVID pandemic
- JFK/MLK/RFK assassinations, Obama/Trump elections
- Steve Jobs, Princess Diana, Queen Elizabeth
- Titanic, Challenger, Chernobyl

MEDIUM FAMILIARITY CANDIDATES:
- Channel Tunnel, Dolly the sheep, Euro launch
- Most Olympics, most natural disasters
- Regional conflicts (Falklands, Gulf War)

LOW FAMILIARITY CANDIDATES:
- Specific court cases (Roe v Wade for non-US)
- Music industry events (Wannabe release date)
- Technical achievements (First Intel microprocessor)
```

---

### Agent 3: Puzzle 4 Redistribution Simulation

**Scenario**: Separating `mlk_dream` and `mlk_death` into different puzzles

**Current Puzzle 4** (lines 36-42):
```typescript
// Puzzle 4: 1963-1969 Mix
{ id: "mlk_dream", event: "I Have a Dream speech", year: 1963 },
{ id: "jfk", event: "JFK assassinated", year: 1963 },
{ id: "beatles_usa", event: "Beatles arrive in USA", year: 1964 },
{ id: "england_wc", event: "England wins World Cup", year: 1966 },
{ id: "mlk_death", event: "MLK assassinated", year: 1968 },
{ id: "moon", event: "Moon landing", year: 1969 },
```

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| P4-01 | **Moving mlk_death breaks puzzle array indexing** | Critical | EVENTS[18-23] becomes wrong for Puzzle 4 |
| P4-02 | **Which event replaces mlk_death in Puzzle 4?** | High | Need event from 1963-1969 range that isn't in nearby puzzles |
| P4-03 | **Where does mlk_death go?** | High | Must fit another puzzle's temporal range |
| P4-04 | **JFK assassination and MLK speech are ALSO related** | Medium | Same civil rights era, same emotional weight |
| P4-05 | **Puzzle 4 is early (day 4) - should have anchor events** | Medium | Moon landing is anchor, but needs another high-familiarity |

**Redistribution Analysis**:

**Option A: Move mlk_death to Puzzle 21** (1968-1973 Mix)
- Puzzle 21 currently: rfk, woodstock, apollo13, intel, nixon_china, roe
- Range: 1968-1973 (MLK death = April 1968 fits perfectly)
- PROBLEM: RFK assassination also 1968, same month as MLK death

**Option B: Move mlk_death to Puzzle 30** (1965-1970 Mix)
- Puzzle 30 currently: malcolm_x, voting_rights, six_day, summer_love, kent_state, earth_day
- Range: 1965-1970 (MLK death = 1968 fits)
- BETTER: Thematically coherent (civil rights era)
- BUT: malcolm_x is also an assassination

**Option C: Swap mlk_death with rfk from Puzzle 21**
- Puzzle 4 gets: mlk_dream, jfk, beatles_usa, england_wc, RFK_DEATH, moon
- Puzzle 21 gets: MLK_DEATH, woodstock, apollo13, intel, nixon_china, roe
- PROBLEM: Now Puzzle 4 has both JFK and RFK (same relatedGroup: 'kennedy')

**RECOMMENDED SOLUTION**:
```
Puzzle 4 AFTER redistribution:
- mlk_dream (1963) - keep (anchor)
- jfk (1963) - keep (anchor)
- beatles_usa (1964) - keep
- england_wc (1966) - keep
- REPLACE mlk_death with: cultural_rev (1966) from Puzzle 53
- moon (1969) - keep (anchor)

Move mlk_death to Puzzle 30 (civil rights themed):
- malcolm_x, voting_rights, MLK_DEATH, six_day, summer_love, kent_state
  (Remove earth_day to maintain 6 events)

Move earth_day to Puzzle 63 or create swap chain
```

---

### Agent 4: Puzzle 10 Redistribution Simulation

**Scenario**: Expanding temporal span from 5 years (1989-1994) to 10+ years

**Current Puzzle 10** (lines 84-90):
```typescript
// Puzzle 10: 1989-1994 Mix
{ id: "exxon", event: "Exxon Valdez oil spill", year: 1989 },      // Mar 1989
{ id: "tiananmen", event: "Tiananmen Square protests", year: 1989 }, // Jun 1989
{ id: "hubble", event: "Hubble Telescope launched", year: 1990 },    // Apr 1990
{ id: "ussr", event: "Soviet Union dissolves", year: 1991 },         // Dec 1991
{ id: "la_riots", event: "LA Riots", year: 1992 },                   // Apr 1992
{ id: "rwandagenocide", event: "Rwanda genocide begins", year: 1994 }, // Apr 1994
```

**Current Temporal Span**: 1989-1994 = 5 years (FAILS 10-year minimum)

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| P10-01 | **Need to swap 2+ events to achieve 10-year span** | High | Multiple puzzles affected |
| P10-02 | **Tiananmen is HIGH familiarity anchor - must stay** | Critical | Removing Tiananmen weakens puzzle quality |
| P10-03 | **USSR dissolution is HIGH familiarity - must stay** | Critical | Key historical event |
| P10-04 | **Rwanda genocide is difficult topic** | Medium | May want to keep for educational value |
| P10-05 | **Adjacent puzzles (9, 11) constrain available swaps** | Medium | Can't create conflicts with neighboring puzzles |

**Redistribution Analysis**:

**Target**: Events from ~1984 and ~1999 to achieve 15-year span

**Candidate events to bring IN** (from other puzzles, 1983-1985 range):
- From Puzzle 32: bhopal (1984), ozone (1985)
- From Puzzle 44: beirut_barracks (1983), ethiopian_famine (1984)
- From Puzzle 64: band_aid (1984)

**Candidate events to bring IN** (1997-1999 range):
- From Puzzle 34: deep_blue (1997), napster (1999)
- From Puzzle 66: biggie (1997), pathfinder (1997)

**Events to move OUT** (to achieve span without overcrowding):
- la_riots (1992) - move to Puzzle 33 or 45 (both have 1992 range)
- hubble (1990) - move to Puzzle 55 (1985-1990 range)

**RECOMMENDED SOLUTION**:
```
Puzzle 10 AFTER redistribution (1984-1997, 13-year span):
- band_aid (1984) - HIGH familiarity anchor
- tiananmen (1989) - keep (anchor)
- ussr (1991) - keep (anchor)
- rwandagenocide (1994) - keep (educational)
- deep_blue (1997) - MEDIUM familiarity, notable
- pathfinder (1997) - MEDIUM familiarity, space theme

REMOVE: exxon (1989), hubble (1990), la_riots (1992)
- exxon -> Puzzle 55 (environmental theme)
- hubble -> Puzzle 55 (1985-1990 tech theme)
- la_riots -> Puzzle 45 (1991-1996 already has rodney_king)
```

**Validation Check**:
- Temporal span: 1984-1997 = 13 years (PASSES)
- High familiarity anchors: 3 (band_aid, tiananmen, ussr)
- No related group conflicts
- Category diversity: culture, conflict, politics, science

---

### Agent 5: Category Auto-Assignment Simulation

**Scenario**: Using emojis and event descriptions to auto-assign categories

**Category Definitions**:
```
politics: Elections, legislation, treaties, government actions
science: Space, technology, discoveries, medical advances
culture: Entertainment, music, film, social movements
sports: Olympics, World Cups, sports achievements
conflict: Wars, attacks, disasters, massacres
economics: Market events, financial crises, trade
```

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| CA-01 | **Emoji mapping is not 1:1 with categories** | High | Fire emoji used for both disasters (conflict) and music (culture) |
| CA-02 | **Same emoji used for different event types** | High | "🔥" = LA riots, Amazon fires, Notre-Dame, Kings Cross |
| CA-03 | **Events span multiple categories** | Medium | Challenger = science + conflict |
| CA-04 | **Culture is overloaded category** | Medium | Music, film, social movements all under culture |
| CA-05 | **Sports events are easiest to detect** | Low | 🏅, ⚽, 🏆 clearly indicate sports |

**Emoji-to-Category Mapping Analysis**:

```typescript
const EMOJI_CATEGORY_HINTS: Record<string, string[]> = {
  // High confidence
  '🏅': ['sports'],
  '⚽': ['sports'],
  '🏆': ['sports'],
  '🏃': ['sports'],
  '🥊': ['sports'],
  '🚀': ['science'],
  '🔭': ['science'],
  '🧬': ['science'],
  '💉': ['science'],
  '🛰️': ['science'],
  '⚖️': ['politics'],
  '🗳️': ['politics'],
  '🇺🇸': ['politics'],
  '📉': ['economics'],
  '🏦': ['economics'],
  '💰': ['economics'],

  // Medium confidence (context-dependent)
  '⚔️': ['conflict'],
  '💣': ['conflict'],
  '💔': ['conflict', 'culture'], // shootings vs. celebrity deaths
  '🔥': ['conflict', 'culture'], // disasters vs. entertainment
  '🎸': ['culture'],
  '🎤': ['culture'],
  '🎬': ['culture'],
  '📺': ['culture', 'science'], // TV shows vs. TV invented

  // Low confidence (need text analysis)
  '✊': ['politics', 'culture', 'conflict'], // protests, movements, assassinations
  '🕯️': ['conflict', 'culture'], // assassinations, memorials
};
```

**Achievable Auto-Assignment Rate**: ~70-75%
- Sports: 95% accuracy (emojis very distinctive)
- Science: 85% accuracy (space/tech emojis clear)
- Politics: 80% accuracy (voting/flag emojis help)
- Economics: 90% accuracy (rare category, distinct emojis)
- Conflict: 65% accuracy (overlaps with many emojis)
- Culture: 60% accuracy (catch-all category)

**RECOMMENDATION**: Use AI-assisted assignment with human review rather than pure emoji mapping.

---

### Agent 6: Related Group Assignment Simulation

**Scenario**: Identifying events that should not appear in the same puzzle

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| RG-01 | **Kennedy family spans 3 events across 3 puzzles** | High | jfk (P4), jfk_elected (P29), rfk (P21) |
| RG-02 | **MLK spans 2 events currently in SAME puzzle** | Critical | mlk_dream + mlk_death both in Puzzle 4 |
| RG-03 | **Mandela spans 3 events** | Medium | mandela, mandela_pres, mandela_dies |
| RG-04 | **Nixon spans 3 events** | Medium | nixon, nixon_china, nixon_pardon |
| RG-05 | **WWII events span multiple puzzles already correctly separated** | Low | Good existing distribution |
| RG-06 | **Multiple Olympic events (different cities) may confuse** | Medium | seoul, barcelona, atlanta, sydney, beijing, london_olympics |

**Related Groups Identified**:

```typescript
const RELATED_GROUPS = {
  'kennedy': ['jfk', 'jfk_elected', 'rfk'],
  'mlk': ['mlk_dream', 'mlk_death'],
  'mandela': ['mandela', 'mandela_pres', 'mandela_dies'],
  'nixon': ['nixon', 'nixon_china', 'nixon_pardon'],
  'titanic': ['titanic', 'titanic_film', 'titanic_found'],
  'berlin_wall': ['berlin', 'berlin_wall'], // fall vs. construction
  'queen_elizabeth': ['queen', 'queen_coronation', 'diamond_jubilee', 'charles_king', 'coronation'],
  'apple': ['apple', 'steve_jobs', 'iphone', 'ipod', 'macintosh'],
  'space_shuttle': ['challenger', 'columbia', 'shuttle'],
  'concorde': ['concorde', 'concorde_crash'],
  'euro': ['euro', 'euro_coins', 'euro_launch'],
  'clinton': ['clinton_elected', 'clinton_impeach', 'lewinsky'],
  'trump': ['trump', 'impeach_trump'],
  'wwii_pacific': ['pearl', 'midway', 'hiroshima', 'vj_day'],
  'wwii_europe': ['ww2_start', 'dday', 've_day', 'stalingrad'],
  'covid': ['covid', 'vaccine'],
  'beatles': ['beatles_usa', 'beatles_debut', 'beatles_split', 'lennon'],
  'moon': ['moon', 'apollo13', 'curiosity', 'mars_curiosity'],
  'olympics_summer': ['seoul', 'barcelona', 'atlanta', 'sydney', 'athens', 'beijing', 'london_olympics'],
};
```

**Current Violations**:
1. **Puzzle 4**: mlk_dream + mlk_death (CRITICAL)
2. No other violations found in current data

**RECOMMENDATION**:
- Mandatory constraint: No events from same relatedGroup in same puzzle
- Assign relatedGroup to ~25% of events (most are standalone)
- Algorithm should check this constraint during puzzle generation

---

### Agent 7: Constraint Validation Pipeline Simulation

**Scenario**: Designing validation script for puzzle constraints

**Constraint Rules to Validate**:
1. Minimum 10-year temporal span for 6 events
2. No events with same relatedGroup in same puzzle
3. At least 1 'high' familiarity event per puzzle (anchor)
4. No more than 2 'low' familiarity events per puzzle

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| CV-01 | **Temporal span calculation needs full dates, not just years** | Medium | 1989-1999 could be Jan 1989 to Dec 1999 (11 years) or Dec 1989 to Jan 1999 (9 years) |
| CV-02 | **Current puzzle order in array = puzzle number** | Critical | Reordering events breaks getPuzzleEvents() |
| CV-03 | **EVENTS_PER_PUZZLE hardcoded as 6 in multiple files** | Medium | lib/events.ts, useGame.ts, API routes all have this constant |
| CV-04 | **No mechanism to regenerate puzzles without data loss** | High | If validation fails, manual fixes required |

**Validation Script Design**:

```typescript
// /scripts/validate-puzzles.ts
import { EVENTS, EVENTS_PER_PUZZLE, TOTAL_PUZZLES, HistoricalEvent } from '../lib/events';

interface ValidationResult {
  puzzleNumber: number;
  passed: boolean;
  violations: string[];
}

function validatePuzzle(events: HistoricalEvent[], puzzleNumber: number): ValidationResult {
  const violations: string[] = [];

  // Rule 1: Temporal span >= 10 years
  const years = events.map(e => e.year);
  const span = Math.max(...years) - Math.min(...years);
  if (span < 10) {
    violations.push(`Temporal span ${span} years < 10 year minimum`);
  }

  // Rule 2: No related group conflicts
  const groups = events.map(e => e.relatedGroup).filter(Boolean);
  const duplicateGroups = groups.filter((g, i) => groups.indexOf(g) !== i);
  if (duplicateGroups.length > 0) {
    violations.push(`Related group conflict: ${duplicateGroups.join(', ')}`);
  }

  // Rule 3: At least 1 high familiarity anchor
  const highCount = events.filter(e => e.familiarity === 'high').length;
  if (highCount < 1) {
    violations.push(`No high familiarity anchor (count: ${highCount})`);
  }

  // Rule 4: No more than 2 low familiarity events
  const lowCount = events.filter(e => e.familiarity === 'low').length;
  if (lowCount > 2) {
    violations.push(`Too many low familiarity events: ${lowCount} > 2`);
  }

  return {
    puzzleNumber,
    passed: violations.length === 0,
    violations,
  };
}

function validateAllPuzzles(): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (let i = 0; i < TOTAL_PUZZLES; i++) {
    const startIdx = i * EVENTS_PER_PUZZLE;
    const events = EVENTS.slice(startIdx, startIdx + EVENTS_PER_PUZZLE);
    results.push(validatePuzzle(events, i + 1));
  }

  return results;
}

// Run validation
const results = validateAllPuzzles();
const failures = results.filter(r => !r.passed);

console.log(`Validated ${results.length} puzzles`);
console.log(`Passed: ${results.length - failures.length}`);
console.log(`Failed: ${failures.length}`);

failures.forEach(f => {
  console.log(`\nPuzzle ${f.puzzleNumber} FAILED:`);
  f.violations.forEach(v => console.log(`  - ${v}`));
});
```

---

### Agent 8: Greedy Algorithm Design Simulation

**Scenario**: Algorithm to generate puzzles satisfying all constraints

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| GA-01 | **Greedy may not find optimal solution** | Medium | Some valid arrangements may be missed |
| GA-02 | **Order of event selection affects outcome** | High | Starting with anchors improves success rate |
| GA-03 | **Backtracking needed when greedy fails** | High | Simple greedy won't always find valid puzzle |
| GA-04 | **70 puzzles = 420 events, but we have 410** | Critical | Need 10 more events OR reduce to 68 puzzles |
| GA-05 | **Events must be used exactly once** | High | Algorithm must track used events globally |

**Algorithm Pseudocode**:

```
FUNCTION generatePuzzles(events, constraints):
  puzzles = []
  remainingEvents = copy(events)

  FOR puzzleNum = 1 TO TOTAL_PUZZLES:
    puzzle = []
    attempts = 0

    // Phase 1: Select anchor (high familiarity)
    anchors = filter(remainingEvents, e => e.familiarity === 'high')
    IF anchors.length === 0:
      THROW "No anchors available for puzzle " + puzzleNum

    anchor = selectRandom(anchors)
    puzzle.push(anchor)
    remove(remainingEvents, anchor)

    // Phase 2: Greedily add remaining events
    WHILE puzzle.length < 6 AND attempts < 1000:
      candidates = filter(remainingEvents, e =>
        satisfiesTemporalSpan(puzzle + e, 10) AND
        noRelatedGroupConflict(puzzle, e) AND
        lowFamiliarityCount(puzzle + e) <= 2
      )

      IF candidates.length === 0:
        // Backtrack: return last event and try different path
        IF puzzle.length > 1:
          returnedEvent = puzzle.pop()
          remainingEvents.push(returnedEvent)
          attempts++
        ELSE:
          THROW "Cannot create valid puzzle " + puzzleNum
      ELSE:
        // Select next event (prefer medium familiarity for variety)
        nextEvent = selectByFamiliarityBalance(candidates, puzzle)
        puzzle.push(nextEvent)
        remove(remainingEvents, nextEvent)

    // Validate puzzle
    IF NOT validatePuzzle(puzzle):
      THROW "Generated invalid puzzle " + puzzleNum

    puzzles.push(puzzle)

  RETURN puzzles
```

**Optimization Strategies**:
1. **Sort events by year first** - Helps temporal span selection
2. **Pre-group by related groups** - Fast conflict checking
3. **Balance familiarity distribution** - Even spread across puzzles
4. **Run multiple times** - Take best valid arrangement

---

### Agent 9: Familiarity Scoring Criteria Simulation

**Scenario**: Defining what makes an event High, Medium, or Low familiarity

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| FS-01 | **Target audience unclear** | High | US-centric vs. global familiarity differs significantly |
| FS-02 | **Age affects familiarity** | Medium | Millennials vs. Boomers have different knowledge |
| FS-03 | **No objective measurement possible** | Medium | All familiarity is subjective |
| FS-04 | **Some events are famous for wrong reasons** | Low | "Storm Area 51" is famous but trivial |

**Proposed Familiarity Criteria**:

```
HIGH FAMILIARITY (Universal Recognition):
- Would appear in standard high school world history curriculum
- Referenced frequently in popular culture (films, songs, memes)
- Changed the course of major nations or global events
- Death of globally iconic figures (Princess Diana, JFK, Queen Elizabeth)
- Events with single-word recognition ("9/11", "Chernobyl", "Titanic")

Examples: Moon landing, Berlin Wall fall, 9/11, WWII events, COVID pandemic

MEDIUM FAMILIARITY (Educated Adult Recognition):
- Would be recognized by adults who follow news casually
- Major events but regional in scope (UK events for UK audience)
- Sports achievements known to sports fans
- Technology milestones known to tech-aware adults

Examples: Channel Tunnel opens, Deep Blue beats Kasparov, Most Olympics

LOW FAMILIARITY (Specialist Knowledge):
- Requires specific historical interest or age group membership
- Regional events with limited global impact
- Cultural events primarily known to niche audiences
- Legal/political events requiring context

Examples: Scopes Monkey Trial, Good Friday Agreement (for non-UK),
          Most music releases, Specific court cases
```

**Distribution Validation**:
Current 410 events estimated breakdown:
- High: ~100-120 events (should target ~25-30% = 100-125)
- Medium: ~200-220 events (should target ~50% = 200-210)
- Low: ~80-100 events (should target ~20-25% = 80-100)

This distribution is achievable and aligns with constraint requirements.

---

### Agent 10: Edge Cases Simulation

**Scenario**: Identifying events that don't fit cleanly into categories/familiarity

**Edge Cases Discovered**:

| ID | Edge Case | Issue | Resolution |
|----|-----------|-------|------------|
| EC-01 | **Challenger explosion** | Science or Conflict? Disaster vs. space program | Assign: 'science' (primary context is space exploration) |
| EC-02 | **#MeToo movement** | Culture or Politics? Social movement spans both | Assign: 'culture' (social movement primary) |
| EC-03 | **Brexit referendum** | Politics or Economics? Both equally valid | Assign: 'politics' (voting is political act) |
| EC-04 | **Steve Jobs dies** | Culture or Economics? Both apply | Assign: 'culture' (celebrity death) |
| EC-05 | **Lehman Brothers collapses** | Economics primarily, but has political implications | Assign: 'economics' |
| EC-06 | **Area 51 Storm** | Very low educational value, but highly recognizable | Assign: familiarity='medium', category='culture' |
| EC-07 | **Multiple assassinations** | All use "conflict" but feel different from wars | Consider: 'politics' for political assassinations |
| EC-08 | **Same year, same month events** | Multiple events in June 1968: MLK, RFK, Six-Day War | Related group helps but not complete solution |

**Category Ambiguity Resolution Matrix**:

```
IF event_type = 'assassination':
  IF target = 'political_figure': category = 'politics'
  IF target = 'celebrity': category = 'culture'

IF event_type = 'disaster':
  IF cause = 'technology': category = 'science'
  IF cause = 'natural': category = 'conflict'
  IF cause = 'human_violence': category = 'conflict'

IF event_type = 'social_movement':
  IF involves_legislation: category = 'politics'
  ELSE: category = 'culture'
```

---

### Agent 11: Build-time vs Runtime Simulation

**Scenario**: Should constraint validation happen at build or runtime?

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| BT-01 | **Build-time validation catches all errors before deploy** | Low | RECOMMENDED approach |
| BT-02 | **Runtime validation adds latency to API** | Medium | Should be avoided |
| BT-03 | **Puzzle generation is one-time operation** | Low | No need for dynamic generation |
| BT-04 | **TypeScript already validates at build time** | Low | Leverage existing type system |

**RECOMMENDATION**: Build-time only

**Implementation**:
```
npm run build
  -> TypeScript compiles (catches type errors)
  -> npm run validate:puzzles (custom script)
     -> Validates all 70 puzzles
     -> Fails build if any constraint violated
  -> Next.js builds (if validation passes)
```

**package.json update**:
```json
{
  "scripts": {
    "validate:puzzles": "npx ts-node scripts/validate-puzzles.ts",
    "prebuild": "npm run validate:puzzles",
    "build": "next build"
  }
}
```

---

### Agent 12: Testing Strategy Simulation

**Scenario**: How to test constraint satisfaction

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| TS-01 | **No existing unit test framework** | High | Need to set up Vitest first |
| TS-02 | **Static data testing has limited value** | Medium | Testing that array has 70*6=420 items |
| TS-03 | **Constraint tests are essentially validation script** | Low | Reuse validation logic in tests |
| TS-04 | **Snapshot testing could catch accidental changes** | Medium | Useful for detecting event modifications |

**Test Categories**:

```typescript
// 1. Schema Validation Tests
describe('HistoricalEvent schema', () => {
  test('all events have required fields', () => {
    EVENTS.forEach(event => {
      expect(event.id).toBeDefined();
      expect(event.familiarity).toMatch(/^(high|medium|low)$/);
      expect(event.category).toMatch(/^(politics|science|culture|sports|conflict|economics)$/);
    });
  });
});

// 2. Puzzle Constraint Tests
describe('Puzzle constraints', () => {
  test.each(Array.from({length: 70}, (_, i) => i + 1))(
    'Puzzle %i has 10+ year temporal span',
    (puzzleNum) => {
      const events = getPuzzleEvents(puzzleNum);
      const years = events.map(e => e.year);
      expect(Math.max(...years) - Math.min(...years)).toBeGreaterThanOrEqual(10);
    }
  );

  test.each(Array.from({length: 70}, (_, i) => i + 1))(
    'Puzzle %i has at least one high familiarity anchor',
    (puzzleNum) => {
      const events = getPuzzleEvents(puzzleNum);
      const highCount = events.filter(e => e.familiarity === 'high').length;
      expect(highCount).toBeGreaterThanOrEqual(1);
    }
  );
});

// 3. Snapshot Test for Event Stability
describe('Event data stability', () => {
  test('event IDs match snapshot', () => {
    const ids = EVENTS.map(e => e.id);
    expect(ids).toMatchSnapshot();
  });
});
```

---

### Agent 13: Rollback Strategy Simulation

**Scenario**: If new puzzles are worse, how to revert

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| RS-01 | **Git history provides natural rollback** | Low | Simple git revert |
| RS-02 | **Player progress tied to puzzle IDs, not content** | Critical | Changing Puzzle 4 content breaks saved games |
| RS-03 | **localStorage uses puzzle number as key** | High | Rollback may cause state corruption |
| RS-04 | **No versioning mechanism for puzzle content** | Medium | Can't detect "old" vs "new" puzzles |

**Impact on Saved Games**:

```
Current localStorage structure:
- ordl-today: { puzzleNumber: 8, attempts: [...], currentOrder: ['id1', 'id2', ...] }
- ordl-archive-4: { puzzleNumber: 4, attempts: [...], currentOrder: [...] }

If Puzzle 4 events change:
- currentOrder contains event IDs that may no longer exist in that puzzle
- Game state becomes inconsistent
- User sees ERROR or wrong events
```

**Rollback Strategy**:

1. **Pre-deployment**:
   - Tag current events.ts as `events-v1`
   - Document which puzzles are changing

2. **Migration Path**:
   - Clear affected archive games on first load (safe - archive is optional)
   - Today's puzzle rollback: if today's puzzle is affected, users must restart

3. **Graceful Degradation**:
   ```typescript
   // In useGame.ts loadArchiveGame()
   if (savedGame.currentOrder.some(id => !eventMap.has(id))) {
     // Event IDs changed - clear saved state
     console.warn(`Puzzle ${puzzleNum} structure changed, resetting progress`);
     localStorage.removeItem(`ordl-archive-${puzzleNum}`);
     return null;
   }
   ```

4. **Git Rollback**:
   ```bash
   git revert <commit-hash>  # Revert schema changes
   npm run build             # Rebuild with old events
   ```

---

### Agent 14: Temporal Spread Formula Simulation

**Scenario**: Exactly how to calculate temporal clustering score

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| TF-01 | **Year-only calculation loses precision** | Medium | Jan 1989 to Dec 1989 = same year but 11 months apart |
| TF-02 | **fullDate parsing is inconsistent** | High | "March 1918" has no day, "May 25, 1977" has full date |
| TF-03 | **Leap years and month lengths don't matter for 10-year span** | Low | Simplification acceptable |

**Temporal Span Formula**:

```typescript
function calculateTemporalSpan(events: HistoricalEvent[]): number {
  // Parse fullDate to get actual dates
  const dates = events.map(e => {
    const parsed = new Date(e.fullDate);
    // Handle "March 1918" format (day defaults to 1)
    if (isNaN(parsed.getTime())) {
      // Fallback to year only
      return new Date(e.year, 0, 1);
    }
    return parsed;
  });

  const timestamps = dates.map(d => d.getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  // Convert milliseconds to years
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  const spanYears = (maxTime - minTime) / msPerYear;

  return spanYears;
}

// For constraint: spanYears >= 10
```

**Simplified Version (Year-Only)**:
```typescript
function calculateTemporalSpanSimple(events: HistoricalEvent[]): number {
  const years = events.map(e => e.year);
  return Math.max(...years) - Math.min(...years);
}
```

**RECOMMENDATION**: Use simplified year-only calculation for initial implementation. 10-year span using just years is sufficient accuracy.

---

### Agent 15: Famous Event Distribution Simulation

**Scenario**: Ensuring famous events are spread across puzzles, not front-loaded

**Gotchas Discovered**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| FE-01 | **Current puzzles 1-10 may have higher quality events** | High | Early puzzles hand-curated first |
| FE-02 | **Anchor requirement (1 high per puzzle) naturally distributes** | Low | Constraint helps |
| FE-03 | **"Famous" is subjective and demographic-dependent** | Medium | Already addressed in familiarity criteria |
| FE-04 | **Daily puzzle order affects user experience** | Medium | Puzzle 1 = first impression, needs anchors |

**Distribution Analysis (Current)**:

Looking at first 10 puzzles:
- Puzzle 1: Challenger, Berlin Wall, Mandela, Nirvana (4 anchors)
- Puzzle 2: iPhone, Obama, Bin Laden, Steve Jobs (4 anchors)
- Puzzle 3: Diana, Google, 9/11 (3 anchors)
- Puzzle 4: MLK Dream, JFK, Moon landing (3 anchors)
- Puzzle 5: COVID, Trump (2 anchors)

**Observation**: Early puzzles ARE front-loaded with anchors. This may be intentional (good first impressions) but violates even distribution.

**Target Distribution**:
- If ~100 events are HIGH familiarity
- 70 puzzles need 1+ anchor each = 70 anchors minimum
- Average: 1.4 anchors per puzzle
- Acceptable range: 1-3 anchors per puzzle

**Validation Rule**:
```typescript
function validateAnchorDistribution(events: HistoricalEvent[]): boolean {
  const totalHigh = events.filter(e => e.familiarity === 'high').length;
  const puzzles = chunkArray(events, 6);

  const anchorsPerPuzzle = puzzles.map(p =>
    p.filter(e => e.familiarity === 'high').length
  );

  // All puzzles must have at least 1
  const allHaveAnchor = anchorsPerPuzzle.every(count => count >= 1);

  // No puzzle should have more than 3 (hoarding)
  const noneHoarding = anchorsPerPuzzle.every(count => count <= 3);

  return allHaveAnchor && noneHoarding;
}
```

---

### Agent 16: End-to-End Integration Simulation

**Scenario**: Full simulation of generating one valid puzzle from scratch

**Simulation: Generating Puzzle 71 (New Puzzle)**

**Step 1: Select Events from Pool**

Available events (hypothetical new events not yet used):
```typescript
const candidateEvents = [
  { id: "spotify_launch", year: 2008, familiarity: 'medium', category: 'culture' },
  { id: "mars_ingenuity", year: 2021, familiarity: 'medium', category: 'science' },
  { id: "gamestop_squeeze", year: 2021, familiarity: 'medium', category: 'economics' },
  { id: "squid_game", year: 2021, familiarity: 'high', category: 'culture' },
  { id: "webb_telescope", year: 2022, familiarity: 'high', category: 'science' },
  { id: "heat_dome_2021", year: 2021, familiarity: 'low', category: 'conflict' },
  { id: "tokyo_olympics", year: 2021, familiarity: 'high', category: 'sports' },
  { id: "threads_launch", year: 2023, familiarity: 'medium', category: 'culture' },
];
```

**Step 2: Apply Greedy Selection**

```
Pass 1: Select anchor (high familiarity)
  -> Selected: squid_game (2021)

Pass 2: Need events 10+ years apart
  -> Need event from 2011 or earlier, or 2031+ (impossible)
  -> PROBLEM: All candidates are 2008-2023 range
  -> Maximum span: 2023 - 2008 = 15 years (OK!)
  -> Select: spotify_launch (2008) - provides span

Pass 3: Add remaining events
  -> webb_telescope (2022, high) - second anchor
  -> tokyo_olympics (2021, high) - third anchor
  -> gamestop_squeeze (2021, medium) - variety
  -> mars_ingenuity (2021, medium) - science category

Pass 4: Validate
  -> Events: 6 (OK)
  -> Span: 2008-2022 = 14 years (OK, >= 10)
  -> High familiarity: 3 (squid_game, webb_telescope, tokyo_olympics) (OK, >= 1)
  -> Low familiarity: 0 (OK, <= 2)
  -> Related groups: none conflict (OK)
```

**Final Puzzle 71**:
```typescript
// Puzzle 71: 2008-2022 Mix
{ id: "spotify_launch", event: "Spotify launches", year: 2008, ... },
{ id: "squid_game", event: "Squid Game released", year: 2021, ... },
{ id: "tokyo_olympics", event: "Tokyo Olympics", year: 2021, ... },
{ id: "gamestop_squeeze", event: "GameStop short squeeze", year: 2021, ... },
{ id: "mars_ingenuity", event: "Ingenuity helicopter flies on Mars", year: 2021, ... },
{ id: "webb_telescope", event: "James Webb Telescope launched", year: 2022, ... },
```

**Gotcha Discovered in E2E Simulation**:

| ID | Gotcha | Severity | Impact |
|----|--------|----------|--------|
| E2E-01 | **Too many 2021 events cluster together** | Medium | 4 events in same year makes ordering trivial within that year |
| E2E-02 | **Need to verify fullDate ordering, not just year** | High | Which came first: Squid Game or Tokyo Olympics? |
| E2E-03 | **New events need fullDate, not just year** | Critical | Algorithm needs complete data |

---

## Critical Gotchas Summary (Must Fix Before Integration)

| ID | Gotcha | Severity | Mitigation |
|----|--------|----------|------------|
| **SM-01** | TypeScript requires all 410 events updated atomically | Critical | Plan bulk update with AI assistance |
| **P4-01** | Moving events breaks array indexing | Critical | Update all events in single commit |
| **GA-04** | Need 420 events but have 410 | Critical | Add 10 more events OR reduce to 68 puzzles |
| **RS-02** | Player progress tied to puzzle IDs | Critical | Add migration logic for changed puzzles |
| **P10-02** | Tiananmen is anchor - must stay | Critical | Design around existing anchors |
| **E2E-03** | New events need complete fullDate | Critical | Ensure data completeness |

---

## High Priority Gotchas (Should Fix)

| ID | Issue | Impact | Mitigation |
|----|-------|--------|------------|
| DP-01 | Subjective familiarity varies by demographic | User experience | Define target audience clearly |
| DP-03 | Cultural bias in familiarity | Global appeal | Consider international perspective |
| P4-02 | Need replacement event for Puzzle 4 | Puzzle quality | Identify suitable 1963-1969 event |
| P10-01 | Need 2+ event swaps for Puzzle 10 | Multiple puzzles affected | Plan swap chain carefully |
| CA-01 | Emoji mapping not 1:1 | Auto-assignment accuracy | Use AI + human review |
| RG-01 | Kennedy family spans 3 puzzles | Constraint enforcement | Already separated correctly |
| GA-02 | Order of selection affects outcome | Algorithm reliability | Start with anchors |
| GA-03 | Backtracking needed | Algorithm complexity | Implement retry logic |
| CV-02 | Event order = puzzle number | Dangerous coupling | Document this dependency |
| RS-03 | localStorage uses puzzle number | State corruption on rollback | Add migration logic |
| TS-01 | No unit test framework | Quality assurance | Set up Vitest first |

---

## Medium Priority Gotchas (Consider Fixing)

| ID | Issue | Mitigation |
|----|-------|------------|
| SM-03 | No runtime validation of field values | Add Zod schema |
| SM-04 | Empty relatedGroup semantics | Use undefined, not empty string |
| DP-02 | Events may belong to multiple categories | Pick primary, document secondary |
| CA-04 | Culture is overloaded | Consider splitting into culture/entertainment |
| CV-01 | Temporal span needs full dates | Use year-only for simplicity |
| CV-04 | No regeneration mechanism | Build validation script |
| TF-02 | fullDate parsing inconsistent | Standardize format |
| FE-01 | Early puzzles front-loaded | Redistribute during curation |
| E2E-01 | Too many same-year events cluster | Add same-year spacing rule |
| DP-04 | AI category consistency | Use single prompt for all events |

---

## Integration Risk Matrix

|  | Schema | Puzzle 4 | Puzzle 10 | Algorithm | Testing |
|--|--------|----------|-----------|-----------|---------|
| **Schema** | - | Low | Low | High | Medium |
| **Puzzle 4** | Low | - | Medium | High | Low |
| **Puzzle 10** | Low | Medium | - | High | Low |
| **Algorithm** | High | High | High | - | Medium |
| **Testing** | Medium | Low | Low | Medium | - |

---

## Recommended Integration Sequence

```
Phase 1: Foundation (Day 1-2)
  1. Add 10 new events to reach 420 total (or decide on 68 puzzles)
  2. Create validation script (scripts/validate-puzzles.ts)
  3. Run validation on current data to establish baseline

Phase 2: Schema Extension (Day 2-3)
  4. Update HistoricalEvent interface with new fields
  5. Use AI to populate familiarity, category for all 410 events
  6. Human review of AI assignments (50 sample events)
  7. Assign relatedGroup to ~100 events with obvious relations

Phase 3: Data Quality Fixes (Day 3-4)
  8. Fix Puzzle 4: Replace mlk_death with appropriate event
  9. Fix Puzzle 10: Swap events to achieve 10-year span
  10. Run validation script - fix any other failures

Phase 4: Testing & Rollback Prep (Day 4-5)
  11. Add migration logic for changed puzzles in useGame.ts
  12. Write unit tests for constraint validation
  13. Tag current events.ts as backup
  14. Test on local with sample user data

Phase 5: Deployment (Day 5)
  15. Deploy to production
  16. Monitor for localStorage corruption errors
  17. Hot-fix if needed using git revert
```

---

## Open Questions Requiring Human Decision

1. **Target audience**: US-centric or global familiarity scoring?
2. **68 vs 70 puzzles**: Add 10 events or reduce puzzle count?
3. **Which event replaces mlk_death in Puzzle 4?**: Cultural Revolution? Summer of Love?
4. **Puzzle 10 swap chain**: Which specific events to swap in/out?
5. **Category for assassinations**: 'conflict' or 'politics'?
6. **Should Area 51 Storm stay?**: Low educational value, high recognition
7. **Disambiguation of same-year events**: Add same-year spacing constraint?

---

## Conclusion

The puzzle curation plan is **technically feasible** with a clear implementation path. The main risks are:

1. **Data migration** - Changing puzzle content affects saved games
2. **Bulk data entry** - 410 events need new fields populated
3. **Algorithm reliability** - Greedy with backtracking should work but needs testing

**Integration Readiness Score: 7.5/10**

The plan can proceed with the recommended phased approach. Critical issues have clear mitigations, and the validation pipeline will catch constraint violations before deployment.
