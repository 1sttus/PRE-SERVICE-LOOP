import React, { useEffect, useRef } from 'react';

interface AtmosphereProps {
  accentGlow?: string;
  intensity?: number;
}

export const Atmosphere: React.FC<AtmosphereProps> = ({
  accentGlow = 'rgba(212, 175, 55, 0.2)',
  intensity = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1920);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 1080);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 1920;
      height = canvas.height = canvas.parentElement?.clientHeight || 1080;
    };
    window.addEventListener('resize', handleResize);

    // Subtle atmospheric dust/mote particles (small count for 60fps performance)
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.35 - 0.05, // gentle slow upward drift
      alpha: Math.random() * 0.5 + 0.15,
      targetAlpha: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.4 ? 'gold' : 'ivory',
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Render particles
      for (const p of particles) {
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;

        // Wrap around
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (p.hue === 'gold') {
          ctx.fillStyle = `rgba(229, 193, 88, ${p.alpha * intensity * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(251, 248, 242, ${p.alpha * intensity * 0.5})`;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Subtle volumetric radial ambient lighting */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 25%, ${accentGlow} 0%, rgba(12, 13, 16, 0) 75%)`,
        }}
      />
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
    </div>
  );
};
