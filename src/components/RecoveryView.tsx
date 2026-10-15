import React from 'react';
import { DailyBiometricRecord, UserBaseline } from '../types/whoop';
import { Activity, ShieldCheck, TrendingUp, Zap, Wind, Thermometer, Droplets } from 'lucide-react';

interface RecoveryViewProps {
  currentRecord: DailyBiometricRecord;
  history: DailyBiometricRecord[];
  baseline: UserBaseline;
  onOpenSimulator: () => void;
}

export const RecoveryView: React.FC<RecoveryViewProps> = ({
  currentRecord,
  history,
  baseline,
  onOpenSimulator,
}) => {
  const { recoveryScore, recoveryBand, hrvMs, rhrBpm, respiratoryRateRpm, skinTempDiffF, spo2Percent } =
    currentRecord;

  const bandColor =
    recoveryBand === 'green' ? '#00F090' : recoveryBand === 'yellow' ? '#F59E0B' : '#EF4444';
  const bandBg =
    recoveryBand === 'green'
      ? 'bg-emerald-500/10 border-emerald-500/30'
      : recoveryBand === 'yellow'
      ? 'bg-amber-500/10 border-amber-500/30'
      : 'bg-rose-500/10 border-rose-500/30';

  // Comparisons against baseline
  const hrvDiff = hrvMs - baseline.hrvBaseline;
  const rhrDiff = rhrBpm - baseline.rhrBaseline;
  const respDiff = Number((respiratoryRateRpm - baseline.respiratoryBaseline).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div
        className={`rounded-2xl border p-6 ${bandBg} transition-all relative overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Autonomic Readiness Score</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span
                className="text-5xl md:text-6xl font-extrabold tracking-tight tabular-nums"
                style={{ color: bandColor }}
              >
                {recoveryScore}%
              </span>
              <span className="text-xl font-bold uppercase tracking-wider" style={{ color: bandColor }}>
                {recoveryBand} Zone
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed pt-1">
              {currentRecord.coachRecommendation}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <button
              onClick={onOpenSimulator}
              className="px-4 py-2 text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            >
              Calibrate Today's Biometrics
            </button>
            <span className="text-[11px] text-slate-400">
              Calibrated from slow-wave sleep baseline
            </span>
          </div>
        </div>
      </div>

      {/* 5 Core Autonomic Pillars Grid */}
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-slate-300 mb-3">
          Core Biometric Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 1. HRV */}
          <div className="rounded-xl bg-[#121824] border border-slate-800/80 p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Heart Rate Variability
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tabular-nums">{hrvMs}</span>
              <span className="text-xs font-mono text-slate-400">ms rMSSD</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-400 border-t border-slate-800/60 pt-2">
              <span>Baseline: {baseline.hrvBaseline} ms</span>
              <span
                className={`font-semibold tabular-nums ${
                  hrvDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {hrvDiff >= 0 ? `+${hrvDiff}` : hrvDiff} ms
              </span>
            </div>
          </div>

          {/* 2. RHR */}
          <div className="rounded-xl bg-[#121824] border border-slate-800/80 p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Resting Heart Rate
              </span>
              <Zap className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tabular-nums">{rhrBpm}</span>
              <span className="text-xs font-mono text-slate-400">BPM</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-400 border-t border-slate-800/60 pt-2">
              <span>Baseline: {baseline.rhrBaseline} bpm</span>
              <span
                className={`font-semibold tabular-nums ${
                  rhrDiff <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {rhrDiff > 0 ? `+${rhrDiff}` : rhrDiff} bpm
              </span>
            </div>
          </div>

          {/* 3. Respiratory Rate */}
          <div className="rounded-xl bg-[#121824] border border-slate-800/80 p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Respiratory Rate
              </span>
              <Wind className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {respiratoryRateRpm}
              </span>
              <span className="text-xs font-mono text-slate-400">RPM</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-400 border-t border-slate-800/60 pt-2">
              <span>Baseline: {baseline.respiratoryBaseline} rpm</span>
              <span
                className={`font-semibold tabular-nums ${
                  Math.abs(respDiff) <= 0.5 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {respDiff > 0 ? `+${respDiff}` : respDiff} rpm
              </span>
            </div>
          </div>

          {/* 4. Skin Temperature */}
          <div className="rounded-xl bg-[#121824] border border-slate-800/80 p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Skin Temperature Deviation
              </span>
              <Thermometer className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {skinTempDiffF > 0 ? `+${skinTempDiffF}` : skinTempDiffF}
              </span>
              <span className="text-xs font-mono text-slate-400">°F from baseline</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-400 border-t border-slate-800/60 pt-2">
              <span>Status</span>
              <span className="text-emerald-400 font-medium">Within Normal Range</span>
            </div>
          </div>

          {/* 5. Blood Oxygen (SpO2) */}
          <div className="rounded-xl bg-[#121824] border border-slate-800/80 p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Blood Oxygen Saturation
              </span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tabular-nums">{spo2Percent}</span>
              <span className="text-xs font-mono text-slate-400">% SpO2</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-400 border-t border-slate-800/60 pt-2">
              <span>Target: 95 - 100%</span>
              <span className="text-emerald-400 font-medium">Optimal Pulmonary Tone</span>
            </div>
          </div>

          {/* 6. Autonomic Equilibrium Summary */}
          <div className="rounded-xl bg-[#121824] border border-slate-800/80 p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nervous System Balance
              </span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white">
                {recoveryScore >= 67
                  ? 'Parasympathetic Restored'
                  : recoveryScore >= 34
                  ? 'Equilibrated Tone'
                  : 'Sympathetic Dominant'}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 border-t border-slate-800/60 pt-2">
              {recoveryScore >= 67
                ? 'High vagal tone indicates complete recovery of autonomic reserves.'
                : recoveryScore >= 34
                ? 'Body is operating at balanced capacity; moderate training indicated.'
                : 'Elevated stress markers suggest systemic fatigue or inflammation.'}
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Trend History */}
      <div className="rounded-2xl bg-[#121824] border border-slate-800/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-200">
            7-Day Recovery & HRV Historical Trend
          </span>
          <span className="text-xs text-slate-400">Baseline comparison</span>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-5 gap-3">
          {history.map((record) => {
            const hColor =
              record.recoveryBand === 'green'
                ? 'bg-emerald-500'
                : record.recoveryBand === 'yellow'
                ? 'bg-amber-500'
                : 'bg-rose-500';

            return (
              <div
                key={record.date}
                className="flex flex-col items-center bg-[#090D14] rounded-xl p-3 border border-slate-800/60"
              >
                <span className="text-[11px] font-medium text-slate-400 mb-2 truncate max-w-full">
                  {record.dayLabel.split(',')[0]}
                </span>
                
                {/* Visual Bar */}
                <div className="w-full bg-slate-800/50 rounded-full h-20 relative flex flex-col justify-end p-1">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${hColor}`}
                    style={{ height: `${record.recoveryScore}%` }}
                  />
                </div>

                <div className="mt-2 text-center">
                  <span className="text-sm font-extrabold text-white tabular-nums">
                    {record.recoveryScore}%
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {record.hrvMs}ms
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
