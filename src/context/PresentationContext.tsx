import React, { createContext, useContext, useMemo } from 'react';
import type {
  PresentationState,
  PlaybackStatus,
  TimelineItem,
  Scene,
} from '../types/presentation.ts';
import { usePresentationEngine } from '../engine/PresentationEngine.ts';
import { INITIAL_SCENES } from '../data/scenes.ts';

export interface PresentationContextValue {
  currentSceneId: string;
  playbackStatus: PlaybackStatus;
  timeline: TimelineItem[];
  currentScene: Scene;
  state: PresentationState;
  actions: {
    play: () => void;
    pause: () => void;
    resume: () => void;
    nextScene: () => void;
    previousScene: () => void;
    restart: () => void;
    jumpToScene: (indexOrId: number | string) => void;
    jumpToCountdown: () => void;
    startService: () => void;
    toggleLoop: () => void;
    toggleCountdownVisibility: () => void;
    toggleHold: () => void;
    toggleBlackout: () => void;
    setServiceTimeConfig: (date: string, time: string, tz?: string) => void;
    setSimulatedCountdown: (seconds: number | null) => void;
    toggleAudio: () => void;
  };
}

export const PresentationContext = createContext<PresentationContextValue | null>(null);

interface PresentationProviderProps {
  children: React.ReactNode;
  isController?: boolean;
}

/**
 * PresentationProvider wraps the application and exposes presentation state and actions.
 * State (currentSceneId, playbackStatus, timeline) is synchronized in real time via BroadcastChannel.
 */
export const PresentationProvider: React.FC<PresentationProviderProps> = ({
  children,
  isController = false,
}) => {
  const { state, actions: engineActions } = usePresentationEngine(isController);

  const contextValue = useMemo<PresentationContextValue>(() => {
    const currentScene = INITIAL_SCENES[state.currentSceneIndex] || INITIAL_SCENES[0];

    const actions = {
      ...engineActions,
      jumpToScene: (indexOrId: number | string) => {
        if (typeof indexOrId === 'number') {
          engineActions.jumpToScene(indexOrId);
        } else {
          const foundIndex = INITIAL_SCENES.findIndex((s) => s.id === indexOrId);
          if (foundIndex !== -1) {
            engineActions.jumpToScene(foundIndex);
          }
        }
      },
    };

    return {
      currentSceneId: state.currentSceneId || currentScene.id,
      playbackStatus: state.playbackStatus || (state.isPlaying ? 'playing' : 'paused'),
      timeline: state.timeline || [],
      currentScene,
      state,
      actions,
    };
  }, [state, engineActions]);

  return (
    <PresentationContext.Provider value={contextValue}>
      {children}
    </PresentationContext.Provider>
  );
};

/**
 * Hook to consume presentation context in any component
 */
export function usePresentationContext(): PresentationContextValue {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentationContext must be used within a PresentationProvider');
  }
  return context;
}
