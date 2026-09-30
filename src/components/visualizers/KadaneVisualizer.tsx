import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Info, Sparkles } from 'lucide-react';

interface KadaneVisualizerProps {
  onEarnXP?: (amount: number, reason: string) => void;
}

interface KadaneStep {
  idx: number;
  val: number;
  prevSum: number;
  currSum: number;
  action: 'START_FRESH' | 'EXTEND';
  maxSoFar: number;
  bestL: number;
  bestR: number;
  curL: number;
  curR: number;
  explanation: string;
}

const DEFAULT_ARRAY = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

export const KadaneVisualizer: React.FC<KadaneVisualizerProps> = ({ onEarnXP }) => {
  const [mode, setMode] = useState<'KADANE' | 'PREFIX_SUM'>('KADANE');
  const [arr, setArr] = useState<number[]>(DEFAULT_ARRAY);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000);
  const [hasAwardedXP, setHasAwardedXP] = useState<boolean>(false);

  // Prefix sum mode state
  const [prefL, setPrefL] = useState<number>(3);
  const [prefR, setPrefR] = useState<number>(6);

  // Precompute Kadane steps
  const steps: KadaneStep[] = React.useMemo(() => {
    const res: KadaneStep[] = [];
    if (arr.length === 0) return res;

    let curSum = arr[0];
    let maxSoFar = arr[0];
    let curL = 0;
    let bestL = 0;
    let bestR = 0;

    res.push({
      idx: 0,
      val: arr[0],
      prevSum: 0,
      currSum: curSum,
      action: 'START_FRESH',
      maxSoFar,
      bestL,
      bestR,
      curL: 0,
      curR: 0,
      explanation: `Bắt đầu tại chỉ số 0: phần tử đầu tiên = ${arr[0]}. Khởi tạo current_sum = ${arr[0]}, max_so_far = ${arr[0]}.`
    });

    for (let i = 1; i < arr.length; i++) {
      const prev = curSum;
      const startFresh = arr[i];
      const extend = prev + arr[i];

      if (startFresh > extend) {
        curSum = startFresh;
        curL = i;
      } else {
        curSum = extend;
      }

      let isNewMax = false;
      if (curSum > maxSoFar) {
        maxSoFar = curSum;
        bestL = curL;
        bestR = i;
        isNewMax = true;
      }

      res.push({
        idx: i,
        val: arr[i],
        prevSum: prev,
        currSum: curSum,
        action: startFresh > extend ? 'START_FRESH' : 'EXTEND',
        maxSoFar,
        bestL,
        bestR,
        curL,
        curR: i,
        explanation: startFresh > extend
          ? `Tại chỉ số ${i} (giá trị ${arr[i]}): Vì a[${i}] = ${arr[i]} lớn hơn tổng nối tiếp (${prev} + ${arr[i]} = ${extend}), ta BẮT ĐẦU ĐOẠN MỚI tại vị trí ${i}. ${isNewMax ? `🔥 Phá kỷ lục max_so_far mới = ${maxSoFar}!` : ''}`
          : `Tại chỉ số ${i} (giá trị ${arr[i]}): Nối tiếp đoạn trước đó (${prev} + ${arr[i]} = ${curSum}). ${isNewMax ? `🔥 Phá kỷ lục max_so_far mới = ${maxSoFar} (đoạn [${bestL}..${bestR}])!` : `current_sum = ${curSum}.`}`
      });
    }

    return res;
  }, [arr]);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      stepTimerRef.current = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            if (!hasAwardedXP && onEarnXP) {
              onEarnXP(30, 'Hoàn thành mô phỏng thuật toán Kadane');
              setHasAwardedXP(true);
            }
            return prev;
          }
        });
      }, speed);
    }
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isPlaying, steps.length, speed, hasAwardedXP, onEarnXP]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const handleStepForward = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const currentStep = steps[currentStepIdx] || steps[0];

  // Prefix sum calculation
  const prefixSum = React.useMemo(() => {
    const pref = [0];
    for (let i = 0; i < arr.length; i++) {
      pref.push(pref[i] + arr[i]);
    }
    return pref;
  }, [arr]);

  const rangeSum = prefixSum[prefR + 1] - prefixSum[prefL];

  return (
    <div className="space-y-6">
      {/* Sub Header & Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#18181b] border border-[#26262b] rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-[#f4f4f6] flex items-center gap-2">
            <span>⚡</span>
            {mode === 'KADANE' ? 'Mô phỏng thuật toán Kadane (Maximum Subarray Sum)' : 'Mô phỏng Mảng cộng dồn (Prefix Sum Range Query)'}
          </h3>
          <p className="text-xs text-[#9d9da6] mt-0.5">
            {mode === 'KADANE'
              ? 'Tìm đoạn con liên tiếp có tổng lớn nhất trong O(N) với DP bất biến'
              : 'Tiền tính O(N) để trả lời tổng đoạn [L, R] trong O(1)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode('KADANE'); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'KADANE'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-[#202024] text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            Kadane 1D
          </button>
          <button
            onClick={() => setMode('PREFIX_SUM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'PREFIX_SUM'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-[#202024] text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            Prefix Sum
          </button>
        </div>
      </div>

      {mode === 'KADANE' ? (
        <>
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#141416] border border-[#26262b] rounded-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-medium transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Tạm dừng' : 'Chạy tự động'}</span>
              </button>
              <button
                onClick={handleStepForward}
                disabled={currentStepIdx >= steps.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202024] hover:bg-[#2a2a30] text-[#d4d4d8] disabled:opacity-40 rounded-lg text-xs font-medium transition border border-[#2a2a30]"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Bước tiếp</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#202024] hover:bg-[#2a2a30] text-[#9d9da6] hover:text-white rounded-lg text-xs transition border border-[#2a2a30]"
                title="Khởi động lại"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-[#9d9da6]">
                Bước: <span className="text-white font-bold">{currentStepIdx + 1}</span> / {steps.length}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#9d9da6]">Tốc độ:</span>
                <select
                  value={speed}
                  onChange={e => setSpeed(Number(e.target.value))}
                  className="bg-[#202024] border border-[#2a2a30] rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value={1500}>0.7x (Chậm)</option>
                  <option value={1000}>1.0x (Chuẩn)</option>
                  <option value={500}>2.0x (Nhanh)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Visual Array Display */}
          <div className="p-6 bg-[#141416] border border-[#26262b] rounded-2xl space-y-6">
            <div>
              <div className="text-xs font-mono text-[#9d9da6] mb-3 flex items-center justify-between">
                <span>MẢNG DỮ LIỆU BAN ĐẦU a[]:</span>
                <span className="text-orange-400">
                  Phần tử đang duyệt: <strong className="text-white font-mono">a[{currentStep.idx}] = {currentStep.val}</strong>
                </span>
              </div>

              {/* Elements grid */}
              <div className="grid grid-cols-9 gap-2 sm:gap-3">
                {arr.map((val, idx) => {
                  const isCurrent = idx === currentStep.idx;
                  const isInCurSegment = idx >= currentStep.curL && idx <= currentStep.curR;
                  const isInBestSegment = idx >= currentStep.bestL && idx <= currentStep.bestR;

                  let borderCls = 'border-[#26262b] bg-[#1a1a1e] text-[#a1a1aa]';
                  if (isCurrent) {
                    borderCls = 'border-orange-500 bg-orange-500/20 text-orange-200 ring-2 ring-orange-500/50 scale-105';
                  } else if (isInCurSegment) {
                    borderCls = 'border-amber-500/70 bg-amber-500/10 text-amber-200';
                  } else if (isInBestSegment) {
                    borderCls = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300';
                  }

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 transition-all duration-300">
                      <span className="text-[11px] font-mono text-[#71717a]">i = {idx}</span>
                      <div
                        className={`w-full aspect-square flex items-center justify-center rounded-xl font-mono text-sm sm:text-base font-bold border transition-all ${borderCls}`}
                      >
                        {val}
                      </div>
                      <div className="text-[10px] font-mono h-4">
                        {isCurrent && <span className="text-orange-400 font-bold">▲ i</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kadane State Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#1a1a1e] border border-[#2a2a30]">
                <div className="text-[11px] font-mono text-[#9d9da6]">current_sum (Đoạn đang xét)</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1 flex items-baseline gap-2">
                  <span>{currentStep.currSum}</span>
                  <span className="text-xs text-[#71717a] font-normal">
                    đoạn [{currentStep.curL}..{currentStep.curR}]
                  </span>
                </div>
                <div className="text-[11px] text-[#9d9da6] mt-1">
                  Hành động: <span className="text-white font-medium">{currentStep.action === 'START_FRESH' ? '🌱 Khởi đầu đoạn mới' : '🔗 Nối tiếp đoạn trước'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1a1a1e] border border-emerald-900/40 bg-emerald-950/10">
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  max_so_far (Kỷ lục tối ưu)
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-baseline gap-2">
                  <span>{currentStep.maxSoFar}</span>
                  <span className="text-xs text-emerald-500/70 font-normal">
                    đoạn [{currentStep.bestL}..{currentStep.bestR}]
                  </span>
                </div>
                <div className="text-[11px] text-[#9d9da6] mt-1">
                  Đoạn có tổng lớn nhất tìm được
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1a1a1e] border border-[#2a2a30]">
                <div className="text-[11px] font-mono text-[#9d9da6]">Công thức quy hoạch động</div>
                <div className="text-xs font-mono text-[#d4d4d8] mt-1">
                  dp[i] = max(a[i], dp[i-1] + a[i])
                </div>
                <div className="text-[11px] text-[#71717a] mt-1">
                  Độ phức tạp: <strong className="text-white">O(N)</strong> thời gian, <strong className="text-white">O(1)</strong> bộ nhớ
                </div>
              </div>
            </div>

            {/* Explanation Log */}
            <div className="p-4 rounded-xl bg-[#111113] border border-[#222226] text-xs sm:text-sm text-[#d4d4d8] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-sans">{currentStep.explanation}</div>
            </div>
          </div>
        </>
      ) : (
        /* PREFIX SUM MODE */
        <div className="p-6 bg-[#141416] border border-[#26262b] rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#1a1a1e] border border-[#2a2a30]">
            <div className="space-y-1">
              <div className="text-xs font-bold font-mono text-orange-400">TRUY VẤN TỔNG ĐOẠN [L, R] TRONG O(1):</div>
              <div className="text-xs text-[#a1a1aa]">
                Chọn biên trái L và biên phải R để xem trực quan công thức <span className="font-mono text-white">sum(L..R) = pref[R + 1] - pref[L]</span>.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[#a1a1aa]">L:</span>
                <select
                  value={prefL}
                  onChange={e => {
                    const newL = Number(e.target.value);
                    setPrefL(newL);
                    if (newL > prefR) setPrefR(newL);
                  }}
                  className="bg-[#202024] border border-[#2a2a30] text-white px-2 py-1 rounded-lg"
                >
                  {arr.map((_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[#a1a1aa]">R:</span>
                <select
                  value={prefR}
                  onChange={e => {
                    const newR = Number(e.target.value);
                    setPrefR(newR);
                    if (newR < prefL) setPrefL(newR);
                  }}
                  className="bg-[#202024] border border-[#2a2a30] text-white px-2 py-1 rounded-lg"
                >
                  {arr.map((_, i) => (
                    <option key={i} value={i} disabled={i < prefL}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Array + Pref Array visualization */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-[#a1a1aa] mb-2">Mảng ban đầu a[]:</div>
              <div className="grid grid-cols-9 gap-2">
                {arr.map((val, idx) => {
                  const inRange = idx >= prefL && idx <= prefR;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (idx < prefL) setPrefL(idx);
                        else setPrefR(idx);
                      }}
                      className={`cursor-pointer p-2.5 rounded-xl border text-center font-mono transition-all ${
                        inRange
                          ? 'border-orange-500 bg-orange-500/20 text-orange-200 font-bold scale-102'
                          : 'border-[#26262b] bg-[#1a1a1e] text-[#71717a] hover:border-[#383840]'
                      }`}
                    >
                      <div className="text-[10px] text-[#71717a]">[{idx}]</div>
                      <div className="text-sm font-bold mt-0.5">{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-[#a1a1aa] mb-2">Mảng tiền tố pref[] (kích thước N + 1):</div>
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                {prefixSum.map((val, idx) => {
                  const isPrefR = idx === prefR + 1;
                  const isPrefL = idx === prefL;
                  let cls = 'border-[#26262b] bg-[#141416] text-[#71717a]';
                  if (isPrefR) cls = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
                  else if (isPrefL) cls = 'border-rose-500 bg-rose-500/20 text-rose-200 font-bold';

                  return (
                    <div key={idx} className={`p-2 rounded-lg border text-center font-mono text-xs ${cls}`}>
                      <div className="text-[9px] opacity-75">p[{idx}]</div>
                      <div className="font-bold">{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mathematical Result Box */}
          <div className="p-4 rounded-xl bg-[#111113] border border-[#222226] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs text-[#a1a1aa] font-mono">Công thức tính O(1):</div>
              <div className="text-base sm:text-lg font-mono font-bold text-white">
                sum[{prefL}..{prefR}] = pref[{prefR + 1}] - pref[{prefL}] = <span className="text-emerald-400">{prefixSum[prefR + 1]}</span> - <span className="text-rose-400">{prefixSum[prefL]}</span> = <span className="text-orange-400 font-bold text-xl">{rangeSum}</span>
              </div>
            </div>

            <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-xl font-mono text-xs text-orange-300 text-center">
              Các phần tử: {arr.slice(prefL, prefR + 1).join(' + ')} = {rangeSum}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
