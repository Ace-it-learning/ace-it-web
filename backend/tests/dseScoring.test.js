/**
 * Unit Test: DSE Scoring System
 * Verifies the HKEAA-aligned scoring logic without any database dependencies.
 *
 * Run with: node backend/tests/dseScoring.test.js
 */

const { DSE_SCORING, accuracyToLevel, levelToLabel } = require('../constants/dseScoring');

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
    if (actual === expected) {
        console.log(`  ✅ PASS: ${description}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${description}`);
        console.error(`       Expected: ${expected}`);
        console.error(`       Actual:   ${actual}`);
        failed++;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. accuracyToLevel() — basic threshold mapping
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1] accuracyToLevel() — threshold mapping');
assert('1.00 accuracy → Level 7 (5**)', accuracyToLevel(1.00), 7);
assert('0.90 accuracy → Level 7 (5**)', accuracyToLevel(0.90), 7);
assert('0.89 accuracy → Level 6 (5*)', accuracyToLevel(0.89), 6);
assert('0.85 accuracy → Level 6 (5*)', accuracyToLevel(0.85), 6);
assert('0.84 accuracy → Level 5 (5)', accuracyToLevel(0.84), 5);
assert('0.75 accuracy → Level 5 (5)', accuracyToLevel(0.75), 5);
assert('0.74 accuracy → Level 4 (4)', accuracyToLevel(0.74), 4);
assert('0.65 accuracy → Level 4 (4)', accuracyToLevel(0.65), 4);
assert('0.64 accuracy → Level 3 (3)', accuracyToLevel(0.64), 3);
assert('0.50 accuracy → Level 3 (3)', accuracyToLevel(0.50), 3);
assert('0.49 accuracy → Level 2 (2)', accuracyToLevel(0.49), 2);
assert('0.35 accuracy → Level 2 (2)', accuracyToLevel(0.35), 2);
assert('0.34 accuracy → Level 1 (1)', accuracyToLevel(0.34), 1);
assert('0.00 accuracy → Level 1 (1)', accuracyToLevel(0.00), 1);

// ─────────────────────────────────────────────────────────────────────────────
// 2. levelToLabel() — numeric level to HKEAA grade label
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[2] levelToLabel() — HKEAA grade labels');
assert('Level 7 → "5**"', levelToLabel(7), '5**');
assert('Level 6 → "5*"', levelToLabel(6), '5*');
assert('Level 5 → "5"', levelToLabel(5), '5');
assert('Level 4 → "4"', levelToLabel(4), '4');
assert('Level 3 → "3"', levelToLabel(3), '3');
assert('Level 2 → "2"', levelToLabel(2), '2');
assert('Level 1 → "1"', levelToLabel(1), '1');

// ─────────────────────────────────────────────────────────────────────────────
// 3. Laplacian Smoothing (diagnostic)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[3] Laplacian Smoothing — prevents extreme 0% / 100% from 1 question');

function laplace(correct, total) {
    return (correct + 1) / (total + 2);
}

// 1/1 = 100% raw, but smoothed → ~66%, i.e. Level 4
const smooth_1_1 = laplace(1, 1);
assert('1/1 smoothed ≈ 0.666', Math.abs(smooth_1_1 - 0.6667) < 0.001, true);
assert('1/1 smoothed → Level 4 (not 7)', accuracyToLevel(smooth_1_1), 4);

// 0/1 = 0% raw, but smoothed → 33%, i.e. Level 1
const smooth_0_1 = laplace(0, 1);
assert('0/1 smoothed ≈ 0.333', Math.abs(smooth_0_1 - 0.3333) < 0.001, true);
assert('0/1 smoothed → Level 1', accuracyToLevel(smooth_0_1), 1);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Diagnostic Cap — even 100% raw accuracy caps at Level 4
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[4] Diagnostic Cap — Level 4 ceiling');

function diagnosticLevel(correct, total) {
    const acc = laplace(correct, total);
    const raw = accuracyToLevel(acc);
    return Math.min(raw, DSE_SCORING.DIAGNOSTIC_MAX_LEVEL);
}

assert('10/10 diagnostic → Level 4 max', diagnosticLevel(10, 10), 4);
assert('5/5  diagnostic → Level 4 max', diagnosticLevel(5, 5), 4);
assert('1/10 diagnostic → Level 1', diagnosticLevel(1, 10), 1);
assert('0/5  diagnostic → Level 1', diagnosticLevel(0, 5), 1);
assert('4/5  diagnostic → Level 4', diagnosticLevel(4, 5), 4);  // ~83% accuracy but capped

// ─────────────────────────────────────────────────────────────────────────────
// 5. Gate Logic — minimum correct answers to qualify for a level
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[5] Gate Logic — need enough correct answers to advance');

function simulateLab(sessions) {
    // sessions: array of { correct, total }
    let totalCorrect = 0;
    let totalAttempts = 0;

    for (const s of sessions) {
        totalCorrect += s.correct;
        totalAttempts += s.total;
    }

    const accuracy = totalCorrect / totalAttempts;
    const candidateLevel = accuracyToLevel(accuracy);
    const minCorrect = DSE_SCORING.MIN_CORRECT_FOR_LEVEL[candidateLevel] || 0;

    return {
        candidateLevel,
        finalLevel: totalCorrect >= minCorrect ? candidateLevel : candidateLevel - 1, // simplification
        totalCorrect,
        accuracy: Math.round(accuracy * 100)
    };
}

// Scenario from the plan's table:
// Diagnostic 1/1 → level 4 (capped). Then lab sessions:
// Lab 1: 4/5. Lab 2: 3/5. Lab 3: 5/5. → 12/15 = 80%. Candidate: Level 6 (5*). Gate: 15, not met. But enough for Level 5 (10).
const labResult = simulateLab([
    { correct: 4, total: 5 },
    { correct: 3, total: 5 },
    { correct: 5, total: 5 },
]);
assert('3 lab sessions (80%): candidate Level 5', labResult.candidateLevel, 5);
assert('3 lab sessions (80%): total correct = 12', labResult.totalCorrect, 12);
// Gate for level 6 = 15, but gate for level 5 = 10. 12 >= 10 so should reach 5.
assert('Gate: 12 correct >= 15 (Level 6 gate) → not Level 6', labResult.totalCorrect >= DSE_SCORING.MIN_CORRECT_FOR_LEVEL[6], false);
assert('Gate: 12 correct >= 10 (Level 5 gate) → Level 5 eligible', labResult.totalCorrect >= DSE_SCORING.MIN_CORRECT_FOR_LEVEL[5], true);

// 8 correct at 80% accuracy: candidate Level 6 (5*), gate requires 15. Not met.
const easyGate = simulateLab([
    { correct: 4, total: 5 },
    { correct: 4, total: 5 },
]);
assert('8 correct at 80%: candidate Level 5', easyGate.candidateLevel, 5);
assert('8 correct at 80%: gate NOT met for Level 6 (need 15)', easyGate.totalCorrect >= DSE_SCORING.MIN_CORRECT_FOR_LEVEL[6], false);
assert('8 correct at 80%: gate MET for Level 5 (need 10)? NO — 8 < 10', easyGate.totalCorrect >= DSE_SCORING.MIN_CORRECT_FOR_LEVEL[5], false);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Difficulty Caps
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[6] Difficulty Caps — mastering Easy content caps at Level 3');

assert('Easy (diff=1) cap → max Level 3', DSE_SCORING.DIFFICULTY_CAPS[1], 3);
assert('Easy (diff=2) cap → max Level 3', DSE_SCORING.DIFFICULTY_CAPS[2], 3);
assert('Medium (diff=3) cap → max Level 5', DSE_SCORING.DIFFICULTY_CAPS[3], 5);
assert('Medium (diff=4) cap → max Level 5', DSE_SCORING.DIFFICULTY_CAPS[4], 5);
assert('Elite (diff=5) cap → max Level 7', DSE_SCORING.DIFFICULTY_CAPS[5], 7);

// ─────────────────────────────────────────────────────────────────────────────
// 7. laplaceSmooth — new export for diagnostic evidence seeding
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[7] laplaceSmooth() — smoothed accuracy prevents 0/100% extremes');

const { laplaceSmooth } = require('../constants/dseScoring');

// Edge case: 0 questions answered → returns 0 (not smoothed — no data)
assert('laplaceSmooth(0, 0) → 0', laplaceSmooth(0, 0), 0);
// 0/5 questions correct → 1/7 ≈ 0.143 → Level 1
const smooth_0_5 = laplaceSmooth(0, 5);
assert('laplaceSmooth(0,5) → Level 1', accuracyToLevel(smooth_0_5), 1);
// 5/5 questions correct → 6/7 ≈ 0.857 → Level 6 (would be 5* if uncapped)
const smooth_5_5 = laplaceSmooth(5, 5);
assert('laplaceSmooth(5,5) → Level 6', accuracyToLevel(smooth_5_5), 6);
// With DIAGNOSTIC_MAX_LEVEL cap of 4: 5/5 → 6 → capped to 4
assert('laplaceSmooth(5,5) capped at DIAGNOSTIC_MAX_LEVEL → 4',
    Math.min(accuracyToLevel(smooth_5_5), DSE_SCORING.DIAGNOSTIC_MAX_LEVEL), 4);
// Realistic scenario: 3/7 reading questions correct → smoothed 4/9 ≈ 0.44 → Level 2
const smooth_3_7 = laplaceSmooth(3, 7);
assert('laplaceSmooth(3,7) → Level 2', accuracyToLevel(smooth_3_7), 2);

// ─────────────────────────────────────────────────────────────────────────────
// 8. Post-diagnostic quest continuity
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[8] Post-diagnostic quest continuity — evidence accumulates on diagnostic baseline');

function simulateQuestAfterDiagnostic(diagCorrect, diagTotal, questCorrect, questTotal) {
    // Diagnostic seeds the skill
    const totalCorrectAfterDiag = diagCorrect;
    const totalAttemptsAfterDiag = diagTotal;

    // Quest adds to it
    const totalCorrect = totalCorrectAfterDiag + questCorrect;
    const totalAttempts = totalAttemptsAfterDiag + questTotal;

    const accuracy = totalCorrect / totalAttempts;
    const candidateLevel = accuracyToLevel(accuracy);
    const minCorrect = DSE_SCORING.MIN_CORRECT_FOR_LEVEL[candidateLevel] || 0;
    return { candidateLevel, gatePass: totalCorrect >= minCorrect, totalCorrect };
}

// Diagnostic gave 3/7 evidence. One quest adds 4/5.
// Total: 7/12 = 58% → Level 3. Gate for Level 3 = 5. 7 >= 5 ✓
const afterQuest = simulateQuestAfterDiagnostic(3, 7, 4, 5);
assert('Diagnostic 3/7 + Quest 4/5 → candidate Level 3', afterQuest.candidateLevel, 3);
assert('Diagnostic 3/7 + Quest 4/5 → gate passes (7 >= 5)', afterQuest.gatePass, true);

// Without seeding: quest only (0 baseline + 4/5 = 4/5 = 80% → candidate Level 5)
// But gate for Level 5 = 10 correct. 4 < 10 → gate FAILS. Level stays at 1.
const withoutSeeding = simulateQuestAfterDiagnostic(0, 0, 4, 5);
assert('No seeding + Quest 4/5 → candidate Level 5', withoutSeeding.candidateLevel, 5);
assert('No seeding + Quest 4/5 → gate FAILS (4 < 10)', withoutSeeding.gatePass, false);

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`🏁 Test Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
    console.error('❌ Some tests FAILED. Please review the scoring logic.');
    process.exit(1);
} else {
    console.log('✅ All tests PASSED. DSE scoring system is healthy.');
    process.exit(0);
}
