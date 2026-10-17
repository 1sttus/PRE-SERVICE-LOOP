import React, { useState } from 'react';
import { MotionPreset } from '../types/presentation';

interface CinematicImageProps {
  src?: string;
  alt: string;
  motionPreset?: MotionPreset;
  className?: string;
}

export const CinematicImage: React.FC<CinematicImageProps> = ({
  src,
  alt,
  motionPreset = 'slowZoom',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // Motion preset animations
  const getMotionAnimationClass = () => {
    switch (motionPreset) {
      case 'slowZoom':
        return 'animate-slow-zoom';
      case 'parallaxDrift':
        return 'animate-parallax-drift';
      case 'softRise':
        return 'animate-soft-rise';
      default:
        return 'animate-subtle-drift';
    }
  };

  if (!src || hasError) {
    // Rich procedural fallback composition
    return (
      <div className={`absolute inset-0 bg-[#0e1014] overflow-hidden ${className}`}>
        {/* Deep layered geometric gradient mimicking quiet cathedral architecture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#261914_0%,#111216_55%,#08090b_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(212,175,55,0.06)_0%,transparent_60%,rgba(12,13,16,0.9)_100%)]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <svg className="w-[60%] h-[60%] text-[#d4af37]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <circle cx="50" cy="50" r="44" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="50" y1="6" x2="50" y2="94" strokeWidth="0.5" />
            <line x1="6" y1="50" x2="94" y2="50" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden bg-[#0a0b0d] ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover select-none will-change-transform ${getMotionAnimationClass()}`}
        style={{
          transformOrigin: 'center center',
          animationDuration: '30s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      />
    </div>
  );
};
