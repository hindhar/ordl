# Ordl UX Audit - Final Recommendations

## Executive Summary

Ordl is a **well-built, playable game** with solid foundations but several UX gaps that could impact user retention and virality. The core gameplay works, but the experience assumes Wordle familiarity and lacks onboarding for true newcomers.

**Overall Readiness: 7/10** - Playable but needs polish before major launch.

---

## User Type Satisfaction Scores

| User Type | Score | Critical Issue |
|-----------|-------|----------------|
| **First-time** | 5/10 | No tutorial, rules unclear, drag not discoverable |
| **Returning** | 8/10 | Good persistence, missing win rate display |
| **Mobile** | 7/10 | Touch works, but no native share, small tap targets |
| **Competitive** | 6/10 | Stats exist but incomplete (no win rate, avg guesses) |
| **Casual** | 7/10 | Quick sessions work, streak pressure is low |

---

## Top 10 Priority Fixes

### 🔴 CRITICAL (Launch Blockers)

#### 1. Add First-Time User Onboarding
**Impact:** High | **Effort:** Medium
- Modal on first visit explaining rules
- "Drag to reorder from oldest to newest"
- "Green = correct position, Red = wrong"
- "You have 4 attempts to get all 6 correct"

#### 2. Make Drag Handle Visible
**Impact:** High | **Effort:** Low
- Current: `opacity-25` (nearly invisible)
- Fix: Change to `opacity-60` or higher
- Location: `EventCard.tsx` line 110

#### 3. Add Native Mobile Share (`navigator.share()`)
**Impact:** High | **Effort:** Low
- Current: Clipboard copy only
- Fix: Add native share sheet for mobile
- Location: `lib/share.ts`
```typescript
if (navigator.share) {
  await navigator.share({ title: 'Ordl', text: shareText, url: 'https://ordl.io' });
} else {
  await copyToClipboard(shareText);
}
```

### 🟡 IMPORTANT (Week 1 Fixes)

#### 4. Add Win Rate to Stats Display
**Impact:** Medium | **Effort:** Low
- Calculate: `(gamesWon / gamesPlayed * 100).toFixed(0) + '%'`
- Add to StatsDisplay.tsx summary row
- Users expect this from Wordle

#### 5. Increase Tap Target Sizes
**Impact:** Medium | **Effort:** Low
- Header nav buttons: `w-8 h-8` → `w-11 h-11` (44px)
- Modal close button: `w-6 h-6` → `w-10 h-10`
- Drag handle area: increase touch target

#### 6. Fix Duplicate Puzzle Content
**Impact:** Medium | **Effort:** Low
- Chernobyl appears in both Puzzle 1 AND Puzzle 6
- Replace one instance with different event
- Location: `lib/events.ts`

#### 7. Add Post-Submit Feedback Explanation
**Impact:** Medium | **Effort:** Medium
- First-time users don't understand green/red
- Add tooltip or inline text after first submit
- "🟩 = Correct position (locked) | 🟥 = Wrong position"

### 🟢 NICE-TO-HAVE (Future)

#### 8. Add "How to Play" Help Link
**Impact:** Low | **Effort:** Low
- Add `?` icon in header
- Links to rules modal
- Always accessible, not just first visit

#### 9. Enable User Zoom (Accessibility)
**Impact:** Low | **Effort:** Low
- Current: `maximumScale: 1, userScalable: false`
- Fix: Allow zoom for accessibility compliance
- Location: `app/layout.tsx` viewport config

#### 10. Add PWA/Offline Support
**Impact:** Low | **Effort:** High
- Add manifest.json
- Add service worker
- Enable "Add to Home Screen"

---

## Puzzle Quality Assessment

| Puzzle | Difficulty | Quality | Issues |
|--------|------------|---------|--------|
| #1 | Easy | A- | Three 1986 events clustered |
| #2 | Easy | A | Well-balanced, iconic |
| #3 | Medium | A- | Tiger Slam too obscure |
| #4 | Medium | A | Excellent historical balance |
| #5 | Medium-Hard | A- | Leicester may be hard for non-football fans |
| #6 | Medium | B+ | **DUPLICATE: Chernobyl** also in #1 |
| #7 | Medium | A | Excellent 1970s balance |
| #8 | Medium | B | Over-clustered on tech (4/6 events) |

**Content Issues:**
- ❌ Duplicate event (Chernobyl in puzzles 1 & 6)
- ⚠️ Puzzle 8 has 4 tech platform launches (imbalanced)
- ⚠️ Some obscure events (Tiger Slam, Falklands War)
- ⚠️ Western/US-centric bias overall

---

## Share Format Assessment

**Current Format:**
```
Ordl #8 3/4

🟩🟥🟩🟩🟩🟩
🟩🟩🟩🟥🟥🟩
🟩🟩🟩🟩🟩🟩
🔥 7 day streak!

ordl.io
```

**Strengths:**
- ✅ Spoiler-free (no event names/years)
- ✅ Wordle-familiar format
- ✅ Streak creates FOMO
- ✅ Puzzle number enables comparison

**Weaknesses:**
- ❌ No native mobile share sheet
- ❌ Silent failure if copy fails
- ⚠️ 2-second confirmation is short

---

## Feature Completeness Checklist

### Core Game ✅
- [x] Daily puzzle rotation
- [x] Drag-and-drop reordering
- [x] Position locking on correct
- [x] 4-guess limit
- [x] Win/lose detection

### Stats & Persistence ✅
- [x] Games played tracking
- [x] Streak tracking
- [x] Guess distribution
- [x] Game state restoration
- [ ] Win rate display ❌
- [ ] Average guesses ❌

### Sharing ⚠️
- [x] Emoji grid generation
- [x] Clipboard copy
- [x] Copy confirmation
- [ ] Native share API ❌
- [ ] Error handling ❌

### Onboarding ❌
- [ ] First-time tutorial
- [ ] How to play modal
- [ ] Tooltips
- [ ] Help link

### Mobile ⚠️
- [x] Touch drag-and-drop
- [x] Responsive layout
- [x] Thumb-zone button placement
- [ ] 44px tap targets ❌
- [ ] Native share ❌
- [ ] PWA support ❌

### Accessibility ⚠️
- [x] Focus states
- [x] ARIA labels
- [x] Keyboard navigation
- [ ] User zoom enabled ❌
- [ ] Skip links ❌

---

## Ready for Launch?

**Verdict: CONDITIONAL YES**

The game is playable and enjoyable, but should address these before major promotion:

### Must Fix Before Launch:
1. ✅ Add basic onboarding/rules modal
2. ✅ Make drag handles visible
3. ✅ Fix duplicate Chernobyl puzzle
4. ✅ Add native mobile share

### Can Fix Post-Launch:
- Win rate display
- Tap target sizes
- PWA support
- Full accessibility audit

---

## Quick Wins (< 30 min each)

1. **Drag handle opacity**: `opacity-25` → `opacity-60` (1 line change)
2. **Win rate display**: Add calculation to StatsDisplay (10 lines)
3. **Native share**: Add navigator.share() check (15 lines)
4. **Remove Chernobyl duplicate**: Edit events.ts (replace 1 event)
5. **Tap target sizes**: Increase button classes (5 lines)

---

## Conclusion

Ordl has strong foundations - the core game loop is satisfying, the visual design is polished, and the technical implementation is solid. The main gaps are in **discoverability** (new users don't know how to play) and **mobile optimization** (missing native share).

Addressing the top 4 critical issues would significantly improve the first-time user experience and increase viral potential through better mobile sharing.

**Estimated effort for critical fixes: 2-4 hours**
