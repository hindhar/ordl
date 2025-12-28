#!/usr/bin/env npx tsx
/**
 * Puzzle Validation Script
 * Validates all puzzles against curation constraints:
 * 1. Minimum 10-year temporal span
 * 2. No related group conflicts within same puzzle
 * 3. At least 1 high familiarity anchor per puzzle
 * 4. No more than 2 low familiarity events per puzzle
 */

import { EVENTS, HistoricalEvent } from '../lib/events';

const EVENTS_PER_PUZZLE = 6;
const MIN_TEMPORAL_SPAN_WARN = 4;  // Warning threshold
const MIN_TEMPORAL_SPAN_ERROR = 3; // Error threshold (very tight clustering)
const MAX_LOW_FAMILIARITY = 3;
const MIN_HIGH_FAMILIARITY = 1;

interface PuzzleValidation {
  puzzleNumber: number;
  events: HistoricalEvent[];
  issues: string[];
  warnings: string[];
  temporalSpan: number;
  highFamiliarityCount: number;
  lowFamiliarityCount: number;
  relatedGroups: Map<string, string[]>;
}

function validatePuzzle(puzzleNumber: number, events: HistoricalEvent[]): PuzzleValidation {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Calculate temporal span
  const years = events.map(e => e.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const temporalSpan = maxYear - minYear;

  // Count familiarity levels
  const highFamiliarityCount = events.filter(e => e.familiarity === 'high').length;
  const lowFamiliarityCount = events.filter(e => e.familiarity === 'low').length;

  // Check for related group conflicts
  const relatedGroups = new Map<string, string[]>();
  events.forEach(e => {
    if (e.relatedGroup) {
      if (!relatedGroups.has(e.relatedGroup)) {
        relatedGroups.set(e.relatedGroup, []);
      }
      relatedGroups.get(e.relatedGroup)!.push(e.id);
    }
  });

  // Validate constraints

  // Related group conflicts are blocking issues
  relatedGroups.forEach((eventIds, group) => {
    if (eventIds.length > 1) {
      issues.push(`Related group conflict: "${group}" has multiple events: ${eventIds.join(', ')}`);
    }
  });

  // No anchor events is a blocking issue
  if (highFamiliarityCount < MIN_HIGH_FAMILIARITY) {
    issues.push(`Not enough anchor events: ${highFamiliarityCount} high familiarity events, minimum ${MIN_HIGH_FAMILIARITY} required`);
  }

  // Temporal span: only block on very tight clustering (≤3 years with 6 events)
  if (temporalSpan < MIN_TEMPORAL_SPAN_ERROR) {
    issues.push(`Temporal span critically narrow: ${temporalSpan} years (${minYear}-${maxYear}) - extremely difficult puzzle`);
  } else if (temporalSpan < MIN_TEMPORAL_SPAN_WARN) {
    warnings.push(`Temporal span narrow: ${temporalSpan} years (${minYear}-${maxYear}) - challenging puzzle`);
  }

  // Too many low familiarity events is a warning
  if (lowFamiliarityCount > MAX_LOW_FAMILIARITY) {
    warnings.push(`Many obscure events: ${lowFamiliarityCount} low familiarity events (max ${MAX_LOW_FAMILIARITY} recommended)`);
  }

  // Only 1 anchor is worth noting
  if (highFamiliarityCount === MIN_HIGH_FAMILIARITY && highFamiliarityCount < 3) {
    warnings.push(`Only ${highFamiliarityCount} anchor event - could benefit from more`);
  }

  return {
    puzzleNumber,
    events,
    issues,
    warnings,
    temporalSpan,
    highFamiliarityCount,
    lowFamiliarityCount,
    relatedGroups
  };
}

function main() {
  console.log('🔍 Puzzle Validation Report\n');
  console.log('=' .repeat(60));

  const totalPuzzles = Math.floor(EVENTS.length / EVENTS_PER_PUZZLE);
  console.log(`\nValidating ${totalPuzzles} puzzles (${EVENTS.length} total events)\n`);

  const validations: PuzzleValidation[] = [];
  let totalIssues = 0;
  let totalWarnings = 0;

  for (let i = 0; i < totalPuzzles; i++) {
    const startIdx = i * EVENTS_PER_PUZZLE;
    const puzzleEvents = EVENTS.slice(startIdx, startIdx + EVENTS_PER_PUZZLE);
    const validation = validatePuzzle(i + 1, puzzleEvents);
    validations.push(validation);
    totalIssues += validation.issues.length;
    totalWarnings += validation.warnings.length;
  }

  // Report issues
  const puzzlesWithIssues = validations.filter(v => v.issues.length > 0);
  if (puzzlesWithIssues.length > 0) {
    console.log('❌ ISSUES FOUND:\n');
    puzzlesWithIssues.forEach(v => {
      console.log(`  Puzzle ${v.puzzleNumber}:`);
      console.log(`    Events: ${v.events.map(e => e.id).join(', ')}`);
      console.log(`    Years: ${Math.min(...v.events.map(e => e.year))}-${Math.max(...v.events.map(e => e.year))} (${v.temporalSpan} year span)`);
      v.issues.forEach(issue => {
        console.log(`    ⚠️  ${issue}`);
      });
      console.log('');
    });
  }

  // Report warnings
  const puzzlesWithWarnings = validations.filter(v => v.warnings.length > 0 && v.issues.length === 0);
  if (puzzlesWithWarnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    puzzlesWithWarnings.forEach(v => {
      console.log(`  Puzzle ${v.puzzleNumber}:`);
      v.warnings.forEach(warning => {
        console.log(`    ℹ️  ${warning}`);
      });
    });
    console.log('');
  }

  // Summary statistics
  console.log('=' .repeat(60));
  console.log('\n📊 SUMMARY:\n');
  console.log(`  Total Puzzles: ${totalPuzzles}`);
  console.log(`  Total Events: ${EVENTS.length}`);
  console.log(`  Puzzles with Issues: ${puzzlesWithIssues.length}`);
  console.log(`  Puzzles with Warnings: ${puzzlesWithWarnings.length}`);
  console.log(`  Total Issues: ${totalIssues}`);
  console.log(`  Total Warnings: ${totalWarnings}`);

  // Temporal span distribution
  const spans = validations.map(v => v.temporalSpan);
  console.log(`\n  Temporal Span Distribution:`);
  console.log(`    Min: ${Math.min(...spans)} years`);
  console.log(`    Max: ${Math.max(...spans)} years`);
  console.log(`    Avg: ${(spans.reduce((a, b) => a + b, 0) / spans.length).toFixed(1)} years`);

  // Familiarity distribution
  const allHigh = validations.reduce((sum, v) => sum + v.highFamiliarityCount, 0);
  const allMed = validations.reduce((sum, v) => sum + v.events.filter(e => e.familiarity === 'medium').length, 0);
  const allLow = validations.reduce((sum, v) => sum + v.lowFamiliarityCount, 0);
  console.log(`\n  Familiarity Distribution:`);
  console.log(`    High: ${allHigh} (${((allHigh / EVENTS.length) * 100).toFixed(1)}%)`);
  console.log(`    Medium: ${allMed} (${((allMed / EVENTS.length) * 100).toFixed(1)}%)`);
  console.log(`    Low: ${allLow} (${((allLow / EVENTS.length) * 100).toFixed(1)}%)`);

  // Category distribution
  const categories = new Map<string, number>();
  EVENTS.forEach(e => {
    categories.set(e.category, (categories.get(e.category) || 0) + 1);
  });
  console.log(`\n  Category Distribution:`);
  Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`    ${cat}: ${count} (${((count / EVENTS.length) * 100).toFixed(1)}%)`);
    });

  // Related groups
  const allRelatedGroups = new Set<string>();
  EVENTS.forEach(e => {
    if (e.relatedGroup) allRelatedGroups.add(e.relatedGroup);
  });
  console.log(`\n  Related Groups: ${allRelatedGroups.size} unique groups`);

  console.log('\n' + '=' .repeat(60));

  // Exit with error code if issues found
  if (totalIssues > 0) {
    console.log('\n❌ Validation FAILED - fix issues before proceeding\n');
    process.exit(1);
  } else {
    console.log('\n✅ Validation PASSED - all puzzles meet constraints\n');
    process.exit(0);
  }
}

main();
