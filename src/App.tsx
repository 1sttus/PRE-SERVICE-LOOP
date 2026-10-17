import React, { useState, useEffect } from 'react';
import { DisplayRoute } from './routes/DisplayRoute';
import { ControlRoute } from './routes/ControlRoute';
import { Tv, Sliders, ExternalLink, Sparkles } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'root' | 'display' | 'control'>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('display') || hash.includes('display')) return 'display';
    if (path.includes('control') || hash.includes('control')) return 'control';
    return 'root';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('display') || hash.includes('display')) {
        setCurrentRoute('display');
      } else if (path.includes('control') || hash.includes('control')) {
        setCurrentRoute('control');
      } else {
        setCurrentRoute('root');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route: 'display' | 'control') => {
    window.history.pushState({}, '', `/${route}`);
    setCurrentRoute(route);
  };

  if (currentRoute === 'display') {
    return <DisplayRoute />;
  }

  if (currentRoute === 'control') {
    return <ControlRoute />;
  }

  // Root Welcome / Hub Launcher
  return (
    <div className="min-h-screen bg-[#08090b] text-[#fbf8f2] flex flex-col justify-between font-sans-inter selection:bg-[#d4af37] selection:text-black">
      {/* Top Bar */}
      <header className="border-b border-[#1c1e27] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
          <span className="font-serif-cormorant text-2xl font-bold tracking-wider text-[#fbf8f2]">
            MORNINGSTAR
          </span>
          <span className="text-xs text-[#a39b8d] tracking-widest uppercase hidden sm:inline">
            Covenant International Church
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#c5a059] font-medium tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Broadcast Presentation Suite</span>
        </div>
      </header>

      {/* Main Mode Selection Card */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full">
        <div className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#d4af37] font-semibold">
          <span>Sanctuary Projection Engine</span>
        </div>

        <h1 className="font-serif-cormorant text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[#fbf8f2] mb-6 leading-tight">
          Morningstar Pre-Service Experience
        </h1>

        <p className="font-sans-inter text-base sm:text-lg text-[#a39b8d] max-w-2xl mb-12 leading-relaxed">
          Select an operating view below. For production services, launch the clean projection display on your sanctuary screens and operate the broadcast control room from your media desk.
        </p>

        {/* Two Core Routes Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Option 1: Clean Projection Display */}
          <div
            onClick={() => navigateTo('display')}
            className="group relative p-8 rounded-2xl bg-[#0e1017] border border-[#232738] hover:border-[#d4af37] transition-all duration-300 text-left flex flex-col justify-between cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:-translate-y-1"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#171a26] border border-[#2e334a] group-hover:border-[#d4af37]/60 flex items-center justify-center mb-6 text-[#d4af37] transition-colors">
                <Tv className="w-6 h-6" />
              </div>
              <h2 className="font-serif-cormorant text-2xl font-semibold text-[#fbf8f2] mb-2">
                Projection Display
              </h2>
              <div className="text-xs font-mono text-[#d4af37] mb-3">/display</div>
              <p className="text-sm text-[#a39b8d] leading-relaxed">
                Pristine 16:9 fullscreen projection output. Clean visuals without browser chrome, headers, or controls. Recovers state automatically.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#1c1f2e] flex items-center justify-between text-xs text-[#fbf8f2] font-medium group-hover:text-[#d4af37] transition-colors">
              <span>Launch Display Screen</span>
              <span className="text-lg">→</span>
            </div>
          </div>

          {/* Option 2: Media Team Control Room */}
          <div
            onClick={() => navigateTo('control')}
            className="group relative p-8 rounded-2xl bg-[#0e1017] border border-[#232738] hover:border-[#38bdf8] transition-all duration-300 text-left flex flex-col justify-between cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:-translate-y-1"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#171a26] border border-[#2e334a] group-hover:border-[#38bdf8]/60 flex items-center justify-center mb-6 text-[#38bdf8] transition-colors">
                <Sliders className="w-6 h-6" />
              </div>
              <h2 className="font-serif-cormorant text-2xl font-semibold text-[#fbf8f2] mb-2">
                Media Control Room
              </h2>
              <div className="text-xs font-mono text-[#38bdf8] mb-3">/control</div>
              <p className="text-sm text-[#a39b8d] leading-relaxed">
                Full operator dashboard with dual Preview/Program bus, Go Live switcher, emergency hold, black screen, countdown scheduler, and shortcuts.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#1c1f2e] flex items-center justify-between text-xs text-[#fbf8f2] font-medium group-hover:text-[#38bdf8] transition-colors">
              <span>Enter Control Room</span>
              <span className="text-lg">→</span>
            </div>
          </div>
        </div>

        {/* Dual Tab Tip */}
        <div className="mt-12 text-xs text-[#6b7280] flex items-center gap-2">
          <span>Tip: You can open both in separate browser windows and they will stay synchronized in real time.</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1c1e27] px-8 py-4 text-center text-xs text-[#6b7280]">
        Morningstar Covenant International Church • Sanctuary Presentation Engine
      </footer>
    </div>
  );
}
