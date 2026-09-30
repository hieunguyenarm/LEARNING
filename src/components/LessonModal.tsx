import React, { useState } from 'react';
import { X, Check, Copy, BookOpen, Clock, AlertTriangle, Target, Code2, Zap, ExternalLink } from 'lucide-react';
import { Lesson, RoadmapModule } from '../types';

interface LessonModalProps {
  module: RoadmapModule | null;
  lesson: Lesson | null;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: (lesson: Lesson) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  module,
  lesson,
  isCompleted,
  onClose,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState<'THEORY' | 'STEPS' | 'CODE' | 'PRACTICE'>('THEORY');
  const [copied, setCopied] = useState<boolean>(false);

  if (!lesson || !module) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lesson.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const theory = lesson.theoryDeep;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18181b] border border-[#2a2a30] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#26262b] flex items-start justify-between gap-4 bg-[#141416]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400">
              <span>{module.icon}</span>
              <span>{module.title}</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#f4f4f6] mt-1">
              {lesson.title}
            </h3>
            <p className="text-xs text-[#9d9da6] mt-0.5">{lesson.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6d6d76] hover:text-[#f4f4f6] p-1.5 rounded-lg hover:bg-white/[0.05] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#26262b] px-5 sm:px-6 gap-2 bg-[#161619] overflow-x-auto">
          <button
            onClick={() => setActiveTab('THEORY')}
            className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'THEORY'
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lý thuyết & Trực giác</span>
          </button>
          <button
            onClick={() => setActiveTab('STEPS')}
            className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'STEPS'
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Từng bước & Bẫy HSGQG</span>
          </button>
          <button
            onClick={() => setActiveTab('CODE')}
            className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'CODE'
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code C++20 chuẩn</span>
          </button>
          <button
            onClick={() => setActiveTab('PRACTICE')}
            className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'PRACTICE'
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-[#9d9da6] hover:text-[#f4f4f6]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Bài tập ({theory?.practiceProblems?.length || 0})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-sm">
          {/* TAB 1: THEORY */}
          {activeTab === 'THEORY' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#141416] border border-[#26262b] rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-orange-400 font-mono flex items-center gap-1.5">
                  <span>💡</span> BẢN CHẤT & TRỰC GIÁC (INTUITION)
                </h4>
                <p className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed">
                  {theory?.intuition || lesson.theory}
                </p>
              </div>

              <div className="p-4 bg-[#141416] border border-[#26262b] rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                  <span>📐</span> CƠ SỞ TOÁN HỌC & BẤT BIẾN (INVARIANT)
                </h4>
                <div className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed whitespace-pre-line font-mono bg-[#111113] p-3 rounded-lg border border-[#202024]">
                  {theory?.mathInvariant || 'Tính chất bảo toàn cấu trúc con tối ưu và bất biến vòng lặp.'}
                </div>
              </div>

              {/* Complexity Summary */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#202024] border border-[#2a2a30] rounded-xl">
                  <div className="text-[11px] text-[#9d9da6]">Độ phức tạp thời gian</div>
                  <div className="font-mono text-sm font-semibold text-emerald-400 mt-0.5">
                    {theory?.complexity?.time || 'O(N log N)'}
                  </div>
                </div>
                <div className="p-3 bg-[#202024] border border-[#2a2a30] rounded-xl">
                  <div className="text-[11px] text-[#9d9da6]">Không gian bộ nhớ (Space)</div>
                  <div className="font-mono text-sm font-semibold text-blue-400 mt-0.5">
                    {theory?.complexity?.space || 'O(N)'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEPS & PITFALLS */}
          {activeTab === 'STEPS' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#f4f4f6] font-mono mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  CÁC BƯỚC THỰC HIỆN THUẬT TOÁN (DRY RUN)
                </h4>
                <div className="space-y-2">
                  {(theory?.steps || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141416] border border-[#26262b] text-xs sm:text-sm text-[#d4d4d8]"
                    >
                      <span className="w-5 h-5 rounded-full bg-orange-600/20 text-orange-400 font-mono text-xs flex items-center justify-center shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-rose-400 font-mono mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  CÁC BẪY THƯỜNG GẶP TRONG PHÒNG THI HSGQG
                </h4>
                <div className="space-y-2">
                  {(theory?.pitfalls || []).map((pitfall, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs sm:text-sm text-rose-200/90 leading-relaxed"
                    >
                      ⚠️ {pitfall}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CODE */}
          {activeTab === 'CODE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9d9da6] font-mono">Template chuẩn thi đấu C++20</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[#202024] hover:bg-[#28282e] text-[#f4f4f6] border border-[#2a2a30] transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#2a2a30] bg-[#111113]">
                <pre className="p-4 text-xs font-mono text-[#e4e4e7] overflow-x-auto leading-relaxed select-all">
                  {lesson.code}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: PRACTICE */}
          {activeTab === 'PRACTICE' && (
            <div className="space-y-3">
              <p className="text-xs text-[#9d9da6]">
                Các bài tập kinh điển thuộc chuyên đề này trên các hệ thống chấm uy tín (VNOI, CSES, Codeforces):
              </p>
              <div className="space-y-2.5">
                {(theory?.practiceProblems || []).map((prob, idx) => {
                  const targetUrl = prob.url || (
                    prob.oj.toLowerCase().includes('cses')
                      ? 'https://cses.fi/problemset/'
                      : prob.oj.toLowerCase().includes('codeforces')
                      ? 'https://codeforces.com/problemset'
                      : prob.oj.toLowerCase().includes('vnoi')
                      ? 'https://oj.vnoi.info/problems/'
                      : prob.oj.toLowerCase().includes('leetcode')
                      ? 'https://leetcode.com/problemset/'
                      : 'https://atcoder.jp/contests/'
                  );

                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#141416] border border-[#26262b] hover:border-[#383842] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#f4f4f6]">{prob.name}</span>
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border whitespace-nowrap ${
                            prob.diff === 'Dễ' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' :
                            prob.diff === 'Trung bình' ? 'bg-blue-950/40 text-blue-400 border-blue-800/40' :
                            prob.diff === 'Khó' ? 'bg-orange-950/40 text-orange-400 border-orange-800/40' :
                            'bg-purple-950/40 text-purple-400 border-purple-800/40'
                          }`}>
                            {prob.diff}
                          </span>
                        </div>
                        <div className="text-xs text-[#9d9da6] mt-1">
                          <span className="text-amber-400 font-mono font-medium">{prob.oj}</span> · Gợi ý: {prob.linkHint}
                        </div>
                      </div>

                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-orange-600/20 text-[#d4d4d8] hover:text-orange-300 border border-[#2a2a30] hover:border-orange-500/40 text-xs font-medium transition"
                      >
                        <span>Mở bài tập</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-[#26262b] flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>+{lesson.xp} XP</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#9d9da6] hover:text-[#f4f4f6] hover:bg-white/[0.04] transition"
            >
              Đóng
            </button>
            <button
              onClick={() => onComplete(lesson)}
              disabled={isCompleted}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold transition ${
                isCompleted
                  ? 'bg-emerald-800/50 text-emerald-200 border border-emerald-700/40 cursor-default'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20'
              }`}
            >
              {isCompleted ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã hoàn thành</span>
                </>
              ) : (
                <span>Đánh dấu hoàn thành</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
