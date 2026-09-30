import React, { useState } from 'react';
import { SieveVisualizer } from '../visualizers/SieveVisualizer';
import { DijkstraVisualizer } from '../visualizers/DijkstraVisualizer';
import { SegmentTreeVisualizer } from '../visualizers/SegmentTreeVisualizer';
import { DSUVisualizer } from '../visualizers/DSUVisualizer';
import { TwoPointersVisualizer } from '../visualizers/TwoPointersVisualizer';
import { BinarySearchVisualizer } from '../visualizers/BinarySearchVisualizer';
import { KadaneVisualizer } from '../visualizers/KadaneVisualizer';
import { KMPVisualizer } from '../visualizers/KMPVisualizer';

interface VisualizerViewProps {
  onEarnXP: (amount: number, reason: string) => void;
}

type VisTab = 'kadane' | 'kmp' | 'sieve' | 'dijkstra' | 'segment_tree' | 'dsu' | 'two_pointers' | 'binary_search';

export const VisualizerView: React.FC<VisualizerViewProps> = ({ onEarnXP }) => {
  const [activeTab, setActiveTab] = useState<VisTab>('kadane');

  const tabs: { id: VisTab; label: string; icon: string; desc: string }[] = [
    { id: 'kadane', label: 'Kadane & Prefix Sum', icon: '⚡', desc: 'Đoạn con tổng lớn nhất O(N) và truy vấn tổng O(1)' },
    { id: 'kmp', label: 'Thuật toán KMP', icon: '🔤', desc: 'Khớp mẫu xâu ký tự O(N + M) và xây dựng mảng pi' },
    { id: 'sieve', label: 'Sàng Eratosthenes', icon: '🧮', desc: 'Mô phỏng sàng số nguyên tố và loại bỏ bội số' },
    { id: 'dijkstra', label: 'Dijkstra', icon: '🛰️', desc: 'Đường đi ngắn nhất nguồn đơn với Min-Heap' },
    { id: 'segment_tree', label: 'Segment Tree', icon: '🌲', desc: 'Truy vấn đoạn và cập nhật điểm trên cây nhị phân' },
    { id: 'dsu', label: 'DSU & Rừng cây', icon: '🔗', desc: 'Hợp các tập rời, Find với nén đường dẫn, Union by size' },
    { id: 'two_pointers', label: 'Hai con trỏ', icon: '↔️', desc: 'Kỹ thuật hai con trỏ tìm cặp số có tổng đích trên mảng đã sắp xếp' },
    { id: 'binary_search', label: 'Binary Search', icon: '🔍', desc: 'Tìm kiếm nhị phân chia đôi không gian O(log N)' },
  ];

  const currentTabObj = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#f4f4f6]">
          Algorithm Visualizer
        </h2>
        <p className="text-xs sm:text-sm text-[#9d9da6] mt-1">
          Mô phỏng tương tác từng bước thực thi thuật toán để nắm bắt bản chất và bất biến toán học
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#202024] text-white border-[#3a3a42] shadow-sm font-semibold'
                  : 'bg-[#18181b] text-[#9d9da6] border-[#26262b] hover:border-[#383842] hover:text-[#f4f4f6]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#26262b] text-xs text-[#9d9da6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{currentTabObj.icon}</span>
          <span className="text-[#f4f4f6] font-medium">{currentTabObj.label}:</span>
          <span>{currentTabObj.desc}</span>
        </div>
      </div>

      {/* Active Visualizer Component */}
      <div className="rounded-2xl bg-[#18181b] border border-[#26262b] p-4 sm:p-6">
        {activeTab === 'kadane' && <KadaneVisualizer onEarnXP={onEarnXP} />}
        {activeTab === 'kmp' && <KMPVisualizer onEarnXP={onEarnXP} />}
        {activeTab === 'sieve' && <SieveVisualizer onEarnXP={onEarnXP} />}
        {activeTab === 'dijkstra' && <DijkstraVisualizer onEarnXP={onEarnXP} />}
        {activeTab === 'segment_tree' && <SegmentTreeVisualizer onEarnXP={onEarnXP} />}
        {activeTab === 'dsu' && <DSUVisualizer onEarnXP={onEarnXP} />}
        {activeTab === 'two_pointers' && <TwoPointersVisualizer onEarnXP={onEarnXP} />}
        {activeTab === 'binary_search' && <BinarySearchVisualizer onEarnXP={onEarnXP} />}
      </div>
    </div>
  );
};
