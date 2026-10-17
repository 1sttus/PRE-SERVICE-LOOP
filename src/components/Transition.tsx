import React from 'react';
import { MotionPreset } from '../types/presentation';

interface TransitionProps {
  children: React.ReactNode;
  motionPreset: MotionPreset;
  sceneKey: string | number;
}

export const Transition: React.FC<TransitionProps> = ({
  children,
  motionPreset,
  sceneKey,
}) => {
  // Preset animation classes
  const getTransitionClass = () => {
    switch (motionPreset) {
      case 'cinematicFade':
        return 'animate-cinematic-fade';
      case 'slowZoom':
        return 'animate-slow-zoom-fade';
      case 'softRise':
        return 'animate-soft-rise-fade';
      case 'parallaxDrift':
        return 'animate-parallax-drift-fade';
      case 'lightReveal':
        return 'animate-light-reveal';
      case 'crossDissolve':
        return 'animate-cross-dissolve';
      case 'softWipe':
        return 'animate-soft-wipe';
      default:
        return 'animate-cinematic-fade';
    }
  };

  return (
    <div key={sceneKey} className={`relative w-full h-full ${getTransitionClass()}`}>
      {children}
    </div>
  );
};
