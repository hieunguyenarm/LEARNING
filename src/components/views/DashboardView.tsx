import React from 'react';
import { Flame, Zap, BookOpen, CheckCircle, ArrowRight, Edit3 } from 'lucide-react';
import { UserState } from '../../types';
import { ROADMAP, TOTAL_LESSONS } from '../../data/roadmapData';

interface DashboardViewProps {
  userState: UserState;
  onNavigate: (view: string) => void;
  onOpenLessonById?: (lessonId: string) => void;
  onOpenProfile?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userState,
  onNavigate,
  onOpenProfile
}) => {
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Chào buổi sáng,' : hour < 18 ? 'Chào buổi chiều,' : 'Chào buổi tối,';

  // Find next uncompleted lesson
  let nextLesson = { id: '0-1', title: 'Cấu trúc chương trình C++ & Tối ưu I/O', moduleTitle: 'Phần 0 (Nhập môn)' };
  for (const m of ROADMAP) {
    const uncompleted = m.lessons.find(l => !userState.completed.includes(l.id));
    if (uncompleted) {
      nextLesson = { id: uncompleted.id, title: uncompleted.title, moduleTitle: m.title };
      break;
    }
  }

  // Daily goal calculation: 120 XP target per day
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayXP = userState.activity[todayKey] || 0;
  const goalTarget = 120;
  const goalPct = Math.min(100, Math.round((todayXP / goalTarget) * 100));

  // XP needed for next level: lvl * 520
  const nextLevelXP = userState.level * 520;
  const xpNeeded = Math.max(0, nextLevelXP - userState.xp);

  // SVG circle calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89
  const strokeDashoffset = circumference - (circumference * goalPct) / 100;

  const BADGES = [
    { id: 'b1', icon: '🌅', name: 'Chim sớm', desc: 'Bắt đầu hành trình', unlocked: true },
    { id: 'b2', icon: '💯', name: 'Điểm tuyệt đối', desc: 'Nộp bài AC thành công', unlocked: userState.acCount >= 1 },
    { id: 'b3', icon: '⏱️', name: 'Hour Hero', desc: 'Đạt trên 1,000 XP', unlocked: userState.xp >= 1000 },
    { id: 'b4', icon: '⭐', name: 'Cao thủ Level 5', desc: 'Đạt Level 5', unlocked: userState.level >= 5 },
    { id: 'b5', icon: '📚', name: 'Học nhanh', desc: 'Hoàn thành ≥ 3 bài học', unlocked: userState.completed.length >= 3 },
    { id: 'b6', icon: '🎯', name: 'Bước đầu tiên', desc: 'Hoàn thành bài học đầu tiên', unlocked: userState.completed.length >= 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#18181b] border border-[#26262b] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-10 top-10 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs sm:text-sm text-[#9d9da6] mb-1">{greeting}</p>
            <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#f4f4f6] flex items-center flex-wrap gap-2">
              <span>{userState.userName || 'Học viên'}</span>
              {onOpenProfile && (
                <button
                  onClick={onOpenProfile}
                  className="p-1 rounded-lg text-[#9d9da6] hover:text-orange-400 hover:bg-[#202024] transition"
                  title="Bấm để đổi tên học viên của bạn"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              <span className="text-[#6d6d76] font-normal text-base">(HSGQG C++)</span>
              <span>ơi, học tiếp nhé 🚀</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9d9da6] mt-2 max-w-lg leading-relaxed">
              Bạn đang ở <strong className="text-[#f4f4f6]">{nextLesson.moduleTitle.split('·')[0]} · {nextLesson.title}</strong>. Hoàn thành các bài học và mô phỏng hôm nay để duy trì chuỗi streak!
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={() => onNavigate('roadmap')}
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center gap-2"
              >
                <span>▶ Tiếp tục học</span>
              </button>
              <button
                onClick={() => onNavigate('visualizer')}
                className="bg-[#202024] hover:bg-[#28282e] text-[#f4f4f6] border border-[#2a2a30] text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl transition flex items-center gap-2"
              >
                <span>🎬 Mở Visualizer</span>
              </button>
            </div>
          </div>

          {/* Goal Progress Ring */}
          <div className="flex items-center justify-center shrink-0">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#26262b"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="url(#dashRingGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="dashRingGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f9762f" />
                    <stop offset="100%" stopColor="#f2b90c" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display font-bold text-xl text-[#f4f4f6]">{goalPct}%</span>
                <span className="text-[10px] text-[#6d6d76]">mục tiêu ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-[#26262b]">
          <div className="flex items-center justify-between text-xs text-[#9d9da6] mb-1">
            <span>Chuỗi hiện tại</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="font-display text-2xl font-bold text-[#f4f4f6]">
            {userState.streak} ngày
          </div>
          <div className="text-[11px] text-[#6d6d76] mt-1 font-mono">
            Kỷ lục: {userState.bestStreak} ngày
          </div>
        </div>

        {/* Total XP */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-[#26262b]">
          <div className="flex items-center justify-between text-xs text-[#9d9da6] mb-1">
            <span>Tổng XP</span>
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="font-display text-2xl font-bold text-[#f4f4f6]">
            {userState.xp.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] text-[#6d6d76] mt-1 font-mono">
            Còn {xpNeeded} XP lên cấp {userState.level + 1}
          </div>
        </div>

        {/* Lessons */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-[#26262b]">
          <div className="flex items-center justify-between text-xs text-[#9d9da6] mb-1">
            <span>Bài đã học</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-display text-2xl font-bold text-[#f4f4f6]">
            {userState.completed.length}/{TOTAL_LESSONS}
          </div>
          <div className="text-[11px] text-[#6d6d76] mt-1 font-mono">
            trên toàn lộ trình
          </div>
        </div>

        {/* Submissions AC */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-[#26262b]">
          <div className="flex items-center justify-between text-xs text-[#9d9da6] mb-1">
            <span>Bài nộp AC</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display text-2xl font-bold text-[#f4f4f6]">
            {userState.acCount}
          </div>
          <div className="text-[11px] text-[#6d6d76] mt-1 font-mono">
            trên Code Playground
          </div>
        </div>
      </div>

      {/* Two Column Layout: Roadmap preview & Badges / Skills */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Roadmap Preview */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-[#26262b]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base text-[#f4f4f6]">Tiến độ lộ trình học tập</h3>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 transition"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {ROADMAP.map(mod => {
              const doneCount = mod.lessons.filter(l => userState.completed.includes(l.id)).length;
              const pct = Math.round((doneCount / mod.lessons.length) * 100);

              return (
                <div key={mod.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[#f4f4f6] font-medium">
                      <span>{mod.icon}</span>
                      <span>{mod.title}</span>
                    </span>
                    <span className="text-[#6d6d76] font-mono">
                      {doneCount}/{mod.lessons.length} bài ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#202024] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges & Module breakdown */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-[#26262b] flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-[#f4f4f6] mb-3">Huy hiệu thành tích</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {BADGES.map(badge => (
                <div
                  key={badge.id}
                  className={`p-2.5 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                    badge.unlocked
                      ? 'bg-[#202024] border-[#2a2a30] text-[#f4f4f6]'
                      : 'opacity-30 bg-[#141416] border-[#1e1e24] text-[#6d6d76]'
                  }`}
                  title={`${badge.name}: ${badge.desc}`}
                >
                  <span className="text-xl mb-1">{badge.icon}</span>
                  <span className="text-[10px] font-mono leading-tight truncate w-full text-center">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#26262b]">
            <h4 className="text-xs text-[#9d9da6] mb-3">Tỷ lệ hoàn thành chuyên đề</h4>
            <div className="space-y-2">
              {ROADMAP.map(mod => {
                const done = mod.lessons.filter(l => userState.completed.includes(l.id)).length;
                const pct = Math.round((done / mod.lessons.length) * 100);
                const shortTitle = mod.title.split('·')[1]?.trim() || mod.title;

                return (
                  <div key={mod.key} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#6d6d76]">
                      <span className="truncate">{shortTitle}</span>
                      <span className="font-mono">{pct}%</span>
                    </div>
                    <div className="h-1 w-full bg-[#202024] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
