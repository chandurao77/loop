import React from 'react';
import { ShieldCheck, Flame, Moon, BookOpen, LayoutDashboard } from 'lucide-react';

interface TabBarProps {
  activeTab: 'overview' | 'recovery' | 'strain' | 'sleep' | 'journal';
  setActiveTab: (tab: 'overview' | 'recovery' | 'strain' | 'sleep' | 'journal') => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'text-sky-400' },
    { id: 'recovery', label: 'Recovery', icon: ShieldCheck, color: 'text-emerald-400' },
    { id: 'strain', label: 'Strain', icon: Flame, color: 'text-sky-400' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-400' },
    { id: 'journal', label: 'Journal', icon: BookOpen, color: 'text-teal-400' },
  ] as const;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B10]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 shadow-2xl"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
                isActive ? tab.color : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label={tab.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
