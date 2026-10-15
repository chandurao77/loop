import React from 'react';
import { Sliders, Activity } from 'lucide-react';

interface TopHeaderProps {
  activeTab: 'overview' | 'recovery' | 'strain' | 'sleep' | 'journal';
  setActiveTab: (tab: 'overview' | 'recovery' | 'strain' | 'sleep' | 'journal') => void;
  onOpenSimulator: () => void;
  liveBpm: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulator,
  liveBpm,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#080B10]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-lg font-extrabold tracking-tight text-white uppercase font-sans">
            WHOOP <span className="text-sky-400 font-mono text-sm tracking-normal">4.0</span>
          </span>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{liveBpm} BPM Live</span>
          </div>
        </div>

        {/* Zone 2: 4-5 Navigation Links (Single-line controls) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('overview')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'overview' ? 'text-white border-b-2 border-sky-400 pb-1' : 'hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'recovery' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-1' : 'hover:text-slate-200'
            }`}
          >
            Recovery
          </button>
          <button
            onClick={() => setActiveTab('strain')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'strain' ? 'text-sky-400 border-b-2 border-sky-400 pb-1' : 'hover:text-slate-200'
            }`}
          >
            Strain
          </button>
          <button
            onClick={() => setActiveTab('sleep')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'sleep' ? 'text-indigo-400 border-b-2 border-indigo-400 pb-1' : 'hover:text-slate-200'
            }`}
          >
            Sleep
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'journal' ? 'text-teal-400 border-b-2 border-teal-400 pb-1' : 'hover:text-slate-200'
            }`}
          >
            Journal
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs active:scale-95"
            aria-label="Calibrate biometric sensor and simulation"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Sensor Calibrator</span>
          </button>
        </div>
      </div>
    </header>
  );
};
