import React from 'react';
import { FilterKey } from '../types';
import { playHoverTick } from '../utils/sound';

interface CategorySelectorProps {
  activeFilter: FilterKey;
  onSelectFilter: (filter: FilterKey) => void;
}

interface CategoryOption {
  key: FilterKey;
  label: string;
  icon?: string;
  iconColor?: string;
}

const CATEGORIES: CategoryOption[] = [
  { key: 'all', label: 'ALL CHANNELS' },
  { key: 'cartoons', label: 'CARTOONS & ANIMATION', icon: 'animation', iconColor: 'text-amber-400' },
  { key: 'series', label: 'WEB SERIES', icon: 'subscriptions', iconColor: 'text-emerald-400' },
  { key: 'hollywood', label: 'HOLLYWOOD ARCHIVE', icon: 'public', iconColor: 'text-[#00e479]' },
  { key: 'kofa', label: 'KOFA KOREA', icon: 'movie_filter', iconColor: 'text-[#00eefc]' },
  { key: 'greentea', label: 'GREEN TEA OFFICIAL', icon: 'tv_gen', iconColor: 'text-[#00e479]' },
  { key: 'netflix', label: '4K TRAILERS ONLY', icon: 'smart_display', iconColor: 'text-[#ffb4aa]' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="sticky top-16 z-30 w-full px-4 py-2.5 bg-[#0d0d11]/80 glass-pro border-y border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                playHoverTick();
                onSelectFilter(cat.key);
              }}
              onMouseEnter={playHoverTick}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono-tech text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#e50914] text-white neon-glow border border-white/30 font-bold scale-[1.03]'
                  : 'bg-[#1f1f24]/80 text-[#e4e1e8] hover:bg-[#2a292e] border border-white/10 hover:border-white/25 hover:text-white'
              }`}
            >
              {isActive ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ) : cat.icon ? (
                <span className={`material-symbols-outlined text-[14px] ${cat.iconColor || 'text-white'}`}>
                  {cat.icon}
                </span>
              ) : null}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
