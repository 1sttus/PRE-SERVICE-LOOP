import React from 'react';
import { Scene } from '../types/presentation';
import { SceneBackground } from './SceneBackground';
import { SceneText } from './SceneText';
import { Countdown } from './Countdown';

interface SceneRendererProps {
  scene: Scene;
  serviceDate: string;
  serviceTime: string;
  timezone?: string;
  simulatedSeconds?: number | null;
  onCountdownZero?: () => void;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  scene,
  serviceDate,
  serviceTime,
  timezone,
  simulatedSeconds,
  onCountdownZero,
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background layer */}
      <SceneBackground scene={scene} />

      {/* Content Canvas */}
      <div className="relative z-20 w-full h-full flex flex-col justify-center px-[6%] py-[7%]">
        {scene.isCountdownScene ? (
          <div className="flex flex-col items-center justify-center my-auto">
            <SceneText scene={scene} />
            <Countdown
              targetDate={serviceDate}
              targetTime={serviceTime}
              timezone={timezone}
              simulatedSeconds={simulatedSeconds}
              onZeroReached={onCountdownZero}
              className="mt-10"
            />
          </div>
        ) : scene.id === 'scene-6-a-little-reminder' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
            <div className="lg:col-span-7">
              <SceneText scene={scene} />
            </div>
            <div className="lg:col-span-5 flex justify-center items-center">
              {/* Minimal graceful illustration of phone silence */}
              <div className="relative p-8 rounded-3xl bg-[#111218]/80 border border-[#d4af37]/30 shadow-2xl backdrop-blur-md max-w-sm w-full flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#1b1c24] border border-[#e5c158]/50 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(229,193,88,0.2)]">
                  <svg className="w-8 h-8 text-[#e5c158]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    <line x1="2" y1="2" x2="22" y2="22" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="font-serif-cormorant text-2xl text-[#fbf8f2] text-center font-medium mb-2">
                  Quiet the Noise
                </div>
                <p className="font-sans-inter text-xs tracking-wider text-[#a39b8d] text-center uppercase">
                  Entering God's Presence
                </p>
                {/* Dissolving notification pills */}
                <div className="w-full mt-6 space-y-2 opacity-40">
                  <div className="h-2 rounded bg-[#3a131b] w-3/4 mx-auto animate-pulse" />
                  <div className="h-2 rounded bg-[#2a2b36] w-1/2 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        ) : scene.textAlignment === 'right' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
            <div className="lg:col-span-4 hidden lg:flex justify-start opacity-40">
              <div className="h-72 w-[1px] bg-gradient-to-b from-transparent via-[#d4af37]/40 to-transparent" />
            </div>
            <div className="lg:col-span-8 flex justify-end">
              <SceneText scene={scene} />
            </div>
          </div>
        ) : scene.textAlignment === 'left' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
            <div className="lg:col-span-8">
              <SceneText scene={scene} />
            </div>
            <div className="lg:col-span-4 hidden lg:flex justify-end opacity-40">
              {/* Visual geometric pillar balance */}
              <div className="h-72 w-[1px] bg-gradient-to-b from-transparent via-[#d4af37]/40 to-transparent" />
            </div>
          </div>
        ) : (
          <div className="my-auto flex flex-col items-center justify-center">
            <SceneText scene={scene} />
          </div>
        )}
      </div>
    </div>
  );
};
