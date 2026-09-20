import React from 'react';
import { MediaItem } from '../types';
import { playHoverTick } from '../utils/sound';

interface TrendingViewProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  watchlistIds: string[];
}

export const TrendingView: React.FC<TrendingViewProps> = ({
  items,
  onPlay,
  onToggleWatchlist,
  watchlistIds,
}) => {
  // Sort or prioritize by popularity
  const sorted = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <div className="flex flex-col gap-5 px-4 pt-3 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[22px] text-white font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#e50914]">local_fire_department</span>
            Trending Cyber-Streams
          </h2>
          <p className="font-body text-[12px] text-[#e9bcb6]">
            Most active legal streams, 4K Keaton restorations, and viral Netflix trailers this week.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sorted.map((item) => {
          const isSaved = watchlistIds.includes(item.id);
          return (
            <div key={item.id} className="relative pb-3 group">
              <div
                onMouseEnter={playHoverTick}
                className="relative p-3.5 rounded-xl bg-[#141419] border border-white/10 hover:border-[#e50914] flex items-center gap-4 transition-all duration-300 shadow-xl hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(229,9,20,0.5),0_0_45px_rgba(229,9,20,0.25)] card-neon-pulse"
              >
                <div className="relative w-16 h-22 overflow-hidden rounded-lg flex-shrink-0 border border-white/15">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="pointer-events-none absolute inset-0 -translate-x-[150%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/50 to-transparent shine-on-hover z-20" />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tech text-[9px] text-[#00e479] font-bold uppercase truncate">
                      {item.streamTypeBadge}
                    </span>
                    {item.rating && (
                      <span className="font-mono-tech text-[10px] text-yellow-400 font-bold flex items-center gap-0.5">
                        ★ {item.rating}
                      </span>
                    )}
                  </div>

                  <h4 className="font-headline text-[15px] text-white font-bold truncate group-hover:text-[#e50914] transition-colors">
                    {item.title}
                  </h4>
                  <p className="font-body text-[11px] text-[#e9bcb6] truncate">{item.subtitle}</p>
                  <span className="font-mono-tech text-[10px] text-[#00eefc] mt-0.5">{item.qualityTag}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      playHoverTick();
                      onToggleWatchlist(item);
                    }}
                    onMouseEnter={playHoverTick}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
                      isSaved
                        ? 'text-[#00e479] bg-[#00e479]/20 border-[#00e479]/50 shadow-[0_0_10px_rgba(0,228,121,0.3)]'
                        : 'text-[#e4e1e8] bg-[#2a292e] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isSaved ? 'bookmark_added' : 'bookmark_add'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      playHoverTick();
                      onPlay(item);
                    }}
                    onMouseEnter={playHoverTick}
                    className="w-10 h-10 rounded-xl bg-[#e50914] hover:bg-[#ff1e2b] text-white flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.6)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </button>
                </div>
              </div>

              {/* Apple TV Floor Reflection */}
              <div className="absolute -bottom-1 left-3 right-3 h-3 overflow-hidden pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity transform scale-y-[-1] rounded-b-lg">
                <div className="w-full h-full bg-gradient-to-t from-[#e50914]/30 to-transparent blur-sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
