import React, { useState } from 'react';
import { useBiometrics } from './hooks/useBiometrics';
import { TopHeader } from './components/TopHeader';
import { TabBar } from './components/TabBar';
import { DateSelector } from './components/DateSelector';
import { OverviewDashboard } from './components/OverviewDashboard';
import { RecoveryView } from './components/RecoveryView';
import { StrainView } from './components/StrainView';
import { SleepView } from './components/SleepView';
import { JournalView } from './components/JournalView';
import { SimulationControlsModal } from './components/SimulationControlsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'recovery' | 'strain' | 'sleep' | 'journal'>('overview');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const {
    dailyRecords,
    currentRecord,
    selectedDate,
    setSelectedDate,
    userBaseline,
    setUserBaseline,
    habitsList,
    // Live pulse
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
  } = useBiometrics();

  return (
    <div className="min-h-screen bg-[#080B10] text-[#F8FAFC] pb-24 md:pb-12 flex flex-col selection:bg-sky-500 selection:text-black">
      {/* Universal Top Bar */}
      <TopHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        liveBpm={liveBpm}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-6 flex-1">
        {/* Date Selector Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <DateSelector
            records={dailyRecords}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
            <span>Simulation Mode:</span>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="text-sky-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{activePreset}</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                Change
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'overview' && (
          <OverviewDashboard
            currentRecord={currentRecord}
            baseline={userBaseline}
            liveBpm={liveBpm}
            liveHrv={liveHrv}
            pulseHistory={pulseHistory}
            setActiveTab={setActiveTab}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            startWorkout={startWorkout}
          />
        )}

        {activeTab === 'recovery' && (
          <RecoveryView
            currentRecord={currentRecord}
            history={dailyRecords}
            baseline={userBaseline}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        )}

        {activeTab === 'strain' && (
          <StrainView
            currentRecord={currentRecord}
            baseline={userBaseline}
            isWorkoutActive={isWorkoutActive}
            workoutActivity={workoutActivity}
            workoutSeconds={workoutSeconds}
            liveBpm={liveBpm}
            liveWorkoutStats={liveWorkoutStats}
            startWorkout={startWorkout}
            finishWorkout={finishWorkout}
            discardWorkout={discardWorkout}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        )}

        {activeTab === 'sleep' && (
          <SleepView
            currentRecord={currentRecord}
            baseline={userBaseline}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        )}

        {activeTab === 'journal' && (
          <JournalView
            currentRecord={currentRecord}
            habitsList={habitsList}
            toggleHabit={toggleHabit}
          />
        )}
      </main>

      {/* Mobile Fixed Tab Bar */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Simulator & Clinical Calibrator Modal */}
      <SimulationControlsModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        activePreset={activePreset}
        setActivePreset={setActivePreset}
        manualBpmOverride={manualBpmOverride}
        setManualBpmOverride={setManualBpmOverride}
        currentRecord={currentRecord}
        updateCurrentRecord={updateCurrentRecord}
        userBaseline={userBaseline}
        setUserBaseline={setUserBaseline}
        resetToDefaults={resetToDefaults}
        exportDataJson={exportDataJson}
        importDataJson={importDataJson}
      />
    </div>
  );
}
