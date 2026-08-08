import React from 'react';
import { UserSession } from '../types';
import { currentShift, shiftLabel } from '../utils/time';
import { Users, Database, LogOut, Activity } from 'lucide-react';

interface HeaderProps {
  user: UserSession;
  onOpenUsers: () => void;
  onOpenData?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenUsers, onOpenData, onLogout }) => {
  const cShift = currentShift();
  const isMaster = user.role === 'master';

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Idle Machine Log
          </h1>
          <div className="text-slate-400 text-xs md:text-sm tracking-normal mt-0.5 font-sans">
            Knitting Floor &middot; Date-wise Stoppage Record &amp; Audit History
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
        {/* Live Shift Badge */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl font-mono text-xs text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-pulse"></span>
          <span>Shift: <b className="text-indigo-300 font-semibold">{shiftLabel(cShift)}</b></span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs">
          <span className="text-slate-400">User:</span>
          <span className="font-semibold text-white">{user.displayName}</span>
          {isMaster ? (
            <span className="text-[10px] uppercase font-mono tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-semibold ml-0.5">
              Master
            </span>
          ) : (
            <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-medium ml-0.5">
              Supervisor
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <button
          onClick={onOpenUsers}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          Users
        </button>

        {isMaster && onOpenData && (
          <button
            onClick={onOpenData}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            Data
          </button>
        )}

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </div>
    </div>
  );
};
