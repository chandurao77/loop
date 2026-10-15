import React, { useState } from 'react';
import { DailyBiometricRecord, HabitItem } from '../types/whoop';
import { BookOpen, Check, Plus, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';

interface JournalViewProps {
  currentRecord: DailyBiometricRecord;
  habitsList: HabitItem[];
  toggleHabit: (habitId: string) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  currentRecord,
  habitsList,
  toggleHabit,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const loggedSet = new Set(currentRecord.loggedHabits);

  const categories = ['All', 'Recovery', 'Nutrition', 'Habit', 'Environment'];

  const filteredHabits = habitsList.filter((h) => {
    if (filterCategory === 'All') return true;
    return h.category === filterCategory;
  });

  // Calculate net impact of today's logged habits
  const netImpact = habitsList
    .filter((h) => loggedSet.has(h.id))
    .reduce((sum, h) => sum + h.recoveryCorrelationPct, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121824] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <BookOpen className="w-4 h-4" />
              <span>WHOOP Health Journal & Habit Impact</span>
            </div>
            <h2 className="text-xl font-bold text-white">Daily Lifestyle & Behavior Logging</h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Track key lifestyle behaviors, evening nutrition, and recovery modalities. WHOOP correlates
              each tagged variable against your next-day HRV and autonomic recovery score.
            </p>
          </div>

          <div className="bg-[#090D14] border border-slate-800 rounded-xl px-5 py-4 text-center shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Net Modeled Recovery Impact
            </span>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              {netImpact >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-400" />
              )}
              <span
                className={`text-2xl font-extrabold tabular-nums ${
                  netImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netImpact >= 0 ? `+${netImpact.toFixed(1)}%` : `${netImpact.toFixed(1)}%`}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              {currentRecord.loggedHabits.length} behaviors active today
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredHabits.map((habit) => {
          const isLogged = loggedSet.has(habit.id);
          const isPositive = habit.recoveryCorrelationPct >= 0;

          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-4 ${
                isLogged
                  ? 'bg-slate-900/90 border-teal-500/50 shadow-xs'
                  : 'bg-[#121824] border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {habit.category}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? `+${habit.recoveryCorrelationPct}%` : `${habit.recoveryCorrelationPct}%`} Recovery
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{habit.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{habit.description}</p>
              </div>

              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isLogged
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'border border-slate-700 bg-slate-900 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
