import React, { useState } from 'react';
import { IdleRecord, MC_MAX, Shift, Unit, UNITS, UserSession } from '../types';
import { computeDurationHours, fmtDuration } from '../utils/time';
import { replaceRecord } from '../utils/storage';
import { X, Save, AlertCircle } from 'lucide-react';

interface EditModalProps {
  record: IdleRecord;
  user: UserSession;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ record, user, onClose, onSaved }) => {
  const [date, setDate] = useState<string>(record.date);
  const [unit, setUnit] = useState<Unit>(record.unit);
  const [machineNo, setMachineNo] = useState<number>(record.machineNo);
  const [shift, setShift] = useState<Shift>(record.shift);
  const [idleFrom, setIdleFrom] = useState<string>(record.idleFrom);
  const [idleTo, setIdleTo] = useState<string>(record.idleTo);
  const [reason, setReason] = useState<string>(record.reason);
  const [errorMsg, setErrorMsg] = useState<string>('');
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
    if (!idleFrom || !idleTo) {
      setErrorMsg('Enter both Idle From and Idle To times.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Enter an idle reason before saving.');
      return;
    }

    const updated = {
      date,
      unit,
      machineNo: Number(machineNo),
      shift,
      idleFrom,
      idleTo,
      durationHours,
      reason: reason.trim()
    };

    // Calculate diffs
    const changes: Record<string, { old: any; new: any }> = {};
    Object.keys(updated).forEach((k) => {
      if (k === 'durationHours') return;
      const key = k as keyof typeof updated;
      if (String((record as any)[key]) !== String(updated[key])) {
        changes[key] = { old: (record as any)[key], new: updated[key] };
      }
    });

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);

    const historyEntry = {
      timestamp: new Date().toISOString(),
      editor: user.displayName,
      changes
    };

    const newRec: IdleRecord = {
      ...record,
      ...updated,
      updatedAt: new Date().toISOString(),
      history: [...(record.history || []), historyEntry]
    };

    const ok = replaceRecord(record.date, newRec);
    setIsSaving(false);

    if (ok) {
      onSaved(`Entry updated for Mc ${newRec.machineNo} (${newRec.unit})`);
      onClose();
    } else {
      setErrorMsg('Failed to update entry. Please try again.');
    }
  };

  const mcOptionsCount = MC_MAX[unit] || 1;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Edit Entry &mdash; Mc {record.machineNo} ({record.unit})
            </h2>
            <p className="text-xs text-slate-500 font-medium">Update stoppage record details and audit history</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
              <option value="A">A Shift</option>
              <option value="B">B Shift</option>
              <option value="C">C Shift</option>
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
        </div>

        {/* Duration Readout */}
        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Calculated Duration
          </label>
          <div className="bg-indigo-50/60 border border-indigo-200 text-indigo-700 font-mono px-3.5 py-2.5 rounded-xl text-sm font-semibold inline-block min-w-[140px]">
            {idleFrom && idleTo ? fmtDuration(durationHours) : '—'}
          </div>
        </div>

        {/* Idle Reason */}
        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Idle Reason
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        <div className="mt-3.5 text-xs text-slate-500">
          Editing as <b className="text-slate-800 font-semibold">{user.displayName}</b> &mdash; changes will be appended to this entry's audit log.
        </div>

        {errorMsg && (
          <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl text-xs font-medium mt-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
