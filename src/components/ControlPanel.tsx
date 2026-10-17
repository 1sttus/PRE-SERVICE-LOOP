import React, { useState, useEffect } from 'react';
import { PresentationState, Scene } from '../types/presentation';
import { INITIAL_SCENES } from '../data/scenes';
import { calculateTimeRemaining, parseTargetServiceTime } from '../engine/countdown';
import { SceneRenderer } from './SceneRenderer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Clock,
  Radio,
  Eye,
  EyeOff,
  Maximize2,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface ControlPanelProps {
  state: PresentationState;
  actions: {
    play: () => void;
    pause: () => void;
    resume: () => void;
    nextScene: () => void;
    previousScene: () => void;
    restart: () => void;
    jumpToScene: (index: number) => void;
    jumpToCountdown: () => void;
    startService: () => void;
    toggleLoop: () => void;
    toggleCountdownVisibility: () => void;
    toggleHold: () => void;
    toggleBlackout: () => void;
    setServiceTimeConfig: (date: string, time: string, tz: string) => void;
    setSimulatedCountdown: (seconds: number | null) => void;
    toggleAudio: () => void;
  };
}

// Miniature scaled 16:9 Monitor View
const MonitorView: React.FC<{
  scene: Scene;
  serviceDate: string;
  serviceTime: string;
  timezone: string;
  simulatedSeconds?: number | null;
  isBlackout?: boolean;
}> = ({ scene, serviceDate, serviceTime, timezone, simulatedSeconds, isBlackout }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(0.25);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / 1920);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black overflow-hidden">
      <div
        className="absolute top-0 left-0 origin-top-left pointer-events-none"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
        }}
      >
        <SceneRenderer
          scene={scene}
          serviceDate={serviceDate}
          serviceTime={serviceTime}
          timezone={timezone}
          simulatedSeconds={simulatedSeconds}
        />
        {isBlackout && <div className="absolute inset-0 bg-black z-50" />}
      </div>
    </div>
  );
};

// Miniature Thumbnail for Timeline Rail
const MiniThumbnail: React.FC<{
  scene: Scene;
  serviceDate: string;
  serviceTime: string;
  timezone: string;
}> = ({ scene, serviceDate, serviceTime, timezone }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(0.09);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w > 0) setScale(w / 1920);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black overflow-hidden">
      <div
        className="absolute top-0 left-0 origin-top-left pointer-events-none"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
        }}
      >
        <SceneRenderer
          scene={scene}
          serviceDate={serviceDate}
          serviceTime={serviceTime}
          timezone={timezone}
        />
      </div>
    </div>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, actions }) => {
  // Preview scene state (separate from live scene!)
  const [previewSceneIndex, setPreviewSceneIndex] = useState(state.currentSceneIndex);
  
  // Service configuration form state
  const [cfgDate, setCfgDate] = useState(state.serviceDate);
  const [cfgTime, setCfgTime] = useState(state.serviceTime);
  const [cfgTz, setCfgTz] = useState(state.timezone);

  // Live countdown string state
  const [countdownDisplay, setCountdownDisplay] = useState('00:00');
  const timelineRailRef = React.useRef<HTMLDivElement | null>(null);

  const handleTimelineWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (timelineRailRef.current && e.deltaY !== 0) {
      timelineRailRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    const updateCountdown = () => {
      if (state.simulatedTimeRemainingSeconds !== null && state.simulatedTimeRemainingSeconds !== undefined) {
        const s = Math.max(0, state.simulatedTimeRemainingSeconds);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        setCountdownDisplay(`${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
      } else {
        const targetMs = parseTargetServiceTime(state.serviceDate, state.serviceTime, state.timezone);
        const res = calculateTimeRemaining(targetMs);
        setCountdownDisplay(res.formattedString);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 500);
    return () => clearInterval(interval);
  }, [state.serviceDate, state.serviceTime, state.timezone, state.simulatedTimeRemainingSeconds]);

  // Keep preview in sync initially or when live changes if not manually exploring
  const liveScene = INITIAL_SCENES[state.currentSceneIndex] || INITIAL_SCENES[0];
  const nextSceneIndex = (state.currentSceneIndex + 1) % INITIAL_SCENES.length;
  const nextScene = INITIAL_SCENES[nextSceneIndex];
  const previewScene = INITIAL_SCENES[previewSceneIndex] || liveScene;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input, textarea, or select
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (state.isPlaying) actions.pause();
          else actions.play();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          actions.nextScene();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          actions.previousScene();
          break;
        case 'KeyR':
          e.preventDefault();
          actions.restart();
          break;
        case 'KeyC':
          e.preventDefault();
          actions.jumpToCountdown();
          break;
        case 'KeyL':
          e.preventDefault();
          actions.toggleLoop();
          break;
        case 'KeyS':
          e.preventDefault();
          actions.startService();
          break;
        case 'KeyF':
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPlaying, actions]);

  const handleApplyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    actions.setServiceTimeConfig(cfgDate, cfgTime, cfgTz);
  };

  const handleQuickSimulate = (seconds: number) => {
    actions.setSimulatedCountdown(seconds);
  };

  const handleGoLive = () => {
    actions.jumpToScene(previewSceneIndex);
  };

  const openDisplayWindow = () => {
    window.open('/display', '_blank', 'noopener,noreferrer');
  };

  const currentProgressPercent = Math.min(
    100,
    Math.round((state.elapsedSceneSeconds / (liveScene.duration || 1)) * 100)
  );

  return (
    <div className="min-h-screen bg-[#08090b] text-[#fbf8f2] flex flex-col font-sans-inter">
      {/* Top Media-Team Broadcast Header */}
      <header className="border-b border-[#20222a] bg-[#0d0e13] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
            <h1 className="font-serif-cormorant text-2xl font-semibold tracking-wider text-[#fbf8f2]">
              MORNINGSTAR PRE-SERVICE
            </h1>
          </div>
          <span className="text-xs text-[#a39b8d] tracking-widest uppercase">
            Control Room
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-6 text-xs text-[#a39b8d]">
          <div className="flex items-center gap-2">
            <span className="text-[#a39b8d]">Status:</span>
            {state.isBlackout ? (
              <span className="text-[#e05252] font-semibold">BLACKOUT</span>
            ) : state.isHolding ? (
              <span className="text-[#e5c158] font-semibold">HOLDING</span>
            ) : state.isPlaying ? (
              <span className="text-[#4ade80] font-semibold">LIVE PLAYBACK</span>
            ) : (
              <span className="text-[#9ca3af] font-semibold">PAUSED</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-[#fbf8f2] font-mono text-sm font-semibold tabular-nums">
              {countdownDisplay}
            </span>
          </div>

          <button
            onClick={openDisplayWindow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b1d26] hover:bg-[#252834] text-[#d4af37] rounded-md transition-colors text-xs font-medium border border-[#303444]"
            title="Open /display in new tab for external screen or projector"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch Display Window</span>
          </button>
        </div>
      </header>

      {/* Main Control Center Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1920px] w-full mx-auto">
        {/* Left Column: Preview vs Live Studio Monitors (Col 1-8) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Dual Monitor Stage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monitor 1: PREVIEW BUS */}
            <div className="flex flex-col bg-[#0e1015] border border-[#232632] rounded-xl overflow-hidden shadow-xl">
              <div className="px-4 py-2.5 bg-[#151720] border-b border-[#232632] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                  <span className="text-xs font-semibold tracking-wider text-[#38bdf8] uppercase">
                    PREVIEW BUS
                  </span>
                </div>
                <span className="text-xs text-[#a39b8d] font-mono">
                  Slide {previewScene.sceneNumber} of {INITIAL_SCENES.length}
                </span>
              </div>

              {/* 16:9 Aspect Ratio Frame */}
              <MonitorView
                scene={previewScene}
                serviceDate={state.serviceDate}
                serviceTime={state.serviceTime}
                timezone={state.timezone}
                simulatedSeconds={state.simulatedTimeRemainingSeconds}
              />

              {/* Preview Action Bar */}
              <div className="p-3 bg-[#11131a] border-t border-[#232632] flex items-center justify-between gap-3">
                <div className="truncate text-xs">
                  <span className="text-[#a39b8d]">Selected: </span>
                  <span className="text-[#fbf8f2] font-medium">{previewScene.title}</span>
                </div>
                <button
                  onClick={handleGoLive}
                  className="px-4 py-1.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0c0d10] font-semibold text-xs tracking-wider uppercase rounded-md transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Go Live</span>
                </button>
              </div>
            </div>

            {/* Monitor 2: PROGRAM LIVE OUTPUT */}
            <div className="flex flex-col bg-[#0e1015] border border-[#3d1a22] rounded-xl overflow-hidden shadow-xl">
              <div className="px-4 py-2.5 bg-[#1a0f13] border-b border-[#3d1a22] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                  <span className="text-xs font-semibold tracking-wider text-[#ef4444] uppercase">
                    PROGRAM LIVE (ON AIR)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {state.isHolding && (
                    <span className="text-[#e5c158] bg-[#3a131b] px-2 py-0.5 rounded text-[10px] font-bold">
                      FROZEN
                    </span>
                  )}
                  <span className="text-[#a39b8d] font-mono">
                    Slide {liveScene.sceneNumber} of {INITIAL_SCENES.length}
                  </span>
                </div>
              </div>

              {/* Live 16:9 Aspect Ratio Frame */}
              <div className="relative w-full aspect-video bg-black overflow-hidden">
                <MonitorView
                  scene={liveScene}
                  serviceDate={state.serviceDate}
                  serviceTime={state.serviceTime}
                  timezone={state.timezone}
                  simulatedSeconds={state.simulatedTimeRemainingSeconds}
                  isBlackout={state.isBlackout}
                />

                {/* Live Blackout Indicator */}
                {state.isBlackout && (
                  <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-30">
                    <div className="text-center">
                      <span className="text-sm font-semibold tracking-widest text-[#ef4444] uppercase">
                        SCREEN BLACKOUT ACTIVE
                      </span>
                      <p className="text-xs text-[#a39b8d] mt-1">Output projector is receiving pure black</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Info & Timeline Bar */}
              <div className="p-3 bg-[#11131a] border-t border-[#3d1a22] flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="truncate">
                    <span className="text-[#a39b8d]">Live: </span>
                    <span className="text-[#fbf8f2] font-medium">{liveScene.title}</span>
                  </div>
                  <div className="font-mono text-[#a39b8d] text-[11px] tabular-nums">
                    {state.elapsedSceneSeconds}s / {liveScene.duration > 9999 ? 'Manual' : `${liveScene.duration}s`}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-[#1e202b] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#d4af37] h-full transition-all duration-300"
                    style={{ width: `${currentProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Master Transport & Emergency Controls */}
          <div className="p-4 bg-[#0e1015] border border-[#232632] rounded-xl flex flex-wrap items-center justify-between gap-4">
            {/* Primary Transport Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={actions.previousScene}
                className="p-2.5 bg-[#171922] hover:bg-[#222533] text-[#fbf8f2] rounded-lg transition-colors border border-[#2a2d3d]"
                title="Previous Scene (Left Arrow)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {state.isPlaying ? (
                <button
                  onClick={actions.pause}
                  className="px-4 py-2.5 bg-[#252838] hover:bg-[#31354a] text-[#fbf8f2] rounded-lg transition-colors border border-[#3d425a] flex items-center gap-2 font-medium text-xs tracking-wider uppercase"
                  title="Pause Playback (Space)"
                >
                  <Pause className="w-4 h-4 text-[#e5c158]" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={actions.play}
                  className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0c0d10] rounded-lg transition-colors flex items-center gap-2 font-semibold text-xs tracking-wider uppercase shadow-md"
                  title="Resume Playback (Space)"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play</span>
                </button>
              )}

              <button
                onClick={actions.nextScene}
                className="p-2.5 bg-[#171922] hover:bg-[#222533] text-[#fbf8f2] rounded-lg transition-colors border border-[#2a2d3d]"
                title="Next Scene (Right Arrow)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={actions.restart}
                className="p-2.5 bg-[#171922] hover:bg-[#222533] text-[#a39b8d] hover:text-[#fbf8f2] rounded-lg transition-colors border border-[#2a2d3d]"
                title="Restart Presentation (R)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Jump & Mode Shortcuts */}
            <div className="flex items-center gap-2">
              <button
                onClick={actions.jumpToCountdown}
                className="px-3 py-2 bg-[#171922] hover:bg-[#222533] text-[#d4af37] rounded-lg transition-colors border border-[#2a2d3d] text-xs font-medium flex items-center gap-1.5"
                title="Jump directly to Scene 10 Countdown (C)"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Jump Countdown</span>
              </button>

              <button
                onClick={actions.startService}
                className="px-3.5 py-2 bg-[#3a131b] hover:bg-[#521a25] text-[#fbf8f2] border border-[#782335] rounded-lg transition-colors text-xs font-semibold flex items-center gap-1.5"
                title="Start Service immediately - Scene 12 Let's Worship (S)"
              >
                <Flame className="w-3.5 h-3.5 text-[#e5c158]" />
                <span>Start Service</span>
              </button>

              <button
                onClick={actions.toggleLoop}
                className={`px-3 py-2 rounded-lg transition-colors text-xs font-medium border ${
                  state.isLooping
                    ? 'bg-[#1b261e] border-[#225e34] text-[#4ade80]'
                    : 'bg-[#171922] border-[#2a2d3d] text-[#a39b8d]'
                }`}
                title="Toggle Looping Mode (L)"
              >
                Loop: {state.isLooping ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={actions.toggleCountdownVisibility}
                className="px-3 py-2 bg-[#171922] hover:bg-[#222533] text-[#a39b8d] rounded-lg transition-colors border border-[#2a2d3d] text-xs"
                title="Toggle countdown display"
              >
                {state.isCountdownVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Emergency Broadcast Controls */}
            <div className="flex items-center gap-2 border-l border-[#232632] pl-4">
              <button
                onClick={actions.toggleHold}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  state.isHolding
                    ? 'bg-[#e5c158] text-[#0c0d10] shadow-[0_0_15px_rgba(229,193,88,0.4)]'
                    : 'bg-[#1e1c15] text-[#e5c158] border border-[#443818] hover:bg-[#2a2417]'
                }`}
                title="Emergency Hold: Freeze presentation on current scene without skipping"
              >
                {state.isHolding ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{state.isHolding ? 'HOLD ACTIVE' : 'HOLD SCENE'}</span>
              </button>

              <button
                onClick={actions.toggleBlackout}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  state.isBlackout
                    ? 'bg-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-[#211516] text-[#ef4444] border border-[#522326] hover:bg-[#331c1e]'
                }`}
                title="Black Screen: Instantly fade output to black (reversible)"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{state.isBlackout ? 'RESTORE SCREEN' : 'BLACK SCREEN'}</span>
              </button>
            </div>
          </div>

          {/* Scene Timeline Rail (Thumbnails & Sequence) */}
          <div className="p-4 bg-[#0e1015] border border-[#232632] rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wider text-[#a39b8d] uppercase">
                SCENE SEQUENCE TIMELINE (12 SCENES)
              </h2>
              <span className="text-[11px] text-[#6b7280]">
                Click any thumbnail to preview • Click Go Live to air
              </span>
            </div>

            {/* Scrollable Horizontal Rail */}
            <div
              ref={timelineRailRef}
              onWheel={handleTimelineWheel}
              className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1"
            >
              {INITIAL_SCENES.map((sc, idx) => {
                const isLive = state.currentSceneIndex === idx;
                const isPreview = previewSceneIndex === idx;

                return (
                  <div
                    key={sc.id}
                    onClick={() => setPreviewSceneIndex(idx)}
                    className={`flex-shrink-0 w-44 rounded-lg overflow-hidden border cursor-pointer transition-all text-left flex flex-col ${
                      isLive
                        ? 'border-[#ef4444] bg-[#1a0f12] ring-1 ring-[#ef4444]'
                        : isPreview
                        ? 'border-[#38bdf8] bg-[#0f1722] ring-1 ring-[#38bdf8]'
                        : 'border-[#222532] bg-[#12141c] hover:border-[#383d52]'
                    }`}
                  >
                    {/* Mini Scene Header */}
                    <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono border-b border-white/5">
                      <span className="text-[#a39b8d]">#{sc.sceneNumber}</span>
                      {isLive && (
                        <span className="text-[#ef4444] font-bold tracking-wider">LIVE</span>
                      )}
                      {!isLive && isPreview && (
                        <span className="text-[#38bdf8] font-bold tracking-wider">PREVIEW</span>
                      )}
                      {!isLive && !isPreview && (
                        <span className="text-[#6b7280]">{sc.duration > 9999 ? 'Hold' : `${sc.duration}s`}</span>
                      )}
                    </div>

                    {/* Miniature visual thumbnail */}
                    <div className="relative w-full aspect-video bg-[#08090b] overflow-hidden">
                      <MiniThumbnail
                        scene={sc}
                        serviceDate={state.serviceDate}
                        serviceTime={state.serviceTime}
                        timezone={state.timezone}
                      />
                    </div>

                    {/* Title label */}
                    <div className="p-2 text-[11px] font-medium text-[#c8bfb1] truncate border-t border-white/5">
                      {sc.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & Keyboard Shortcuts (Col 9-12) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Service Time & Countdown Engine Configuration */}
          <div className="p-5 bg-[#0e1015] border border-[#232632] rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#20222d] pb-3">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              <h2 className="text-sm font-semibold tracking-wider text-[#fbf8f2] uppercase">
                SERVICE TIME & COUNTDOWN
              </h2>
            </div>

            <form onSubmit={handleApplyConfig} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-[#a39b8d] uppercase tracking-wider mb-1.5 font-medium">
                  Service Date
                </label>
                <input
                  type="date"
                  value={cfgDate}
                  onChange={(e) => setCfgDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141620] border border-[#2a2e3f] rounded-md text-xs text-[#fbf8f2] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#a39b8d] uppercase tracking-wider mb-1.5 font-medium">
                    Service Time
                  </label>
                  <input
                    type="time"
                    value={cfgTime}
                    onChange={(e) => setCfgTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141620] border border-[#2a2e3f] rounded-md text-xs text-[#fbf8f2] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#a39b8d] uppercase tracking-wider mb-1.5 font-medium">
                    Timezone
                  </label>
                  <select
                    value={cfgTz}
                    onChange={(e) => setCfgTz(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141620] border border-[#2a2e3f] rounded-md text-xs text-[#fbf8f2] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                    <option value="UTC">UTC / GMT</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#1b1f2e] hover:bg-[#262c42] text-[#d4af37] border border-[#3b4363] rounded-md text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Update Service Schedule
              </button>
            </form>

            {/* Quick Test / Simulation Mode */}
            <div className="border-t border-[#20222d] pt-3 mt-1">
              <span className="block text-[11px] font-semibold text-[#a39b8d] uppercase tracking-wider mb-2">
                Simulate Countdown (QA & Testing)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSimulate(30)}
                  className="px-2 py-1.5 bg-[#171a26] hover:bg-[#23273a] text-xs text-[#fbf8f2] rounded border border-[#2c3144] transition-colors"
                >
                  30 Seconds
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSimulate(60)}
                  className="px-2 py-1.5 bg-[#171a26] hover:bg-[#23273a] text-xs text-[#fbf8f2] rounded border border-[#2c3144] transition-colors"
                >
                  1 Minute
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSimulate(300)}
                  className="px-2 py-1.5 bg-[#171a26] hover:bg-[#23273a] text-xs text-[#fbf8f2] rounded border border-[#2c3144] transition-colors"
                >
                  5 Minutes
                </button>
              </div>
              {state.simulatedTimeRemainingSeconds !== null && (
                <button
                  type="button"
                  onClick={() => actions.setSimulatedCountdown(null)}
                  className="mt-2 text-[11px] text-[#ef4444] hover:underline"
                >
                  Clear simulation & restore clock
                </button>
              )}
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="p-5 bg-[#0e1015] border border-[#232632] rounded-xl flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-wider text-[#fbf8f2] uppercase">
              KEYBOARD SHORTCUTS
            </h2>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div className="flex items-center justify-between text-[#a39b8d]">
                <span>Play / Pause</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1d28] border border-[#30364d] rounded text-[#fbf8f2] font-mono text-[10px]">
                  Space
                </kbd>
              </div>
              <div className="flex items-center justify-between text-[#a39b8d]">
                <span>Next Scene</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1d28] border border-[#30364d] rounded text-[#fbf8f2] font-mono text-[10px]">
                  →
                </kbd>
              </div>
              <div className="flex items-center justify-between text-[#a39b8d]">
                <span>Prev Scene</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1d28] border border-[#30364d] rounded text-[#fbf8f2] font-mono text-[10px]">
                  ←
                </kbd>
              </div>
              <div className="flex items-center justify-between text-[#a39b8d]">
                <span>Restart</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1d28] border border-[#30364d] rounded text-[#fbf8f2] font-mono text-[10px]">
                  R
                </kbd>
              </div>
              <div className="flex items-center justify-between text-[#a39b8d]">
                <span>Jump Countdown</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1d28] border border-[#30364d] rounded text-[#fbf8f2] font-mono text-[10px]">
                  C
                </kbd>
              </div>
              <div className="flex items-center justify-between text-[#a39b8d]">
                <span>Toggle Loop</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1d28] border border-[#30364d] rounded text-[#fbf8f2] font-mono text-[10px]">
                  L
                </kbd>
              </div>
              <div className="flex items-center justify-between text-[#a39b8d]">
                <span>Start Service</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1d28] border border-[#30364d] rounded text-[#fbf8f2] font-mono text-[10px]">
                  S
                </kbd>
              </div>
              <div className="flex items-center justify-between text-[#a39b8d]">
                <span>Toggle Fullscreen</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1d28] border border-[#30364d] rounded text-[#fbf8f2] font-mono text-[10px]">
                  F
                </kbd>
              </div>
            </div>
          </div>

          {/* Projection Screen Setup Guidance */}
          <div className="p-5 bg-[#0e1015] border border-[#232632] rounded-xl text-xs text-[#a39b8d] flex flex-col gap-2">
            <span className="font-semibold text-[#fbf8f2] uppercase tracking-wider">
              OPERATOR QUICK START
            </span>
            <p className="leading-relaxed">
              1. Open <strong className="text-[#d4af37]">/display</strong> on your projection screen or extended monitor.
            </p>
            <p className="leading-relaxed">
              2. Keep <strong className="text-[#38bdf8]">/control</strong> on your media-team control monitor.
            </p>
            <p className="leading-relaxed">
              3. Press <kbd className="text-[#fbf8f2] bg-[#1a1d28] px-1 rounded">F</kbd> on the display screen to enter clean fullscreen.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
