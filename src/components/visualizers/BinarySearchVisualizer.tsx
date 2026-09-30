import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Info, Search } from 'lucide-react';

interface BinarySearchVisualizerProps {
  onEarnXP?: (amount: number, reason: string) => void;
}

interface BSStep {
  low: number;
  high: number;
  mid: number;
  midVal: number;
  status: 'FOUND' | 'LESS' | 'GREATER' | 'NOT_FOUND';
  log: string;
}

export const BinarySearchVisualizer: React.FC<BinarySearchVisualizerProps> = ({ onEarnXP }) => {
  const array = [2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78, 89, 91, 99, 105, 120];
  const [target, setTarget] = useState<number>(67);
  const [speed, setSpeed] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [xpAwarded, setXpAwarded] = useState<boolean>(false);

  // Precompute steps
  const steps = React.useMemo<BSStep[]>(() => {
    const list: BSStep[] = [];
    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const val = array[mid];

      if (val === target) {
        list.push({
          low,
          high,
          mid,
          midVal: val,
          status: 'FOUND',
          log: `A[mid=${mid}] = ${val} == ${target} -> TÌM THẤY MỤC TIÊU TẠI VỊ TRÍ ${mid}!`
        });
        break;
      } else if (val < target) {
        list.push({
          low,
          high,
          mid,
          midVal: val,
          status: 'LESS',
          log: `A[mid=${mid}] = ${val} < ${target} -> Mục tiêu nằm ở nửa bên phải. Loại bỏ nửa trái và cập nhật low = mid + 1 = ${mid + 1}.`
        });
        low = mid + 1;
      } else {
        list.push({
          low,
          high,
          mid,
          midVal: val,
          status: 'GREATER',
          log: `A[mid=${mid}] = ${val} > ${target} -> Mục tiêu nằm ở nửa bên trái. Loại bỏ nửa phải và cập nhật high = mid - 1 = ${mid - 1}.`
        });
        high = mid - 1;
      }
    }

    if (low > high && (list.length === 0 || list[list.length - 1].status !== 'FOUND')) {
      list.push({
        low,
        high,
        mid: -1,
        midVal: 0,
        status: 'NOT_FOUND',
        log: `Khoảng tìm kiếm rỗng (low > high). Giá trị ${target} không tồn tại trong mảng!`
      });
    }

    return list;
  }, [target]);

  const currentStep = steps[Math.min(stepIdx, steps.length - 1)] || steps[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(200, 1100 - speed * 180);
      timerRef.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            if (!xpAwarded && onEarnXP) {
              setXpAwarded(true);
              onEarnXP(15, 'Mô phỏng Tìm kiếm nhị phân');
            }
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, steps.length, xpAwarded, onEarnXP]);

  const handleReset = () => {
    setIsPlaying(false);
    setStepIdx(0);
  };

  const handleStepForward = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(prev => prev + 1);
    } else {
      if (!xpAwarded && onEarnXP) {
        setXpAwarded(true);
        onEarnXP(15, 'Mô phỏng Tìm kiếm nhị phân');
      }
    }
  };

  const isCompleted = stepIdx >= steps.length - 1;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#18181b] border border-[#2a2a30] rounded-xl text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9d9da6]">Giá trị cần tìm:</span>
            <select
              value={target}
              disabled={isPlaying}
              onChange={e => {
                setTarget(Number(e.target.value));
                handleReset();
              }}
              className="bg-[#202024] border border-[#2a2a30] rounded px-2 py-1 font-mono text-xs font-semibold"
            >
              {array.map(x => (
                <option key={x} value={x}>{x} (có trong mảng)</option>
              ))}
              <option value={42}>42 (không có trong mảng)</option>
              <option value={100}>100 (không có trong mảng)</option>
            </select>
          </div>

          <div className="h-4 w-px bg-[#2a2a30] hidden sm:block"></div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Tạm dừng' : 'Chạy tự động'}</span>
            </button>
            <button
              onClick={handleStepForward}
              disabled={isPlaying || isCompleted}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282e] disabled:opacity-40 text-xs font-medium border border-[#2a2a30] transition"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Bước tiếp</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282e] text-xs font-medium border border-[#2a2a30] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9d9da6]">Tốc độ:</span>
          <input
            type="range"
            min="1"
            max="5"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="w-20 accent-amber-400"
          />
        </div>
      </div>

      {/* Log message */}
      <div className="flex items-start gap-3 p-3.5 bg-[#141416] border border-[#26262b] rounded-xl text-xs font-mono">
        <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div className="text-[#f4f4f6]">
          Bước {stepIdx + 1}/{steps.length}: {currentStep.log}
        </div>
      </div>

      {/* Array Visualization */}
      <div className="p-6 bg-[#141416] border border-[#222226] rounded-xl flex flex-col items-center justify-center min-h-[260px] overflow-x-auto">
        <div className="w-full min-w-[700px] max-w-[850px]">
          {/* Top Pointer Indicator */}
          <div className="grid grid-cols-16 gap-1 mb-2 h-7" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
            {array.map((_, idx) => (
              <div key={`ptr-top-${idx}`} className="flex justify-center items-center">
                {idx === currentStep.mid && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-mono text-[10px] font-bold shadow-md animate-bounce">
                    MID
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Array Elements */}
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
            {array.map((val, idx) => {
              const isMid = idx === currentStep.mid;
              const isLow = idx === currentStep.low;
              const isHigh = idx === currentStep.high;
              const isInRange = idx >= currentStep.low && idx <= currentStep.high;
              const isFound = isMid && currentStep.status === 'FOUND';

              let cellCls = 'bg-[#18181b] border-[#2a2a30] text-[#f4f4f6]';
              if (isFound) {
                cellCls = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 scale-105 z-10';
              } else if (isMid) {
                cellCls = 'bg-amber-500 text-black font-bold ring-2 ring-amber-300';
              } else if (isInRange) {
                cellCls = 'bg-[#202024] border-[#383842] text-[#e4e4e7]';
              } else {
                cellCls = 'opacity-25 bg-[#121214] border-[#1c1c20] text-[#555] line-through';
              }

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-center transition-all duration-200 ${cellCls}`}
                >
                  <div className="text-[9px] text-[#6d6d76] font-mono">{idx}</div>
                  <div className="font-mono text-sm font-bold mt-0.5">{val}</div>
                </div>
              );
            })}
          </div>

          {/* Bottom Indicators (Low & High) */}
          <div className="grid gap-1 mt-2 h-7" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
            {array.map((_, idx) => (
              <div key={`ptr-bot-${idx}`} className="flex justify-center items-center">
                {idx === currentStep.low && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
                    L
                  </span>
                )}
                {idx === currentStep.high && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-mono text-[9px] font-bold ml-0.5">
                    H
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Formula Callout */}
          <div className="mt-5 p-3.5 bg-[#18181b] border border-[#2a2a30] rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span>Công thức tính:</span>
              <span className="text-amber-400 font-bold">mid = ({currentStep.low} + {currentStep.high}) / 2 = {currentStep.mid}</span>
              <span className="text-[#6d6d76]">·</span>
              <span>A[mid] = <strong className="text-white">{currentStep.midVal}</strong></span>
            </div>

            <div className="text-[#9d9da6]">
              Số phần tử còn lại: <strong className="text-orange-400">{Math.max(0, currentStep.high - currentStep.low + 1)}</strong> / 16
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
