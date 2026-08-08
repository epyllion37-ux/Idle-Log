import React from 'react';

export type TabType = 'entry' | 'records' | 'dashboard';

interface TabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="bg-slate-200/70 p-1.5 rounded-2xl mb-6 inline-flex gap-1.5 shadow-xs border border-slate-200">
      <button
        onClick={() => onSelectTab('entry')}
        className={`px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'entry'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
        }`}
      >
        New Entry
      </button>

      <button
        onClick={() => onSelectTab('records')}
        className={`px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'records'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
        }`}
      >
        Records Log
      </button>

      <button
        onClick={() => onSelectTab('dashboard')}
        className={`px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'dashboard'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
        }`}
      >
        Dashboard Analytics
      </button>
    </div>
  );
};
