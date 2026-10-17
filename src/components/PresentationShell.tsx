import React, { useState, useEffect, useRef } from 'react';

interface PresentationShellProps {
  children: React.ReactNode;
  isBlackout?: boolean;
  isHolding?: boolean;
  showOverlayIndicator?: boolean;
}

export const PresentationShell: React.FC<PresentationShellProps> = ({
  children,
  isBlackout = false,
  isHolding = false,
  showOverlayIndicator = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [isCursorHidden, setIsCursorHidden] = useState(false);
  const cursorTimerRef = useRef<number | null>(null);

  // Responsive 16:9 scaling math (Base resolution: 1920 x 1080)
  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const targetAspect = 16 / 9;
      const currentAspect = vw / vh;

      let newScale = 1;
      if (currentAspect > targetAspect) {
        // Limited by height
        newScale = vh / 1080;
      } else {
        // Limited by width
        newScale = vw / 1920;
      }
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Inactivity cursor hiding
  useEffect(() => {
    const handleMouseMove = () => {
      setIsCursorHidden(false);
      if (cursorTimerRef.current) {
        window.clearTimeout(cursorTimerRef.current);
      }
      cursorTimerRef.current = window.setTimeout(() => {
        setIsCursorHidden(true);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (cursorTimerRef.current) {
        window.clearTimeout(cursorTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`fixed inset-0 w-screen h-screen bg-[#000000] flex items-center justify-center overflow-hidden select-none outline-none ${
        isCursorHidden ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* 16:9 Canvas Container */}
      <div
        className="relative overflow-hidden bg-[#0c0d10] flex-shrink-0 origin-center transition-transform duration-75"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
        }}
      >
        {children}

        {/* Emergency Hold Subtle Overlay (Only if explicitly enabled or operator indicator) */}
        {isHolding && showOverlayIndicator && (
          <div className="absolute top-6 right-8 z-50 px-4 py-2 rounded-lg bg-[#3a131b]/90 border border-[#e5c158]/50 text-[#fbf8f2] font-sans-inter text-xs tracking-widest uppercase flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#e5c158] animate-ping" />
            <span>HOLD ACTIVE</span>
          </div>
        )}

        {/* Reversible Blackout Screen Overlay */}
        <div
          className={`absolute inset-0 bg-[#000000] z-50 pointer-events-none transition-opacity duration-700 ${
            isBlackout ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </div>
  );
};
