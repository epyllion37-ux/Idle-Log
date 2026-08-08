import React from 'react';
import { FIELD_LABELS, IdleRecord } from '../types';
import { fmtTs } from '../utils/time';
import { X, Clock, UserCheck } from 'lucide-react';

interface HistoryModalProps {
  record: IdleRecord;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ record, onClose }) => {
  const historyList = record.history || [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-xl relative max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Edit History &mdash; Mc {record.machineNo} ({record.unit})
            </h2>
            <p className="text-xs text-slate-500 font-medium">Audit trail for all modification events</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {historyList.length === 0 ? (
          <div className="text-xs md:text-sm text-slate-500 py-6">
            No edits yet &mdash; originally recorded by <b className="text-slate-800">{record.recordedBy}</b> on {fmtTs(record.createdAt)}.
          </div>
        ) : (
          <div className="space-y-4 my-2">
            {[...historyList].reverse().map((h, idx) => (
              <div key={idx} className="border-l-2 border-indigo-500 pl-4 py-1">
                <div className="font-mono text-xs text-slate-500 flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{fmtTs(h.timestamp)}</span>
                  <span>&middot;</span>
                  <span className="text-slate-800 font-semibold">{h.editor}</span>
                </div>

                <div className="space-y-1 text-xs md:text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {Object.keys(h.changes || {}).map((f) => {
                    const c = h.changes[f];
                    const label = FIELD_LABELS[f] || f;
                    const oldVal = c.old == null || c.old === '' ? '—' : String(c.old);
                    const newVal = c.new == null || c.new === '' ? '—' : String(c.new);

                    return (
                      <div key={f} className="text-slate-800">
                        <span className="text-indigo-600 font-semibold">{label}</span>:{' '}
                        <span className="line-through text-slate-400">{oldVal}</span> &rarr;{' '}
                        <span className="text-emerald-600 font-semibold">{newVal}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Original Record Item */}
            <div className="border-l-2 border-slate-200 pl-4 py-1 pt-2">
              <div className="font-mono text-xs text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{fmtTs(record.createdAt)}</span>
                <span>&middot;</span>
                <span>Originally recorded by <b className="text-slate-800 font-semibold">{record.recordedBy}</b></span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
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
