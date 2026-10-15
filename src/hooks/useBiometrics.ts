import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivityType,
  DailyBiometricRecord,
  HabitItem,
  SimulationPreset,
  UserBaseline,
  WorkoutSession,
} from '../types/whoop';
import {
  DEFAULT_USER_BASELINE,
  HABIT_CATALOG,
  INITIAL_DAILY_RECORDS,
  SIMULATION_PRESETS_DATA,
} from '../utils/mockData';
import {
  aggregateDailyStrain,
  calculateWorkoutStrain,
  getRecoveryBand,
  getStrainTargetRange,
} from '../utils/biometricCalculations';

const STORAGE_KEY_RECORDS = 'whoop_daily_records_v1';
const STORAGE_KEY_BASELINE = 'whoop_user_baseline_v1';
const STORAGE_KEY_HABITS = 'whoop_journal_habits_v1';

export function useBiometrics() {
  // 1. Persistent Daily Records
  const [dailyRecords, setDailyRecords] = useState<DailyBiometricRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_DAILY_RECORDS;
  });

  // 2. Persistent User Baseline
  const [userBaseline, setUserBaseline] = useState<UserBaseline>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BASELINE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_USER_BASELINE;
  });

  // 3. Persistent Habit Catalog Selection
  const [habitsList, setHabitsList] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HABITS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return HABIT_CATALOG;
  });

  // Selected Day Key
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-15');

  // Simulation State
  const [activePreset, setActivePreset] = useState<SimulationPreset>('Resting Baseline');
  const [manualBpmOverride, setManualBpmOverride] = useState<number | null>(null);
  const [liveBpm, setLiveBpm] = useState<number>(54);
  const [liveHrv, setLiveHrv] = useState<number>(84);
  const [pulseHistory, setPulseHistory] = useState<number[]>(() => Array(40).fill(54));

  // Active Workout Session State
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [workoutActivity, setWorkoutActivity] = useState<ActivityType>('Running');
  const [workoutSeconds, setWorkoutSeconds] = useState<number>(0);
  const [workoutSamples, setWorkoutSamples] = useState<number[]>([]);
  const [workoutZoneCounts, setWorkoutZoneCounts] = useState<{ 1: number; 2: number; 3: number; 4: number; 5: number }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(dailyRecords));
    } catch (e) {
      console.error(e);
    }
  }, [dailyRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BASELINE, JSON.stringify(userBaseline));
    } catch (e) {
      console.error(e);
    }
  }, [userBaseline]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habitsList));
    } catch (e) {
      console.error(e);
    }
  }, [habitsList]);

  // Current selected day's record
  const currentRecord = dailyRecords.find((r) => r.date === selectedDate) || dailyRecords[0];

  // 1-second continuous biometric pulse generator
  useEffect(() => {
    const interval = setInterval(() => {
      const presetData = SIMULATION_PRESETS_DATA[activePreset];
      const targetBpm = manualBpmOverride !== null ? manualBpmOverride : (isWorkoutActive ? Math.max(130, presetData.targetHeartRate) : presetData.targetHeartRate);
      
      // Heart rate variability natural jitter (±2 to ±4 bpm)
      const jitter = (Math.random() - 0.5) * 4;
      const nextBpm = Math.max(40, Math.min(210, Math.round(targetBpm + jitter)));

      // HRV fluctuation
      const targetHrv = presetData.hrvVariance;
      const nextHrv = Math.max(15, Math.min(160, Math.round(targetHrv + (Math.random() - 0.5) * 6)));

      setLiveBpm(nextBpm);
      setLiveHrv(nextHrv);
      setPulseHistory((prev) => [...prev.slice(1), nextBpm]);

      // If workout is active, record sample
      if (isWorkoutActive) {
        setWorkoutSeconds((sec) => sec + 1);
        setWorkoutSamples((prev) => [...prev, nextBpm]);

        // Bin into HR Zone
        const maxHr = userBaseline.maxHeartRate;
        const ratio = nextBpm / maxHr;
        let z: 1 | 2 | 3 | 4 | 5 = 1;
        if (ratio >= 0.9) z = 5;
        else if (ratio >= 0.8) z = 4;
        else if (ratio >= 0.7) z = 3;
        else if (ratio >= 0.6) z = 2;

        setWorkoutZoneCounts((prev) => ({
          ...prev,
          [z]: prev[z] + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activePreset, manualBpmOverride, isWorkoutActive, userBaseline.maxHeartRate]);

  // Calculate live workout strain dynamically
  const liveWorkoutStats = useCallback(() => {
    if (!workoutSamples.length) {
      return {
        durationMinutes: 0,
        avgBpm: liveBpm,
        maxBpm: liveBpm,
        strain: 0,
        calories: 0,
      };
    }
    const sum = workoutSamples.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / workoutSamples.length);
    const max = Math.max(...workoutSamples);
    const durationMins = workoutSeconds / 60;
    const strain = calculateWorkoutStrain(durationMins, avg, userBaseline.maxHeartRate, userBaseline.rhrBaseline);
    // Approximate calories ~ 10-14 kcal per minute depending on HR intensity
    const calFactor = 8 + (avg / userBaseline.maxHeartRate) * 8;
    const calories = Math.round(durationMins * calFactor);

    return {
      durationMinutes: durationMins,
      avgBpm: avg,
      maxBpm: max,
      strain,
      calories,
    };
  }, [workoutSamples, workoutSeconds, liveBpm, userBaseline]);

  // Workout Controls
  const startWorkout = (activity: ActivityType) => {
    setWorkoutActivity(activity);
    setWorkoutSeconds(0);
    setWorkoutSamples([]);
    setWorkoutZoneCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    setIsWorkoutActive(true);
    // Switch preset to appropriate elevated intensity
    if (activity === 'HIIT') setActivePreset('High Intensity Interval');
    else if (activity === 'Running' || activity === 'Cycling') setActivePreset('Zone 2 Aerobic');
  };

  const finishWorkout = () => {
    if (!isWorkoutActive) return;
    const stats = liveWorkoutStats();
    if (stats.durationMinutes >= 0.2) {
      // Save completed workout session to today's record
      const newSession: WorkoutSession = {
        id: 'w_' + Date.now(),
        activity: workoutActivity,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMinutes: Math.max(1, Math.round(stats.durationMinutes)),
        avgHeartRate: stats.avgBpm,
        maxHeartRate: stats.maxBpm,
        strainEarned: stats.strain,
        caloriesBurned: stats.calories,
        zoneMinutes: {
          1: Math.round(workoutZoneCounts[1] / 60),
          2: Math.round(workoutZoneCounts[2] / 60),
          3: Math.round(workoutZoneCounts[3] / 60),
          4: Math.round(workoutZoneCounts[4] / 60),
          5: Math.round(workoutZoneCounts[5] / 60),
        },
      };

      setDailyRecords((prev) =>
        prev.map((rec) => {
          if (rec.date === selectedDate) {
            const updatedWorkouts = [newSession, ...rec.workouts];
            const workoutStrains = updatedWorkouts.map((w) => w.strainEarned);
            const newDayStrain = aggregateDailyStrain(workoutStrains);
            const totalCals = rec.caloriesBurned + stats.calories;

            return {
              ...rec,
              workouts: updatedWorkouts,
              dayStrain: newDayStrain,
              caloriesBurned: totalCals,
            };
          }
          return rec;
        })
      );
    }

    setIsWorkoutActive(false);
    setActivePreset('Resting Baseline');
  };

  const discardWorkout = () => {
    setIsWorkoutActive(false);
    setWorkoutSeconds(0);
    setWorkoutSamples([]);
    setActivePreset('Resting Baseline');
  };

  // Toggle habit in journal for current day
  const toggleHabit = (habitId: string) => {
    setDailyRecords((prev) =>
      prev.map((rec) => {
        if (rec.date === selectedDate) {
          const hasHabit = rec.loggedHabits.includes(habitId);
          const newHabits = hasHabit
            ? rec.loggedHabits.filter((h) => h !== habitId)
            : [...rec.loggedHabits, habitId];
          return {
            ...rec,
            loggedHabits: newHabits,
          };
        }
        return rec;
      })
    );
  };

  // Update specific values in current day's record (e.g. from manual calibration)
  const updateCurrentRecord = (updates: Partial<DailyBiometricRecord>) => {
    setDailyRecords((prev) =>
      prev.map((rec) => {
        if (rec.date === selectedDate) {
          const merged = { ...rec, ...updates };
          // If recovery was updated, recompute band and targets
          if (updates.recoveryScore !== undefined) {
            merged.recoveryBand = getRecoveryBand(merged.recoveryScore);
            const targets = getStrainTargetRange(merged.recoveryScore);
            merged.strainTargetMin = targets.min;
            merged.strainTargetMax = targets.max;
          }
          return merged;
        }
        return rec;
      })
    );
  };

  const resetToDefaults = () => {
    setDailyRecords(INITIAL_DAILY_RECORDS);
    setUserBaseline(DEFAULT_USER_BASELINE);
    setHabitsList(HABIT_CATALOG);
    setSelectedDate('2026-10-15');
    setActivePreset('Resting Baseline');
    setManualBpmOverride(null);
    setIsWorkoutActive(false);
  };

  const exportDataJson = () => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        baseline: userBaseline,
        records: dailyRecords,
        habits: habitsList,
      },
      null,
      2
    );
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.records && Array.isArray(parsed.records)) {
        setDailyRecords(parsed.records);
        if (parsed.baseline) setUserBaseline(parsed.baseline);
        if (parsed.habits) setHabitsList(parsed.habits);
        return true;
      }
    } catch {
      // invalid
    }
    return false;
  };

  return {
    dailyRecords,
    currentRecord,
    selectedDate,
    setSelectedDate,
    userBaseline,
    setUserBaseline,
    habitsList,
    // Live Telemetry
    liveBpm,
    liveHrv,
    pulseHistory,
    activePreset,
    setActivePreset,
    manualBpmOverride,
    setManualBpmOverride,
    // Workouts
    isWorkoutActive,
    workoutActivity,
    workoutSeconds,
    liveWorkoutStats,
    startWorkout,
    finishWorkout,
    discardWorkout,
    // Actions
    toggleHabit,
    updateCurrentRecord,
    resetToDefaults,
    exportDataJson,
    importDataJson,
  };
}
