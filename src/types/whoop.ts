/**
 * WHOOP-equivalent Biometric Performance & Recovery Engine Types
 */

export type RecoveryBand = 'green' | 'yellow' | 'red';

export type ActivityType =
  | 'Running'
  | 'Cycling'
  | 'Strength Trainer'
  | 'HIIT'
  | 'Swimming'
  | 'Zone 2 Cardio'
  | 'Breathwork'
  | 'Walking';

export interface HeartRateZone {
  zone: 1 | 2 | 3 | 4 | 5;
  name: string;
  minHr: number;
  maxHr: number;
  durationMinutes: number;
  color: string;
  description: string;
}

export interface WorkoutSession {
  id: string;
  activity: ActivityType;
  startTime: string; // ISO or human format
  durationMinutes: number;
  avgHeartRate: number;
  maxHeartRate: number;
  strainEarned: number; // 0.0 - 21.0
  caloriesBurned: number;
  zoneMinutes: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface SleepStages {
  deepMinutes: number;   // Slow Wave Sleep (SWS)
  remMinutes: number;    // Rapid Eye Movement
  lightMinutes: number;  // Light Sleep
  awakeMinutes: number;  // Restless / awake duration
}

export interface SleepRecord {
  timeInBedMinutes: number;
  asleepMinutes: number;
  sleepPerformancePercent: number; // e.g. 88%
  sleepNeedMinutes: number; // e.g. 480 mins (8h)
  sleepDebtMinutes: number; // e.g. 45 mins
  recentStrainStrainFactorMinutes: number; // extra minutes needed due to previous strain
  stages: SleepStages;
  sleepEfficiencyPercent: number; // asleep / timeInBed
  sleepConsistencyPercent: number; // bed/wake time variance
  wakeEventsCount: number;
  bedtime: string; // e.g. "10:45 PM"
  wakeTime: string; // e.g. "06:30 AM"
  sleepNeedTier: 'peak' | 'perform' | 'get_by';
}

export interface HabitItem {
  id: string;
  label: string;
  category: 'Recovery' | 'Nutrition' | 'Habit' | 'Environment';
  description: string;
  selected: boolean;
  recoveryCorrelationPct: number; // e.g. +7% or -12%
}

export interface DailyBiometricRecord {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Today, Oct 15"
  recoveryScore: number; // 0 - 100
  recoveryBand: RecoveryBand;
  hrvMs: number; // Root Mean Square of Successive Differences (rMSSD) in ms
  rhrBpm: number; // Resting Heart Rate (bpm)
  respiratoryRateRpm: number; // breaths per minute
  skinTempDiffF: number; // e.g. +0.4 or -0.2 °F
  spo2Percent: number; // Blood oxygen % (e.g. 97 - 99%)
  dayStrain: number; // 0.0 - 21.0 WHOOP log scale
  strainTargetMin: number; // e.g. 12.0
  strainTargetMax: number; // e.g. 15.5
  caloriesBurned: number;
  sleep: SleepRecord;
  workouts: WorkoutSession[];
  loggedHabits: string[]; // HabitItem IDs
  coachRecommendation: string;
}

export interface UserBaseline {
  rhrBaseline: number;
  hrvBaseline: number;
  respiratoryBaseline: number;
  skinTempBaselineF: number;
  maxHeartRate: number;
  baseSleepNeedHours: number;
}

export type SimulationPreset =
  | 'Resting Baseline'
  | 'Zone 2 Aerobic'
  | 'High Intensity Interval'
  | 'Deep Slow-Wave Sleep'
  | 'Post-Alcohol Recovery'
  | 'Optimal Restored State';
