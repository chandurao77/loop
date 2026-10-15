import React, { useState } from 'react';
import { DailyBiometricRecord, SimulationPreset, UserBaseline } from '../types/whoop';
import { SIMULATION_PRESETS_DATA } from '../utils/mockData';
import { Sliders, X, RefreshCw, Download, Upload, Zap, Check } from 'lucide-react';

interface SimulationControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePreset: SimulationPreset;
  setActivePreset: (preset: SimulationPreset) => void;
  manualBpmOverride: number | null;
  setManualBpmOverride: (bpm: number | null) => void;
  currentRecord: DailyBiometricRecord;
  updateCurrentRecord: (updates: Partial<DailyBiometricRecord>) => void;
  userBaseline: UserBaseline;
  setUserBaseline: (baseline: UserBaseline) => void;
  resetToDefaults: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
}

export const SimulationControlsModal: React.FC<SimulationControlsModalProps> = ({
  isOpen,
  onClose,
  activePreset,
  setActivePreset,
  manualBpmOverride,
  setManualBpmOverride,
  currentRecord,
  updateCurrentRecord,
  userBaseline,
  setUserBaseline,
  resetToDefaults,
  exportDataJson,
  importDataJson,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'presets' | 'manual' | 'baseline' | 'data'>('presets');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Local form state for direct calibrations
  const [editRecovery, setEditRecovery] = useState(currentRecord.recoveryScore);
  const [editStrain, setEditStrain] = useState(currentRecord.dayStrain);
  const [editHrv, setEditHrv] = useState(currentRecord.hrvMs);
  const [editRhr, setEditRhr] = useState(currentRecord.rhrBpm);
  const [editSleepPerf, setEditSleepPerf] = useState(currentRecord.sleep.sleepPerformancePercent);

  const presetsList: SimulationPreset[] = [
    'Resting Baseline',
    'Zone 2 Aerobic',
    'High Intensity Interval',
    'Deep Slow-Wave Sleep',
    'Post-Alcohol Recovery',
    'Optimal Restored State',
  ];

  const handleApplyCalibration = () => {
    updateCurrentRecord({
      recoveryScore: Number(editRecovery),
      dayStrain: Number(editStrain),
      hrvMs: Number(editHrv),
      rhrBpm: Number(editRhr),
      sleep: {
        ...currentRecord.sleep,
        sleepPerformancePercent: Number(editSleepPerf),
      },
    });
    onClose();
  };

  const handleDownloadExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportDataJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `whoop_health_data_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportStatus('Data successfully loaded!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#101520] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Biometric Simulator & Calibrator</h2>
              <p className="text-xs text-slate-400">
                Adjust sensor signals, athletic presets, or enter clinical overrides
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-[#0C1019]">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Physiological Presets
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Direct Metric Calibration
          </button>
          <button
            onClick={() => setActiveTab('baseline')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'baseline'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            User Baselines
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'data'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Import / Export
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Select Active Sensor Simulation Profile
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presetsList.map((preset) => {
                  const data = SIMULATION_PRESETS_DATA[preset];
                  const isCurrent = activePreset === preset && manualBpmOverride === null;

                  return (
                    <button
                      key={preset}
                      onClick={() => {
                        setActivePreset(preset);
                        setManualBpmOverride(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-sky-500 bg-sky-950/30'
                          : 'border-slate-800 bg-[#0A0E17] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{preset}</span>
                        {isCurrent && <Check className="w-4 h-4 text-sky-400" />}
                      </div>
                      <div className="text-xs text-sky-400 font-mono mb-1.5">
                        ~{data.targetHeartRate} BPM · {data.hrvVariance} ms HRV
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{data.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Heart rate direct slider */}
              <div className="bg-[#0A0E17] border border-slate-800 rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-semibold">Live Heart Rate Override</span>
                  <span className="text-sky-400 font-mono font-bold">
                    {manualBpmOverride !== null ? `${manualBpmOverride} BPM (Manual)` : 'Auto (Preset Driven)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="195"
                  value={manualBpmOverride ?? 70}
                  onChange={(e) => setManualBpmOverride(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>40 BPM (Sleep)</span>
                  <span>100 BPM (Walk)</span>
                  <span>160 BPM (Run)</span>
                  <span>195 BPM (Sprint)</span>
                </div>

                {manualBpmOverride !== null && (
                  <button
                    onClick={() => setManualBpmOverride(null)}
                    className="mt-3 text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Clear override and return to auto-fluctuation
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Override today's clinical values with your actual laboratory or device readings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Recovery Score (0 - 100%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editRecovery}
                    onChange={(e) => setEditRecovery(Number(e.target.value))}
                    className="w-full bg-[#090D14] border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Day Strain (0.0 - 21.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="21"
                    value={editStrain}
                    onChange={(e) => setEditStrain(Number(e.target.value))}
                    className="w-full bg-[#090D14] border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    HRV (ms rMSSD)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="220"
                    value={editHrv}
                    onChange={(e) => setEditHrv(Number(e.target.value))}
                    className="w-full bg-[#090D14] border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Resting Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="110"
                    value={editRhr}
                    onChange={(e) => setEditRhr(Number(e.target.value))}
                    className="w-full bg-[#090D14] border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Sleep Performance (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editSleepPerf}
                    onChange={(e) => setEditSleepPerf(Number(e.target.value))}
                    className="w-full bg-[#090D14] border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleApplyCalibration}
                  className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Save & Apply Calibrated Metrics
                </button>
              </div>
            </div>
          )}

          {activeTab === 'baseline' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Personalize your physiological 30-day baseline markers used to compute recovery readiness.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Baseline Resting HR (BPM)
                  </label>
                  <input
                    type="number"
                    value={userBaseline.rhrBaseline}
                    onChange={(e) =>
                      setUserBaseline({ ...userBaseline, rhrBaseline: Number(e.target.value) })
                    }
                    className="w-full bg-[#090D14] border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Baseline HRV (ms rMSSD)
                  </label>
                  <input
                    type="number"
                    value={userBaseline.hrvBaseline}
                    onChange={(e) =>
                      setUserBaseline({ ...userBaseline, hrvBaseline: Number(e.target.value) })
                    }
                    className="w-full bg-[#090D14] border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Maximum Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={userBaseline.maxHeartRate}
                    onChange={(e) =>
                      setUserBaseline({ ...userBaseline, maxHeartRate: Number(e.target.value) })
                    }
                    className="w-full bg-[#090D14] border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Baseline Sleep Need (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={userBaseline.baseSleepNeedHours}
                    onChange={(e) =>
                      setUserBaseline({ ...userBaseline, baseSleepNeedHours: Number(e.target.value) })
                    }
                    className="w-full bg-[#090D14] border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Backup your historical health records or restore sample profiles.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadExport}
                  className="p-4 rounded-xl border border-slate-800 bg-[#0A0E17] hover:border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>Export JSON Backup</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Download complete historical records and baseline values.
                  </p>
                </button>

                <label className="p-4 rounded-xl border border-slate-800 bg-[#0A0E17] hover:border-slate-700 text-left transition-colors cursor-pointer block">
                  <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                    <Upload className="w-4 h-4 text-teal-400" />
                    <span>Import JSON Backup</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Upload and restore a previous JSON backup file.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {importStatus && (
                <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs">
                  {importStatus}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (confirm('Reset all health records and baselines back to original WHOOP presets?')) {
                      resetToDefaults();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All Data to Default Profiles</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0C1019] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
