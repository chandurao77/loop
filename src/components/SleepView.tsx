import React, { useState } from 'react';
import { DailyBiometricRecord, UserBaseline } from '../types/whoop';
import { calculateSleepGuidance, formatDurationHoursMins } from '../utils/biometricCalculations';
import { Moon, Bed, Clock, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SleepViewProps {
  currentRecord: DailyBiometricRecord;
  baseline: UserBaseline;
  onOpenSimulator: () => void;
}

export const SleepView: React.FC<SleepViewProps> = ({
  currentRecord,
  baseline,
  onOpenSimulator,
}) => {
  const { sleep, dayStrain } = currentRecord;
  const { stages } = sleep;

  const [wakeTime, setWakeTime] = useState<string>('07:00 AM');
  const [selectedTier, setSelectedTier] = useState<'peak' | 'perform' | 'get_by'>('peak');

  const guidance = calculateSleepGuidance(
    baseline.baseSleepNeedHours,
    sleep.sleepDebtMinutes,
    dayStrain,
    wakeTime,
    selectedTier
  );

  const totalSleepMinutes = sleep.asleepMinutes;
  const totalStagesMinutes = stages.deepMinutes + stages.remMinutes + stages.lightMinutes + stages.awakeMinutes;

  const deepPct = Math.round((stages.deepMinutes / totalStagesMinutes) * 100);
  const remPct = Math.round((stages.remMinutes / totalStagesMinutes) * 100);
  const lightPct = Math.round((stages.lightMinutes / totalStagesMinutes) * 100);
  const awakePct = Math.round((stages.awakeMinutes / totalStagesMinutes) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#12142d] to-[#0d1021] p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Moon className="w-4 h-4" />
              <span>Sleep Performance & Architecture</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl md:text-6xl font-extrabold text-indigo-300 tracking-tight tabular-nums">
                {sleep.sleepPerformancePercent}%
              </span>
              <span className="text-xl font-bold text-indigo-400 uppercase tracking-wider">
                {sleep.sleepPerformancePercent >= 85 ? 'Restored' : 'Deficit'}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-xl">
              You achieved {formatDurationHoursMins(sleep.asleepMinutes)} of restorative sleep out of{' '}
              {formatDurationHoursMins(sleep.sleepNeedMinutes)} calculated physiological need.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-[#0A0D17] border border-slate-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Time In Bed
              </span>
              <span className="text-xl font-extrabold text-white tabular-nums">
                {formatDurationHoursMins(sleep.timeInBedMinutes)}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {sleep.bedtime} – {sleep.wakeTime}
              </span>
            </div>

            <div className="bg-[#0A0D17] border border-slate-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Efficiency
              </span>
              <span className="text-xl font-extrabold text-emerald-400 tabular-nums">
                {sleep.sleepEfficiencyPercent}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {sleep.wakeEventsCount} wake events
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Stage Stacked Bar (Hypnogram Summary) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>Sleep Architecture Composition</span>
            <span>Total Duration: {formatDurationHoursMins(sleep.timeInBedMinutes)}</span>
          </div>

          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-900 border border-slate-800">
            <div
              style={{ width: `${deepPct}%` }}
              className="bg-indigo-600 transition-all"
              title={`Deep (Slow Wave): ${stages.deepMinutes}m (${deepPct}%)`}
            />
            <div
              style={{ width: `${remPct}%` }}
              className="bg-teal-400 transition-all"
              title={`REM Sleep: ${stages.remMinutes}m (${remPct}%)`}
            />
            <div
              style={{ width: `${lightPct}%` }}
              className="bg-sky-400/70 transition-all"
              title={`Light Sleep: ${stages.lightMinutes}m (${lightPct}%)`}
            />
            <div
              style={{ width: `${awakePct}%` }}
              className="bg-rose-500/80 transition-all"
              title={`Awake / Restless: ${stages.awakeMinutes}m (${awakePct}%)`}
            />
          </div>

          {/* Staging Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
              <span className="text-slate-300">
                Deep (SWS): <strong className="text-white font-mono">{formatDurationHoursMins(stages.deepMinutes)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0" />
              <span className="text-slate-300">
                REM: <strong className="text-white font-mono">{formatDurationHoursMins(stages.remMinutes)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400/70 shrink-0" />
              <span className="text-slate-300">
                Light: <strong className="text-white font-mono">{formatDurationHoursMins(stages.lightMinutes)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shrink-0" />
              <span className="text-slate-300">
                Awake: <strong className="text-white font-mono">{formatDurationHoursMins(stages.awakeMinutes)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bedtime Coach Interactive Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121824] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">WHOOP Bedtime Sleep Coach</h3>
              <p className="text-xs text-slate-400">
                Calculates precise sleep need tonight based on accumulated debt and day strain
              </p>
            </div>
          </div>

          {/* Wake target picker */}
          <div className="flex items-center gap-2 bg-[#090D14] border border-slate-800 rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Target Wake:</span>
            <select
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="05:30 AM">05:30 AM</option>
              <option value="06:00 AM">06:00 AM</option>
              <option value="06:30 AM">06:30 AM</option>
              <option value="07:00 AM">07:00 AM</option>
              <option value="07:30 AM">07:30 AM</option>
              <option value="08:00 AM">08:00 AM</option>
              <option value="08:30 AM">08:30 AM</option>
            </select>
          </div>
        </div>

        {/* Performance Goal Tabs */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Tomorrow's Athletic Expectation
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedTier('peak')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTier === 'peak'
                  ? 'border-indigo-500 bg-indigo-950/30 shadow-md'
                  : 'border-slate-800 bg-[#090D14] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">100% Peak Performance</span>
                {selectedTier === 'peak' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-400">
                Full physiological restoration, debt clearance, and maximum cognitive readiness.
              </p>
            </button>

            <button
              onClick={() => setSelectedTier('perform')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTier === 'perform'
                  ? 'border-indigo-500 bg-indigo-950/30 shadow-md'
                  : 'border-slate-800 bg-[#090D14] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">85% Perform / Maintain</span>
                {selectedTier === 'perform' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-400">
                Sufficient for ordinary athletic output and daily productivity demands.
              </p>
            </button>

            <button
              onClick={() => setSelectedTier('get_by')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTier === 'get_by'
                  ? 'border-indigo-500 bg-indigo-950/30 shadow-md'
                  : 'border-slate-800 bg-[#090D14] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">70% Get By</span>
                {selectedTier === 'get_by' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-400">
                Minimum threshold to function with minor deficit accumulation.
              </p>
            </button>
          </div>
        </div>

        {/* Calculated Bedtime Recommendation Banner */}
        <div className="rounded-xl bg-[#090D14] border border-indigo-500/40 p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Recommended In-Bed Schedule Tonight
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {guidance.recommendedBedtime}
              </span>
              <span className="text-xs text-slate-400">
                to wake up restored at <strong className="text-slate-200">{wakeTime}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Total In-Bed Time needed: <strong>{formatDurationHoursMins(guidance.totalNeedMinutes + 25)}</strong> (includes ~25m sleep latency & brief night awakenings).
            </p>
          </div>

          <div className="flex flex-col gap-1.5 text-xs border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span>Baseline Need:</span>
              <strong className="text-white font-mono">
                {formatDurationHoursMins(guidance.breakdown.baselineMinutes)}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Accumulated Sleep Debt:</span>
              <strong className="text-amber-400 font-mono">
                +{guidance.breakdown.debtMinutes}m
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Day Strain Extra Load:</span>
              <strong className="text-sky-400 font-mono">
                +{guidance.breakdown.strainAdjustmentMinutes}m
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
