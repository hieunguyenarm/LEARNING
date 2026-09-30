import React from 'react';
import { Menu, Zap, Flame, User, RotateCcw } from 'lucide-react';
import { UserState } from '../types';

interface HeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
  userState: UserState;
  onOpenProfile?: () => void;
  onResetAll?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenMobileMenu,
  userState,
  onOpenProfile,
  onResetAll
}) => {
  return (
    <header className="h-16 shrink-0 border-b border-[#26262b] flex items-center justify-between px-4 sm:px-7 bg-[#111113]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-[#9d9da6] hover:text-[#f4f4f6] p-1 -ml-1 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display font-semibold text-lg tracking-tight text-[#f4f4f6] truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* User name & Edit Button */}
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181b] hover:bg-[#222228] border border-[#2a2a30] text-xs text-[#d4d4d8] hover:text-white transition"
            title="Đổi tên học viên hoặc cài đặt"
          >
            <User className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-medium max-w-[100px] sm:max-w-[150px] truncate">
              {userState.userName || 'Học viên'}
            </span>
          </button>
        )}

        {/* Reload / Reset Page Button */}
        {onResetAll && (
          <button
            onClick={onResetAll}
            className="p-1.5 rounded-full bg-[#18181b] hover:bg-rose-950/30 border border-[#2a2a30] hover:border-rose-900/50 text-[#9d9da6] hover:text-rose-300 text-xs transition"
            title="Làm mới / Đặt lại trang về ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Streak */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#202024] border border-[#2a2a30] px-3 py-1.5 rounded-full text-xs">
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span className="font-mono font-medium text-[#f4f4f6]">{userState.streak}</span>
          <span className="text-[#6d6d76]">ngày</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 bg-[#202024] border border-[#2a2a30] px-3 py-1.5 rounded-full text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-mono font-medium text-[#f4f4f6]">
            {userState.xp.toLocaleString('vi-VN')}
          </span>
          <span className="text-[#6d6d76] hidden sm:inline">XP</span>
        </div>

        {/* Level */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-400 px-3.5 py-1.5 rounded-full text-xs font-display font-bold text-[#181008] shadow-sm">
          <span>Lv.{userState.level}</span>
        </div>
      </div>
    </header>
  );
};
