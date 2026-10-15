import React, { useState } from 'react';
import { RecoveryBand } from '../types/whoop';

interface ConcentricRingsProps {
  strain: number; // 0.0 - 21.0
  strainTargetMax: number;
  recovery: number; // 0 - 100
  recoveryBand: RecoveryBand;
  sleepScore: number; // 0 - 100
  size?: number;
  className?: string;
  onSelectMetric?: (metric: 'recovery' | 'strain' | 'sleep') => void;
}

export const ConcentricRings: React.FC<ConcentricRingsProps> = ({
  strain,
  strainTargetMax = 16.0,
  recovery,
  recoveryBand,
  sleepScore,
  size = 280,
  className = '',
  onSelectMetric,
}) => {
  const [activeCenter, setActiveCenter] = useState<'recovery' | 'strain' | 'sleep'>('recovery');

  const strokeWidth = 12;
  const center = size / 2;

  // Radii for the three concentric rings
  const rStrain = center - strokeWidth; // Outer ring
  const rRecovery = rStrain - strokeWidth - 6; // Middle ring
  const rSleep = rRecovery - strokeWidth - 6; // Inner ring

  const circumStrain = 2 * Math.PI * rStrain;
  const circumRecovery = 2 * Math.PI * rRecovery;
  const circumSleep = 2 * Math.PI * rSleep;

  // Clamped fractions
  const strainPct = Math.min(1, Math.max(0, strain / 21));
  const recoveryPct = Math.min(1, Math.max(0, recovery / 100));
  const sleepPct = Math.min(1, Math.max(0, sleepScore / 100));

  // Offsets (starting from top, so strokeDashoffset)
  const offsetStrain = circumStrain * (1 - strainPct);
  const offsetRecovery = circumRecovery * (1 - recoveryPct);
  const offsetSleep = circumSleep * (1 - sleepPct);

  // Recovery colors
  const recoveryColor =
    recoveryBand === 'green' ? '#00F090' : recoveryBand === 'yellow' ? '#F59E0B' : '#EF4444';
  const recoveryGlow =
    recoveryBand === 'green'
      ? 'rgba(0, 240, 144, 0.35)'
      : recoveryBand === 'yellow'
      ? 'rgba(245, 158, 11, 0.35)'
      : 'rgba(239, 68, 68, 0.35)';

  const handleCenterClick = () => {
    const next = activeCenter === 'recovery' ? 'strain' : activeCenter === 'strain' ? 'sleep' : 'recovery';
    setActiveCenter(next);
    if (onSelectMetric) onSelectMetric(next);
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <filter id="glow-strain" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-recovery" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-sleep" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Ring Background (Strain) */}
        <circle
          cx={center}
          cy={center}
          r={rStrain}
          fill="none"
          stroke="#162338"
          strokeWidth={strokeWidth}
        />
        {/* Outer Ring Active (Strain: Cyan) */}
        <circle
          cx={center}
          cy={center}
          r={rStrain}
          fill="none"
          stroke="#00D4FF"
          strokeWidth={strokeWidth}
          strokeDasharray={circumStrain}
          strokeDashoffset={offsetStrain}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          filter="url(#glow-strain)"
        />

        {/* Middle Ring Background (Recovery) */}
        <circle
          cx={center}
          cy={center}
          r={rRecovery}
          fill="none"
          stroke="#18271E"
          strokeWidth={strokeWidth}
        />
        {/* Middle Ring Active (Recovery: Green/Yellow/Red) */}
        <circle
          cx={center}
          cy={center}
          r={rRecovery}
          fill="none"
          stroke={recoveryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumRecovery}
          strokeDashoffset={offsetRecovery}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          filter="url(#glow-recovery)"
        />

        {/* Inner Ring Background (Sleep) */}
        <circle
          cx={center}
          cy={center}
          r={rSleep}
          fill="none"
          stroke="#201C38"
          strokeWidth={strokeWidth}
        />
        {/* Inner Ring Active (Sleep: Indigo) */}
        <circle
          cx={center}
          cy={center}
          r={rSleep}
          fill="none"
          stroke="#818CF8"
          strokeWidth={strokeWidth}
          strokeDasharray={circumSleep}
          strokeDashoffset={offsetSleep}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          filter="url(#glow-sleep)"
        />
      </svg>

      {/* Center Interactive Value Dial */}
      <button
        onClick={handleCenterClick}
        className="absolute inset-0 m-auto flex flex-col items-center justify-center rounded-full text-center transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
        style={{
          width: rSleep * 2 - 16,
          height: rSleep * 2 - 16,
          backgroundColor: '#0D131D',
          boxShadow: `0 0 24px ${
            activeCenter === 'recovery'
              ? recoveryGlow
              : activeCenter === 'strain'
              ? 'rgba(0, 212, 255, 0.25)'
              : 'rgba(129, 140, 248, 0.25)'
          }`,
        }}
        title="Tap to switch displayed metric"
        aria-label="Switch displayed ring score"
      >
        {activeCenter === 'recovery' && (
          <>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recovery
            </span>
            <div className="flex items-baseline mt-0.5">
              <span
                className="text-4xl font-extrabold tracking-tight tabular-nums"
                style={{ color: recoveryColor }}
              >
                {recovery}
              </span>
              <span className="text-base font-bold ml-0.5" style={{ color: recoveryColor }}>
                %
              </span>
            </div>
            <span className="text-[10px] text-slate-400 capitalize mt-0.5">
              {recoveryBand} Zone
            </span>
          </>
        )}

        {activeCenter === 'strain' && (
          <>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
              Day Strain
            </span>
            <div className="flex items-baseline mt-0.5">
              <span className="text-4xl font-extrabold tracking-tight tabular-nums text-white">
                {strain.toFixed(1)}
              </span>
              <span className="text-xs text-sky-400/80 ml-1 font-mono">/ 21.0</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Target ~{strainTargetMax.toFixed(1)}
            </span>
          </>
        )}

        {activeCenter === 'sleep' && (
          <>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Sleep Perf
            </span>
            <div className="flex items-baseline mt-0.5">
              <span className="text-4xl font-extrabold tracking-tight tabular-nums text-indigo-300">
                {sleepScore}
              </span>
              <span className="text-base font-bold ml-0.5 text-indigo-400">%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">Last Night</span>
          </>
        )}

        <span className="text-[9px] text-slate-500 mt-1">Tap to cycle</span>
      </button>
    </div>
  );
};
