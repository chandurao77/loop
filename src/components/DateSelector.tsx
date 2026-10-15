import React from 'react';
import { DailyBiometricRecord } from '../types/whoop';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  records: DailyBiometricRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  records,
  selectedDate,
  onSelectDate,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs shrink-0 font-medium">
        <Calendar className="w-3.5 h-3.5 text-sky-400" />
        <span className="hidden sm:inline">Records</span>
      </div>

      {records.map((rec) => {
        const isSelected = rec.date === selectedDate;
        const [dayName, dateStr] = rec.dayLabel.includes(',')
          ? rec.dayLabel.split(',')
          : [rec.dayLabel, ''];

        const bandColor =
          rec.recoveryBand === 'green'
            ? 'bg-emerald-400'
            : rec.recoveryBand === 'yellow'
            ? 'bg-amber-400'
            : 'bg-rose-400';

        return (
          <button
            key={rec.date}
            onClick={() => onSelectDate(rec.date)}
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
              isSelected
                ? 'bg-slate-800 text-white border-slate-600 shadow-xs'
                : 'bg-[#101520] text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${bandColor}`} />
            <span>{dayName}</span>
            {dateStr && <span className="text-[11px] text-slate-500 font-normal">{dateStr}</span>}
            <span className="text-[11px] font-mono text-slate-400">
              {rec.recoveryScore}%
            </span>
          </button>
        );
      })}
    </div>
  );
};
