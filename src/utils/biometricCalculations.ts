import { HeartRateZone, RecoveryBand, UserBaseline } from '../types/whoop';

/**
 * Calculates WHOOP-style cardiovascular strain on a 0.0 to 21.0 logarithmic scale
 * based on heart rate elevation above resting HR relative to max HR.
 */
export function calculateWorkoutStrain(
  durationMinutes: number,
  avgHr: number,
  maxHr: number,
  restingHr: number
): number {
  if (durationMinutes <= 0) return 0;
  // Heart rate reserve ratio (0.0 to 1.0)
  const hrReserve = Math.max(0, Math.min(1, (avgHr - restingHr) / (maxHr - restingHr)));
  
  // Non-linear exponential weighting factor per minute (Banister TRIMP model)
  const intensityFactor = hrReserve * Math.exp(1.92 * hrReserve);
  const rawLoad = durationMinutes * intensityFactor;

  // Logarithmic compression onto WHOOP 0.0 - 21.0 scale
  // 100 raw load ≈ 10 strain, 300 raw load ≈ 14.5 strain, 800 raw load ≈ 19.5 strain
  const k = 0.0038;
  const strain = 21 * (1 - Math.exp(-k * rawLoad));
  return Number(Math.min(21, Math.max(0, strain)).toFixed(1));
}

/**
 * Aggregates daily strain when multiple workouts and background active minutes occur.
 * WHOOP strain adds non-linearly (it's significantly harder to go from 15 to 16 than 5 to 6).
 */
export function aggregateDailyStrain(strains: number[]): number {
  if (!strains.length) return 0;
  // Sum of raw uncompressed exponential loads
  let totalRawLoad = 0;
  const k = 0.0038;
  for (const s of strains) {
    if (s <= 0) continue;
    const boundedS = Math.min(20.95, s);
    const raw = -Math.log(1 - boundedS / 21) / k;
    totalRawLoad += raw;
  }
  const totalStrain = 21 * (1 - Math.exp(-k * totalRawLoad));
  return Number(Math.min(21, Math.max(0, totalStrain)).toFixed(1));
}

/**
 * Computes standard 5-zone breakdown based on User Max HR.
 */
export function getHeartRateZones(maxHr: number = 190): HeartRateZone[] {
  return [
    {
      zone: 1,
      name: 'Zone 1: Active Recovery',
      minHr: Math.round(maxHr * 0.5),
      maxHr: Math.round(maxHr * 0.6),
      durationMinutes: 0,
      color: '#38BDF8', // light blue
      description: 'Promotes circulation and metabolic restoration',
    },
    {
      zone: 2,
      name: 'Zone 2: Aerobic Base',
      minHr: Math.round(maxHr * 0.6),
      maxHr: Math.round(maxHr * 0.7),
      durationMinutes: 0,
      color: '#2DD4BF', // teal
      description: 'Mitochondrial density, fat oxidation, endurance capacity',
    },
    {
      zone: 3,
      name: 'Zone 3: Aerobic Power',
      minHr: Math.round(maxHr * 0.7),
      maxHr: Math.round(maxHr * 0.8),
      durationMinutes: 0,
      color: '#FBBF24', // amber yellow
      description: 'Cardiovascular efficiency and sustained tempo endurance',
    },
    {
      zone: 4,
      name: 'Zone 4: Threshold',
      minHr: Math.round(maxHr * 0.8),
      maxHr: Math.round(maxHr * 0.9),
      durationMinutes: 0,
      color: '#FB923C', // orange
      description: 'Lactate clearance and maximal aerobic power capacity',
    },
    {
      zone: 5,
      name: 'Zone 5: Anaerobic Max',
      minHr: Math.round(maxHr * 0.9),
      maxHr: maxHr,
      durationMinutes: 0,
      color: '#EF4444', // red
      description: 'Peak neuromuscular power, sprint capacity, and VO2 max stimulus',
    },
  ];
}

/**
 * Categorizes recovery band (Green > 66%, Yellow 34-66%, Red < 34%)
 */
export function getRecoveryBand(score: number): RecoveryBand {
  if (score >= 67) return 'green';
  if (score >= 34) return 'yellow';
  return 'red';
}

/**
 * Returns dynamic daily strain target range based on morning recovery score.
 */
export function getStrainTargetRange(recoveryScore: number): {
  min: number;
  max: number;
  label: string;
  recommendation: string;
} {
  if (recoveryScore >= 67) {
    const min = Number((13.5 + (recoveryScore - 67) * 0.1).toFixed(1));
    const max = Number((16.5 + (recoveryScore - 67) * 0.12).toFixed(1));
    return {
      min,
      max: Math.min(20.5, max),
      label: 'Optimal High Strain Target',
      recommendation:
        'Your cardiovascular and autonomic nervous system is primed for peak exertion. Target high-intensity sessions or high training volume today.',
    };
  } else if (recoveryScore >= 34) {
    const min = Number((9.5 + (recoveryScore - 34) * 0.1).toFixed(1));
    const max = Number((13.0 + (recoveryScore - 34) * 0.1).toFixed(1));
    return {
      min,
      max,
      label: 'Moderate Maintenance Target',
      recommendation:
        'Your body is ready for moderate activity. Focus on steady aerobic Zone 2 work or maintenance training without pushing into severe overreaching.',
    };
  } else {
    return {
      min: 0.0,
      max: 9.0,
      label: 'Restorative Low Strain Target',
      recommendation:
        'Your autonomic system shows signs of fatigue or stress. Prioritize active recovery, light walks, hydration, and an early bedtime to restore baseline equilibrium.',
    };
  }
}

/**
 * Calculates bedtime coach recommendations based on target wake time, sleep debt, and target tier.
 */
export function calculateSleepGuidance(
  baseNeedHours: number,
  sleepDebtMinutes: number,
  recentStrain: number,
  targetWakeTime: string = '07:00 AM',
  tier: 'peak' | 'perform' | 'get_by' = 'peak'
): {
  totalNeedMinutes: number;
  recommendedBedtime: string;
  breakdown: {
    baselineMinutes: number;
    debtMinutes: number;
    strainAdjustmentMinutes: number;
  };
} {
  const baselineMinutes = Math.round(baseNeedHours * 60);
  
  // Strain impact: high strain (>14) adds up to 35 mins extra sleep need
  const strainFactor = recentStrain > 10 ? Math.min(45, Math.round((recentStrain - 10) * 4)) : 0;
  
  // Multipliers for tiers
  const tierMultiplier = tier === 'peak' ? 1.0 : tier === 'perform' ? 0.85 : 0.70;
  
  const totalNeedMinutes = Math.round(
    (baselineMinutes + sleepDebtMinutes + strainFactor) * tierMultiplier
  );

  // Time in bed needed adds ~25 minutes for sleep latency & natural brief wake cycles
  const totalInBedMinutes = totalNeedMinutes + 25;

  // Compute bedtime from wake time
  const [timeStr, meridiem] = targetWakeTime.split(' ');
  const [rawHours, rawMins] = timeStr.split(':').map(Number);
  let wakeHour24 = rawHours % 12 + (meridiem === 'PM' ? 12 : 0);
  let wakeTotalMinutes = wakeHour24 * 60 + rawMins;

  let bedTotalMinutes = wakeTotalMinutes - totalInBedMinutes;
  if (bedTotalMinutes < 0) {
    bedTotalMinutes += 24 * 60;
  }

  const bedHour24 = Math.floor(bedTotalMinutes / 60) % 24;
  const bedMin = bedTotalMinutes % 60;
  const bedMeridiem = bedHour24 >= 12 ? 'PM' : 'AM';
  const bedHour12 = bedHour24 % 12 === 0 ? 12 : bedHour24 % 12;

  const recommendedBedtime = `${bedHour12}:${bedMin.toString().padStart(2, '0')} ${bedMeridiem}`;

  return {
    totalNeedMinutes,
    recommendedBedtime,
    breakdown: {
      baselineMinutes,
      debtMinutes: sleepDebtMinutes,
      strainAdjustmentMinutes: strainFactor,
    },
  };
}

/**
 * Format minutes into "Xh Ym"
 */
export function formatDurationHoursMins(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}
