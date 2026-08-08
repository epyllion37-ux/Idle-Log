import React, { useState } from 'react';
import { IdleRecord } from '../types';
import { fmtDate } from '../utils/time';
import { deleteRecord } from '../utils/storage';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteModalProps {
  record: IdleRecord;
  onClose: () => void;
  onDeleted: (msg: string) => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ record, onClose, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleConfirm = () => {
    setIsDeleting(true);
    const ok = deleteRecord(record.date, record.id);
    setIsDeleting(false);

    if (ok) {
      onDeleted(`Deleted entry for Mc ${record.machineNo} (${record.unit})`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Delete Entry?
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs md:text-sm text-slate-600 mb-6 leading-relaxed">
          This will permanently remove the <b className="text-slate-900 font-semibold">Mc {record.machineNo} ({record.unit})</b> entry from <b className="text-slate-900 font-semibold">{fmtDate(record.date)}</b> ({record.reason}) along with its edit audit history.
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};
