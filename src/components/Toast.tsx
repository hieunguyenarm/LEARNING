import React from 'react';
import { Zap } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1c1c20] border border-[#2a2a30] text-[#f4f4f6] rounded-xl px-4 py-2.5 text-xs sm:text-sm shadow-2xl flex items-center gap-2 whitespace-nowrap">
        <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};
