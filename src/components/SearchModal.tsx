import React, { useState } from 'react';
import { MediaItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  watchlistIds: string[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  items,
  onPlay,
  onToggleWatchlist,
  watchlistIds,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.genre.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
        {/* Search Header */}
        <div className="flex items-center gap-3 pt-safe">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-[#00eefc]">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, series, directors, genres, languages..."
              autoFocus
              className="w-full bg-[#1b1b20] border border-white/15 focus:border-[#00eefc] rounded-xl pl-11 pr-4 py-3 text-white font-body text-[14px] placeholder-[#e9bcb6]/40 outline-none shadow-[0_0_15px_rgba(0,238,252,0.15)] transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e4e1e8]/60 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-[#2a292e] border border-white/10 flex items-center justify-center text-[#e4e1e8] hover:bg-[#353439] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Catalog' },
            { id: 'action', label: 'Action' },
            { id: 'adventure', label: 'Adventure' },
            { id: 'horror', label: 'Horror' },
            { id: 'cartoons', label: 'Cartoons' },
            { id: 'series', label: 'Series' },
            { id: 'kofa', label: 'KOFA Free' },
            { id: 'greentea', label: 'Green Tea' },
            { id: 'trailer_only', label: '4K Trailers' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full font-mono-tech text-[10px] uppercase font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#00eefc] text-black shadow-[0_0_12px_#00eefc]'
                  : 'bg-[#1b1b20] text-[#e4e1e8] border border-white/10 hover:border-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pr-1 no-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-[#e9bcb6]/40">movie_off</span>
              <p className="font-headline text-[16px] text-white">No movies found</p>
              <p className="font-body text-[12px] text-[#e9bcb6]/60">
                Try searching for "Buster Keaton", "Romero", "Korean", or "Thriller"
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSaved = watchlistIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#1b1b20]/90 border border-white/10 hover:border-[#00eefc]/50 flex items-center justify-between gap-3 transition-all group"
                >
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                    onClick={() => {
                      onPlay(item);
                      onClose();
                    }}
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-14 h-18 object-cover rounded-lg flex-shrink-0 shadow-md border border-white/10 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono-tech text-[9px] text-[#00e479] font-bold uppercase">
                        {item.streamTypeBadge}
                      </span>
                      <h4 className="font-headline text-[14px] text-white font-bold truncate">
                        {item.title}
                      </h4>
                      <p className="font-body text-[11px] text-[#e9bcb6] truncate">
                        {item.year} • {item.genre} • {item.duration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleWatchlist(item)}
                      className={`w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center cursor-pointer ${
                        isSaved ? 'text-[#00e479] bg-[#00e479]/15' : 'text-[#e4e1e8] hover:bg-[#353439]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isSaved ? 'bookmark_added' : 'bookmark_add'}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        onPlay(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#e50914] text-white font-mono-tech text-[11px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(229,9,20,0.5)] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">play_arrow</span>
                      <span>Play</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
