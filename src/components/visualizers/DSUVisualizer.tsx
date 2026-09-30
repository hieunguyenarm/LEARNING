import React, { useState } from 'react';
import { Play, RotateCcw, Info, GitMerge, Search } from 'lucide-react';

interface DSUVisualizerProps {
  onEarnXP?: (amount: number, reason: string) => void;
}

export const DSUVisualizer: React.FC<DSUVisualizerProps> = ({ onEarnXP }) => {
  const [parent, setParent] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);
  const [size, setSize] = useState<number[]>([1, 1, 1, 1, 1, 1, 1, 1]);
  const [nodeA, setNodeA] = useState<number>(0);
  const [nodeB, setNodeB] = useState<number>(1);
  const [findTarget, setFindTarget] = useState<number>(3);
  const [highlightedNodes, setHighlightedNodes] = useState<number[]>([]);
  const [log, setLog] = useState<string>('Chọn hai đỉnh để thực hiện hợp nhất Union(u, v) hoặc tìm đại diện Find(x).');

  // Find with Path Compression
  const handleFind = (target: number) => {
    const path: number[] = [];
    let curr = target;
    while (curr !== parent[curr]) {
      path.push(curr);
      curr = parent[curr];
    }
    path.push(curr); // Root

    // Path compression: rewire all nodes on path to point directly to curr
    const nextParent = [...parent];
    path.forEach(node => {
      nextParent[node] = curr;
    });

    setParent(nextParent);
    setHighlightedNodes(path);
    setLog(`Find(${target}): Duyệt đường dẫn [${path.join(' -> ')}]. Gốc là ${curr}. Áp dụng nén đường dẫn (Path Compression) cho mọi đỉnh trên đường.`);
    if (onEarnXP) onEarnXP(10, `Find(${target}) với Path Compression`);
  };

  // Union by Size
  const handleUnion = (u: number, v: number) => {
    let rootU = u;
    while (rootU !== parent[rootU]) rootU = parent[rootU];
    let rootV = v;
    while (rootV !== parent[rootV]) rootV = parent[rootV];

    if (rootU === rootV) {
      setHighlightedNodes([rootU]);
      setLog(`Union(${u}, ${v}): Đỉnh ${u} và ${v} đã có cùng gốc là ${rootU} (Đã liên thông từ trước). Bỏ qua để không tạo chu trình!`);
      return;
    }

    const nextParent = [...parent];
    const nextSize = [...size];

    let small = rootU;
    let big = rootV;
    if (nextSize[rootU] >= nextSize[rootV]) {
      big = rootU;
      small = rootV;
    }

    // Attach smaller root to bigger root
    nextParent[small] = big;
    nextSize[big] += nextSize[small];

    setParent(nextParent);
    setSize(nextSize);
    setHighlightedNodes([u, v, big, small]);
    setLog(`Union(${u}, ${v}): Gốc của ${u} là ${rootU} (size=${size[rootU]}), gốc của ${v} là ${rootV} (size=${size[rootV]}). Gắn cây nhỏ ${small} vào gốc lớn ${big}. Kích thước mới = ${nextSize[big]}.`);
    if (onEarnXP) onEarnXP(15, `Union(${u}, ${v})`);
  };

  const handleReset = () => {
    setParent([0, 1, 2, 3, 4, 5, 6, 7]);
    setSize([1, 1, 1, 1, 1, 1, 1, 1]);
    setHighlightedNodes([]);
    setLog('Đã đặt lại 8 tập hợp rời nhau ban đầu {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}.');
  };

  // Preset demo: Kruskal like connections
  const handlePresetDemo = () => {
    const p = [0, 0, 0, 3, 3, 5, 5, 0];
    const s = [5, 1, 1, 2, 1, 2, 1, 1];
    setParent(p);
    setSize(s);
    setHighlightedNodes([0, 3, 5]);
    setLog('Nạp sẵn cấu trúc rừng gồm 3 cây: Cây {0, 1, 2, 7}, Cây {3, 4}, Cây {5, 6}.');
  };

  // Calculate component count
  const componentCount = parent.filter((p, i) => p === i).length;

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#18181b] border border-[#2a2a30] rounded-xl text-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Union controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#9d9da6]">Union:</span>
            <select
              value={nodeA}
              onChange={e => setNodeA(Number(e.target.value))}
              className="bg-[#202024] border border-[#2a2a30] rounded px-2 py-1 font-mono text-xs"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <span className="text-xs text-[#6d6d76]">và</span>
            <select
              value={nodeB}
              onChange={e => setNodeB(Number(e.target.value))}
              className="bg-[#202024] border border-[#2a2a30] rounded px-2 py-1 font-mono text-xs"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <button
              onClick={() => handleUnion(nodeA, nodeB)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Gộp tập hợp</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[#2a2a30] hidden sm:block"></div>

          {/* Find controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#9d9da6]">Find:</span>
            <select
              value={findTarget}
              onChange={e => setFindTarget(Number(e.target.value))}
              className="bg-[#202024] border border-[#2a2a30] rounded px-2 py-1 font-mono text-xs"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>Đỉnh {i}</option>
              ))}
            </select>
            <button
              onClick={() => handleFind(findTarget)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282e] border border-[#2a2a30] font-medium text-xs transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tìm gốc & Nén</span>
            </button>
          </div>

          <button
            onClick={handlePresetDemo}
            className="px-2.5 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282e] border border-[#2a2a30] text-xs font-medium text-amber-300"
          >
            Mẫu Rừng DSU
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282e] text-xs font-medium border border-[#2a2a30] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        </div>

        <div className="text-xs font-mono text-[#9d9da6]">
          Số thành phần: <strong className="text-emerald-400 font-bold text-sm">{componentCount}</strong>
        </div>
      </div>

      {/* Log message */}
      <div className="flex items-start gap-3 p-3.5 bg-[#141416] border border-[#26262b] rounded-xl text-xs font-mono">
        <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div className="text-[#f4f4f6]">{log}</div>
      </div>

      {/* Nodes Array & Tree Visualization */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Array Table */}
        <div className="p-4 bg-[#141416] border border-[#222226] rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-[#f4f4f6] mb-3">Mảng cha parent[] & kích thước size[]</h4>
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: 8 }, (_, i) => {
                const isRoot = parent[i] === i;
                const isHl = highlightedNodes.includes(i);

                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-center border transition ${
                      isHl
                        ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                        : isRoot
                        ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                        : 'bg-[#18181b] border-[#2a2a30] text-[#9d9da6]'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold text-[#f4f4f6]">#{i}</div>
                    <div className="mt-1 text-[11px] font-mono">
                      p: <strong className={isRoot ? 'text-emerald-400' : 'text-[#f4f4f6]'}>{parent[i]}</strong>
                    </div>
                    {isRoot && (
                      <div className="text-[10px] text-amber-400 font-mono">sz:{size[i]}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#26262b] text-xs text-[#9d9da6] space-y-1.5 font-mono">
            <div>• <strong className="text-emerald-400">Đỉnh gốc</strong>: là đỉnh có <code className="text-white">parent[i] == i</code>.</div>
            <div>• <strong className="text-amber-400">Union by Size</strong>: luôn gắn gốc của cây ít phần tử vào gốc của cây nhiều phần tử hơn.</div>
            <div>• <strong className="text-orange-400">Path Compression</strong>: khi duyệt đường dẫn, trỏ trực tiếp mọi đỉnh lên gốc để độ sâu cây luôn xấp xỉ 1!</div>
          </div>
        </div>

        {/* Tree graph visualization */}
        <div className="p-4 bg-[#141416] border border-[#222226] rounded-xl flex flex-col items-center justify-center min-h-[260px]">
          <svg viewBox="0 0 440 240" className="w-full max-w-[440px] select-none">
            {/* Draw parent pointers */}
            {Array.from({ length: 8 }, (_, i) => {
              if (parent[i] === i) return null; // Root has no parent line
              const p = parent[i];
              // Calculate coordinates based on index
              const x1 = 40 + (i % 4) * 105;
              const y1 = i < 4 ? 60 : 180;
              const x2 = 40 + (p % 4) * 105;
              const y2 = p < 4 ? 60 : 180;

              return (
                <g key={`arrow-${i}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#f9762f"
                    strokeWidth={2}
                    strokeDasharray={x1 === x2 && y1 === y2 ? 'none' : '4,2'}
                  />
                </g>
              );
            })}

            {/* Draw Nodes */}
            {Array.from({ length: 8 }, (_, i) => {
              const x = 40 + (i % 4) * 105;
              const y = i < 4 ? 60 : 180;
              const isRoot = parent[i] === i;
              const isHl = highlightedNodes.includes(i);

              let fill = '#1c1c20';
              let stroke = '#2e2e36';
              if (isHl) {
                fill = '#ea580c';
                stroke = '#fed7aa';
              } else if (isRoot) {
                fill = '#059669';
                stroke = '#34d399';
              }

              return (
                <g key={`node-${i}`} className="cursor-pointer" onClick={() => handleFind(i)}>
                  <circle
                    cx={x}
                    cy={y}
                    r={20}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2}
                  />
                  <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontWeight="bold"
                    fontSize={13}
                    fontFamily="Space Grotesk, sans-serif"
                  >
                    {i}
                  </text>
                  <text
                    x={x}
                    y={y + 32}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize={10}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {isRoot ? `(gốc)` : `-> ${parent[i]}`}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="text-[11px] text-[#6d6d76] mt-2 font-mono">
            Mũi tên thể hiện con trỏ <code className="text-orange-400">parent[i]</code> trỏ về cha
          </div>
        </div>
      </div>
    </div>
  );
};
