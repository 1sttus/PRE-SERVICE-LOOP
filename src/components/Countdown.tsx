import React, { useState, useEffect } from 'react';
import { calculateTimeRemaining, parseTargetServiceTime, CountdownResult } from '../engine/countdown';

interface CountdownProps {
  targetDate: string;
  targetTime: string;
  timezone?: string;
  simulatedSeconds?: number | null;
  className?: string;
  onZeroReached?: () => void;
}

export const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  targetTime,
  timezone = 'Africa/Lagos',
  simulatedSeconds,
  className = '',
  onZeroReached,
}) => {
  const [remaining, setRemaining] = useState<CountdownResult>(() => {
    if (simulatedSeconds !== null && simulatedSeconds !== undefined) {
      return calculateTimeRemaining(Date.now() + simulatedSeconds * 1000);
    }
    const targetMs = parseTargetServiceTime(targetDate, targetTime, timezone);
    return calculateTimeRemaining(targetMs);
  });

  useEffect(() => {
    let triggered = false;

    const tick = () => {
      let res: CountdownResult;
      if (simulatedSeconds !== null && simulatedSeconds !== undefined) {
        const safeSec = Math.max(0, simulatedSeconds);
        const hours = Math.floor(safeSec / 3600);
        const minutes = Math.floor((safeSec % 3600) / 60);
        const seconds = safeSec % 60;
        const formattedString =
          hours > 0
            ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        res = {
          hours,
          minutes,
          seconds,
          totalSeconds: safeSec,
          isExpired: safeSec <= 0,
          formattedString,
        };
      } else {
        const targetMs = parseTargetServiceTime(targetDate, targetTime, timezone);
        res = calculateTimeRemaining(targetMs);
      }

      setRemaining(res);

      if (res.isExpired && !triggered) {
        triggered = true;
        onZeroReached?.();
      }
    };

    tick();
    const interval = setInterval(tick, 250); // High responsive clock check
    return () => clearInterval(interval);
  }, [targetDate, targetTime, timezone, simulatedSeconds, onZeroReached]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Refined ivory numerals, thin gold border, charcoal container */}
      <div className="relative px-12 py-8 rounded-2xl bg-[#121319]/80 backdrop-blur-md border border-[#d4af37]/40 shadow-[0_0_50px_rgba(212,175,55,0.12)]">
        {/* Subtle gold corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#e5c158] rounded-tl-sm -translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#e5c158] rounded-tr-sm translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#e5c158] rounded-bl-sm -translate-x-[1px] translate-y-[1px]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#e5c158] rounded-br-sm translate-x-[1px] translate-y-[1px]" />

        <div className="flex items-center gap-6">
          {remaining.hours > 0 && (
            <>
              <div className="flex flex-col items-center">
                <span className="font-serif-cormorant text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#fbf8f2] tabular-nums font-semibold leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  {String(remaining.hours).padStart(2, '0')}
                </span>
                <span className="font-sans-inter text-xs tracking-[0.25em] uppercase text-[#a39b8d] mt-2">
                  Hours
                </span>
              </div>
              <span className="font-serif-cormorant text-5xl md:text-7xl text-[#d4af37]/60 -mt-6">
                :
              </span>
            </>
          )}

          <div className="flex flex-col items-center">
            <span className="font-serif-cormorant text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#fbf8f2] tabular-nums font-semibold leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {String(remaining.minutes).padStart(2, '0')}
            </span>
            <span className="font-sans-inter text-xs tracking-[0.25em] uppercase text-[#a39b8d] mt-2">
              Minutes
            </span>
          </div>

          <span className="font-serif-cormorant text-5xl md:text-7xl text-[#d4af37]/60 -mt-6">
            :
          </span>

          <div className="flex flex-col items-center">
            <span className="font-serif-cormorant text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#fbf8f2] tabular-nums font-semibold leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {String(remaining.seconds).padStart(2, '0')}
            </span>
            <span className="font-sans-inter text-xs tracking-[0.25em] uppercase text-[#a39b8d] mt-2">
              Seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
