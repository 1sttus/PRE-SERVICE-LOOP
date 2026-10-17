export type MotionPreset =
  | 'cinematicFade'
  | 'slowZoom'
  | 'softRise'
  | 'parallaxDrift'
  | 'lightReveal'
  | 'crossDissolve'
  | 'softWipe';

export type TextAlignment = 'left' | 'center' | 'right';

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  headline: string;
  supporting: string;
  body?: string;
  scripture?: string;
  reference?: string;
  closing?: string;
  mainText?: string;
  duration: number; // in seconds
  motionPreset: MotionPreset;
  textAlignment: TextAlignment;
  darkOverlayOpacity: number; // 0.0 - 0.95
  imageSrc?: string;
  videoSrc?: string;
  isManualHold?: boolean;
  isCountdownScene?: boolean;
  accentGlow?: string;
  tagline?: string;
}

export type PlaybackStatus = 'playing' | 'paused' | 'holding' | 'blackout';

export interface TimelineItem {
  id: string;
  sceneNumber: number;
  title: string;
  duration: number;
  isManualHold?: boolean;
}

export interface PresentationState {
  currentSceneId: string;
  currentSceneIndex: number;
  playbackStatus: PlaybackStatus;
  timeline: TimelineItem[];
  isPlaying: boolean;
  isHolding: boolean; // Emergency freeze
  isBlackout: boolean; // Black screen toggle
  isLooping: boolean;
  isCountdownVisible: boolean;
  targetServiceTime: string; // ISO or local date/time string
  serviceDate: string; // YYYY-MM-DD
  serviceTime: string; // HH:mm
  timezone: string; // e.g. 'Africa/Lagos'
  countdownLeadInMinutes: number;
  elapsedSceneSeconds: number;
  lastUpdated: number;
  simulatedTimeRemainingSeconds?: number | null; // For operator test mode
  activeAudio: boolean;
}

export type SyncActionType =
  | 'PLAY'
  | 'PAUSE'
  | 'RESUME'
  | 'NEXT'
  | 'PREVIOUS'
  | 'RESTART'
  | 'JUMP_SCENE'
  | 'JUMP_COUNTDOWN'
  | 'START_SERVICE'
  | 'TOGGLE_LOOP'
  | 'TOGGLE_COUNTDOWN_VISIBILITY'
  | 'SET_SERVICE_TIME'
  | 'TOGGLE_HOLD'
  | 'TOGGLE_BLACKOUT'
  | 'SET_AUDIO'
  | 'SET_SIMULATED_COUNTDOWN'
  | 'REQUEST_SYNC'
  | 'STATE_SYNC';

export interface SyncMessage {
  type: SyncActionType;
  payload?: any;
  timestamp: number;
  senderId?: string;
}
