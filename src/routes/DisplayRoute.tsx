import React, { useEffect } from 'react';
import { PresentationProvider, usePresentationContext } from '../context/PresentationContext';
import { PresentationShell } from '../components/PresentationShell';
import { SceneRenderer } from '../components/SceneRenderer';
import { Transition } from '../components/Transition';

const DisplayContent: React.FC = () => {
  const { state, currentScene, actions } = usePresentationContext();

  // Keyboard shortcut listener on display (F for fullscreen, Space for pause, Arrow keys, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
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
        case 'KeyC':
          e.preventDefault();
          actions.jumpToCountdown();
          break;
        case 'KeyS':
          e.preventDefault();
          actions.startService();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPlaying, actions]);

  // Mouse wheel scroll to advance or go back through presentation scenes
  useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      // 350ms cooldown prevents a single continuous wheel flick from triggering multiple scenes
      if (now - lastWheelTime < 350) return;

      if (Math.abs(e.deltaY) > 24) {
        if (e.deltaY > 0) {
          // Scrolled down -> Next Scene
          actions.nextScene();
        } else {
          // Scrolled up -> Previous Scene
          actions.previousScene();
        }
        lastWheelTime = now;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [actions]);

  // Touch swipe support (Swipe Up or Left to advance, Swipe Down or Right to go back)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY < -40) {
          // Swiped Up -> Next Scene
          actions.nextScene();
        } else if (deltaY > 40) {
          // Swiped Down -> Previous Scene
          actions.previousScene();
        }
      } else {
        if (deltaX < -40) {
          // Swiped Left -> Next Scene
          actions.nextScene();
        } else if (deltaX > 40) {
          // Swiped Right -> Previous Scene
          actions.previousScene();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [actions]);

  // Floating hover control bar that disappears when cursor is inactive
  const [controlsVisible, setControlsVisible] = React.useState(false);
  const hideTimerRef = React.useRef<number | null>(null);

  useEffect(() => {
    const onActivity = () => {
      setControlsVisible(true);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    };

    window.addEventListener('mousemove', onActivity);
    return () => {
      window.removeEventListener('mousemove', onActivity);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  // When countdown timer hits 00:00, trigger Scene 12
  const handleCountdownZero = () => {
    actions.startService();
  };

  return (
    <PresentationShell
      isBlackout={state.isBlackout}
      isHolding={state.isHolding}
      showOverlayIndicator={false}
    >
      <Transition
        motionPreset={currentScene.motionPreset}
        sceneKey={currentScene.id}
      >
        <SceneRenderer
          scene={currentScene}
          serviceDate={state.serviceDate}
          serviceTime={state.serviceTime}
          timezone={state.timezone}
          simulatedSeconds={state.simulatedTimeRemainingSeconds}
          onCountdownZero={handleCountdownZero}
        />
      </Transition>

      {/* Floating Interactive Controls (Visible on mouse movement, unobtrusive on projector) */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0d0e14]/90 border border-[#d4af37]/30 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-[#fbf8f2] transition-all duration-300 pointer-events-auto ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <button
          onClick={actions.previousScene}
          className="p-1.5 rounded-full hover:bg-white/10 text-[#d4af37] transition-colors"
          title="Previous Scene (Scroll Up or Left Arrow)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="font-mono text-xs font-semibold text-[#fbf8f2] px-1">
          {String(currentScene.sceneNumber).padStart(2, '0')} / 12
        </span>

        <button
          onClick={actions.nextScene}
          className="p-1.5 rounded-full hover:bg-white/10 text-[#d4af37] transition-colors"
          title="Next Scene (Scroll Down or Right Arrow)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <span className="h-4 w-px bg-white/20 mx-1" />

        <button
          onClick={state.isPlaying ? actions.pause : actions.play}
          className="px-2.5 py-1 rounded text-xs font-medium text-[#fbf8f2] hover:bg-white/10 transition-colors"
        >
          {state.isPlaying ? 'Pause' : 'Play'}
        </button>

        <span className="text-[11px] text-[#a39b8d] hidden sm:inline pl-1 font-sans">
          (Scroll wheel or ↑/↓ to navigate)
        </span>
      </div>
    </PresentationShell>
  );
};

export const DisplayRoute: React.FC = () => {
  return (
    <PresentationProvider isController={false}>
      <DisplayContent />
    </PresentationProvider>
  );
};
