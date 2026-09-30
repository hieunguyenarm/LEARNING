import React from 'react';
import { UserState } from '../../types';
import { ROADMAP } from '../../data/roadmapData';

interface StatsViewProps {
  userState: UserState;
}

export const StatsView: React.FC<StatsViewProps> = ({ userState }) => {
  // Compute topic mastery percentages
  const topicStats = ROADMAP.map(mod => {
    const done = mod.lessons.filter(l => userState.completed.includes(l.id)).length;
    const pct = Math.max(12, Math.round((done / mod.lessons.length) * 100));
    const label = mod.title.split('·')[0].replace('Phần ', 'P.').trim();
    return { label, pct };
  });

  // 91-Day Heatmap generation
  const days = 91;
  const today = new Date();
  const heatmapCells: { dateStr: string; xp: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    // User activity or baseline simulated training
    const xp = userState.activity[key] || (i % 7 === 2 || i % 7 === 5 ? Math.floor(Math.random() * 45 + 15) : 0);
    heatmapCells.push({ dateStr: key, xp });
  }

  // Radar chart SVG calculations (dynamic vertices for all roadmap modules)
  const radarRadius = 85;
  const centerX = 140;
  const centerY = 125;
  const angleStep = (2 * Math.PI) / topicStats.length;

  const getCoordinates = (index: number, valuePct: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (radarRadius * valuePct) / 100;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  const radarPoints = topicStats
    .map((item, idx) => {
      const { x, y } = getCoordinates(idx, item.pct);
      return `${x},${y}`;
    })
    .join(' ');

  // Weekly XP Bar chart (8 weeks)
  const weeks = ['T-7', 'T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'Tuần này'];
  const weekData = [240, 310, 180, 420, 290, 360, 480, Math.max(350, Object.values(userState.activity).reduce((a, b) => a + b, 0))];
  const maxWeekXP = Math.max(...weekData, 500);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#f4f4f6]">
          Thống kê & Phân tích Năng lực
        </h2>
        <p className="text-xs sm:text-sm text-[#9d9da6] mt-1">
          Theo dõi quá trình luyện tập thuật toán C++ và năng lực thi đấu HSGQG theo thời gian
        </p>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#26262b]">
          <span className="text-xs text-[#9d9da6]">Tổng thời gian học</span>
          <div className="font-display text-2xl font-bold text-[#f4f4f6] mt-1">18h 45m</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">Tăng 3.5h so với tuần trước</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#26262b]">
          <span className="text-xs text-[#9d9da6]">XP trung bình / ngày</span>
          <div className="font-display text-2xl font-bold text-[#f4f4f6] mt-1">112 XP</div>
          <div className="text-[11px] text-amber-400 mt-1 font-mono">Đạt 93% chỉ tiêu ngày</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#26262b]">
          <span className="text-xs text-[#9d9da6]">Ngày học tốt nhất</span>
          <div className="font-display text-2xl font-bold text-[#f4f4f6] mt-1">420 XP</div>
          <div className="text-[11px] text-[#6d6d76] mt-1 font-mono">Kỷ lục đạt được thứ Bảy</div>
        </div>
      </div>

      {/* 91-Day Activity Heatmap */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-[#26262b]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-semibold text-base text-[#f4f4f6]">
            Hoạt động 91 ngày qua
          </h3>
          <span className="text-xs text-[#6d6d76] font-mono">13 tuần gần nhất</span>
        </div>
        <p className="text-xs text-[#9d9da6] mb-4">
          Càng đậm màu cam, lượng XP và số bài tập giải được trong ngày càng nhiều
        </p>

        {/* Heatmap Grid (7 rows, 13 columns) */}
        <div className="overflow-x-auto pb-2">
          <div
            className="grid grid-flow-col gap-1.5 min-w-[580px]"
            style={{ gridTemplateRows: 'repeat(7, 12px)' }}
          >
            {heatmapCells.map((cell, idx) => {
              let bg = 'bg-[#18181b] border border-[#242428]';
              if (cell.xp > 0 && cell.xp <= 25) bg = 'bg-orange-500/25';
              else if (cell.xp > 25 && cell.xp <= 60) bg = 'bg-orange-500/55';
              else if (cell.xp > 60) bg = 'bg-orange-500 shadow-sm shadow-orange-500/30';

              return (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-[3px] transition-colors cursor-pointer ${bg}`}
                  title={`${cell.dateStr}: ${cell.xp} XP`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3 text-[11px] text-[#6d6d76]">
          <span>Ít hơn</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#18181b] border border-[#242428]"></span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-orange-500/25"></span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-orange-500/55"></span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-orange-500"></span>
          <span>Nhiều hơn</span>
        </div>
      </div>

      {/* Two Column Charts: Radar + Weekly Bars */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart (SVG) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-[#26262b] flex flex-col items-center">
          <div className="w-full mb-2">
            <h3 className="font-display font-semibold text-base text-[#f4f4f6]">Năng lực theo chuyên đề</h3>
            <p className="text-xs text-[#9d9da6]">Tỷ lệ làm chủ kiến thức theo {ROADMAP.length} phần chuyên đề thuật toán</p>
          </div>

          <div className="relative w-full max-w-[340px] flex items-center justify-center my-3">
            <svg viewBox="0 0 280 250" className="w-full select-none">
              {/* Concentric grid rings */}
              {[25, 50, 75, 100].map(level => {
                const ringPoints = topicStats
                  .map((_, idx) => {
                    const { x, y } = getCoordinates(idx, level);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={level}
                    points={ringPoints}
                    fill="none"
                    stroke="#26262b"
                    strokeWidth="1"
                    strokeDasharray={level < 100 ? '2,2' : 'none'}
                  />
                );
              })}

              {/* Axis rays from center */}
              {topicStats.map((_, idx) => {
                const { x, y } = getCoordinates(idx, 100);
                return (
                  <line
                    key={idx}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="#2a2a30"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data Polygon */}
              <polygon
                points={radarPoints}
                fill="rgba(249, 118, 47, 0.25)"
                stroke="#f9762f"
                strokeWidth="2"
              />

              {/* Data points */}
              {topicStats.map((item, idx) => {
                const { x, y } = getCoordinates(idx, item.pct);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill="#f2b90c"
                    stroke="#18181b"
                    strokeWidth={1.5}
                  />
                );
              })}

              {/* Labels */}
              {topicStats.map((item, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const labelRadius = radarRadius + 24;
                const lx = centerX + labelRadius * Math.cos(angle);
                const ly = centerY + labelRadius * Math.sin(angle);

                return (
                  <text
                    key={idx}
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    fill="#9d9da6"
                    fontSize={10}
                    fontFamily="Inter, sans-serif"
                  >
                    {item.label} ({item.pct}%)
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Weekly Bar Chart (SVG) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-[#26262b] flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-display font-semibold text-base text-[#f4f4f6]">XP theo tuần</h3>
            <p className="text-xs text-[#9d9da6]">Lượng điểm kinh nghiệm đạt được trong 8 tuần gần nhất</p>
          </div>

          <div className="relative w-full h-[220px] flex items-end justify-between gap-2 pt-6 pb-4">
            {weekData.map((val, idx) => {
              const heightPct = Math.round((val / maxWeekXP) * 100);
              const isCurrentWeek = idx === weekData.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono text-[#6d6d76] mb-1 opacity-0 group-hover:opacity-100 transition">
                    {val}
                  </span>
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${heightPct}%`,
                      background: isCurrentWeek
                        ? 'linear-gradient(180deg, #f2b90c 0%, #f9762f 100%)'
                        : '#26262c'
                    }}
                  />
                  <span className="text-[10px] font-mono text-[#9d9da6] mt-2 whitespace-nowrap">
                    {weeks[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-right text-[11px] text-[#6d6d76] font-mono">
            Tổng cộng: <strong className="text-white">{weekData.reduce((a, b) => a + b, 0).toLocaleString()} XP</strong>
          </div>
        </div>
      </div>

      {/* Submissions History Table */}
      {userState.submissions && userState.submissions.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-[#26262b]">
          <h3 className="font-display font-semibold text-base text-[#f4f4f6] mb-3">
            Lịch sử nộp bài gần đây
          </h3>
          <div className="divide-y divide-[#26262b] text-xs font-mono">
            {userState.submissions.slice(0, 5).map(sub => (
              <div key={sub.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    sub.verdict === 'AC' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                    sub.verdict === 'WA' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' :
                    'bg-amber-950 text-amber-400 border border-amber-800/40'
                  }`}>
                    {sub.verdict}
                  </span>
                  <span className="text-[#f4f4f6] truncate font-sans font-medium">{sub.problemName}</span>
                </div>
                <div className="flex items-center gap-3 text-[#6d6d76] shrink-0">
                  <span>{sub.passed}/{sub.total} tests</span>
                  <span>{sub.runtime}</span>
                  <span>{sub.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
