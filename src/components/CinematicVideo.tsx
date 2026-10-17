import React, { useState } from 'react';
import { CinematicImage } from './CinematicImage';
import { MotionPreset } from '../types/presentation';

interface CinematicVideoProps {
  videoSrc?: string;
  fallbackImageSrc?: string;
  alt: string;
  motionPreset?: MotionPreset;
}

export const CinematicVideo: React.FC<CinematicVideoProps> = ({
  videoSrc,
  fallbackImageSrc,
  alt,
  motionPreset = 'slowZoom',
}) => {
  const [videoError, setVideoError] = useState(false);

  if (!videoSrc || videoError) {
    return (
      <CinematicImage
        src={fallbackImageSrc}
        alt={alt}
        motionPreset={motionPreset}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0c0d10]">
      <video
        autoPlay
        loop
        muted
        playsInline
        onError={() => setVideoError(true)}
        className="w-full h-full object-cover select-none"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
};
