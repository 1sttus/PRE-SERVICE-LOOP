import React from 'react';
import { CinematicVideo } from './CinematicVideo';
import { Atmosphere } from './Atmosphere';
import { Scene } from '../types/presentation';

interface SceneBackgroundProps {
  scene: Scene;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ scene }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Visual media layer */}
      <CinematicVideo
        videoSrc={scene.videoSrc}
        fallbackImageSrc={scene.imageSrc}
        alt={scene.title}
        motionPreset={scene.motionPreset}
      />

      {/* Atmospheric lighting and motes */}
      <Atmosphere accentGlow={scene.accentGlow} />

      {/* Cinematic dark scrim overlays ensuring WCAG AA contrast (ivory on dark) */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundColor: '#0c0d10',
          opacity: scene.darkOverlayOpacity,
        }}
      />

      {/* Vignette for camera depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(8,9,11,0.85)_100%)] pointer-events-none" />

      {/* Subtle bottom gradient scrim */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0c0d10] via-[#0c0d10]/40 to-transparent" />
    </div>
  );
};
