import React, { useMemo } from 'react';
import { Activity, Heart } from 'lucide-react';

interface PulseWaveformProps {
  bpm: number;
  hrv: number;
  history: number[];
  className?: string;
  onOpenSimulator?: () => void;
}

export const PulseWaveform: React.FC<PulseWaveformProps> = ({
  bpm,
  hrv,
  history,
  className = '',
  onOpenSimulator,
}) => {
  // Generate a realistic ECG/PPG wave path from pulse points
  const pathD = useMemo(() => {
    const width = 320;
    const height = 64;
    const step = width / (history.length - 1);

    // Normalize history values between min and max
    const min = Math.min(...history) - 5;
    const max = Math.max(...history) + 5;
    const range = Math.max(10, max - min);

    const points = history.map((val, idx) => {
      const x = idx * step;
      // Invert y because SVG 0 is top
      const normalized = (val - min) / range;
      const y = height - (normalized * (height - 16) + 8);
      return { x, y };
    });

    if (points.length < 2) return '';

    // Build smooth cubic bezier curve
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return d;
  }, [history]);

  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-[#121824] p-4 transition-all hover:border-slate-700/80 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400">
            <Heart className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-300">Live Heart Rate Telemetry</span>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Continuous PPG Sensor</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-mono">1.0 Hz Active</span>
            </div>
          </div>
        </div>

        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Calibrate Sensor
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-[#0A0E17] rounded-xl p-3 border border-slate-800/50">
          <span className="text-[10px] font-medium tracking-wide uppercase text-slate-400">
            Current Pulse
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {bpm}
            </span>
            <span className="text-xs font-semibold text-rose-400 font-mono">BPM</span>
          </div>
        </div>

        <div className="bg-[#0A0E17] rounded-xl p-3 border border-slate-800/50">
          <span className="text-[10px] font-medium tracking-wide uppercase text-slate-400">
            Real-Time HRV
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight tabular-nums">
              {hrv}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">MS rMSSD</span>
          </div>
        </div>
      </div>

      {/* Waveform graphic */}
      <div className="relative h-16 w-full overflow-hidden rounded-lg bg-[#080B10] border border-slate-800/60 flex items-center">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-2 opacity-10 pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border-r border-b border-emerald-400" />
          ))}
        </div>

        <svg
          viewBox="0 0 320 64"
          preserveAspectRatio="none"
          className="w-full h-full text-rose-500 overflow-visible"
        >
          <path
            d={pathD}
            fill="none"
            stroke="#F43F5E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="absolute right-2 top-2 flex items-center gap-1.5 bg-[#0D131D]/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono">
          <Activity className="w-3 h-3 text-rose-400 animate-spin" />
          <span>Real-time Stream</span>
        </div>
      </div>
    </div>
  );
};
