import React, { useState } from 'react';
import { IdleRecord, MC_MAX, REASON_SUGGESTIONS, Shift, Unit, UNITS, UserSession } from '../types';
import { computeDurationHours, currentShift, fmtDuration, todayStr } from '../utils/time';
import { addRecord } from '../utils/storage';
import { Save, AlertCircle } from 'lucide-react';

interface EntryFormProps {
  user: UserSession;
  onEntrySaved: (msg: string) => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ user, onEntrySaved }) => {
  const [date, setDate] = useState<string>(todayStr());
  const [unit, setUnit] = useState<Unit>("EKL");
  const [machineNo, setMachineNo] = useState<number>(1);
  const [shift, setShift] = useState<Shift>(currentShift());
  const [idleFrom, setIdleFrom] = useState<string>("");
  const [idleTo, setIdleTo] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const durationHours = computeDurationHours(idleFrom, idleTo);

  const handleUnitChange = (newUnit: Unit) => {
    setUnit(newUnit);
    const max = MC_MAX[newUnit] || 1;
    if (machineNo > max) {
      setMachineNo(1);
    }
  };

  const handleSave = () => {
    setErrorMsg("");
    if (!idleFrom || !idleTo) {
      setErrorMsg("Please select both Idle From and Idle To times.");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("Please enter or select an idle reason before saving.");
      return;
    }

    setIsSaving(true);

    const rec: IdleRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      date,
      unit,
      machineNo: Number(machineNo),
      shift,
      idleFrom,
      idleTo,
      durationHours,
      reason: reason.trim(),
      recordedBy: user.displayName,
      recordedByUser: user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: []
    };

    const ok = addRecord(rec);
    setIsSaving(false);

    if (ok) {
      onEntrySaved(`Entry saved for Mc ${rec.machineNo} (${rec.unit}) — ${fmtDuration(rec.durationHours)}`);
      setIdleFrom("");
      setIdleTo("");
      setReason("");
    } else {
      setErrorMsg("Failed to save entry. Please check storage.");
    }
  };

  const mcOptionsCount = MC_MAX[unit] || 1;

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 md:p-8">
      <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Record Machine Stoppage</h2>
          <p className="text-xs text-slate-500">Log new idle duration and reason for knitting machines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value as Unit)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Machine Number */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Mc Number
          </label>
          <select
            value={machineNo}
            onChange={(e) => setMachineNo(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            {Array.from({ length: mcOptionsCount }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Mc {n}
              </option>
            ))}
          </select>
        </div>

        {/* Shift */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Shift
          </label>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value as Shift)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="A">A Shift (6 AM–2 PM)</option>
            <option value="B">B Shift (2 PM–10 PM)</option>
            <option value="C">C Shift (10 PM–6 AM)</option>
          </select>
        </div>

        {/* Idle From */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Idle From
          </label>
          <input
            type="time"
            value={idleFrom}
            onChange={(e) => setIdleFrom(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Idle To */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Idle To
          </label>
          <input
            type="time"
            value={idleTo}
            onChange={(e) => setIdleTo(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Duration Readout */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Duration
          </label>
          <div className="w-full bg-indigo-50/60 border border-indigo-200 text-indigo-700 font-mono px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between">
            <span>{idleFrom && idleTo ? fmtDuration(durationHours) : "—"}</span>
            {idleFrom && idleTo && <span className="text-[10px] uppercase bg-indigo-200/60 text-indigo-800 px-1.5 py-0.5 rounded font-mono">Auto</span>}
          </div>
        </div>

        {/* Recorded By Readout */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Recorded By
          </label>
          <div className="w-full bg-slate-100/70 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm font-medium">
            {user.displayName}
          </div>
        </div>
      </div>

      {/* Idle Reason Section */}
      <div className="mt-6">
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Idle Reason
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Yarn shortage, mechanical fault, no operator..."
          list="reason-suggestions"
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
        />
        <datalist id="reason-suggestions">
          {REASON_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-slate-500 font-medium mr-1">Quick Select:</span>
          {REASON_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setReason(s)}
              className="text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 px-3 py-1 rounded-lg transition-colors cursor-pointer font-medium"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message Display */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl text-xs font-medium mt-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </div>
  );
};
