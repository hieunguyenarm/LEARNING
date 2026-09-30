import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Info, ArrowRight } from 'lucide-react';

interface DijkstraVisualizerProps {
  onEarnXP?: (amount: number, reason: string) => void;
}

interface Node {
  id: string;
  x: number;
  y: number;
}

interface Edge {
  u: string;
  v: string;
  w: number;
}

interface DijStep {
  type: 'POP' | 'RELAX' | 'SKIP' | 'DONE';
  currentNode: string | null;
  relaxedEdge: [string, string] | null;
  dist: Record<string, number>;
  visited: string[];
  pq: [string, number][];
  parent: Record<string, string | null>;
  log: string;
}

const NODES: Node[] = [
  { id: 'A', x: 80, y: 180 },
  { id: 'B', x: 220, y: 80 },
  { id: 'C', x: 220, y: 280 },
  { id: 'D', x: 380, y: 80 },
  { id: 'E', x: 380, y: 280 },
  { id: 'F', x: 520, y: 180 },
];

const EDGES: Edge[] = [
  { u: 'A', v: 'B', w: 4 },
  { u: 'A', v: 'C', w: 2 },
  { u: 'C', v: 'B', w: 1 },
  { u: 'B', v: 'D', w: 5 },
  { u: 'C', v: 'E', w: 8 },
  { u: 'D', v: 'E', w: 3 },
  { u: 'D', v: 'F', w: 6 },
  { u: 'E', v: 'F', w: 2 },
];

export const DijkstraVisualizer: React.FC<DijkstraVisualizerProps> = ({ onEarnXP }) => {
  const [sourceNode, setSourceNode] = useState<string>('A');
  const [targetNode, setTargetNode] = useState<string>('F');
  const [speed, setSpeed] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [xpAwarded, setXpAwarded] = useState<boolean>(false);

  // Precompute all steps for the algorithm
  const steps = React.useMemo<DijStep[]>(() => {
    const adj: Record<string, [string, number][]> = {};
    NODES.forEach(n => { adj[n.id] = []; });
    EDGES.forEach(e => {
      adj[e.u].push([e.v, e.w]);
      adj[e.v].push([e.u, e.w]); // Undirected for friendly visualization
    });

    const dist: Record<string, number> = {};
    const parent: Record<string, string | null> = {};
    NODES.forEach(n => {
      dist[n.id] = Infinity;
      parent[n.id] = null;
    });

    dist[sourceNode] = 0;
    const visitedSet = new Set<string>();
    // Priority queue of [node, dist]
    const pq: [string, number][] = [[sourceNode, 0]];
    const generatedSteps: DijStep[] = [];

    generatedSteps.push({
      type: 'POP',
      currentNode: sourceNode,
      relaxedEdge: null,
      dist: { ...dist },
      visited: [],
      pq: [...pq],
      parent: { ...parent },
      log: `Khởi tạo: Gán khoảng cách đỉnh nguồn dist[${sourceNode}] = 0, các đỉnh khác = ∞. Đẩy (${sourceNode}, 0) vào Min-Heap.`
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a[1] - b[1]);
      const [u, d] = pq.shift()!;

      if (visitedSet.has(u)) {
        generatedSteps.push({
          type: 'SKIP',
          currentNode: u,
          relaxedEdge: null,
          dist: { ...dist },
          visited: Array.from(visitedSet),
          pq: [...pq],
          parent: { ...parent },
          log: `Bỏ qua trạng thái lỗi thời (${u}, ${d}) vì đỉnh ${u} đã được chốt khoảng cách tối ưu từ trước.`
        });
        continue;
      }

      visitedSet.add(u);

      generatedSteps.push({
        type: 'POP',
        currentNode: u,
        relaxedEdge: null,
        dist: { ...dist },
        visited: Array.from(visitedSet),
        pq: [...pq],
        parent: { ...parent },
        log: `Lấy đỉnh ${u} từ đỉnh Min-Heap (khoảng cách ngắn nhất hiện tại là ${d}). Đánh dấu ${u} đã hoàn thành.`
      });

      const neighbors = adj[u] || [];
      for (const [v, w] of neighbors) {
        if (!visitedSet.has(v)) {
          if (dist[u] + w < dist[v]) {
            const oldDist = dist[v] === Infinity ? '∞' : dist[v];
            dist[v] = dist[u] + w;
            parent[v] = u;
            pq.push([v, dist[v]]);
            generatedSteps.push({
              type: 'RELAX',
              currentNode: u,
              relaxedEdge: [u, v],
              dist: { ...dist },
              visited: Array.from(visitedSet),
              pq: [...pq],
              parent: { ...parent },
              log: `Nới lỏng cạnh (${u}, ${v}) có trọng số ${w}: dist[${u}] + ${w} = ${dist[v]} < ${oldDist} => Cập nhật dist[${v}] = ${dist[v]} và đẩy vào Heap.`
            });
          }
        }
      }
    }

    generatedSteps.push({
      type: 'DONE',
      currentNode: null,
      relaxedEdge: null,
      dist: { ...dist },
      visited: Array.from(visitedSet),
      pq: [],
      parent: { ...parent },
      log: `Hoàn tất thuật toán Dijkstra! Đã tìm được khoảng cách ngắn nhất từ đỉnh ${sourceNode} đến tất cả các đỉnh.`
    });

    return generatedSteps;
  }, [sourceNode]);

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
              onEarnXP(25, 'Hoàn thành mô phỏng Dijkstra');
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
        onEarnXP(25, 'Hoàn thành mô phỏng Dijkstra');
      }
    }
  };

  // Reconstruct shortest path to target
  const reconstructedPath = React.useMemo<string[]>(() => {
    if (!currentStep.parent) return [];
    const path: string[] = [];
    let curr: string | null = targetNode;
    while (curr) {
      path.unshift(curr);
      if (curr === sourceNode) break;
      curr = currentStep.parent[curr] || null;
    }
    return path.length > 0 && path[0] === sourceNode ? path : [];
  }, [currentStep.parent, sourceNode, targetNode]);

  const isCompleted = stepIdx >= steps.length - 1;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#18181b] border border-[#2a2a30] rounded-xl text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#9d9da6]">Đỉnh nguồn:</span>
            <select
              value={sourceNode}
              disabled={isPlaying}
              onChange={e => {
                setSourceNode(e.target.value);
                handleReset();
              }}
              className="bg-[#202024] border border-[#2a2a30] rounded-lg px-2 py-1 text-xs font-mono font-semibold"
            >
              {NODES.map(n => (
                <option key={n.id} value={n.id}>Đỉnh {n.id}</option>
              ))}
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

      {/* Step Log Banner */}
      <div className="flex items-start gap-3 p-3.5 bg-[#141416] border border-[#26262b] rounded-xl text-xs font-mono">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="text-[#f4f4f6]">
            Bước {stepIdx + 1}/{steps.length}: {currentStep.log}
          </span>
        </div>
      </div>

      {/* Main Grid: Graph + State Table */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* SVG Graph Canvas */}
        <div className="lg:col-span-2 p-4 bg-[#141416] border border-[#222226] rounded-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
          <svg viewBox="0 0 600 360" className="w-full h-auto max-w-[600px] select-none">
            {/* Draw Edges */}
            {EDGES.map((edge, idx) => {
              const uNode = NODES.find(n => n.id === edge.u)!;
              const vNode = NODES.find(n => n.id === edge.v)!;
              const isRelaxed = currentStep.relaxedEdge &&
                ((currentStep.relaxedEdge[0] === edge.u && currentStep.relaxedEdge[1] === edge.v) ||
                 (currentStep.relaxedEdge[0] === edge.v && currentStep.relaxedEdge[1] === edge.u));

              const isPartOfShortestPath = isCompleted && reconstructedPath.length > 1 &&
                reconstructedPath.some((node, i) => {
                  if (i === reconstructedPath.length - 1) return false;
                  const next = reconstructedPath[i + 1];
                  return (node === edge.u && next === edge.v) || (node === edge.v && next === edge.u);
                });

              const strokeColor = isRelaxed
                ? '#f9762f'
                : isPartOfShortestPath
                ? '#10b981'
                : '#33333a';
              const strokeWidth = isRelaxed || isPartOfShortestPath ? 3.5 : 1.5;

              const midX = (uNode.x + vNode.x) / 2;
              const midY = (uNode.y + vNode.y) / 2;

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={uNode.x}
                    y1={uNode.y}
                    x2={vNode.x}
                    y2={vNode.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className="transition-colors duration-300"
                  />
                  {/* Edge weight badge */}
                  <rect
                    x={midX - 11}
                    y={midY - 9}
                    width={22}
                    height={18}
                    rx={5}
                    fill="#18181b"
                    stroke="#2a2a30"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill="#9d9da6"
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {edge.w}
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {NODES.map(node => {
              const isVisited = currentStep.visited.includes(node.id);
              const isCurrent = currentStep.currentNode === node.id && !isCompleted;
              const isSource = node.id === sourceNode;
              const distVal = currentStep.dist[node.id];
              const distDisplay = distVal === Infinity ? '∞' : distVal;

              let fillColor = '#202024';
              let strokeColor = '#3a3a42';
              let textColor = '#e4e4e7';

              if (isCurrent) {
                fillColor = '#f59e0b';
                strokeColor = '#fcd34d';
                textColor = '#000000';
              } else if (isVisited) {
                fillColor = '#059669';
                strokeColor = '#34d399';
                textColor = '#ffffff';
              } else if (isSource) {
                fillColor = '#ea580c';
                strokeColor = '#fdba74';
                textColor = '#ffffff';
              }

              return (
                <g key={`node-${node.id}`} className="cursor-pointer">
                  {/* Outer glow for current active node */}
                  {isCurrent && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={28}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      opacity={0.5}
                      className="animate-ping"
                    />
                  )}
                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={22}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2.5}
                    className="transition-all duration-300"
                  />
                  {/* Node Label */}
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill={textColor}
                    fontWeight="bold"
                    fontSize={14}
                    fontFamily="Space Grotesk, sans-serif"
                  >
                    {node.id}
                  </text>
                  {/* Distance Subtitle */}
                  <rect
                    x={node.x - 24}
                    y={node.y + 28}
                    width={48}
                    height={18}
                    rx={6}
                    fill="#18181b"
                    stroke="#2a2a30"
                  />
                  <text
                    x={node.x}
                    y={node.y + 41}
                    textAnchor="middle"
                    fill={isVisited ? '#34d399' : '#9d9da6'}
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="500"
                  >
                    {distDisplay}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs text-[#9d9da6]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Đỉnh đang xét (Pop)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span>Đỉnh đã chốt (Visited)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#202024] border border-[#3a3a42]"></span>
              <span>Chưa duyệt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-orange-500 inline-block"></span>
              <span>Cạnh vừa nới lỏng</span>
            </div>
          </div>
        </div>

        {/* State Sidebar: Distance Table + Priority Queue */}
        <div className="space-y-4 flex flex-col">
          {/* Priority Queue Box */}
          <div className="p-4 bg-[#141416] border border-[#222226] rounded-xl">
            <div className="flex items-center justify-between text-xs font-semibold mb-2 text-[#f4f4f6]">
              <span>Min-Heap (Priority Queue)</span>
              <span className="text-[#9d9da6] font-mono">{currentStep.pq.length} phần tử</span>
            </div>
            {currentStep.pq.length === 0 ? (
              <div className="text-xs text-[#6d6d76] py-3 text-center font-mono">
                {isCompleted ? 'Heap đã rỗng · Kết thúc' : 'Chưa có phần tử nào'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {currentStep.pq.map(([nId, dVal], i) => (
                  <span
                    key={`${nId}-${i}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 ${
                      i === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-[#202024] text-[#9d9da6] border border-[#2a2a30]'
                    }`}
                  >
                    <span>{nId}</span>
                    <span className="text-[#6d6d76]">({dVal})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Distance Table */}
          <div className="p-4 bg-[#141416] border border-[#222226] rounded-xl flex-1 flex flex-col">
            <h4 className="text-xs font-semibold text-[#f4f4f6] mb-2">Bảng khoảng cách (Dist Array)</h4>
            <div className="space-y-1.5 flex-1 font-mono text-xs">
              {NODES.map(node => {
                const isVisited = currentStep.visited.includes(node.id);
                const isCurrent = currentStep.currentNode === node.id;
                const distVal = currentStep.dist[node.id];
                const p = currentStep.parent[node.id];

                return (
                  <div
                    key={node.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold'
                        : isVisited
                        ? 'bg-emerald-950/30 border border-emerald-800/30 text-emerald-400'
                        : 'bg-[#18181b] border border-[#26262b] text-[#9d9da6]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-bold">{node.id}</span>
                      <span className="text-[10px] text-[#6d6d76]">
                        {p ? `(cha: ${p})` : node.id === sourceNode ? '(gốc)' : ''}
                      </span>
                    </div>
                    <span className="font-bold">
                      {distVal === Infinity ? '∞' : distVal}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Path Reconstructor */}
            <div className="mt-4 pt-3 border-t border-[#26262b]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#9d9da6]">Truy vết đường đi tới:</span>
                <select
                  value={targetNode}
                  onChange={e => setTargetNode(e.target.value)}
                  className="bg-[#202024] border border-[#2a2a30] rounded px-1.5 py-0.5 text-xs font-mono"
                >
                  {NODES.filter(n => n.id !== sourceNode).map(n => (
                    <option key={n.id} value={n.id}>{n.id}</option>
                  ))}
                </select>
              </div>

              {reconstructedPath.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30">
                  {reconstructedPath.map((step, i) => (
                    <React.Fragment key={step}>
                      <span className="font-bold">{step}</span>
                      {i < reconstructedPath.length - 1 && <ArrowRight className="w-3 h-3 text-[#6d6d76]" />}
                    </React.Fragment>
                  ))}
                  <span className="ml-auto text-xs text-[#9d9da6]">
                    = {currentStep.dist[targetNode]}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-[#6d6d76] font-mono">Chưa tìm thấy đường đi</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
