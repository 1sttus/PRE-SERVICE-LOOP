import { useState, useEffect } from 'react';
import type { PresentationState, PlaybackStatus, SyncMessage } from '../types/presentation.ts';
import { calculateTimeRemaining, parseTargetServiceTime } from './countdown.ts';
import { getNextSceneIndex, shouldAutoAdvance } from './timeline.ts';
import { INITIAL_SCENES } from '../data/scenes.ts';

export const DEFAULT_CHANNEL_NAME = 'morningstar_preservice_channel';
export const DEFAULT_STORAGE_KEY = 'morningstar_preservice_state';

export function createDefaultPresentationState(): PresentationState {
  const tz = 'Africa/Lagos';
  const targetDate = new Date(Date.now() + 30 * 60 * 1000);

  let serviceDate = '2026-10-17';
  let serviceTime = '12:00';

  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    serviceDate = formatter.format(targetDate);
    serviceTime = timeFormatter.format(targetDate);
  } catch {
    // Fallback if Intl unavailable
  }

  const timeline = INITIAL_SCENES.map((s) => ({
    id: s.id,
    sceneNumber: s.sceneNumber,
    title: s.title,
    duration: s.duration,
    isManualHold: s.isManualHold,
  }));

  const initialScene = INITIAL_SCENES[0];

  return {
    currentSceneId: initialScene?.id || 'scene-1-welcome',
    currentSceneIndex: 0,
    playbackStatus: 'playing',
    timeline,
    isPlaying: true,
    isHolding: false,
    isBlackout: false,
    isLooping: true,
    isCountdownVisible: true,
    targetServiceTime: `${serviceDate}T${serviceTime}:00`,
    serviceDate,
    serviceTime,
    timezone: tz,
    countdownLeadInMinutes: 30,
    elapsedSceneSeconds: 0,
    lastUpdated: Date.now(),
    simulatedTimeRemainingSeconds: null,
    activeAudio: false,
  };
}

export class PresentationEngine {
  private state: PresentationState;
  private listeners: Set<(state: PresentationState) => void> = new Set();
  private channel: BroadcastChannel | null = null;
  private channelName: string;
  private storageKey: string;
  private isController: boolean;
  private timerId: any = null;

  constructor(options?: {
    isController?: boolean;
    channelName?: string;
    storageKey?: string;
    initialState?: Partial<PresentationState>;
    autoStartClock?: boolean;
  }) {
    this.isController = options?.isController ?? false;
    this.channelName = options?.channelName ?? DEFAULT_CHANNEL_NAME;
    this.storageKey = options?.storageKey ?? DEFAULT_STORAGE_KEY;

    // Load initial state with localStorage merge if in browser
    const baseState = createDefaultPresentationState();
    let loadedState: Partial<PresentationState> = {};

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(this.storageKey);
        if (saved) {
          loadedState = JSON.parse(saved);
        }
      } catch {
        // ignore
      }
    }

    this.state = {
      ...baseState,
      ...loadedState,
      ...options?.initialState,
      lastUpdated: Date.now(),
    };

    this.initCommunication();

    if (options?.autoStartClock !== false && typeof window !== 'undefined') {
      this.startClock();
    }
  }

  private initCommunication() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          this.handleIncomingMessage(event.data);
        };
      } catch {
        this.channel = null;
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
      if (!this.isController && this.channel) {
        this.postMessage({
          type: 'REQUEST_SYNC',
          timestamp: Date.now(),
        });
      }
    }
  }

  private handleIncomingMessage(msg: SyncMessage | undefined) {
    if (!msg) return;

    if (msg.type === 'STATE_SYNC' && msg.payload) {
      this.state = {
        ...this.state,
        ...msg.payload,
        lastUpdated: Date.now(),
      };
      this.notifyListeners();
    } else if (msg.type === 'REQUEST_SYNC' && this.isController) {
      this.broadcastState(this.state);
    }
  }

  private handleStorageEvent = (e: StorageEvent) => {
    if (e.key === this.storageKey && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        this.state = {
          ...this.state,
          ...parsed,
          lastUpdated: Date.now(),
        };
        this.notifyListeners();
      } catch {
        // ignore
      }
    }
  };

  private postMessage(msg: SyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {
        // ignore
      }
    }
  }

  public getState(): PresentationState {
    return { ...this.state };
  }

  public subscribe(listener: (state: PresentationState) => void): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Error in PresentationEngine subscriber:', err);
      }
    });
  }

  public broadcastState(newState: PresentationState) {
    const currentScene = INITIAL_SCENES[newState.currentSceneIndex] || INITIAL_SCENES[0];
    const playbackStatus: PlaybackStatus = newState.isBlackout
      ? 'blackout'
      : newState.isHolding
      ? 'holding'
      : newState.isPlaying
      ? 'playing'
      : 'paused';

    this.state = {
      ...newState,
      currentSceneId: currentScene.id,
      playbackStatus,
      lastUpdated: Date.now(),
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch {
        // ignore
      }
    }

    this.postMessage({
      type: 'STATE_SYNC',
      payload: this.state,
      timestamp: Date.now(),
    });

    this.notifyListeners();
  }

  // Master Clock Tick logic
  public tick(dtSeconds: number = 1) {
    const currentScene = INITIAL_SCENES[this.state.currentSceneIndex] || INITIAL_SCENES[0];
    const isManualHold = currentScene.isManualHold || this.state.isHolding;

    // 1. Calculate Countdown
    let remainingSeconds: number;
    if (this.state.simulatedTimeRemainingSeconds !== null && this.state.simulatedTimeRemainingSeconds !== undefined) {
      remainingSeconds = Math.max(0, this.state.simulatedTimeRemainingSeconds - dtSeconds);
      if (this.state.isPlaying && !this.state.isHolding && remainingSeconds !== this.state.simulatedTimeRemainingSeconds) {
        this.broadcastState({
          ...this.state,
          simulatedTimeRemainingSeconds: remainingSeconds,
        });
      }
    } else {
      const targetMs = parseTargetServiceTime(this.state.serviceDate, this.state.serviceTime, this.state.timezone);
      const remaining = calculateTimeRemaining(targetMs);
      remainingSeconds = remaining.totalSeconds;
    }

    // 2. Check if countdown reached zero -> Trigger Scene 12
    const finalSceneIndex = INITIAL_SCENES.length - 1;
    if (remainingSeconds <= 0 && this.state.currentSceneIndex !== finalSceneIndex) {
      this.broadcastState({
        ...this.state,
        currentSceneIndex: finalSceneIndex,
        elapsedSceneSeconds: 0,
        isPlaying: false,
      });
      return;
    }

    // 3. Scene Auto-advance
    if (this.state.isPlaying && !isManualHold && !this.state.isBlackout) {
      const nextElapsed = this.state.elapsedSceneSeconds + dtSeconds;
      if (shouldAutoAdvance(nextElapsed, currentScene.duration, false)) {
        const nextIndex = getNextSceneIndex(
          this.state.currentSceneIndex,
          INITIAL_SCENES.length,
          this.state.isLooping
        );
        this.broadcastState({
          ...this.state,
          currentSceneIndex: nextIndex,
          elapsedSceneSeconds: 0,
        });
      } else {
        this.state = {
          ...this.state,
          elapsedSceneSeconds: nextElapsed,
        };
        this.notifyListeners();
      }
    }
  }

  public startClock(intervalMs: number = 1000) {
    this.stopClock();
    this.timerId = setInterval(() => this.tick(1), intervalMs);
  }

  public stopClock() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // Core Presentation Actions
  public play() {
    this.broadcastState({ ...this.state, isPlaying: true, isHolding: false });
  }

  public pause() {
    this.broadcastState({ ...this.state, isPlaying: false });
  }

  public resume() {
    this.broadcastState({ ...this.state, isPlaying: true, isHolding: false });
  }

  public nextScene() {
    const nextIndex = getNextSceneIndex(
      this.state.currentSceneIndex,
      INITIAL_SCENES.length,
      this.state.isLooping
    );
    this.broadcastState({
      ...this.state,
      currentSceneIndex: nextIndex,
      elapsedSceneSeconds: 0,
    });
  }

  public previousScene() {
    const prevIndex = Math.max(0, this.state.currentSceneIndex - 1);
    this.broadcastState({
      ...this.state,
      currentSceneIndex: prevIndex,
      elapsedSceneSeconds: 0,
    });
  }

  public restart() {
    this.broadcastState({
      ...this.state,
      currentSceneIndex: 0,
      elapsedSceneSeconds: 0,
      isPlaying: true,
      isHolding: false,
      isBlackout: false,
    });
  }

  public jumpToScene(index: number) {
    const safeIndex = Math.max(0, Math.min(INITIAL_SCENES.length - 1, index));
    this.broadcastState({
      ...this.state,
      currentSceneIndex: safeIndex,
      elapsedSceneSeconds: 0,
    });
  }

  public jumpToCountdown() {
    const countdownIdx = INITIAL_SCENES.findIndex((s) => s.isCountdownScene);
    if (countdownIdx !== -1) {
      this.broadcastState({
        ...this.state,
        currentSceneIndex: countdownIdx,
        elapsedSceneSeconds: 0,
      });
    }
  }

  public startService() {
    const finalIdx = INITIAL_SCENES.length - 1;
    this.broadcastState({
      ...this.state,
      currentSceneIndex: finalIdx,
      elapsedSceneSeconds: 0,
      isPlaying: false,
    });
  }

  public toggleLoop() {
    this.broadcastState({
      ...this.state,
      isLooping: !this.state.isLooping,
    });
  }

  public toggleCountdownVisibility() {
    this.broadcastState({
      ...this.state,
      isCountdownVisible: !this.state.isCountdownVisible,
    });
  }

  public toggleHold() {
    this.broadcastState({
      ...this.state,
      isHolding: !this.state.isHolding,
    });
  }

  public toggleBlackout() {
    this.broadcastState({
      ...this.state,
      isBlackout: !this.state.isBlackout,
    });
  }

  public setServiceTime(date: string, time: string, tz: string = 'Africa/Lagos') {
    this.broadcastState({
      ...this.state,
      serviceDate: date,
      serviceTime: time,
      timezone: tz,
      simulatedTimeRemainingSeconds: null,
    });
  }

  public setSimulatedCountdown(seconds: number | null) {
    this.broadcastState({
      ...this.state,
      simulatedTimeRemainingSeconds: seconds,
    });
  }

  public toggleAudio() {
    this.broadcastState({
      ...this.state,
      activeAudio: !this.state.activeAudio,
    });
  }

  public destroy() {
    this.stopClock();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Global engine singleton for browser runtime
let globalEngine: PresentationEngine | null = null;

export function getPresentationEngine(isController?: boolean): PresentationEngine {
  if (!globalEngine) {
    globalEngine = new PresentationEngine({ isController });
  }
  return globalEngine;
}

export function usePresentationEngine(isController: boolean = false) {
  const engine = getPresentationEngine(isController);
  const [state, setState] = useState<PresentationState>(() => engine.getState());

  useEffect(() => {
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, [engine]);

  return {
    state,
    engine,
    actions: {
      play: () => engine.play(),
      pause: () => engine.pause(),
      resume: () => engine.resume(),
      nextScene: () => engine.nextScene(),
      previousScene: () => engine.previousScene(),
      restart: () => engine.restart(),
      jumpToScene: (idx: number) => engine.jumpToScene(idx),
      jumpToCountdown: () => engine.jumpToCountdown(),
      startService: () => engine.startService(),
      toggleLoop: () => engine.toggleLoop(),
      toggleCountdownVisibility: () => engine.toggleCountdownVisibility(),
      toggleHold: () => engine.toggleHold(),
      toggleBlackout: () => engine.toggleBlackout(),
      setServiceTimeConfig: (date: string, time: string, tz: string = 'Africa/Lagos') =>
        engine.setServiceTime(date, time, tz),
      setSimulatedCountdown: (sec: number | null) => engine.setSimulatedCountdown(sec),
      toggleAudio: () => engine.toggleAudio(),
    },
  };
}
