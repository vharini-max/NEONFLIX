import React from 'react';
import { ToastInfo } from '../types';

interface ToastProps {
  toast: ToastInfo | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#2a292e]/95 border border-white/20 backdrop-blur-xl text-white font-mono-tech text-[12px] shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
      <span className={`material-symbols-outlined text-[17px] ${toast.color || 'text-[#00e479]'}`}>
        {toast.icon || 'check_circle'}
      </span>
      <span className="font-bold">{toast.message}</span>
    </div>
  );
};
