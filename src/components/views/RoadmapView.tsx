import React, { useState } from 'react';
import { ChevronDown, Check, Zap, Search, Filter } from 'lucide-react';
import { UserState, Lesson, RoadmapModule } from '../../types';
import { ROADMAP, TOTAL_LESSONS } from '../../data/roadmapData';

interface RoadmapViewProps {
  userState: UserState;
  onOpenLesson: (module: RoadmapModule, lesson: Lesson) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  userState,
  onOpenLesson
}) => {
  const [openModules, setOpenModules] = useState<{ [key: string]: boolean }>({
    'part-0': true,
    'part-1': true,
    'part-2': true,
    'part-3': true,
    'part-4': true,
    'part-5': true,
    'part-6': true,
    'part-7': true,
    'part-8': true,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DONE' | 'UNDONE'>('ALL');

  const toggleModule = (key: string) => {
    setOpenModules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const completedCount = userState.completed.length;
  const overallPct = Math.round((completedCount / TOTAL_LESSONS) * 100);

  return (
    <div className="space-y-6">
      {/* Roadmap Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#f4f4f6]">
            Lộ trình C++ Chuyên sâu cho HSGQG
          </h2>
          <p className="text-xs sm:text-sm text-[#9d9da6] mt-1">
            {ROADMAP.length} phần chuyên sâu · {TOTAL_LESSONS} bài học lý thuyết, bất biến toán học & code C++20 chuẩn
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#18181b] border border-[#26262b] text-xs font-mono text-[#f4f4f6]">
            <strong className="text-orange-400 font-bold">{completedCount}</strong>/{TOTAL_LESSONS} hoàn thành ({overallPct}%)
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-[#18181b] rounded-full overflow-hidden border border-[#26262b]">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${overallPct}%` }}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6d6d76] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học, thuật toán, cấu trúc dữ liệu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#18181b] border border-[#26262b] text-xs sm:text-sm text-[#f4f4f6] placeholder-[#6d6d76] focus:outline-none focus:border-orange-500/50 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-[#26262b] text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterMode === 'ALL'
                ? 'bg-[#202024] text-white shadow'
                : 'text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            Tất cả ({TOTAL_LESSONS})
          </button>
          <button
            onClick={() => setFilterMode('DONE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterMode === 'DONE'
                ? 'bg-[#202024] text-emerald-400 shadow'
                : 'text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            Đã học ({completedCount})
          </button>
          <button
            onClick={() => setFilterMode('UNDONE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterMode === 'UNDONE'
                ? 'bg-[#202024] text-orange-400 shadow'
                : 'text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            Chưa học ({TOTAL_LESSONS - completedCount})
          </button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {ROADMAP.map((mod, modIdx) => {
          // Filter lessons within module based on search and status
          const filteredLessons = mod.lessons.filter(l => {
            const matchesQuery =
              l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              l.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
              l.theory.toLowerCase().includes(searchQuery.toLowerCase());

            const isDone = userState.completed.includes(l.id);
            if (filterMode === 'DONE') return matchesQuery && isDone;
            if (filterMode === 'UNDONE') return matchesQuery && !isDone;
            return matchesQuery;
          });

          if (filteredLessons.length === 0 && searchQuery !== '') {
            return null;
          }

          const doneCount = mod.lessons.filter(l => userState.completed.includes(l.id)).length;
          const pct = Math.round((doneCount / mod.lessons.length) * 100);
          const isOpen = openModules[mod.key] ?? false;

          return (
            <div
              key={mod.key}
              className="rounded-2xl bg-[#18181b] border border-[#26262b] overflow-hidden transition"
            >
              {/* Module Header Toggle */}
              <button
                onClick={() => toggleModule(mod.key)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl sm:text-2xl shrink-0 p-2 rounded-xl bg-[#202024]">
                    {mod.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-sm sm:text-base text-[#f4f4f6] truncate">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-[#6d6d76] mt-0.5 truncate">
                      {doneCount}/{mod.lessons.length} bài hoàn thành · {pct}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:block w-28 h-1.5 bg-[#202024] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#6d6d76] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#f4f4f6]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Module Lessons Accordion Body */}
              {isOpen && (
                <div className="px-5 pb-4 pt-1 space-y-2 border-t border-[#26262b]">
                  {filteredLessons.map(lesson => {
                    const isDone = userState.completed.includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => onOpenLesson(mod, lesson)}
                        className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition cursor-pointer ${
                          isDone
                            ? 'bg-[#18181b] border-[#222226] hover:border-[#33333a]'
                            : 'bg-[#141416] border-[#26262b] hover:border-[#383842]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition ${
                              isDone
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'bg-[#202024] text-[#6d6d76] border border-[#2a2a30]'
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5" /> : lesson.id}
                          </span>

                          <div className="min-w-0">
                            <div className={`text-xs sm:text-sm font-medium truncate ${isDone ? 'text-[#9d9da6]' : 'text-[#f4f4f6]'}`}>
                              {lesson.title}
                            </div>
                            <div className="text-[11px] text-[#6d6d76] truncate mt-0.5">
                              {lesson.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400/90">
                            <Zap className="w-3 h-3" />
                            <span>+{lesson.xp} XP</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
