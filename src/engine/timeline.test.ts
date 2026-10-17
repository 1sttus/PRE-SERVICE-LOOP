import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNextSceneIndex,
  getPreviousSceneIndex,
  shouldAutoAdvance,
  shouldTransitionToCountdown,
} from './timeline.ts';

test('getNextSceneIndex advances sequentially', () => {
  assert.equal(getNextSceneIndex(0, 12, true), 1);
  assert.equal(getNextSceneIndex(5, 12, true), 6);
});

test('getNextSceneIndex loops back to 0 before the final manual hold scene', () => {
  // If at slide 10 (out of 12), next is 11
  assert.equal(getNextSceneIndex(10, 12, true), 11);
  // At slide 11 (the final scene index), it must hold and NOT loop
  assert.equal(getNextSceneIndex(11, 12, true), 11);
});

test('getPreviousSceneIndex decrements and clamps at 0', () => {
  assert.equal(getPreviousSceneIndex(5, 12), 4);
  assert.equal(getPreviousSceneIndex(0, 12), 0);
});

test('shouldAutoAdvance respects duration and manual hold', () => {
  assert.equal(shouldAutoAdvance(44, 45, false), false);
  assert.equal(shouldAutoAdvance(45, 45, false), true);
  assert.equal(shouldAutoAdvance(50, 45, false), true);
  // Manual hold should never auto-advance
  assert.equal(shouldAutoAdvance(100, 45, true), false);
});

test('shouldTransitionToCountdown triggers when within lead-in window', () => {
  const countdownIndex = 9; // Scene 10 (0-indexed 9)
  // 120s remaining, 300s lead-in, currently at scene 3 -> should trigger
  assert.equal(shouldTransitionToCountdown(120, 300, 3, countdownIndex), true);
  // 400s remaining, 300s lead-in -> false
  assert.equal(shouldTransitionToCountdown(400, 300, 3, countdownIndex), false);
  // Already at or past countdown -> false
  assert.equal(shouldTransitionToCountdown(120, 300, 9, countdownIndex), false);
});
