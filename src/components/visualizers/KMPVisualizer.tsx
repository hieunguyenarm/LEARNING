import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Info, Check, X } from 'lucide-react';

interface KMPVisualizerProps {
  onEarnXP?: (amount: number, reason: string) => void;
}

interface LPSStep {
  i: number;
  j: number;
  charI: string;
  charJ: string;
  isMatch: boolean;
  piArray: number[];
  explanation: string;
}

interface SearchStep {
  i: number;
  j: number;
  charT: string;
  charP: string;
  status: 'MATCH' | 'MISMATCH' | 'FOUND';
  foundPositions: number[];
  explanation: string;
}

export const KMPVisualizer: React.FC<KMPVisualizerProps> = ({ onEarnXP }) => {
  const [subTab, setSubTab] = useState<'BUILD_PI' | 'SEARCH'>('BUILD_PI');
  const [pattern, setPattern] = useState<string>('ABABCABAB');
  const [text, setText] = useState<string>('ABABDABACDABABCABAB');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000);
  const [hasAwardedXP, setHasAwardedXP] = useState<boolean>(false);

  // 1. Build PI steps
  const lpsSteps: LPSStep[] = React.useMemo(() => {
    const res: LPSStep[] = [];
    const m = pattern.length;
    if (m === 0) return res;

    const pi = new Array(m).fill(0);
    res.push({
      i: 0,
      j: 0,
      charI: pattern[0],
      charJ: pattern[0],
      isMatch: true,
      piArray: [...pi],
      explanation: `Khởi tạo: pi[0] luôn bằng 0 vì tiền tố độ dài 1 không thể có tiền tố thực sự trùng hậu tố.`
    });

    let j = 0;
    for (let i = 1; i < m; i++) {
      while (j > 0 && pattern[i] !== pattern[j]) {
        const oldJ = j;
        j = pi[j - 1];
        res.push({
          i,
          j,
          charI: pattern[i],
          charJ: pattern[oldJ],
          isMatch: false,
          piArray: [...pi],
          explanation: `Không khớp pattern[${i}] ('${pattern[i]}') != pattern[${oldJ}] ('${pattern[oldJ]}'). Lùi con trỏ j về pi[${oldJ - 1}] = ${j}.`
        });
      }

      if (pattern[i] === pattern[j]) {
        j++;
        pi[i] = j;
        res.push({
          i,
          j,
          charI: pattern[i],
          charJ: pattern[j - 1],
          isMatch: true,
          piArray: [...pi],
          explanation: `Khớp ký tự pattern[${i}] == pattern[${j - 1}] ('${pattern[i]}'). Tăng j lên ${j} và gán pi[${i}] = ${j}.`
        });
      } else {
        pi[i] = 0;
        res.push({
          i,
          j: 0,
          charI: pattern[i],
          charJ: pattern[0],
          isMatch: false,
          piArray: [...pi],
          explanation: `Không thể kéo dài tiền tố, gán pi[${i}] = 0.`
        });
      }
    }

    return res;
  }, [pattern]);

  // Precomputed final PI array
  const finalPi = React.useMemo(() => {
    const m = pattern.length;
    const pi = new Array(m).fill(0);
    let j = 0;
    for (let i = 1; i < m; i++) {
      while (j > 0 && pattern[i] !== pattern[j]) j = pi[j - 1];
      if (pattern[i] === pattern[j]) j++;
      pi[i] = j;
    }
    return pi;
  }, [pattern]);

  // 2. Search steps
  const searchSteps: SearchStep[] = React.useMemo(() => {
    const res: SearchStep[] = [];
    const n = text.length;
    const m = pattern.length;
    if (n === 0 || m === 0) return res;

    let j = 0;
    const found: number[] = [];

    for (let i = 0; i < n; i++) {
      while (j > 0 && text[i] !== pattern[j]) {
        const oldJ = j;
        j = finalPi[j - 1];
        res.push({
          i,
          j,
          charT: text[i],
          charP: pattern[oldJ],
          status: 'MISMATCH',
          foundPositions: [...found],
          explanation: `Không khớp tại text[${i}] ('${text[i]}') != pattern[${oldJ}] ('${pattern[oldJ]}'). Nhảy con trỏ mẫu j = pi[${oldJ - 1}] = ${j} mà KHÔNG cần lùi con trỏ i trên văn bản.`
        });
      }

      if (text[i] === pattern[j]) {
        j++;
        if (j === m) {
          const matchPos = i - m + 1;
          found.push(matchPos);
          res.push({
            i,
            j,
            charT: text[i],
            charP: pattern[j - 1],
            status: 'FOUND',
            foundPositions: [...found],
            explanation: `🎉 TÌM THẤY MẪU KHỚP HOÀN TOÀN tại vị trí bắt đầu ${matchPos} (đoạn text[${matchPos}..${i}])! Nhảy j = pi[${m - 1}] = ${finalPi[m - 1]} để tiếp tục tìm.`
          });
          j = finalPi[j - 1];
        } else {
          res.push({
            i,
            j,
            charT: text[i],
            charP: pattern[j - 1],
            status: 'MATCH',
            foundPositions: [...found],
            explanation: `Khớp ký tự text[${i}] == pattern[${j - 1}] ('${text[i]}'). Tiếp tục tịnh tiến cả 2 con trỏ.`
          });
        }
      } else {
        res.push({
          i,
          j: 0,
          charT: text[i],
          charP: pattern[0],
          status: 'MISMATCH',
          foundPositions: [...found],
          explanation: `Ký tự text[${i}] ('${text[i]}') không khớp với pattern[0] ('${pattern[0]}'). Tịnh tiến sang ký tự tiếp theo của văn bản.`
        });
      }
    }

    return res;
  }, [text, pattern, finalPi]);

  const activeSteps = subTab === 'BUILD_PI' ? lpsSteps : searchSteps;

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      stepTimerRef.current = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < activeSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            if (!hasAwardedXP && onEarnXP) {
              onEarnXP(35, 'Hoàn thành mô phỏng thuật toán KMP & mảng pi');
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
  }, [isPlaying, activeSteps.length, speed, hasAwardedXP, onEarnXP]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const handleStepForward = () => {
    if (currentStepIdx < activeSteps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const currentLpsStep = lpsSteps[Math.min(currentStepIdx, lpsSteps.length - 1)];
  const currentSearchStep = searchSteps[Math.min(currentStepIdx, searchSteps.length - 1)];

  return (
    <div className="space-y-6">
      {/* Sub Header & Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#18181b] border border-[#26262b] rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-[#f4f4f6] flex items-center gap-2">
            <span>🔤</span>
            Mô phỏng thuật toán KMP (Knuth-Morris-Pratt O(N + M))
          </h3>
          <p className="text-xs text-[#9d9da6] mt-0.5">
            Tìm kiếm mẫu trong văn bản tuyến tính nhờ mảng tiền tố chung dài nhất $\pi$ (LPS)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSubTab('BUILD_PI'); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              subTab === 'BUILD_PI'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-[#202024] text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            1. Xây dựng mảng $\pi$
          </button>
          <button
            onClick={() => { setSubTab('SEARCH'); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              subTab === 'SEARCH'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-[#202024] text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            2. Khớp mẫu trên văn bản
          </button>
        </div>
      </div>

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
            disabled={currentStepIdx >= activeSteps.length - 1}
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
            Bước: <span className="text-white font-bold">{currentStepIdx + 1}</span> / {activeSteps.length}
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

      {subTab === 'BUILD_PI' ? (
        /* TAB 1: BUILD PI ARRAY */
        <div className="p-6 bg-[#141416] border border-[#26262b] rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-mono text-[#a1a1aa]">
              XÂU MẪU PATTERN: <span className="text-white font-bold tracking-widest">{pattern}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-orange-400 font-bold">i = {currentLpsStep.i}</span>
              <span className="text-blue-400 font-bold">j = {currentLpsStep.j}</span>
            </div>
          </div>

          {/* Visual Pattern Cells & Pi Cells */}
          <div className="space-y-3">
            <div className="grid grid-cols-9 gap-2">
              {pattern.split('').map((char, idx) => {
                const isI = idx === currentLpsStep.i;
                const isJ = idx === currentLpsStep.j;

                let borderCls = 'border-[#26262b] bg-[#1a1a1e] text-[#a1a1aa]';
                if (isI && isJ) {
                  borderCls = 'border-purple-500 bg-purple-500/20 text-purple-200 ring-2 ring-purple-500/50';
                } else if (isI) {
                  borderCls = 'border-orange-500 bg-orange-500/20 text-orange-200 ring-2 ring-orange-500/50';
                } else if (isJ) {
                  borderCls = 'border-blue-500 bg-blue-500/20 text-blue-200 ring-2 ring-blue-500/50';
                }

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 transition-all">
                    <span className="text-[10px] font-mono text-[#71717a]">[{idx}]</span>
                    <div
                      className={`w-full aspect-square flex items-center justify-center rounded-xl font-mono text-base font-bold border transition-all ${borderCls}`}
                    >
                      {char}
                    </div>
                    <div className="text-[10px] font-mono font-bold h-4">
                      {isI && isJ ? (
                        <span className="text-purple-400">i, j</span>
                      ) : isI ? (
                        <span className="text-orange-400">▲ i</span>
                      ) : isJ ? (
                        <span className="text-blue-400">▲ j</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Pi Array Row */}
            <div>
              <div className="text-xs font-mono text-[#a1a1aa] mb-1.5">Mảng $\pi$ (LPS Array) hiện tại:</div>
              <div className="grid grid-cols-9 gap-2">
                {currentLpsStep.piArray.map((val, idx) => {
                  const isCalculated = idx <= currentLpsStep.i;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-center font-mono text-sm font-bold transition-all ${
                        isCalculated
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                          : 'border-[#26262b] bg-[#141416] text-[#52525b]'
                      }`}
                    >
                      {isCalculated ? val : '?'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-[#111113] border border-[#222226] text-xs sm:text-sm text-[#d4d4d8] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-sans">{currentLpsStep.explanation}</div>
          </div>
        </div>
      ) : (
        /* TAB 2: SEARCH TEXT */
        <div className="p-6 bg-[#141416] border border-[#26262b] rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="text-[#a1a1aa]">
              VĂN BẢN TEXT: <span className="text-white font-bold">{text}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-orange-400 font-bold">i = {currentSearchStep.i} (Text)</span>
              <span className="text-blue-400 font-bold">j = {currentSearchStep.j} (Pattern)</span>
            </div>
          </div>

          {/* Visual Text Row */}
          <div>
            <div className="text-xs font-mono text-[#71717a] mb-2">Text (văn bản):</div>
            <div className="flex flex-wrap gap-1.5">
              {text.split('').map((char, idx) => {
                const isCurrentI = idx === currentSearchStep.i;
                const isFoundArea = currentSearchStep.foundPositions.some(
                  start => idx >= start && idx < start + pattern.length
                );

                let cls = 'border-[#26262b] bg-[#1a1a1e] text-[#a1a1aa]';
                if (isCurrentI) {
                  cls = currentSearchStep.status === 'MATCH'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-500/50 scale-105'
                    : currentSearchStep.status === 'FOUND'
                    ? 'border-amber-400 bg-amber-400/30 text-white ring-2 ring-amber-400 scale-105'
                    : 'border-rose-500 bg-rose-500/20 text-rose-200 ring-2 ring-rose-500/50 scale-105';
                } else if (isFoundArea) {
                  cls = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
                }

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[9px] font-mono text-[#52525b]">{idx}</span>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-mono text-sm font-bold border transition-all ${cls}`}>
                      {char}
                    </div>
                    <div className="text-[9px] font-mono font-bold h-3 text-orange-400">
                      {isCurrentI ? '▲' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pattern Offset Aligned Under Text */}
          <div className="pt-2 border-t border-[#26262b]">
            <div className="text-xs font-mono text-[#71717a] mb-2">Pattern (xâu mẫu đang so khớp):</div>
            <div className="flex gap-1.5 font-mono text-xs">
              {/* Spacers to align pattern index with text */}
              {Array.from({ length: Math.max(0, currentSearchStep.i - (currentSearchStep.status === 'FOUND' ? pattern.length - 1 : currentSearchStep.j - 1)) }).map((_, sp) => (
                <div key={sp} className="w-8 h-8 opacity-0 pointer-events-none" />
              ))}

              {pattern.split('').map((char, pIdx) => {
                const isUnderComparison = pIdx === (currentSearchStep.status === 'FOUND' ? pattern.length - 1 : currentSearchStep.j - 1);
                let cls = 'border-[#2a2a30] bg-[#141416] text-[#71717a]';
                if (isUnderComparison) {
                  cls = currentSearchStep.status === 'MATCH' || currentSearchStep.status === 'FOUND'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold ring-2 ring-emerald-500/50'
                    : 'border-rose-500 bg-rose-500/20 text-rose-200 font-bold ring-2 ring-rose-500/50';
                }

                return (
                  <div key={pIdx} className="flex flex-col items-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-mono text-sm font-bold border ${cls}`}>
                      {char}
                    </div>
                    <span className="text-[9px] text-[#52525b]">p[{pIdx}]</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Matches Found Banner */}
          {currentSearchStep.foundPositions.length > 0 && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center gap-2 text-xs font-mono text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                Đã tìm thấy mẫu tại các chỉ số bắt đầu: {currentSearchStep.foundPositions.map(p => `[${p}]`).join(', ')}
              </span>
            </div>
          )}

          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-[#111113] border border-[#222226] text-xs sm:text-sm text-[#d4d4d8] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-sans">{currentSearchStep.explanation}</div>
          </div>
        </div>
      )}
    </div>
  );
};
