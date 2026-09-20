import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, LanguageFilter } from '../types';
import { playHoverTick } from '../utils/sound';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  watchlistIds: string[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  items,
  onPlay,
  onToggleWatchlist,
  watchlistIds,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedLang, setSelectedLang] = useState<LanguageFilter | 'All'>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      query.trim() === '' ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.genre.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.originalLanguage.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());

    const matchesLang = selectedLang === 'All' || item.originalLanguage === selectedLang;
    return matchesQuery && matchesLang;
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedLang]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playHoverTick();
        setSelectedIndex((prev) => (filteredItems.length ? (prev + 1) % filteredItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        playHoverTick();
        setSelectedIndex((prev) => (filteredItems.length ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        playHoverTick();
        onPlay(filteredItems[selectedIndex]);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onPlay, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-500 bg-black/85 backdrop-blur-2xl flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="relative w-full max-w-2xl bg-[#101015]/95 border border-white/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(229,9,20,0.2)] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Spotlight Input Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#16161d]/80">
            <span className="material-symbols-outlined text-[#e50914] text-[24px]">search</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, series, directors, genres (Press ↑↓ to navigate, Enter to stream)..."
              className="flex-1 bg-transparent text-white font-body text-[15px] placeholder-white/35 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-white/50 hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 border border-white/15 text-white/70 font-mono-tech text-[10px]">
              <span>ESC</span>
            </div>
          </div>

          {/* Language Quick Pills Bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border-b border-white/5 overflow-x-auto no-scrollbar">
            {(['All', 'Tamil', 'English', 'Korean', 'Chinese', 'Hindi'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  playHoverTick();
                  setSelectedLang(lang);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono-tech text-[11px] transition-all cursor-pointer ${
                  selectedLang === lang
                    ? 'bg-[#e50914] text-white font-bold shadow-[0_0_10px_#e50914]'
                    : 'bg-white/5 text-[#e9bcb6] hover:text-white hover:bg-white/10'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-white/5">
            {filteredItems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[36px] text-white/20 mb-2">movie</span>
                <p className="text-white/70 font-body text-[14px]">No legal streams matching "{query}"</p>
                <p className="text-white/40 font-mono-tech text-[11px] mt-1">
                  Try searching "General", "Housemaid", "Night", "Deadpool", or "Master"
                </p>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isWatchlisted = watchlistIds.includes(item.id);
                const isTrailer = item.badge === 'TRAILER ONLY' || item.isTrailerOnly;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      playHoverTick();
                      onPlay(item);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#e50914]/20 border border-[#e50914]/60 shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={item.posterUrl}
                        alt=""
                        className="w-11 h-15 object-cover rounded-lg border border-white/10 flex-shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline text-[14px] text-white font-bold truncate">
                            {item.title}
                          </h4>
                          {isTrailer ? (
                            <span className="px-1.5 py-0.2 rounded bg-[#e50914]/30 border border-[#e50914] text-[#ff4d5a] font-mono-tech text-[9px] font-black">
                              TRAILER
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-[#00e479]/25 border border-[#00e479] text-[#00e479] font-mono-tech text-[9px] font-black">
                              FREE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-white/50 font-mono-tech text-[11px] mt-0.5">
                          <span>{item.year}</span>
                          <span>•</span>
                          <span className="text-[#00eefc] font-bold">{item.originalLanguage}</span>
                          <span>•</span>
                          <span className="truncate">{item.genre}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          playHoverTick();
                          onToggleWatchlist(item);
                        }}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                          isWatchlisted
                            ? 'bg-[#00e479]/20 text-[#00e479] border-[#00e479]/50'
                            : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20'
                        }`}
                        title={isWatchlisted ? 'Remove' : 'Save'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isWatchlisted ? 'bookmark_added' : 'bookmark_add'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          playHoverTick();
                          onPlay(item);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#e50914] hover:bg-[#ff1e2b] text-white font-mono-tech text-[11px] font-black flex items-center gap-1 shadow-[0_0_10px_#e50914]"
                      >
                        <span>{isTrailer ? 'WATCH' : 'PLAY'}</span>
                        <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div className="px-4 py-2.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-white/50 font-mono-tech text-[11px]">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Open Stream</span>
              <span>ESC Dismiss</span>
            </div>
            <span className="text-[#00e479]">Verified Legal Index</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
