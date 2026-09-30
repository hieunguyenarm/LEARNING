import React, { useState } from 'react';
import { Play, RotateCcw, Info, ArrowUpRight } from 'lucide-react';

interface SegmentTreeVisualizerProps {
  onEarnXP?: (amount: number, reason: string) => void;
}

interface TreeNode {
  id: number;
  l: number;
  r: number;
  x: number;
  y: number;
  value: number;
}

export const SegmentTreeVisualizer: React.FC<SegmentTreeVisualizerProps> = ({ onEarnXP }) => {
  const [array, setArray] = useState<number[]>([5, 2, 9, 1, 7, 6, 3, 8]);
  const [opMode, setOpMode] = useState<'QUERY' | 'UPDATE'>('QUERY');
  const [queryL, setQueryL] = useState<number>(2);
  const [queryR, setQueryR] = useState<number>(5);
  const [updateIdx, setUpdateIdx] = useState<number>(3);
  const [updateVal, setUpdateVal] = useState<number>(10);

  // Playback state
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [activeNodes, setActiveNodes] = useState<{ [nodeId: number]: 'VISITED' | 'IN_RANGE' | 'OUT_RANGE' | 'UPDATED' }>({});
  const [logMessage, setLogMessage] = useState<string>('Chọn truy vấn khoảng [L, R] hoặc cập nhật giá trị rồi nhấn "Chạy mô phỏng".');
  const [queryResult, setQueryResult] = useState<number | null>(null);

  // Tree geometry for 8 elements (size 15 nodes: root 1 to 15)
  // Level 0: Node 1 [0, 7]
  // Level 1: Node 2 [0, 3], Node 3 [4, 7]
  // Level 2: Node 4 [0, 1], Node 5 [2, 3], Node 6 [4, 5], Node 7 [6, 7]
  // Level 3: Node 8 [0], Node 9 [1], Node 10 [2], Node 11 [3], Node 12 [4], Node 13 [5], Node 14 [6], Node 15 [7]
  const buildTree = (arr: number[]): TreeNode[] => {
    const nodes: TreeNode[] = [];
    const treeVals = new Array(16).fill(0);

    // Leaves
    for (let i = 0; i < 8; i++) {
      treeVals[8 + i] = arr[i];
    }
    // Internal nodes (SUM Segment Tree)
    for (let i = 7; i >= 1; i--) {
      treeVals[i] = treeVals[2 * i] + treeVals[2 * i + 1];
    }

    const levelCoords = [
      [{ x: 300, y: 35, l: 0, r: 7, id: 1 }],
      [
        { x: 150, y: 105, l: 0, r: 3, id: 2 },
        { x: 450, y: 105, l: 4, r: 7, id: 3 }
      ],
      [
        { x: 75, y: 180, l: 0, r: 1, id: 4 },
        { x: 225, y: 180, l: 2, r: 3, id: 5 },
        { x: 375, y: 180, l: 4, r: 5, id: 6 },
        { x: 525, y: 180, l: 6, r: 7, id: 7 }
      ],
      [
        { x: 38, y: 260, l: 0, r: 0, id: 8 },
        { x: 112, y: 260, l: 1, r: 1, id: 9 },
        { x: 188, y: 260, l: 2, r: 2, id: 10 },
        { x: 262, y: 260, l: 3, r: 3, id: 11 },
        { x: 338, y: 260, l: 4, r: 4, id: 12 },
        { x: 412, y: 260, l: 5, r: 5, id: 13 },
        { x: 488, y: 260, l: 6, r: 6, id: 14 },
        { x: 562, y: 260, l: 7, r: 7, id: 15 }
      ]
    ];

    levelCoords.forEach(level => {
      level.forEach(item => {
        nodes.push({
          ...item,
          value: treeVals[item.id]
        });
      });
    });

    return nodes;
  };

  const treeNodes = buildTree(array);

  // Execute Range Query Simulation
  const runRangeQuerySimulation = () => {
    const ql = queryL;
    const qr = queryR;
    const nodeStatus: { [nodeId: number]: 'VISITED' | 'IN_RANGE' | 'OUT_RANGE' | 'UPDATED' } = {};
    let totalSum = 0;
    const logSteps: string[] = [];

    const queryRec = (id: number, l: number, r: number): number => {
      if (qr < l || r < ql) {
        nodeStatus[id] = 'OUT_RANGE';
        logSteps.push(`Nút #${id} [${l}..${r}]: Nằm ngoài đoạn truy vấn [${ql}..${qr}] -> Bỏ qua (Pruned).`);
        return 0;
      }
      if (ql <= l && r <= qr) {
        nodeStatus[id] = 'IN_RANGE';
        const nodeObj = treeNodes.find(n => n.id === id);
        const val = nodeObj ? nodeObj.value : 0;
        totalSum += val;
        logSteps.push(`Nút #${id} [${l}..${r}]: Nằm trọn vẹn trong [${ql}..${qr}] -> Lấy luôn giá trị ${val}!`);
        return val;
      }
      nodeStatus[id] = 'VISITED';
      logSteps.push(`Nút #${id} [${l}..${r}]: Giao một phần với [${ql}..${qr}] -> Đệ quy xuống hai con.`);
      const mid = Math.floor((l + r) / 2);
      const leftVal: number = queryRec(2 * id, l, mid);
      const rightVal: number = queryRec(2 * id + 1, mid + 1, r);
      return leftVal + rightVal;
    };

    queryRec(1, 0, 7);
    setActiveNodes(nodeStatus);
    setQueryResult(totalSum);
    setLogMessage(`Tổng đoạn [${ql}..${qr}] = ${totalSum}. Đã lấy giá trị từ các nút màu xanh lá cây.`);
    if (onEarnXP) onEarnXP(15, 'Mô phỏng Segment Tree Range Query');
  };

  // Execute Point Update Simulation
  const runPointUpdateSimulation = () => {
    const idx = updateIdx;
    const val = updateVal;
    const nextArr = [...array];
    nextArr[idx] = val;
    setArray(nextArr);

    const nodeStatus: { [nodeId: number]: 'VISITED' | 'IN_RANGE' | 'OUT_RANGE' | 'UPDATED' } = {};
    let leafId = 8 + idx;
    let curr = leafId;
    while (curr >= 1) {
      nodeStatus[curr] = 'UPDATED';
      curr = Math.floor(curr / 2);
    }
    setActiveNodes(nodeStatus);
    setQueryResult(null);
    setLogMessage(`Đã cập nhật A[${idx}] = ${val}. Đường đi từ lá #${leafId} lên gốc #1 được tô sáng màu cam và tính toán lại.`);
    if (onEarnXP) onEarnXP(15, 'Mô phỏng Segment Tree Point Update');
  };

  const handleReset = () => {
    setActiveNodes({});
    setQueryResult(null);
    setLogMessage('Sẵn sàng. Nhấn chạy mô phỏng để xem quá trình duyệt cây.');
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#18181b] border border-[#2a2a30] rounded-xl text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-[#202024] p-1 rounded-lg border border-[#2a2a30]">
            <button
              onClick={() => { setOpMode('QUERY'); handleReset(); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                opMode === 'QUERY' ? 'bg-orange-600 text-white shadow' : 'text-[#9d9da6] hover:text-white'
              }`}
            >
              Truy vấn đoạn [L, R]
            </button>
            <button
              onClick={() => { setOpMode('UPDATE'); handleReset(); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                opMode === 'UPDATE' ? 'bg-orange-600 text-white shadow' : 'text-[#9d9da6] hover:text-white'
              }`}
            >
              Cập nhật điểm A[i] = v
            </button>
          </div>

          <div className="h-4 w-px bg-[#2a2a30] hidden sm:block"></div>

          {opMode === 'QUERY' ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#9d9da6]">L:</span>
              <select
                value={queryL}
                onChange={e => {
                  const newL = Number(e.target.value);
                  setQueryL(newL);
                  if (newL > queryR) setQueryR(newL);
                  handleReset();
                }}
                className="bg-[#202024] border border-[#2a2a30] rounded px-2 py-1 font-mono text-xs"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>

              <span className="text-[#9d9da6]">R:</span>
              <select
                value={queryR}
                onChange={e => {
                  const newR = Number(e.target.value);
                  setQueryR(newR);
                  if (newR < queryL) setQueryL(newR);
                  handleReset();
                }}
                className="bg-[#202024] border border-[#2a2a30] rounded px-2 py-1 font-mono text-xs"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>

              <button
                onClick={runRangeQuerySimulation}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition ml-1"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Chạy truy vấn</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#9d9da6]">Vị trí i:</span>
              <select
                value={updateIdx}
                onChange={e => setUpdateIdx(Number(e.target.value))}
                className="bg-[#202024] border border-[#2a2a30] rounded px-2 py-1 font-mono text-xs"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <option key={i} value={i}>A[{i}]</option>
                ))}
              </select>

              <span className="text-[#9d9da6]">Giá trị mới:</span>
              <input
                type="number"
                value={updateVal}
                onChange={e => setUpdateVal(Number(e.target.value))}
                className="w-16 bg-[#202024] border border-[#2a2a30] rounded px-2 py-1 font-mono text-xs"
              />

              <button
                onClick={runPointUpdateSimulation}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition ml-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Cập nhật</span>
              </button>
            </div>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282e] text-xs font-medium border border-[#2a2a30] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa highlight</span>
          </button>
        </div>

        {queryResult !== null && (
          <div className="text-xs font-mono px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-lg">
            Kết quả: <strong>{queryResult}</strong>
          </div>
        )}
      </div>

      {/* Log message */}
      <div className="flex items-start gap-3 p-3.5 bg-[#141416] border border-[#26262b] rounded-xl text-xs font-mono">
        <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div className="text-[#f4f4f6]">{logMessage}</div>
      </div>

      {/* Visual Tree Canvas */}
      <div className="p-4 bg-[#141416] border border-[#222226] rounded-xl overflow-x-auto flex flex-col items-center">
        <svg viewBox="0 0 600 310" className="w-full min-w-[560px] max-w-[620px] select-none">
          {/* Tree Edges */}
          {treeNodes.map(node => {
            if (node.id >= 8) return null; // Leaves have no children
            const leftChild = treeNodes.find(n => n.id === 2 * node.id);
            const rightChild = treeNodes.find(n => n.id === 2 * node.id + 1);

            return (
              <g key={`edges-${node.id}`}>
                {leftChild && (
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={leftChild.x}
                    y2={leftChild.y}
                    stroke="#2e2e36"
                    strokeWidth={1.5}
                  />
                )}
                {rightChild && (
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={rightChild.x}
                    y2={rightChild.y}
                    stroke="#2e2e36"
                    strokeWidth={1.5}
                  />
                )}
              </g>
            );
          })}

          {/* Tree Nodes */}
          {treeNodes.map(node => {
            const status = activeNodes[node.id];
            let fill = '#1c1c20';
            let stroke = '#33333b';
            let textColor = '#f4f4f6';

            if (status === 'IN_RANGE') {
              fill = '#059669'; // Emerald
              stroke = '#34d399';
              textColor = '#ffffff';
            } else if (status === 'VISITED') {
              fill = '#d97706'; // Amber partial
              stroke = '#fde68a';
              textColor = '#000000';
            } else if (status === 'OUT_RANGE') {
              fill = '#141416';
              stroke = '#26262b';
              textColor = '#4b4b54';
            } else if (status === 'UPDATED') {
              fill = '#ea580c'; // Orange
              stroke = '#fed7aa';
              textColor = '#ffffff';
            }

            return (
              <g key={`node-${node.id}`} className="transition-all duration-300">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={18}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={2}
                />
                {/* Node Sum Value */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize={11}
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.value}
                </text>
                {/* Segment Range Subtitle [L..R] */}
                <text
                  x={node.x}
                  y={node.y + 26}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize={9}
                  fontFamily="JetBrains Mono, monospace"
                >
                  [{node.l}..{node.r}]
                </text>
              </g>
            );
          })}
        </svg>

        {/* Array representation at bottom */}
        <div className="mt-4 pt-3 border-t border-[#26262b] w-full max-w-[560px]">
          <div className="text-xs text-[#9d9da6] mb-2 font-mono flex items-center justify-between">
            <span>Mảng gốc A[0..7]:</span>
            <span className="text-[11px] text-[#6d6d76]">Nhấp vào số để cập nhật nhanh</span>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {array.map((val, idx) => {
              const inQuery = opMode === 'QUERY' && idx >= queryL && idx <= queryR;
              const isUpdate = opMode === 'UPDATE' && idx === updateIdx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setUpdateIdx(idx);
                    setOpMode('UPDATE');
                  }}
                  className={`p-2 rounded-lg text-center cursor-pointer border transition ${
                    isUpdate
                      ? 'bg-orange-600/30 border-orange-500 text-orange-200'
                      : inQuery
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                      : 'bg-[#18181b] border-[#2a2a30] text-[#f4f4f6] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="text-[10px] text-[#6d6d76] font-mono">[{idx}]</div>
                  <div className="font-mono font-bold text-sm mt-0.5">{val}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-[#9d9da6]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span>Nằm trọn vẹn (Lấy giá trị)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600"></span>
            <span>Giao một phần (Đệ quy tiếp)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#141416] border border-[#2a2a30]"></span>
            <span>Nằm ngoài khoảng (Tỉa bỏ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-600"></span>
            <span>Đường dẫn cập nhật lên gốc</span>
          </div>
        </div>
      </div>
    </div>
  );
};
