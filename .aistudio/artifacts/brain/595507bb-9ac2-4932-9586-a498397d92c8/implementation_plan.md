# WHOOP Biometric Performance & Recovery Engine

A clinical-grade, athletic health monitoring web application equivalent to WHOOP, providing comprehensive tracking of the physiological triad: Strain (0.0–21.0), Recovery (0–100%), and Sleep Performance, powered by continuous HRV, Resting Heart Rate (RHR), Sleep Staging, dynamic Strain Target coaching, and realistic biometric simulation.

### User Review & Critical Decisions

> [!IMPORTANT]
> Based on your selections, the system is designed around the authentic WHOOP physiological architecture:
> - **Biometric Triad**: Real-time Strain (0–21.0 log scale), Recovery score (%) with autonomic nervous system indicators (HRV & RHR), and Sleep Performance & Debt breakdown.
> - **Continuous Simulation & Realism Engine**: Generates live fluctuating heart rate, beat-to-beat variability (rMSSD), skin temperature deviation, and SpO2 with simulated sensor modes (Resting, High-Intensity Interval, Zone 2 Aerobic, Deep Sleep, and Recovery Day).
> - **Dynamic Coaching Algorithms**: Calculates daily optimal strain target ranges based on morning Recovery, plus a Bedtime Sleep Coach accounting for accumulated sleep debt, strain load, and wake target.
> - **Data Persistence**: Offline-first reactive local storage with instant presets, custom workout session recording, manual health metric overrides, and JSON export/import.

- **Confirmed Decision 1**: Prioritize the full WHOOP triad (Day Strain, Recovery %, Sleep Performance with HRV & RHR).
- **Confirmed Decision 2**: Realistic continuous live biometric simulation coupled with rapid manual entry and preset athletic profiles.
- **Confirmed Decision 3**: Dynamic daily strain targets (underreaching, optimal, overreaching) and bedtime sleep coach calculating sleep debt and circadian alignment.

---

### 1. Overview & Core Concept

- **What It Does**: Recreates the complete WHOOP mobile and dashboard experience in the browser. Users monitor live heart rate telemetry, view morning Recovery scores based on HRV rmSSD and baseline trends, review multi-stage sleep architecture (Deep SWS, REM, Light, Awake), track cumulative cardiovascular Strain across workouts and daily activities, log lifestyle journal habits (caffeine, hydration, magnesium, sauna, cold plunge, stress), and receive proactive coaching.
- **Target Audience / Persona**: Athletes, biohackers, endurance enthusiasts, and health-conscious individuals who demand actionable physiological intelligence rather than passive step counts.
- **Key Value**: Closes the loop between strain and recovery—telling users exactly how ready their body is each morning, how much cardiovascular strain they can safely absorb, and the exact sleep duration needed tonight to bounce back.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Overview & Dial View**: View the signature three concentric biometric rings (Recovery in green/yellow/red, Day Strain in cyan/blue, Sleep in teal/indigo) with live pulse wave, current Heart Rate, and daily physiological status.
2. **Recovery Deep Dive**: Inspect HRV (rmSSD in ms), Resting Heart Rate (bpm), Respiratory Rate (rpm), Skin Temperature deviation (°F/°C), and Blood Oxygen (SpO2 %), benchmarked against personal 30-day baselines.
3. **Strain & Workout Tracker**: Launch live workout sessions (Running, Cycling, HIIT, Strength, Swimming, Breathwork) with live HR zone distribution (Zone 1 to Zone 5), calorie burn, and instantaneous strain accumulation along a logarithmic scale (0–21).
4. **Sleep & Bedtime Coach**: Analyze last night's sleep cycle breakdown (Deep, REM, Light, Awake), sleep debt, sleep efficiency %, and compute bedtime recommendations based on desired tomorrow performance (Peak 100%, Perform 85%, or Get By 70%).
5. **Health Journal & Habit Impact**: Check in daily lifestyle factors (Hydration, Evening Alcohol, Late Meal, Magnesium, Screen Time) and correlate habits with next-day recovery shifts.
6. **Live Sensor Simulator Controls**: Seamlessly switch sensor simulation states (e.g., Active 165 bpm Sprint vs. Calm 52 bpm Baseline vs. Sleep Staging) or manually calibrate any metric for personalized testing.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-performance athletic luxury dark mode—deep obsidian black surfaces, crisp neon telemetry accents, razor-sharp vector dials, and clinical typography inspired by elite fitness telemetry.
- **Color Palette**:
  - Deep Canvas: `#0A0D12` (Void Black) and `#11161F` (Charcoal Slate)
  - Card Surfaces: `#161D27` with hairline border `#222D3D`
  - Recovery Tints: Neon Emerald (`#00F090`) for Green (>66%), Amber Gold (`#F59E0B`) for Yellow (34–66%), Crimson Red (`#EF4444`) for Red (<34%)
  - Strain Accent: Electric Cyan / Ice Blue (`#00D4FF` / `#38BDF8`)
  - Sleep Accent: Luminous Indigo / Deep Teal (`#818CF8` / `#2DD4BF`)
  - Text & Accents: Crisp High-Legibility White (`#F8FAFC`) with muted metadata (`#94A3B8`)
- **Typography & Hierarchy**:
  - Display & Numbers: `Plus Jakarta Sans` with heavy weights (700/800) and tabular numerals (`font-mono tabular-nums`) for jitter-free live metrics.
  - Body & Labels: Clean unboxed metadata with dot separators (`·`), eliminating clutter and AI pills.
- **Layout Ergonomics**:
  - Desktop: Multi-column responsive command center (Left: Hero Triad dials + Live ECG/pulse; Center: Active Strain / Sleep breakdown; Right: Coaching targets + Health Journal).
  - Mobile & Tablet: Seamless responsive stack with fixed thumb-zone bottom navigation tabs (Today, Recovery, Strain, Sleep, Journal, Settings/Simulator).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Algorithmic WHOOP Scoring Models**:
  - *Chosen Approach*: Implement authentic mathematical approximations:
    - *Strain Formula*: Modified Banister TRIMP model compressed logarithmically onto the standard WHOOP 0.0–21.0 scale ($S = 21 \cdot (1 - e^{-k \cdot \text{accumulated HR load}})$).
    - *Recovery Formula*: Weighted autonomic equilibrium comparing current HRV and RHR against 30-day baseline deviations, weighted by sleep performance.
    - *Sleep Need*: Base need (e.g. 7h45m) + accumulated sleep debt fraction + strain load penalty + naps.
  - *Why*: Delivers an experience indistinguishable from the actual WHOOP hardware algorithm.
- **Decision 2: Realistic Autonomous Sensor Simulation with Manual Override**:
  - *Chosen Approach*: Background pulse generator with heart rate variability micro-jitter, dynamic respiratory sinus arrhythmia, and active activity presets, coupled with quick-edit modals to input actual user lab values.
  - *Why*: Allows immediate out-of-the-box exploration without needing Bluetooth pairing hardware, while giving real users the freedom to track their actual physical biometrics.
- **Decision 3: Zero-Dependency Client-Side Architecture**:
  - *Chosen Approach*: Pure React 19 + TypeScript + Lucide icons + SVG arc calculations + Tailwind CSS + local persistence.
  - *Why*: Instant launch time, zero server latency, complete privacy for personal health data, and 100% offline reliability.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          WHOOP Core Application                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │   Biometric Sensor    │  │        State & Storage Engine         │  │
│  │      Simulator        │──│ - localStorage persistent health store│  │
│  │ - 1Hz live ECG jitter │  │ - 30-day historical logs & baselines  │  │
│  │ - Activity preset mod │  │ - Active workout session timer & HR   │  │
│  └───────────────────────┘  └───────────────────────────────────────┘  │
│             │                                  │                       │
│             ▼                                  ▼                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Biometric Math Engine                        │  │
│  │  - Strain (0-21 log)  - Recovery % (HRV/RHR)  - Sleep Debt & Need│  │
│  │  - Zone 1-5 calc      - Bedtime Coach         - Habit Impact     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│             │                                  │                       │
│             ▼                                  ▼                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  UI Views & Interactive Modules                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────┐ │  │
│  │  │ Today Triad  │  │ Recovery Tab │  │  Strain Tab  │  │ Sleep │ │  │
│  │  │ Concentric   │  │ Baseline HRV │  │ Live Workout │  │ Stages│ │  │
│  │  │ Status Rings │  │ RHR & SpO2   │  │ Zone Bar HR  │  │ Coach │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └───────┘ │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │  │
│  │  │ Habit Journal│  │ Trend Charts │  │ Sensor Sim & │            │  │
│  │  │ Quick Checkin│  │ 7d/30d Stats │  │ Manual Input │            │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Entities & Stores
- `UserBaseline`: Resting HR (e.g. 52 bpm), Baseline HRV (e.g. 78 ms), Typical Respiratory Rate (14.2 rpm), Typical Sleep Need (8.0 hrs).
- `DailyRecord`: Date key, Recovery score (0–100), HRV (ms), RHR (bpm), SpO2 (%), Skin Temp diff (±°F), Day Strain (0–21), Calories burned, Sleep record, Journal tags.
- `SleepRecord`: Time in bed, Asleep time, Sleep Performance %, Sleep Debt (min), Awake time, Light sleep min, Deep (SWS) min, REM min, Sleep Consistency %.
- `WorkoutSession`: Activity type (Running, Cycling, Functional Fitness, etc.), Duration (sec), Avg HR, Max HR, Strain score earned, Calories, Zone breakdown.
- `JournalHabit`: Array of active habits tracked (Hydration, Alcohol, Late Meal, Blue Light, Magnesium, Cold Plunge, Sauna, Meditation) and logged values.

#### Planned Files to Implement
- `src/types/whoop.ts`: Complete data models, enums, biometric ranges, and habit types.
- `src/utils/biometricCalculations.ts`: Banister TRIMP strain math, recovery algorithm, sleep staging and target calculators.
- `src/utils/mockData.ts`: 14-day realistic athletic history, defaults, and habit correlation baselines.
- `src/hooks/useBiometrics.ts`: Reactive state hook handling live pulse simulation, timer, workout sessions, and local storage persistence.
- `src/components/ConcentricRings.tsx`: Custom SVG concentric dial matching WHOOP's signature Strain, Recovery, and Sleep graphics with glowing arcs.
- `src/components/PulseWaveform.tsx`: Real-time SVG canvas pulse wave simulating live PPG optical sensor data.
- `src/components/RecoveryView.tsx`: Autonomic nervous system gauges, baseline comparison charts, and respiratory telemetry.
- `src/components/StrainView.tsx`: Day strain breakdown, active workout tracker, heart rate zones (Z1 to Z5) duration bars.
- `src/components/SleepView.tsx`: Sleep staging hypnogram, sleep debt, bedtime coaching recommendations with wake-up calculator.
- `src/components/JournalView.tsx`: Daily lifestyle habit logging and recovery correlation insights.
- `src/components/SimulationControlsModal.tsx`: Real-time simulator dashboard to switch athletic modes or manually update records.
- `src/components/TopHeader.tsx` & `src/components/TabBar.tsx`: Ergonomic navigation compliant with universal frontend guidelines.
- `src/App.tsx`: Main application shell with view transitions, date navigation, and responsive multi-column layout.
