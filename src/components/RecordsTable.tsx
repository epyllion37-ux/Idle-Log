import React, { useState, useEffect, useMemo } from 'react';
import { IdleRecord, Shift, Unit, UNITS } from '../types';
import { fmtDate, fmtDuration, todayStr } from '../utils/time';
import { getRecordsInRange } from '../utils/storage';
import { Download, Edit3, History, Trash2, XCircle, Search } from 'lucide-react';

interface RecordsTableProps {
  onEdit: (record: IdleRecord) => void;
  onHistory: (record: IdleRecord) => void;
  onDelete: (record: IdleRecord) => void;
  refreshTrigger: number;
  initialReasonFilter?: string;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  onEdit,
  onHistory,
  onDelete,
  refreshTrigger,
  initialReasonFilter = ''
}) => {
  const thisMonthStart = `${todayStr().slice(0, 8)}01`;

  const [fromDate, setFromDate] = useState<string>(thisMonthStart);
  const [toDate, setToDate] = useState<string>(todayStr());
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [shiftFilter, setShiftFilter] = useState<string>('');
  const [reasonSearch, setReasonSearch] = useState<string>(initialReasonFilter);

  const [rawRecords, setRawRecords] = useState<IdleRecord[]>([]);

  useEffect(() => {
    if (initialReasonFilter) {
      setReasonSearch(initialReasonFilter);
    }
  }, [initialReasonFilter]);

  // Load records whenever filters change or table triggers refresh
  useEffect(() => {
    const loaded = getRecordsInRange(fromDate || null, toDate || null);
    setRawRecords(loaded);
  }, [fromDate, toDate, refreshTrigger]);

  const filteredRecords = useMemo(() => {
    let list = [...rawRecords];

    if (unitFilter) {
      list = list.filter((r) => r.unit === unitFilter);
    }
    if (shiftFilter) {
      list = list.filter((r) => r.shift === shiftFilter);
    }
    if (reasonSearch.trim()) {
      const q = reasonSearch.trim().toLowerCase();
      list = list.filter((r) => (r.reason || '').toLowerCase().includes(q));
    }

    list.sort((a, b) => (b.date + b.idleFrom).localeCompare(a.date + a.idleFrom));
    return list;
  }, [rawRecords, unitFilter, shiftFilter, reasonSearch]);

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setUnitFilter('');
    setShiftFilter('');
    setReasonSearch('');
  };

  const handleExportCsv = () => {
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

    const rows = filteredRecords.map((r) => [
      r.date,
      r.unit,
      r.machineNo,
      r.shift,
      r.idleFrom,
      r.idleTo,
      r.durationHours,
      r.reason,
      r.recordedBy,
      r.history.length,
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

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `idle-machine-log-${todayStr()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-end gap-3 mb-6 border-b border-slate-100 pb-5">
        {/* From Date */}
        <div className="min-w-[130px]">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* To Date */}
        <div className="min-w-[130px]">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Unit Filter */}
        <div className="min-w-[120px]">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Unit
          </label>
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="">All units</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Filter */}
        <div className="min-w-[120px]">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Shift
          </label>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="">All shifts</option>
            <option value="A">A Shift</option>
            <option value="B">B Shift</option>
            <option value="C">C Shift</option>
          </select>
        </div>

        {/* Reason Search */}
        <div className="min-w-[180px] flex-1">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Reason Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={reasonSearch}
              onChange={(e) => setReasonSearch(e.target.value)}
              placeholder="Search reason..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-8 pr-3 py-2 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Filter Action Buttons */}
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          Clear
        </button>

        <button
          onClick={handleExportCsv}
          disabled={filteredRecords.length === 0}
          className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV ({filteredRecords.length})
        </button>
      </div>

      {/* Records Table */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <b className="text-slate-800 block mb-1">No idle entries match these filters.</b>
          <span>Log an entry from the New Entry tab, or adjust the filters above.</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="p-3">Date</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Mc No</th>
                <th className="p-3">Shift</th>
                <th className="p-3">Idle Window</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Recorded By</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRecords.map((r) => {
                const hasEdits = r.history && r.history.length > 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-slate-900 whitespace-nowrap font-medium">
                      {fmtDate(r.date)}
                    </td>
                    <td className="p-3 font-medium text-slate-800">{r.unit}</td>
                    <td className="p-3">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 font-mono text-xs">
                        Mc {r.machineNo}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 font-medium">{r.shift}</td>
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                      {r.idleFrom} &ndash; {r.idleTo}
                    </td>
                    <td className="p-3 font-mono text-indigo-600 font-bold whitespace-nowrap">
                      {fmtDuration(r.durationHours)}
                    </td>
                    <td className="p-3 text-slate-800 max-w-[220px] break-words font-medium">{r.reason}</td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      <span className="text-slate-800 font-medium">{r.recordedBy}</span>
                      {hasEdits && (
                        <span className="ml-1.5 inline-block bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200">
                          edited &times;{r.history.length}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => onEdit(r)}
                          className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-600" />
                          Edit
                        </button>
                        <button
                          onClick={() => onHistory(r)}
                          className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                        >
                          <History className="w-3 h-3 text-slate-500" />
                          History
                        </button>
                        <button
                          onClick={() => onDelete(r)}
                          className="flex items-center gap-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
