import React from 'react';
import { Home, Map, Film, Code, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserState } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userState: UserState;
  onOpenProfile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  userState,
  onOpenProfile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'roadmap', label: 'Lộ trình', icon: Map },
    { id: 'visualizer', label: 'Visualizer', icon: Film },
    { id: 'playground', label: 'Code Playground', icon: Code },
    { id: 'stats', label: 'Thống kê', icon: BarChart2 },
  ];

  const getInitials = (name: string) => {
    if (!name || name === 'Bạn' || name === 'Học viên') return 'CP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = userState.userName || 'Học viên';
  const initials = getInitials(displayName);

  return (
    <aside
      className={`shrink-0 h-full flex flex-col border-r border-[#26262b] bg-[#111113] transition-all duration-300 z-30 ${
        collapsed ? 'w-[74px]' : 'w-[250px]'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[#26262b] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shrink-0 shadow-md">
          <span className="text-sm">🧠</span>
        </div>
        {!collapsed && (
          <span className="font-display font-semibold text-[15px] tracking-tight text-[#f4f4f6] truncate">
            LearningVN
          </span>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition relative ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/15 to-orange-500/5 text-white font-medium'
                  : 'text-[#9d9da6] hover:bg-white/[0.04] hover:text-[#f4f4f6]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-gradient-to-b from-orange-500 to-amber-400" />
              )}
              <Icon className="w-5 h-5 shrink-0 text-center" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile & Collapse Footer */}
      <div className="p-3 border-t border-[#26262b] shrink-0 space-y-2">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl bg-[#202024]/60 hover:bg-[#202024] text-left transition"
          title="Bấm để đổi tên học viên hoặc cài đặt"
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-xs font-display font-bold text-white">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#111113]"></span>
          </div>
          {!collapsed && (
            <div className="min-w-0 text-xs leading-tight">
              <div className="font-medium text-[#f4f4f6] truncate hover:text-orange-400 flex items-center gap-1">
                <span>{displayName}</span>
                <span className="text-[10px] text-[#71717a]">✎</span>
              </div>
              <div className="text-[#6d6d76] font-mono truncate">
                Cấp {userState.level} · {userState.xp.toLocaleString('vi-VN')} XP
              </div>
            </div>
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#6d6d76] hover:text-[#f4f4f6] hover:bg-[#202024]/60 text-xs transition"
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
