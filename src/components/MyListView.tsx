import React from 'react';
import { MediaItem } from '../types';

interface MyListViewProps {
  items: MediaItem[];
  watchlistIds: string[];
  onPlay: (item: MediaItem) => void;
  onRemoveFromWatchlist: (item: MediaItem) => void;
  onShowToast: (msg: string, icon?: string, color?: string) => void;
}

export const MyListView: React.FC<MyListViewProps> = ({
  items,
  watchlistIds,
  onPlay,
  onRemoveFromWatchlist,
}) => {
  const watchlistItems = items.filter((i) => watchlistIds.includes(i.id));

  return (
    <div className="flex flex-col gap-5 px-4 pt-3 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[22px] text-white font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#e50914]">bookmark</span>
            My Watchlist
          </h2>
          <p className="font-body text-[12px] text-[#e9bcb6]">
            Synced in real-time with Supabase edge database <code className="font-mono text-[#00eefc]">table: watchlist</code>
          </p>
        </div>

        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#e50914]/15 border border-[#e50914]/40 text-[#ffb4aa] font-mono-tech text-[11px] font-bold">
          <span>{watchlistItems.length} Saved</span>
        </div>
      </div>

      {watchlistItems.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-[#e9bcb6]/30">bookmark_border</span>
          <h3 className="font-headline text-[18px] text-white font-bold">Your Watchlist is Empty</h3>
          <p className="font-body text-[13px] text-[#e9bcb6]/70 max-w-sm">
            Tap the bookmark or plus icon on any public domain movie or trailer to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {watchlistItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#1b1b20] border border-white/10 hover:border-[#e50914]/50 flex items-center gap-3 transition-all shadow-md group"
            >
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-16 h-22 object-cover rounded-lg flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-mono-tech text-[9px] text-[#00e479] font-bold uppercase truncate">
                  {item.streamTypeBadge}
                </span>
                <h4 className="font-headline text-[14px] text-white font-bold truncate">{item.title}</h4>
                <p className="font-body text-[11px] text-[#e9bcb6] truncate">
                  {item.year} • {item.genre} • {item.duration}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onPlay(item)}
                    className="px-3 py-1 rounded-lg bg-[#e50914] text-white font-mono-tech text-[10px] font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(229,9,20,0.5)] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                    <span>Play</span>
                  </button>
                  <button
                    onClick={() => onRemoveFromWatchlist(item)}
                    className="px-2 py-1 rounded-lg bg-[#353439] hover:bg-[#39393e] text-[#e9bcb6] hover:text-white font-mono-tech text-[10px] flex items-center gap-0.5 border border-white/5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">delete</span>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
