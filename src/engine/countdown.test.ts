import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTimeRemaining } from './countdown.ts';

test('countdown calculates accurate minutes and seconds', () => {
  const now = 1000000;
  const target = now + (10 * 60 + 25) * 1000; // 10 mins 25 secs
  const res = calculateTimeRemaining(target, now);

  assert.equal(res.hours, 0);
  assert.equal(res.minutes, 10);
  assert.equal(res.seconds, 25);
  assert.equal(res.totalSeconds, 625);
  assert.equal(res.isExpired, false);
  assert.equal(res.formattedString, '10:25');
});

test('countdown formats hours when remaining > 1 hour', () => {
  const now = 1000000;
  const target = now + (1 * 3600 + 4 * 60 + 9) * 1000; // 1 hr 4 mins 9 secs
  const res = calculateTimeRemaining(target, now);

  assert.equal(res.hours, 1);
  assert.equal(res.minutes, 4);
  assert.equal(res.seconds, 9);
  assert.equal(res.formattedString, '01:04:09');
});

test('countdown clamps to 00:00 when target is reached or in past', () => {
  const now = 1000000;
  const target = now - 5000; // 5 seconds past
  const res = calculateTimeRemaining(target, now);

  assert.equal(res.hours, 0);
  assert.equal(res.minutes, 0);
  assert.equal(res.seconds, 0);
  assert.equal(res.totalSeconds, 0);
  assert.equal(res.isExpired, true);
  assert.equal(res.formattedString, '00:00');
});

test('countdown handles exact zero gracefully', () => {
  const now = 1000000;
  const target = now;
  const res = calculateTimeRemaining(target, now);

  assert.equal(res.totalSeconds, 0);
  assert.equal(res.isExpired, true);
  assert.equal(res.formattedString, '00:00');
});
