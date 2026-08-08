import React, { useState, useEffect } from 'react';
import { deleteMonth, listMonthKeys, loadMonth } from '../utils/storage';
import { X, Database, Download, Trash2, AlertTriangle } from 'lucide-react';

interface DataModalProps {
  onClose: () => void;
  onArchived: (msg: string) => void;
}

export const DataModal: React.FC<DataModalProps> = ({ onClose, onArchived }) => {
  const [yearData, setYearData] = useState<Record<string, { monthKeys: string[]; count: number }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmYear, setConfirmYear] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);

  const scanYears = () => {
    setLoading(true);
    const keys = listMonthKeys();
    const grouped: Record<string, { monthKeys: string[]; count: number }> = {};

    keys.forEach((k) => {
      // k looks like "idle-records:2026-08"
      const ym = k.replace('idle-records:', '');
      const y = ym.slice(0, 4);
      if (!grouped[y]) {
        grouped[y] = { monthKeys: [], count: 0 };
      }
      grouped[y].monthKeys.push(k);
      const records = loadMonth(k);
      grouped[y].count += records.length;
    });

    setYearData(grouped);
    setLoading(false);
  };

  useEffect(() => {
    scanYears();
  }, []);

  const handleArchiveYear = (year: string) => {
    const data = yearData[year];
    if (!data) return;

    setIsArchiving(true);

    // Collect all records across the year's month keys
    let allRecords: any[] = [];
    data.monthKeys.forEach((mk) => {
      allRecords = allRecords.concat(loadMonth(mk));
    });

    // CSV headers
    const header = [
      'Date',
      'Unit',
      'Mc Number',
      'Shift',
      'Idle From',
      'Idle To',
      'Duration (hrs)',
      'Reason',
      'Recorded By',
      'Edits',
      'Last Updated'
    ];

    const rows = allRecords.map((r) => [
      r.date,
      r.unit,
      r.machineNo,
      r.shift,
      r.idleFrom,
      r.idleTo,
      r.durationHours,
      r.reason,
      r.recordedBy,
      r.history ? r.history.length : 0,
      r.updatedAt
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell == null ? '' : cell).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(',')
      )
      .join('\n');

    // Trigger CSV download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `idle-machine-log-archive-${year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Delete month keys
    data.monthKeys.forEach((mk) => {
      deleteMonth(mk);
    });

    setIsArchiving(false);
    setConfirmYear(null);
    onArchived(`${year} archived (${allRecords.length} entries) and cleared from live database.`);
    scanYears();
  };

  const sortedYears = Object.keys(yearData).sort();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-xl relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Data Management &amp; Year Archiving
            </h2>
            <p className="text-xs text-slate-500 font-medium">Backup and manage annual stoppage records</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed mb-5 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl">
          Archiving a year downloads a complete CSV backup of all entries for that year, then permanently removes those months from live storage to keep the app fast and lightweight.
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs font-mono text-slate-400">
            Scanning stored data&hellip;
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            No archived or active year partitions found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mb-6">
            {sortedYears.map((y) => {
              const info = yearData[y];
              return (
                <div key={y} className="py-3.5 flex items-center justify-between text-xs md:text-sm">
                  <div>
                    <span className="font-mono font-bold text-base text-slate-900">{y}</span>
                    <span className="text-slate-500 ml-3 font-mono font-medium">{info.count} entries</span>
                  </div>

                  <div>
                    <button
                      onClick={() => setConfirmYear(y)}
                      className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Archive &amp; Clear
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Sub-modal */}
        {confirmYear && (
          <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl mb-6 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm mb-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Confirm Archiving {confirmYear}?
            </div>
            <p className="text-slate-600 mb-3.5 leading-relaxed">
              This will download a full CSV backup file of all {yearData[confirmYear]?.count || 0} entries from {confirmYear}, then permanently clear those months from the active app.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleArchiveYear(confirmYear)}
                disabled={isArchiving}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isArchiving ? 'Archiving...' : `Download Backup & Delete ${confirmYear}`}
              </button>
              <button
                onClick={() => setConfirmYear(null)}
                className="bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
