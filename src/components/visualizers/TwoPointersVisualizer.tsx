import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Info } from 'lucide-react';

interface TwoPointersVisualizerProps {
  onEarnXP?: (amount: number, reason: string) => void;
}

interface PointerStep {
  l: number;
  r: number;
  sum: number;
  status: 'LESS' | 'GREATER' | 'EQUAL' | 'NOT_FOUND';
  log: string;
}

export const TwoPointersVisualizer: React.FC<TwoPointersVisualizerProps> = ({ onEarnXP }) => {
  const array = [1, 3, 5, 8, 11, 14, 19, 24, 30];
  const [targetSum, setTargetSum] = useState<number>(22);
  const [speed, setSpeed] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [xpAwarded, setXpAwarded] = useState<boolean>(false);

  // Precompute steps
  const steps = React.useMemo<PointerStep[]>(() => {
    const list: PointerStep[] = [];
    let l = 0;
    let r = array.length - 1;

    while (l < r) {
      const s = array[l] + array[r];
      if (s === targetSum) {
        list.push({
          l,
          r,
          sum: s,
          status: 'EQUAL',
          log: `A[${l}] (${array[l]}) + A[${r}] (${array[r]}) = ${s} == ${targetSum} -> TÌM THẤY CẶP SỐ!`
        });
        break;
      } else if (s < targetSum) {
        list.push({
          l,
          r,
          sum: s,
          status: 'LESS',
          log: `A[${l}] (${array[l]}) + A[${r}] (${array[r]}) = ${s} < ${targetSum} -> Tổng nhỏ hơn đích, tăng con trỏ trái L (L++) để tăng tổng.`
        });
        l++;
      } else {
        list.push({
          l,
          r,
          sum: s,
          status: 'GREATER',
          log: `A[${l}] (${array[l]}) + A[${r}] (${array[r]}) = ${s} > ${targetSum} -> Tổng lớn hơn đích, giảm con trỏ phải R (R--) để giảm tổng.`
        });
        r--;
      }
    }

    if (l >= r && (list.length === 0 || list[list.length - 1].status !== 'EQUAL')) {
      list.push({
        l,
        r,
        sum: 0,
        status: 'NOT_FOUND',
        log: `Hai con trỏ đã gặp nhau (L >= R). Không tồn tại cặp số nào có tổng bằng ${targetSum}.`
      });
    }

    return list;
  }, [targetSum]);

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
              onEarnXP(15, 'Mô phỏng Hai con trỏ (Two Pointers)');
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
        onEarnXP(15, 'Mô phỏng Hai con trỏ (Two Pointers)');
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
            <span className="text-xs text-[#9d9da6]">Tổng mục tiêu X:</span>
            <input
              type="number"
              value={targetSum}
              disabled={isPlaying}
              onChange={e => {
                setTargetSum(Number(e.target.value));
                handleReset();
              }}
              className="w-20 bg-[#202024] border border-[#2a2a30] rounded px-2 py-1 font-mono text-xs font-semibold"
            />
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

      {/* Array with pointers visualization */}
      <div className="p-6 bg-[#141416] border border-[#222226] rounded-xl flex flex-col items-center justify-center min-h-[260px]">
        <div className="w-full max-w-[680px]">
          {/* Top Pointer Indicator: Left Pointer */}
          <div className="grid grid-cols-9 gap-2 mb-2 h-7">
            {array.map((_, idx) => (
              <div key={`ptr-l-${idx}`} className="flex justify-center items-center">
                {idx === currentStep.l && (
                  <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-mono text-[11px] font-bold shadow-md animate-bounce">
                    L ({idx})
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Array Elements */}
          <div className="grid grid-cols-9 gap-2">
            {array.map((val, idx) => {
              const isL = idx === currentStep.l;
              const isR = idx === currentStep.r;
              const isPair = (isL || isR) && currentStep.status === 'EQUAL';
              const isInWindow = idx >= currentStep.l && idx <= currentStep.r;

              let cellCls = 'bg-[#18181b] border-[#2a2a30] text-[#f4f4f6]';
              if (isPair) {
                cellCls = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 scale-105';
              } else if (isL) {
                cellCls = 'bg-blue-600/40 border-blue-400 text-blue-200 font-bold';
              } else if (isR) {
                cellCls = 'bg-purple-600/40 border-purple-400 text-purple-200 font-bold';
              } else if (isInWindow) {
                cellCls = 'bg-[#202024] border-[#383842] text-[#9d9da6]';
              } else {
                cellCls = 'opacity-30 bg-[#121214] border-[#1e1e24] text-[#6d6d76]';
              }

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center transition-all duration-300 ${cellCls}`}
                >
                  <div className="text-[10px] text-[#71717a] font-mono">[{idx}]</div>
                  <div className="font-mono text-base font-bold mt-1">{val}</div>
                </div>
              );
            })}
          </div>

          {/* Bottom Pointer Indicator: Right Pointer */}
          <div className="grid grid-cols-9 gap-2 mt-2 h-7">
            {array.map((_, idx) => (
              <div key={`ptr-r-${idx}`} className="flex justify-center items-center">
                {idx === currentStep.r && (
                  <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-mono text-[11px] font-bold shadow-md animate-bounce">
                    R ({idx})
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Calculation Equation */}
          <div className="mt-6 p-4 bg-[#18181b] border border-[#2a2a30] rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#9d9da6]">Phép tính hiện tại:</span>
              <span className="text-blue-400 font-bold">A[{currentStep.l}] ({array[currentStep.l]})</span>
              <span>+</span>
              <span className="text-purple-400 font-bold">A[{currentStep.r}] ({array[currentStep.r]})</span>
              <span>=</span>
              <span className={`font-bold text-sm ${
                currentStep.status === 'EQUAL' ? 'text-emerald-400 font-extrabold' : 'text-amber-400'
              }`}>
                {currentStep.sum}
              </span>
            </div>

            <div>
              Mục tiêu: <strong className="text-[#f4f4f6]">{targetSum}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
