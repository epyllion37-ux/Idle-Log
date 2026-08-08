import React, { useState, useEffect, useMemo } from 'react';
import { IdleRecord, UNITS } from '../types';
import { fmtDuration, todayStr } from '../utils/time';
import { getRecordsInRange } from '../utils/storage';
import { BarChart3, Clock, AlertTriangle, ListFilter, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onSelectReason: (reason: string, fromDate: string, toDate: string, unit: string, shift: string) => void;
  refreshTrigger: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectReason, refreshTrigger }) => {
  const thisMonthStart = `${todayStr().slice(0, 8)}01`;

  const [fromDate, setFromDate] = useState<string>(thisMonthStart);
  const [toDate, setToDate] = useState<string>(todayStr());
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [shiftFilter, setShiftFilter] = useState<string>('');

  const [rawRecords, setRawRecords] = useState<IdleRecord[]>([]);

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
    return list;
  }, [rawRecords, unitFilter, shiftFilter]);

  // Group by reason
  const { reasonMap, totalDowntimeHours } = useMemo(() => {
    const map: Record<string, { label: string; hours: number; count: number }> = {};
    let total = 0;

    filteredRecords.forEach((r) => {
      const rawReason = (r.reason || '').trim();
      const key = rawReason.toLowerCase() || '(no reason given)';
      if (!map[key]) {
        map[key] = {
          label: rawReason || '(No reason given)',
          hours: 0,
          count: 0
        };
      }
      const hrs = r.durationHours || 0;
      map[key].hours += hrs;
      map[key].count += 1;
      total += hrs;
    });

    return { reasonMap: map, totalDowntimeHours: total };
  }, [filteredRecords]);

  const sortedReasons = useMemo(() => {
    return (Object.values(reasonMap) as Array<{ label: string; hours: number; count: number }>).sort((a, b) => b.hours - a.hours);
  }, [reasonMap]);

  const maxReasonHours = sortedReasons.length ? sortedReasons[0].hours : 0;

  const handleQuickRange = (range: 'today' | '7d' | 'month' | 'all') => {
    const today = todayStr();
    if (range === 'today') {
      setFromDate(today);
      setToDate(today);
    } else if (range === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      const pad = (n: number) => String(n).padStart(2, '0');
      setFromDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
      setToDate(today);
    } else if (range === 'month') {
      setFromDate(`${today.slice(0, 8)}01`);
      setToDate(today);
    } else if (range === 'all') {
      setFromDate('');
      setToDate('');
    }
  };

  const handleRowClick = (label: string) => {
    onSelectReason(label === '(No reason given)' ? '' : label, fromDate, toDate, unitFilter, shiftFilter);
  };

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6">
      {/* Quick Ranges & Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6 pb-5 border-b border-slate-100">
        <div className="flex flex-wrap gap-1.5 mr-2">
          <button
            onClick={() => handleQuickRange('today')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => handleQuickRange('7d')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickRange('month')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
          >
            This Month
          </button>
          <button
            onClick={() => handleQuickRange('all')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
          >
            All Time
          </button>
        </div>

        {/* Date Inputs */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Unit Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Unit
          </label>
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
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
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Shift
          </label>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="">All shifts</option>
            <option value="A">A Shift</option>
            <option value="B">B Shift</option>
            <option value="C">C Shift</option>
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <b className="text-slate-800 block mb-1">No idle entries in this range.</b>
          <span>Widen the date range or clear the unit/shift filters.</span>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {/* KPI 1 */}
            <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="font-mono text-2xl md:text-3xl font-bold text-indigo-600">
                {fmtDuration(totalDowntimeHours)}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Total Downtime
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <AlertTriangle className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="font-mono text-2xl md:text-3xl font-bold text-slate-900">
                {filteredRecords.length}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Stoppage Entries
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <ListFilter className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="font-mono text-2xl md:text-3xl font-bold text-slate-900">
                {sortedReasons.length}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Distinct Reasons
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="font-mono text-2xl md:text-3xl font-bold text-indigo-600">
                {filteredRecords.length
                  ? fmtDuration(totalDowntimeHours / filteredRecords.length)
                  : '—'}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Avg per Stoppage
              </div>
            </div>
          </div>

          {/* Downtime by Reason Vertical Bar Chart */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 mb-6">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-5">
              Downtime by Reason (Hours)
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="min-w-[500px]">
                <div className="flex items-end gap-5 h-48 border-b border-slate-200 px-2 pb-1">
                  {sortedReasons.map((item) => {
                    const maxBarHeight = 160; // px
                    const height = maxReasonHours
                      ? Math.max(8, Math.round((item.hours / maxReasonHours) * maxBarHeight))
                      : 8;

                    return (
                      <div
                        key={item.label}
                        onClick={() => handleRowClick(item.label)}
                        className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                        title={`${item.label}: ${fmtDuration(item.hours)} (${item.count} stoppages)`}
                      >
                        <div className="font-mono text-[11px] text-slate-700 font-semibold mb-1.5 group-hover:text-indigo-600 transition-colors">
                          {fmtDuration(item.hours)}
                        </div>
                        <div
                          style={{ height: `${height}px` }}
                          className="w-full max-w-[42px] bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-t-xl group-hover:from-indigo-600 group-hover:to-indigo-700 transition-all shadow-xs"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-5 px-2 pt-3">
                  {sortedReasons.map((item) => (
                    <div
                      key={item.label}
                      onClick={() => handleRowClick(item.label)}
                      className="flex-1 text-xs text-slate-600 text-center leading-tight break-words cursor-pointer hover:text-indigo-600 font-medium transition-colors"
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reason Breakdown Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Reason Breakdown</span>
              <span>Click a reason to view matching records</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs md:text-sm">
              <div className="grid grid-cols-12 gap-2 p-3.5 bg-slate-50/40 font-semibold text-xs text-slate-500">
                <div className="col-span-6">Reason</div>
                <div className="col-span-2 text-right">Hours</div>
                <div className="col-span-2 text-right">Count</div>
                <div className="col-span-2 text-right">% Total</div>
              </div>

              {sortedReasons.map((item) => {
                const percent = totalDowntimeHours
                  ? Math.round((item.hours / totalDowntimeHours) * 1000) / 10
                  : 0;

                return (
                  <div
                    key={item.label}
                    onClick={() => handleRowClick(item.label)}
                    className="grid grid-cols-12 gap-2 p-3.5 hover:bg-slate-50 transition-colors cursor-pointer group items-center"
                  >
                    <div className="col-span-6 font-medium text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5">
                      <span>{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <div className="col-span-2 text-right font-mono text-indigo-600 font-bold">
                      {fmtDuration(item.hours)}
                    </div>
                    <div className="col-span-2 text-right font-mono text-slate-700 font-medium">
                      {item.count}x
                    </div>
                    <div className="col-span-2 text-right font-mono text-slate-500">
                      {percent}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
