import test from 'node:test';
import assert from 'node:assert/strict';
import { PresentationEngine } from './PresentationEngine.ts';

test('PresentationEngine initializes with valid default state', () => {
  const engine = new PresentationEngine({
    autoStartClock: false,
    channelName: 'test-channel-1',
    storageKey: 'test-storage-1',
  });

  const state = engine.getState();
  assert.equal(state.currentSceneIndex, 0);
  assert.equal(state.isPlaying, true);
  assert.equal(state.isHolding, false);
  assert.equal(state.isBlackout, false);
  assert.equal(state.isLooping, true);
  assert.equal(state.timezone, 'Africa/Lagos');

  engine.destroy();
});

test('PresentationEngine notifies subscribers on state change', () => {
  const engine = new PresentationEngine({
    autoStartClock: false,
    channelName: 'test-channel-2',
    storageKey: 'test-storage-2',
  });

  let receivedIndex = -1;
  const unsubscribe = engine.subscribe((s) => {
    receivedIndex = s.currentSceneIndex;
  });

  assert.equal(receivedIndex, 0);

  engine.nextScene();
  assert.equal(receivedIndex, 1);
  assert.equal(engine.getState().currentSceneIndex, 1);

  engine.nextScene();
  assert.equal(receivedIndex, 2);

  engine.previousScene();
  assert.equal(receivedIndex, 1);

  unsubscribe();
  engine.nextScene();
  // Listener was unsubscribed, so receivedIndex stays 1
  assert.equal(receivedIndex, 1);
  assert.equal(engine.getState().currentSceneIndex, 2);

  engine.destroy();
});

test('PresentationEngine handles hold and blackout toggles', () => {
  const engine = new PresentationEngine({
    autoStartClock: false,
    channelName: 'test-channel-3',
    storageKey: 'test-storage-3',
  });

  assert.equal(engine.getState().isHolding, false);
  engine.toggleHold();
  assert.equal(engine.getState().isHolding, true);
  engine.toggleHold();
  assert.equal(engine.getState().isHolding, false);

  assert.equal(engine.getState().isBlackout, false);
  engine.toggleBlackout();
  assert.equal(engine.getState().isBlackout, true);
  engine.toggleBlackout();
  assert.equal(engine.getState().isBlackout, false);

  engine.destroy();
});

test('PresentationEngine jumpToCountdown and startService jump to correct scenes', () => {
  const engine = new PresentationEngine({
    autoStartClock: false,
    channelName: 'test-channel-4',
    storageKey: 'test-storage-4',
  });

  engine.jumpToCountdown();
  // Scene 10 (0-indexed 9)
  assert.equal(engine.getState().currentSceneIndex, 9);

  engine.startService();
  // Scene 12 (0-indexed 11)
  assert.equal(engine.getState().currentSceneIndex, 11);
  assert.equal(engine.getState().isPlaying, false);

  engine.destroy();
});

test('PresentationEngine zero countdown auto-triggers Scene 12', () => {
  const engine = new PresentationEngine({
    autoStartClock: false,
    channelName: 'test-channel-5',
    storageKey: 'test-storage-5',
    initialState: {
      currentSceneIndex: 3,
      simulatedTimeRemainingSeconds: 1, // 1 second left
      isPlaying: true,
    },
  });

  // Tick 1: reaches 0
  engine.tick(1);
  // Reached zero: triggers Scene 12
  assert.equal(engine.getState().currentSceneIndex, 11);
  assert.equal(engine.getState().isPlaying, false);

  engine.destroy();
});

test('PresentationEngine updates currentSceneId, playbackStatus, and timeline', () => {
  const engine = new PresentationEngine({
    autoStartClock: false,
    channelName: 'test-channel-6',
    storageKey: 'test-storage-6',
  });

  const state = engine.getState();
  assert.equal(state.currentSceneId, 'scene-1-welcome');
  assert.equal(state.playbackStatus, 'playing');
  assert.ok(Array.isArray(state.timeline));
  assert.equal(state.timeline.length, 12);

  engine.nextScene();
  assert.equal(engine.getState().currentSceneId, 'scene-2-find-a-seat');

  engine.pause();
  assert.equal(engine.getState().playbackStatus, 'paused');

  engine.toggleHold();
  assert.equal(engine.getState().playbackStatus, 'holding');

  engine.toggleBlackout();
  assert.equal(engine.getState().playbackStatus, 'blackout');

  engine.destroy();
});

