import React, { useState, useEffect, useRef } from 'react';
import { Play, Send, RotateCcw, Copy, Info, FileText, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Problem, UserSubmission } from '../../types';
import { PROBLEMS } from '../../data/problemsData';
import { judgeProblem as judgeProblemFallback, executeCpp as executeCppFallback, TestCaseResult } from '../../utils/cppEngine';

interface PlaygroundViewProps {
  onEarnXP: (amount: number, reason: string) => void;
  onRecordSubmission: (sub: UserSubmission) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  onEarnXP,
  onRecordSubmission
}) => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>('p1');
  const [showStatement, setShowStatement] = useState<boolean>(true);
  const [code, setCode] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [outputConsole, setOutputConsole] = useState<string>('Chưa có kết quả. Nhấn "Run" để chạy thử hoặc "Submit" để nộp bài.');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isJudging, setIsJudging] = useState<boolean>(false);

  // Judge Result State
  const [judgeVerdict, setJudgeVerdict] = useState<'AC' | 'WA' | 'TLE' | 'CE' | 'RTE' | null>(null);
  const [judgeDetails, setJudgeDetails] = useState<{
    passed: number;
    total: number;
    runtime: string;
    memory: string;
    details: TestCaseResult[];
    error?: string;
  } | null>(null);
  const [selectedTestDetail, setSelectedTestDetail] = useState<TestCaseResult | null>(null);

  const [copied, setCopied] = useState<boolean>(false);

  const activeProblem = PROBLEMS.find(p => p.id === selectedProblemId) || PROBLEMS[0];
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Reset when problem changes
  useEffect(() => {
    setCode(activeProblem.starter);
    setCustomInput(activeProblem.samples[0]?.input.replace(/\\n/g, '\n') || '');
    setOutputConsole('Chưa có kết quả. Nhấn "Run" để chạy thử hoặc "Submit" để nộp bài.');
    setJudgeVerdict(null);
    setJudgeDetails(null);
    setSelectedTestDetail(null);
  }, [selectedProblemId, activeProblem]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    setCode(activeProblem.starter);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbersString = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  // Run with custom input
  const handleRun = async () => {
    setIsRunning(true);
    setJudgeVerdict(null);
    setJudgeDetails(null);
    setSelectedTestDetail(null);
    setOutputConsole('Đang biên dịch với g++ (C++20) và thực thi...');

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input: customInput })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.verdict === 'CE') {
          setOutputConsole(`[Lỗi biên dịch - Compile Error]:\n${data.stderr || 'Syntax Error'}`);
        } else if (data.verdict === 'TLE') {
          setOutputConsole(`[Time Limit Exceeded]: Quá thời gian quy định (> 2.0s).\n${data.stdout ? 'Đầu ra trước khi ngắt:\n' + data.stdout : ''}`);
        } else if (data.verdict === 'RTE') {
          setOutputConsole(`[Runtime Error]: Chương trình bị lỗi dừng đột ngột (Segmentation Fault hoặc Exception).\n${data.stderr}`);
        } else {
          setOutputConsole(`$ g++ -O2 -std=c++20 solution.cpp -o sol && ./sol\n\n${data.stdout}\n\n[Thời gian: ${data.executionTimeMs}ms]`);
        }
      } else {
        // Fallback to client-side engine
        const fallbackRes = executeCppFallback(code, customInput, activeProblem.id);
        if (fallbackRes.verdict === 'CE') {
          setOutputConsole(`[Lỗi biên dịch]:\n${fallbackRes.stderr}`);
        } else {
          setOutputConsole(`$ g++ -O2 -std=c++20 solution.cpp\n\n${fallbackRes.stdout}\n\n[Thời gian: ${fallbackRes.executionTimeMs}ms]`);
        }
      }
    } catch (err: any) {
      // Offline fallback
      const fallbackRes = executeCppFallback(code, customInput, activeProblem.id);
      setOutputConsole(`$ g++ -O2 -std=c++20 (Sandbox offline)\n\n${fallbackRes.stdout || fallbackRes.stderr}\n\n[Thời gian: ${fallbackRes.executionTimeMs}ms]`);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit and Judge against test suite with ACTUAL OUTPUT COMPARISON
  const handleSubmit = async () => {
    setIsJudging(true);
    setJudgeVerdict(null);
    setJudgeDetails(null);
    setSelectedTestDetail(null);
    setOutputConsole(`Đang nộp bài cho "${activeProblem.name}"...\nĐang biên dịch và kiểm tra lần lượt từng test case...`);

    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: activeProblem.id, code })
      });

      let judgeReport;

      if (res.ok) {
        judgeReport = await res.json();
      } else {
        // Fallback to client-side judge
        judgeReport = judgeProblemFallback(activeProblem.id, code, activeProblem.testCases);
      }

      setJudgeVerdict(judgeReport.verdict);
      setJudgeDetails({
        passed: judgeReport.passedCount,
        total: judgeReport.totalCount,
        runtime: `${judgeReport.maxTimeMs}ms`,
        memory: `${judgeReport.memoryMb}MB`,
        details: judgeReport.details || [],
        error: judgeReport.error
      });

      // Show first failed test if any
      const firstFailed = judgeReport.details?.find((d: TestCaseResult) => !d.passed);
      if (firstFailed) {
        setSelectedTestDetail(firstFailed);
      } else if (judgeReport.details && judgeReport.details.length > 0) {
        setSelectedTestDetail(judgeReport.details[0]);
      }

      if (judgeReport.verdict === 'AC') {
        setOutputConsole(
          `✔ ACCEPTED (ĐẠT)!\nChương trình của bạn đã vượt qua tất cả ${judgeReport.totalCount}/${judgeReport.totalCount} test case.\nThời gian chạy: ${judgeReport.maxTimeMs}ms · Bộ nhớ: ${judgeReport.memoryMb}MB\nKết quả đầu ra khớp 100% với đáp án mẫu chuẩn!`
        );
        onEarnXP(35, `Accepted · ${activeProblem.name}`);
      } else if (judgeReport.verdict === 'CE') {
        setOutputConsole(
          `✕ COMPILE ERROR (LỖI BIÊN DỊCH)\nTrình biên dịch g++ báo lỗi sau:\n\n${judgeReport.error}`
        );
      } else if (judgeReport.verdict === 'WA') {
        setOutputConsole(
          `✕ WRONG ANSWER (SAI KẾT QUẢ)\nĐã vượt qua ${judgeReport.passedCount}/${judgeReport.totalCount} test case.\n${judgeReport.error || 'Kết quả đầu ra thực tế không khớp với kỳ vọng.'}\n\nXem chi tiết so sánh ở bảng bên dưới!`
        );
      } else if (judgeReport.verdict === 'TLE') {
        setOutputConsole(
          `⏱ TIME LIMIT EXCEEDED (QUÁ THỜI GIAN)\nChương trình chạy vượt quá giới hạn thời gian (2.0s).\nHãy tối ưu độ phức tạp thuật toán!`
        );
      } else {
        setOutputConsole(
          `⚠ RUNTIME ERROR\nChương trình dừng đột ngột hoặc tràn mảng.\n${judgeReport.error || ''}`
        );
      }

      onRecordSubmission({
        id: Date.now().toString(),
        problemId: activeProblem.id,
        problemName: activeProblem.name,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        verdict: judgeReport.verdict === 'RTE' ? 'WA' : judgeReport.verdict,
        passed: judgeReport.passedCount,
        total: judgeReport.totalCount,
        runtime: `${judgeReport.maxTimeMs}ms`,
        memory: `${judgeReport.memoryMb}MB`
      });
    } catch (err: any) {
      // Local fallback judge
      const fallbackReport = judgeProblemFallback(activeProblem.id, code, activeProblem.testCases);
      setJudgeVerdict(fallbackReport.verdict);
      setJudgeDetails({
        passed: fallbackReport.passedCount,
        total: fallbackReport.totalCount,
        runtime: `${fallbackReport.maxTimeMs}ms`,
        memory: `${fallbackReport.memoryMb}MB`,
        details: fallbackReport.details,
        error: fallbackReport.error
      });
      setOutputConsole(`[Sandbox]: ${fallbackReport.verdict} (${fallbackReport.passedCount}/${fallbackReport.totalCount} tests pass)`);
    } finally {
      setIsJudging(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Problem Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#18181b] border border-[#26262b] rounded-2xl">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs text-[#9d9da6] whitespace-nowrap">Chọn bài tập:</span>
          <select
            value={selectedProblemId}
            onChange={e => setSelectedProblemId(e.target.value)}
            className="bg-[#202024] border border-[#2a2a30] text-[#f4f4f6] text-xs sm:text-sm rounded-xl px-3 py-1.5 font-medium truncate max-w-md focus:outline-none focus:border-orange-500/50"
          >
            {PROBLEMS.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.difficulty}]
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowStatement(!showStatement)}
          className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-medium px-3 py-1.5 rounded-lg bg-[#202024] border border-[#2a2a30] transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{showStatement ? 'Ẩn đề bài' : 'Xem đề bài & Gợi ý'}</span>
          {showStatement ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Problem Statement Card */}
      {showStatement && (
        <div className="p-5 sm:p-6 bg-[#18181b] border border-[#26262b] rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#26262b]">
            <div>
              <h3 className="font-display text-lg font-bold text-[#f4f4f6]">
                {activeProblem.name}
              </h3>
              <div className="text-xs text-[#9d9da6] mt-0.5">
                Chuyên đề: <span className="text-orange-400 font-mono">{activeProblem.category}</span> · Độ khó: <span className="text-amber-400 font-mono">{activeProblem.difficulty}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[#9d9da6]">
              <span>Thời gian: <strong className="text-white">{activeProblem.timeLimit}</strong></span>
              <span>·</span>
              <span>Bộ nhớ: <strong className="text-white">{activeProblem.memLimit}</strong></span>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed">
            {activeProblem.description}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#141416] border border-[#26262b] rounded-xl space-y-1">
              <strong className="text-orange-400 font-mono">Định dạng đầu vào (Input):</strong>
              <p className="text-[#9d9da6]">{activeProblem.inputFormat}</p>
            </div>
            <div className="p-3.5 bg-[#141416] border border-[#26262b] rounded-xl space-y-1">
              <strong className="text-emerald-400 font-mono">Định dạng đầu ra (Output):</strong>
              <p className="text-[#9d9da6]">{activeProblem.outputFormat}</p>
            </div>
          </div>

          {/* Constraints */}
          <div className="p-3 bg-[#141416] border border-[#26262b] rounded-xl text-xs space-y-1">
            <strong className="text-amber-400 font-mono">Ràng buộc (Constraints):</strong>
            <ul className="list-disc list-inside text-[#9d9da6] space-y-0.5 font-mono">
              {activeProblem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Samples */}
          <div className="space-y-2">
            <strong className="text-xs text-[#f4f4f6] font-mono">Ví dụ mẫu:</strong>
            {activeProblem.samples.map((sample, idx) => (
              <div key={idx} className="p-3 bg-[#141416] border border-[#26262b] rounded-xl space-y-2 text-xs font-mono">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#6d6d76]">Input:</span>
                    <pre className="p-2 bg-[#111113] rounded mt-1 text-[#f4f4f6] whitespace-pre-wrap">{sample.input.replace(/\\n/g, '\n')}</pre>
                  </div>
                  <div>
                    <span className="text-[#6d6d76]">Output:</span>
                    <pre className="p-2 bg-[#111113] rounded mt-1 text-emerald-400 whitespace-pre-wrap">{sample.output.replace(/\\n/g, '\n')}</pre>
                  </div>
                </div>
                {sample.explanation && (
                  <div className="text-[11px] text-[#9d9da6] italic font-sans">
                    Giải thích: {sample.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hints */}
          {activeProblem.hints && activeProblem.hints.length > 0 && (
            <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl text-xs space-y-1">
              <strong className="text-amber-400 font-mono">💡 Gợi ý thuật toán:</strong>
              <ul className="list-disc list-inside text-amber-200/80 space-y-0.5">
                {activeProblem.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Editor & Execution Dual Panel */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left: Code Editor */}
        <div className="rounded-2xl bg-[#18181b] border border-[#26262b] flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#141416] border-b border-[#26262b]">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="font-mono text-[#9d9da6] ml-2">solution.cpp (GNU C++20)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="text-xs text-[#9d9da6] hover:text-[#f4f4f6] px-2 py-1 rounded bg-[#202024] hover:bg-[#28282e] border border-[#2a2a30] transition flex items-center gap-1"
                title="Sao chép code"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
              </button>
              <button
                onClick={handleResetCode}
                className="text-xs text-[#9d9da6] hover:text-[#f4f4f6] px-2 py-1 rounded bg-[#202024] hover:bg-[#28282e] border border-[#2a2a30] transition flex items-center gap-1"
                title="Khôi phục code mẫu ban đầu"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Khôi phục</span>
              </button>
            </div>
          </div>

          {/* Editor Area with Line Numbers */}
          <div className="flex-1 flex bg-[#111113] min-h-[380px] max-h-[460px] overflow-hidden">
            {/* Line numbers */}
            <div
              ref={lineNumbersRef}
              className="py-3 px-2.5 bg-[#141416] text-[#4b4b54] font-mono text-xs text-right select-none leading-[1.6rem] border-r border-[#222226]"
              style={{ width: '3.2rem' }}
            >
              <pre className="m-0 p-0 font-mono">{lineNumbersString}</pre>
            </div>

            {/* Code Input Textarea */}
            <textarea
              ref={editorRef}
              spellCheck={false}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              onScroll={() => {
                if (editorRef.current && lineNumbersRef.current) {
                  lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
                }
              }}
              className="flex-1 p-3 bg-transparent text-[#e4e4e7] font-mono text-[13px] leading-[1.6rem] resize-none focus:outline-none overflow-y-auto selection:bg-orange-500/30"
            />
          </div>

          {/* Editor Footer Actions */}
          <div className="p-3 bg-[#141416] border-t border-[#26262b] flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning || isJudging}
              className="flex-1 py-2.5 rounded-xl bg-[#202024] hover:bg-[#28282e] text-[#f4f4f6] text-xs sm:text-sm font-semibold border border-[#2a2a30] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{isRunning ? 'Đang chạy...' : 'Chạy thử (Run)'}</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isRunning || isJudging}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-[#181008] text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isJudging ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Send className="w-4 h-4" />}
              <span>{isJudging ? 'Đang chấm test...' : 'Nộp bài (Submit & Chấm)'}</span>
            </button>
          </div>
        </div>

        {/* Right: Input & Output Console & Judge Result */}
        <div className="flex flex-col gap-4">
          {/* Custom Input */}
          <div className="p-4 rounded-2xl bg-[#18181b] border border-[#26262b]">
            <h4 className="text-xs font-semibold text-[#9d9da6] mb-2 font-mono flex items-center justify-between">
              <span>Dữ liệu đầu vào (Custom Input)</span>
              <span className="text-[11px] text-[#6d6d76]">Nhập để chạy thử với Run</span>
            </h4>
            <textarea
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              className="w-full h-24 p-3 rounded-xl bg-[#111113] border border-[#26262b] font-mono text-xs text-[#f4f4f6] resize-none focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Execution Console */}
          <div className="p-4 rounded-2xl bg-[#18181b] border border-[#26262b] flex-1 flex flex-col min-h-[160px]">
            <h4 className="text-xs font-semibold text-[#9d9da6] mb-2 font-mono">
              Kết quả thực thi (Execution Output)
            </h4>
            <div className="flex-1 p-3.5 rounded-xl bg-[#111113] border border-[#26262b] font-mono text-xs whitespace-pre-wrap overflow-y-auto text-[#d4d4d8] leading-relaxed">
              {outputConsole}
            </div>
          </div>

          {/* Judge Verdict Box with Detailed Comparison */}
          {judgeVerdict && judgeDetails && (
            <div className="p-4 rounded-2xl bg-[#18181b] border border-[#26262b] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-bold font-display flex items-center gap-2 ${
                    judgeVerdict === 'AC'
                      ? 'text-emerald-400'
                      : judgeVerdict === 'WA'
                      ? 'text-rose-400'
                      : judgeVerdict === 'TLE'
                      ? 'text-amber-400'
                      : judgeVerdict === 'CE'
                      ? 'text-rose-500'
                      : 'text-amber-400'
                  }`}
                >
                  {judgeVerdict === 'AC' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5" />}
                  <span>
                    {judgeVerdict === 'AC'
                      ? 'Accepted (Đạt điểm tuyệt đối)'
                      : judgeVerdict === 'WA'
                      ? 'Wrong Answer (Sai kết quả)'
                      : judgeVerdict === 'TLE'
                      ? 'Time Limit Exceeded (Quá thời gian)'
                      : judgeVerdict === 'CE'
                      ? 'Compile Error (Lỗi cú pháp)'
                      : 'Runtime Error'}
                  </span>
                </span>
                <span className="text-xs font-mono text-[#9d9da6]">
                  {judgeDetails.passed}/{judgeDetails.total} test case
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#202024] border border-[#2a2a30]">
                  <div className="text-[10px] text-[#6d6d76]">Test Pass</div>
                  <div className={`font-mono font-bold mt-0.5 ${judgeDetails.passed === judgeDetails.total ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {judgeDetails.passed}/{judgeDetails.total}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#202024] border border-[#2a2a30]">
                  <div className="text-[10px] text-[#6d6d76]">Thời gian</div>
                  <div className="font-mono font-bold text-[#f4f4f6] mt-0.5">
                    {judgeDetails.runtime}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#202024] border border-[#2a2a30]">
                  <div className="text-[10px] text-[#6d6d76]">Bộ nhớ</div>
                  <div className="font-mono font-bold text-[#f4f4f6] mt-0.5">
                    {judgeDetails.memory}
                  </div>
                </div>
              </div>

              {/* Interactive Test Case Badges */}
              {judgeDetails.details && judgeDetails.details.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] text-[#9d9da6] font-mono flex items-center justify-between">
                    <span>Chi tiết từng test case (nhấp để xem so sánh):</span>
                  </div>
                  <div className="grid grid-cols-8 gap-1.5">
                    {judgeDetails.details.map((tc, idx) => {
                      const isSelected = selectedTestDetail?.testIndex === tc.testIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedTestDetail(tc)}
                          className={`p-1.5 rounded-lg text-center font-mono text-xs border transition ${
                            tc.passed
                              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
                              : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
                          } ${isSelected ? 'ring-2 ring-white/60 font-bold' : ''}`}
                          title={`Test #${tc.testIndex}: ${tc.passed ? 'ĐẠT' : tc.status}`}
                        >
                          #{tc.testIndex}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Test Case Inspection Diff Box */}
              {selectedTestDetail && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#141416] border border-[#2a2a30] text-xs font-mono space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#222226]">
                    <span className="font-semibold text-[#f4f4f6]">
                      So sánh chi tiết Test #{selectedTestDetail.testIndex}:
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedTestDetail.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}>
                      {selectedTestDetail.passed ? 'PASS ✔' : `${selectedTestDetail.status} ✕`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6d6d76]">Input:</span>
                    <pre className="p-2 bg-[#111113] rounded mt-0.5 text-[#e4e4e7] whitespace-pre-wrap">{selectedTestDetail.input}</pre>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-emerald-400 font-semibold">Đáp án kỳ vọng (Expected):</span>
                      <pre className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded mt-0.5 text-emerald-300 whitespace-pre-wrap">
                        {selectedTestDetail.expected}
                      </pre>
                    </div>
                    <div>
                      <span className={selectedTestDetail.passed ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        Đầu ra của bạn (Your Output):
                      </span>
                      <pre className={`p-2 rounded mt-0.5 whitespace-pre-wrap border ${
                        selectedTestDetail.passed
                          ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300'
                          : 'bg-rose-950/20 border-rose-900/30 text-rose-300'
                      }`}>
                        {selectedTestDetail.actual || '(không có đầu ra)'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
