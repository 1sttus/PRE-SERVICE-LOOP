import React from 'react';
import { Scene } from '../types/presentation';

interface SceneTextProps {
  scene: Scene;
}

export const SceneText: React.FC<SceneTextProps> = ({ scene }) => {
  const isLeft = scene.textAlignment === 'left';

  return (
    <div
      className={`relative z-20 flex flex-col justify-center max-w-5xl transition-all duration-700 ${
        isLeft ? 'items-start text-left' : 'items-center text-center mx-auto'
      }`}
    >
      {/* Brand / Kicker Eyebrow */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-[1px] bg-[#d4af37]/60" />
        <span className="font-sans-inter text-xs md:text-sm tracking-[0.3em] uppercase text-[#c5a059] font-medium">
          {scene.tagline || 'MORNINGSTAR COVENANT INTERNATIONAL CHURCH'}
        </span>
        <span className="w-6 h-[1px] bg-[#d4af37]/60" />
      </div>

      {/* Main Headline in Cormorant Garamond */}
      <h1 className="font-serif-cormorant text-5xl md:text-7xl lg:text-8xl tracking-tight text-[#fbf8f2] font-semibold leading-[1.05] mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] whitespace-pre-line text-balance">
        {scene.headline}
      </h1>

      {/* Main text if distinct (e.g. Scene 4, Scene 6, Scene 8, Scene 12) */}
      {scene.mainText && (
        <div className="font-serif-cormorant text-3xl md:text-5xl lg:text-6xl text-[#e5c158] font-normal leading-snug mb-6 whitespace-pre-line text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          {scene.mainText}
        </div>
      )}

      {/* Scripture Quote (Scene 5) */}
      {scene.scripture && (
        <div className="my-6 max-w-3xl">
          <blockquote className="font-serif-cormorant italic text-4xl md:text-6xl lg:text-7xl text-[#fbf8f2] font-normal leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
            {scene.scripture}
          </blockquote>
          {scene.reference && (
            <div className="mt-4 font-sans-inter text-sm md:text-base tracking-[0.25em] text-[#d4af37] uppercase font-semibold">
              — {scene.reference}
            </div>
          )}
        </div>
      )}

      {/* Supporting Text in Inter */}
      {scene.supporting && !scene.scripture && (
        <p className="font-sans-inter text-lg md:text-2xl text-[#d4af37] font-medium tracking-wide mb-4 max-w-2xl text-balance">
          {scene.supporting}
        </p>
      )}

      {/* Body Copy */}
      {scene.body && (
        <p className="font-sans-inter text-base md:text-xl text-[#a39b8d] font-normal leading-relaxed max-w-2xl text-balance">
          {scene.body}
        </p>
      )}

      {/* Closing remark (Scene 6, Scene 12) */}
      {scene.closing && (
        <p className="mt-6 font-sans-inter text-sm md:text-base text-[#c8bfb1] tracking-wider uppercase opacity-80 border-t border-[#d4af37]/20 pt-4">
          {scene.closing}
        </p>
      )}
    </div>
  );
};
