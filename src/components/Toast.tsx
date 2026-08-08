import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs md:text-sm font-medium z-[100] shadow-lg flex items-center gap-2.5 border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      <span>{message}</span>
    </div>
  );
};
