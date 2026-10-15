import React, { useState } from 'react';
import { ActivityType, DailyBiometricRecord, UserBaseline, WorkoutSession } from '../types/whoop';
import { getHeartRateZones } from '../utils/biometricCalculations';
import { Dumbbell, Flame, Play, Square, Timer, Plus, Award } from 'lucide-react';

interface StrainViewProps {
  currentRecord: DailyBiometricRecord;
  baseline: UserBaseline;
  isWorkoutActive: boolean;
  workoutActivity: ActivityType;
  workoutSeconds: number;
  liveBpm: number;
  liveWorkoutStats: () => {
    durationMinutes: number;
    avgBpm: number;
    maxBpm: number;
    strain: number;
    calories: number;
  };
  startWorkout: (activity: ActivityType) => void;
  finishWorkout: () => void;
  discardWorkout: () => void;
  onOpenSimulator: () => void;
}

const ACTIVITIES: ActivityType[] = [
  'Running',
  'Cycling',
  'Strength Trainer',
  'HIIT',
  'Swimming',
  'Zone 2 Cardio',
  'Breathwork',
  'Walking',
];

export const StrainView: React.FC<StrainViewProps> = ({
  currentRecord,
  baseline,
  isWorkoutActive,
  workoutActivity,
  workoutSeconds,
  liveBpm,
  liveWorkoutStats,
  startWorkout,
  finishWorkout,
  discardWorkout,
  onOpenSimulator,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('Running');
  const [showLogModal, setShowLogModal] = useState(false);

  const stats = liveWorkoutStats();
  const zones = getHeartRateZones(baseline.maxHeartRate);

  // Target calculations
  const targetMin = currentRecord.strainTargetMin;
  const targetMax = currentRecord.strainTargetMax;
  const currentStrain = currentRecord.dayStrain;

  // Percentage along 21.0 scale
  const currentPct = (currentStrain / 21) * 100;
  const targetMinPct = (targetMin / 21) * 100;
  const targetMaxPct = (targetMax / 21) * 100;

  // Format workout duration seconds into MM:SS
  const mins = Math.floor(workoutSeconds / 60);
  const secs = workoutSeconds % 60;
  const formattedTimer = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Top Strain Overview Banner */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-[#0c1a2e] to-[#111928] p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Flame className="w-4 h-4" />
              <span>Cardiovascular Day Strain</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tight tabular-nums">
                {currentStrain.toFixed(1)}
              </span>
              <span className="text-lg font-mono text-sky-400">/ 21.0</span>
            </div>
            <p className="text-sm text-slate-300 max-w-xl">
              Target Range for today: <strong className="text-sky-400">{targetMin.toFixed(1)} – {targetMax.toFixed(1)}</strong>.
              {currentStrain < targetMin
                ? ` Log ~${(targetMin - currentStrain).toFixed(1)} more strain points to enter your optimal recovery-adjusted training target.`
                : currentStrain <= targetMax
                ? ' You are in your optimal training target zone. Excellent cardiovascular balance.'
                : ' You have exceeded your recommended target, pushing into functional overreaching.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-[#0A0F1A] border border-slate-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Total Calories
              </span>
              <span className="text-2xl font-extrabold text-white tabular-nums">
                {currentRecord.caloriesBurned}
              </span>
              <span className="text-[10px] text-slate-500 block">Active + BMR kcal</span>
            </div>

            <div className="bg-[#0A0F1A] border border-slate-800 rounded-xl px-4 py-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Workouts Logged
              </span>
              <span className="text-2xl font-extrabold text-sky-400 tabular-nums">
                {currentRecord.workouts.length}
              </span>
              <span className="text-[10px] text-slate-500 block">Activities today</span>
            </div>
          </div>
        </div>

        {/* Dynamic Strain Target Slider Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>Restorative (0.0)</span>
            <span className="text-sky-400">Target Range ({targetMin} - {targetMax})</span>
            <span>All-Out (21.0)</span>
          </div>

          <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            {/* Target optimal zone highlight */}
            <div
              className="absolute top-0 bottom-0 bg-sky-500/25 border-x border-sky-400/50"
              style={{
                left: `${targetMinPct}%`,
                width: `${targetMaxPct - targetMinPct}%`,
              }}
            />

            {/* Current Day Strain Fill */}
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, currentPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Workout Tracker Box */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121824] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Live Workout & Activity Engine</h3>
              <p className="text-xs text-slate-400">
                Track real-time cardiovascular strain accumulation per minute
              </p>
            </div>
          </div>

          {!isWorkoutActive && (
            <button
              onClick={() => setShowLogModal(true)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Change Activity</span>
            </button>
          )}
        </div>

        {!isWorkoutActive ? (
          <div className="bg-[#0A0E17] border border-slate-800/60 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Selected Activity
              </span>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-sky-400" />
                <span>{selectedActivity}</span>
              </div>
              <p className="text-xs text-slate-400">
                Live sensor will simulate elevated heart rate zones and compute TRIMP strain.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value as ActivityType)}
                className="bg-slate-900 text-slate-200 text-xs rounded-lg px-3 py-2.5 border border-slate-700 focus:outline-none"
              >
                {ACTIVITIES.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>

              <button
                onClick={() => startWorkout(selectedActivity)}
                className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Workout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0A0E17] border border-sky-500/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Active {workoutActivity} Session
                </span>
              </div>

              <div className="text-2xl font-mono font-extrabold text-sky-400 tabular-nums">
                {formattedTimer}
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Live Heart Rate</span>
                <div className="text-2xl font-extrabold text-rose-400 tabular-nums">
                  {liveBpm} <span className="text-xs font-mono text-slate-400">bpm</span>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Avg / Max HR</span>
                <div className="text-2xl font-extrabold text-white tabular-nums">
                  {stats.avgBpm} <span className="text-xs font-mono text-slate-400">/ {stats.maxBpm}</span>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Workout Strain</span>
                <div className="text-2xl font-extrabold text-sky-400 tabular-nums">
                  +{stats.strain.toFixed(1)}
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Burned Calories</span>
                <div className="text-2xl font-extrabold text-amber-400 tabular-nums">
                  {stats.calories} <span className="text-xs font-mono text-slate-400">kcal</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={discardWorkout}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Discard
              </button>

              <button
                onClick={finishWorkout}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Finish & Save to Day Strain</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Heart Rate Zones Reference */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121824] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Max HR Target Zones ({baseline.maxHeartRate} BPM Max)
          </h3>
          <span className="text-xs text-slate-400">Resting Baseline: {baseline.rhrBaseline} BPM</span>
        </div>

        <div className="space-y-2.5">
          {zones.map((z) => (
            <div
              key={z.zone}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#090D14] border border-slate-800/60 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: z.color }}
                />
                <div>
                  <span className="font-semibold text-slate-200">{z.name}</span>
                  <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                    · {z.description}
                  </span>
                </div>
              </div>

              <div className="font-mono text-slate-300 font-medium tabular-nums">
                {z.minHr} – {z.maxHr} BPM
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logged Workouts List */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121824] p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">
          Activities Recorded Today ({currentRecord.workouts.length})
        </h3>

        {currentRecord.workouts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No workouts logged yet today. Start a live session above or log an activity.
          </div>
        ) : (
          <div className="space-y-3">
            {currentRecord.workouts.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#0A0E17] border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">{w.activity}</span>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{w.startTime}</span>
                      <span aria-hidden="true">·</span>
                      <span>{w.durationMinutes} min</span>
                      <span aria-hidden="true">·</span>
                      <span>Avg {w.avgHeartRate} bpm</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-lg font-extrabold text-sky-400 tabular-nums">
                      {w.strainEarned.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase">Strain</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-lg font-extrabold text-amber-400 tabular-nums">
                      {w.caloriesBurned}
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase">Kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
