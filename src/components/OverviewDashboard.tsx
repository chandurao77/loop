import React from 'react';
import { DailyBiometricRecord, UserBaseline } from '../types/whoop';
import { ConcentricRings } from './ConcentricRings';
import { PulseWaveform } from './PulseWaveform';
import {
  ShieldCheck,
  Flame,
  Moon,
  TrendingUp,
  ArrowRight,
  Activity,
  Heart,
  Dumbbell,
} from 'lucide-react';
import { formatDurationHoursMins } from '../utils/biometricCalculations';

interface OverviewDashboardProps {
  currentRecord: DailyBiometricRecord;
  baseline: UserBaseline;
  liveBpm: number;
  liveHrv: number;
  pulseHistory: number[];
  setActiveTab: (tab: 'overview' | 'recovery' | 'strain' | 'sleep' | 'journal') => void;
  onOpenSimulator: () => void;
  startWorkout: (act: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  currentRecord,
  baseline,
  liveBpm,
  liveHrv,
  pulseHistory,
  setActiveTab,
  onOpenSimulator,
  startWorkout,
}) => {
  const { recoveryScore, recoveryBand, dayStrain, strainTargetMin, strainTargetMax, sleep } =
    currentRecord;

  const recoveryColor =
    recoveryBand === 'green' ? '#00F090' : recoveryBand === 'yellow' ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-6">
      {/* Hero Biometric Triad Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Concentric Rings Hero Showcase (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#121824] border border-slate-800/80 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Daily Physiological Triad
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">Biometric Status</h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00D4FF]" />
                <span>Strain</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: recoveryColor }} />
                <span>Recovery</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" />
                <span>Sleep</span>
              </span>
            </div>
          </div>

          <div className="py-6 flex justify-center">
            <ConcentricRings
              strain={dayStrain}
              strainTargetMax={strainTargetMax}
              recovery={recoveryScore}
              recoveryBand={recoveryBand}
              sleepScore={sleep.sleepPerformancePercent}
              size={300}
              onSelectMetric={(metric) => {
                if (metric === 'recovery') setActiveTab('recovery');
                if (metric === 'strain') setActiveTab('strain');
                if (metric === 'sleep') setActiveTab('sleep');
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-4 text-center">
            <button
              onClick={() => setActiveTab('recovery')}
              className="p-2.5 rounded-xl bg-[#0A0E17] hover:bg-slate-900 border border-slate-800 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: recoveryColor }} />
                <span>Recovery</span>
              </div>
              <div className="text-xl font-bold mt-0.5 tabular-nums" style={{ color: recoveryColor }}>
                {recoveryScore}%
              </div>
              <span className="text-[10px] text-slate-500 capitalize">{recoveryBand} Zone</span>
            </button>

            <button
              onClick={() => setActiveTab('strain')}
              className="p-2.5 rounded-xl bg-[#0A0E17] hover:bg-slate-900 border border-slate-800 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Flame className="w-3.5 h-3.5 text-sky-400" />
                <span>Day Strain</span>
              </div>
              <div className="text-xl font-bold mt-0.5 text-white tabular-nums">
                {dayStrain.toFixed(1)}
              </div>
              <span className="text-[10px] text-slate-500">Target ~{strainTargetMax.toFixed(1)}</span>
            </button>

            <button
              onClick={() => setActiveTab('sleep')}
              className="p-2.5 rounded-xl bg-[#0A0E17] hover:bg-slate-900 border border-slate-800 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sleep Perf</span>
              </div>
              <div className="text-xl font-bold mt-0.5 text-indigo-300 tabular-nums">
                {sleep.sleepPerformancePercent}%
              </div>
              <span className="text-[10px] text-slate-500">
                {formatDurationHoursMins(sleep.asleepMinutes)}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Live Telemetry & Physiological Guidance (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PulseWaveform
            bpm={liveBpm}
            hrv={liveHrv}
            history={pulseHistory}
            onOpenSimulator={onOpenSimulator}
          />

          {/* Coach Insight Summary */}
          <div className="rounded-2xl bg-[#121824] border border-slate-800/80 p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Target Coach Recommendation
                </span>
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {recoveryScore >= 67
                  ? 'Optimal Exertion Day'
                  : recoveryScore >= 34
                  ? 'Moderate Maintenance Day'
                  : 'Restorative Day'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentRecord.coachRecommendation}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-4">
              <button
                onClick={() => {
                  startWorkout('Running');
                  setActiveTab('strain');
                }}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Start Workout</span>
              </button>

              <button
                onClick={() => setActiveTab('recovery')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Full Autonomic Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Triad Breakdown Deep-Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recovery Deep Card */}
        <div
          onClick={() => setActiveTab('recovery')}
          className="rounded-2xl bg-[#121824] border border-slate-800/80 hover:border-emerald-500/50 p-5 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Recovery Analysis
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {currentRecord.hrvMs}
              </span>
              <span className="text-xs font-mono text-slate-400">ms HRV</span>
              <span className="text-xs text-emerald-400 font-semibold ml-auto">
                {currentRecord.hrvMs >= baseline.hrvBaseline ? 'Elevated' : 'Suppressed'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              RHR is at <strong>{currentRecord.rhrBpm} bpm</strong> (baseline {baseline.rhrBaseline} bpm). Respiratory rate is steady at {currentRecord.respiratoryRateRpm} rpm.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-300">
            <span>Inspect Autonomic Indicators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Strain Deep Card */}
        <div
          onClick={() => setActiveTab('strain')}
          className="rounded-2xl bg-[#121824] border border-slate-800/80 hover:border-sky-500/50 p-5 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Day Strain Progress
              </span>
              <Flame className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {dayStrain.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-sky-400">/ 21.0</span>
              <span className="text-xs text-slate-400 ml-auto">
                Target: {strainTargetMin.toFixed(1)} - {strainTargetMax.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {currentRecord.workouts.length} workouts logged today totaling {currentRecord.caloriesBurned} active & BMR calories.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-300">
            <span>View HR Zones & Log Workout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Sleep Deep Card */}
        <div
          onClick={() => setActiveTab('sleep')}
          className="rounded-2xl bg-[#121824] border border-slate-800/80 hover:border-indigo-500/50 p-5 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Sleep Coach
              </span>
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {formatDurationHoursMins(sleep.asleepMinutes)}
              </span>
              <span className="text-xs font-mono text-indigo-300">Asleep</span>
              <span className="text-xs text-indigo-400 font-semibold ml-auto">
                {sleep.sleepPerformancePercent}% Perf
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Deep & REM totaled {formatDurationHoursMins(sleep.stages.deepMinutes + sleep.stages.remMinutes)}. Sleep debt is {sleep.sleepDebtMinutes}m.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-indigo-300">
            <span>Calculate Tonight's Bedtime</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
