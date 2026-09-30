import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Info } from 'lucide-react';

interface SieveVisualizerProps {
  onEarnXP?: (amount: number, reason: string) => void;
}

interface SieveStep {
  prime: number;
  marked: number[];
  currentMultiple?: number;
  description: string;
}

export const SieveVisualizer: React.FC<SieveVisualizerProps> = ({ onEarnXP }) => {
  const [n, setN] = useState<number>(100);
  const [speed, setSpeed] = useState<number>(3); // 1 to 5
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [xpAwarded, setXpAwarded] = useState<boolean>(false);

  // Precompute full steps
  const steps = useMemo<SieveStep[]>(() => {
    const res: SieveStep[] = [];
    const comp = new Array(n + 1).fill(false);
    for (let p = 2; p * p <= n; p++) {
      if (!comp[p]) {
        const markedList: number[] = [];
        for (let j = p * p; j <= n; j += p) {
          if (!comp[j]) {
            comp[j] = true;
            markedList.push(j);
          }
        }
        res.push({
          prime: p,
          marked: markedList,
          description: `Chọn số nguyên tố p = ${p}. Loại bỏ các bội số từ p² = ${p * p} đến ${n} (tổng cộng ${markedList.length} hợp số mới).`
        });
      }
    }
    return res;
  }, [n]);

  // Derived state up to currentStepIdx
  const { primesFound, compositeSet, currentPrime, currentMarked } = useMemo(() => {
    const comp = new Set<number>();
    const primes = new Set<number>();
    let cPrime: number | null = null;
    let cMarked: number[] = [];

    // All primes up to n if finished
    const allPrimes = new Set<number>();
    const isComp = new Array(n + 1).fill(false);
    for (let i = 2; i <= n; i++) {
      if (!isComp[i]) {
        allPrimes.add(i);
        for (let j = i * i; j <= n; j += i) isComp[j] = true;
      }
    }

    for (let i = 0; i < currentStepIdx; i++) {
      const step = steps[i];
      step.marked.forEach(m => comp.add(m));
      primes.add(step.prime);
      if (i === currentStepIdx - 1) {
        cPrime = step.prime;
        cMarked = step.marked;
      }
    }

    const isDone = currentStepIdx >= steps.length && steps.length > 0;
    if (isDone) {
      allPrimes.forEach(p => primes.add(p));
    }

    return {
      primesFound: isDone ? allPrimes : primes,
      compositeSet: comp,
      currentPrime: cPrime,
      currentMarked: cMarked
    };
  }, [steps, currentStepIdx, n]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(100, 1000 - speed * 170);
      timerRef.current = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < steps.length) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            if (!xpAwarded && onEarnXP) {
              setXpAwarded(true);
              onEarnXP(20, 'Hoàn thành mô phỏng Sàng Eratosthenes');
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
    setCurrentStepIdx(0);
    setActiveCell(null);
  };

  const handleStepForward = () => {
    if (currentStepIdx < steps.length) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      if (!xpAwarded && onEarnXP) {
        setXpAwarded(true);
        onEarnXP(20, 'Hoàn thành mô phỏng Sàng Eratosthenes');
      }
    }
  };

  const isCompleted = currentStepIdx >= steps.length && steps.length > 0;

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#18181b] border border-[#2a2a30] rounded-xl text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9d9da6]">Giới hạn N:</span>
            <input
              type="range"
              min="30"
              max="160"
              value={n}
              disabled={isPlaying}
              onChange={e => {
                setN(Number(e.target.value));
                handleReset();
              }}
              className="w-28 sm:w-36 accent-orange-500"
            />
            <span className="font-mono text-xs font-semibold text-[#f4f4f6] w-8">{n}</span>
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

      {/* Status banner */}
      <div className="flex items-start gap-3 p-3.5 bg-[#141416] border border-[#26262b] rounded-xl text-xs font-mono">
        <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          {currentStepIdx === 0 ? (
            <span className="text-[#9d9da6]">
              Khởi tạo mảng bool từ 2 đến {n}. Nhấn <strong className="text-[#f4f4f6]">Chạy tự động</strong> hoặc <strong className="text-[#f4f4f6]">Bước tiếp</strong> để bắt đầu sàng.
            </span>
          ) : isCompleted ? (
            <span className="text-emerald-400 font-medium">
              Hoàn thành sàng! Tìm thấy {primesFound.size} số nguyên tố trong khoảng [2, {n}]. Mọi số màu xanh lá là số nguyên tố.
            </span>
          ) : (
            <span className="text-[#f4f4f6]">
              Bước {currentStepIdx}/{steps.length}: {steps[currentStepIdx - 1]?.description}
            </span>
          )}
        </div>
        <div className="text-right text-[#9d9da6] shrink-0 font-mono">
          <span className="text-emerald-400 font-semibold">{primesFound.size}</span> nguyên tố / <span className="text-rose-400 font-semibold">{compositeSet.size}</span> hợp số
        </div>
      </div>

      {/* Grid of numbers */}
      <div
        className="grid gap-1.5 p-4 bg-[#141416] border border-[#222226] rounded-xl max-h-[420px] overflow-y-auto"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))' }}
      >
        {Array.from({ length: n - 1 }, (_, idx) => {
          const num = idx + 2;
          const isPrime = primesFound.has(num);
          const isComposite = compositeSet.has(num);
          const isCurrentPrime = num === currentPrime;
          const isJustMarked = currentMarked.includes(num);

          let cellClass = 'bg-[#202024] text-[#9d9da6] hover:border-[#3f3f46]';
          if (isCurrentPrime) {
            cellClass = 'bg-amber-500 text-black font-bold ring-2 ring-amber-300 scale-105 z-10';
          } else if (isJustMarked) {
            cellClass = 'bg-orange-600 text-white font-medium animate-pulse';
          } else if (isPrime) {
            cellClass = 'bg-emerald-600/90 text-white font-semibold';
          } else if (isComposite) {
            cellClass = 'bg-[#1a1a1e] text-[#4b4b54] line-through';
          }

          return (
            <button
              key={num}
              onClick={() => setActiveCell(activeCell === num ? null : num)}
              className={`h-9 rounded-lg text-xs font-mono flex items-center justify-center border border-transparent transition-all duration-200 ${cellClass}`}
              title={`Số ${num}: ${isPrime ? 'Số nguyên tố' : isComposite ? 'Hợp số' : 'Chưa sàng'}`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Legend & Details */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9d9da6] px-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span>Số nguyên tố đang xét (p)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-600"></span>
            <span>Bội số vừa bị loại (p²)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600"></span>
            <span>Số nguyên tố đã chốt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#1a1a1e] border border-[#2a2a30]"></span>
            <span>Hợp số đã loại</span>
          </div>
        </div>

        <div className="text-[#6d6d76] font-mono">
          Độ phức tạp: <span className="text-[#f4f4f6]">O(N log log N)</span>
        </div>
      </div>
    </div>
  );
};
