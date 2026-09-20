import React, { useState, useMemo } from 'react';
import { MediaItem, LanguageFilter } from '../types';
import { NeonCard } from './NeonCard';
import { playHoverTick } from '../utils/sound';
import { isItemDownloaded } from '../utils/offlineStorage';

interface MediaShelfProps {
  items: MediaItem[];
  selectedLanguage: LanguageFilter;
  watchlistIds: string[];
  continueWatchingItems?: { movie_id: string; progress: number }[];
  onPlay: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  onShowToast: (message: string, icon?: string, color?: string) => void;
}

export const MediaShelf: React.FC<MediaShelfProps> = React.memo(({
  items,
  selectedLanguage,
  watchlistIds,
  continueWatchingItems = [],
  onPlay,
  onToggleWatchlist,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'rails' | 'grid'>('rails');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Filter items by language
  const filteredByLanguage = useMemo(() => {
    if (selectedLanguage === 'All') return items;
    return items.filter((item) => item.originalLanguage === selectedLanguage);
  }, [items, selectedLanguage]);

  // Category rows memoized
  const actionItems = useMemo(
    () => filteredByLanguage.filter(
      (i) => i.category === 'action' || i.genre.toLowerCase().includes('action') || i.genre.toLowerCase().includes('combat')
    ),
    [filteredByLanguage]
  );

  const adventureItems = useMemo(
    () => filteredByLanguage.filter(
      (i) => i.category === 'adventure' || i.genre.toLowerCase().includes('adventure') || i.genre.toLowerCase().includes('odyssey') || i.genre.toLowerCase().includes('epic')
    ),
    [filteredByLanguage]
  );

  const horrorItems = useMemo(
    () => filteredByLanguage.filter(
      (i) => i.category === 'horror' || i.genre.toLowerCase().includes('horror') || i.genre.toLowerCase().includes('gothic')
    ),
    [filteredByLanguage]
  );

  const cartoonItems = useMemo(
    () => filteredByLanguage.filter(
      (i) => i.category === 'cartoons' || i.genre.toLowerCase().includes('animation') || i.genre.toLowerCase().includes('cartoon')
    ),
    [filteredByLanguage]
  );

  const seriesItems = useMemo(
    () => filteredByLanguage.filter(
      (i) => i.category === 'series' || i.duration.toLowerCase().includes('season') || i.duration.toLowerCase().includes('episode')
    ),
    [filteredByLanguage]
  );

  const kofaItems = useMemo(() => filteredByLanguage.filter((i) => i.category === 'kofa'), [filteredByLanguage]);
  const greenteaItems = useMemo(() => filteredByLanguage.filter((i) => i.category === 'greentea'), [filteredByLanguage]);
  const hollywoodItems = useMemo(() => filteredByLanguage.filter((i) => i.category === 'hollywood'), [filteredByLanguage]);
  const trendingItems = useMemo(() => filteredByLanguage.filter((i) => i.category === 'trending'), [filteredByLanguage]);
  const trailerItems = useMemo(() => filteredByLanguage.filter((i) => i.isTrailerOnly || i.category === 'trailer_only' || i.category === 'netflix'), [filteredByLanguage]);
  const offlineItems = useMemo(() => filteredByLanguage.filter((i) => isItemDownloaded(i.id, i.isDownloaded)), [filteredByLanguage]);

  // Resolved items if user clicks a genre pill
  const activeGenreItems = useMemo(() => {
    if (selectedGenre === 'offline') return offlineItems;
    if (selectedGenre === 'action') return actionItems;
    if (selectedGenre === 'adventure') return adventureItems;
    if (selectedGenre === 'horror') return horrorItems;
    if (selectedGenre === 'cartoons') return cartoonItems;
    if (selectedGenre === 'series') return seriesItems;
    if (selectedGenre === 'trailers') return trailerItems;
    return filteredByLanguage;
  }, [selectedGenre, offlineItems, actionItems, adventureItems, horrorItems, cartoonItems, seriesItems, trailerItems, filteredByLanguage]);

  // Continue watching resolved items
  const continueWatchingList = useMemo(() => {
    return continueWatchingItems
      .map((cw) => {
        const match = items.find((i) => i.id === cw.movie_id);
        return match ? { ...match, continueProgress: cw.progress } : null;
      })
      .filter(Boolean) as MediaItem[];
  }, [continueWatchingItems, items]);

  const renderHorizontalRail = (
    title: string,
    subtitle: string,
    badgeText: string,
    badgeColor: string,
    railItems: MediaItem[]
  ) => {
    if (railItems.length === 0) return null;

    return (
      <div className="flex flex-col gap-3">
        {/* Rail Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4.5 rounded-full bg-[#e50914] shadow-[0_0_10px_#e50914]" />
            <h3 className="font-headline text-[17px] sm:text-[19px] text-white font-bold tracking-tight">
              {title}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full font-mono-tech text-[9px] font-black tracking-wider uppercase border ${badgeColor}`}
            >
              {badgeText}
            </span>
          </div>
          <span className="text-white/45 font-mono-tech text-[11px] hidden sm:inline">
            {subtitle}
          </span>
        </div>

        {/* Responsive Rail Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
          {railItems.map((item, idx) => (
            <NeonCard
              key={item.id}
              item={item}
              index={idx}
              isInWatchlist={watchlistIds.includes(item.id)}
              onPlay={onPlay}
              onToggleWatchlist={onToggleWatchlist}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      </div>
    );
  };

  const GENRE_PILLS = [
    { id: 'all', label: 'All Channels', icon: 'auto_awesome' },
    { id: 'offline', label: 'Stored Offline', icon: 'offline_pin', count: offlineItems.length },
    { id: 'action', label: 'Action & Thrillers', icon: 'local_fire_department', count: actionItems.length },
    { id: 'adventure', label: 'Adventures', icon: 'explore', count: adventureItems.length },
    { id: 'horror', label: 'Horror & Chills', icon: 'skull', count: horrorItems.length },
    { id: 'cartoons', label: 'Cartoons & Animation', icon: 'palette', count: cartoonItems.length },
    { id: 'series', label: 'Web Series', icon: 'tv', count: seriesItems.length },
    { id: 'trailers', label: 'Original Trailers Only', icon: 'movie', count: trailerItems.length },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full px-4 pb-12">
      {/* Category & Genre Quick Filter Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        {/* Genre Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
          {GENRE_PILLS.map((genre) => {
            const isActive = selectedGenre === genre.id;
            return (
              <button
                key={genre.id}
                onClick={() => {
                  playHoverTick();
                  setSelectedGenre(genre.id);
                }}
                className={`px-3 py-1.5 rounded-xl font-mono-tech text-[11px] font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-[#e50914] text-white shadow-[0_0_15px_#e50914] scale-105'
                    : 'bg-[#18181f] text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{genre.icon}</span>
                <span>{genre.label}</span>
                {genre.count !== undefined && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {genre.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Curated Channels vs Grid */}
        <div className="flex items-center gap-1 bg-[#18181f] p-1 rounded-xl border border-white/10 self-end sm:self-center">
          <button
            onClick={() => {
              playHoverTick();
              setViewMode('rails');
            }}
            className={`px-3 py-1 rounded-lg font-mono-tech text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'rails'
                ? 'bg-[#e50914] text-white shadow-[0_0_12px_#e50914]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">view_carousel</span>
            <span className="hidden sm:inline">Curated Channels</span>
          </button>
          <button
            onClick={() => {
              playHoverTick();
              setViewMode('grid');
            }}
            className={`px-3 py-1 rounded-lg font-mono-tech text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#e50914] text-white shadow-[0_0_12px_#e50914]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">grid_view</span>
            <span className="hidden sm:inline">All Grid</span>
          </button>
        </div>
      </div>

      {/* CONTINUE WATCHING ROW */}
      {continueWatchingList.length > 0 && selectedLanguage === 'All' && selectedGenre === 'all' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4.5 rounded-full bg-[#00eefc] shadow-[0_0_10px_#00eefc]" />
              <h3 className="font-headline text-[17px] text-white font-bold">Continue Watching</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#00eefc]/20 text-[#00eefc] font-mono-tech text-[9px] font-bold border border-[#00eefc]/40">
                Resumable Stream
              </span>
            </div>
            <span className="text-white/40 font-mono-tech text-[11px]">Synced with Supabase</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {continueWatchingList.map((item, idx) => (
              <div key={'cw_' + item.id} className="flex flex-col gap-1.5">
                <NeonCard
                  item={item}
                  index={idx}
                  isInWatchlist={watchlistIds.includes(item.id)}
                  onPlay={onPlay}
                  onToggleWatchlist={onToggleWatchlist}
                  onShowToast={onShowToast}
                />
                <div className="px-1 -mt-8 mb-2 z-20">
                  <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#00eefc] font-bold mb-1">
                    <span>Progress</span>
                    <span>{item.continueProgress || 50}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#e50914] to-[#00eefc] shadow-[0_0_10px_#e50914]"
                      style={{ width: `${item.continueProgress || 50}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE SWITCH */}
      {viewMode === 'grid' || selectedGenre !== 'all' ? (
        /* Filtered Grid View for specific genre or grid layout */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-white/60 font-mono-tech text-[12px]">
            <span>Showing {activeGenreItems.length} titles in {selectedGenre === 'all' ? 'All Channels' : selectedGenre.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {activeGenreItems.map((item, idx) => (
              <NeonCard
                key={item.id}
                item={item}
                index={idx}
                isInWatchlist={watchlistIds.includes(item.id)}
                onPlay={onPlay}
                onToggleWatchlist={onToggleWatchlist}
                onShowToast={onShowToast}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Curated Multi-Channel Rails */
        <div className="flex flex-col gap-10">
          {/* Stored Offline Dedicated Rail */}
          {offlineItems.length > 0 &&
            renderHorizontalRail(
              'Stored Offline • Zero-Latency Vault Masters',
              'Locally cached 4K titles ready for immediate playback without internet buffering',
              'STORED OFFLINE',
              'bg-[#00eefc]/20 text-[#00eefc] border-[#00eefc]/50 shadow-[0_0_12px_rgba(0,238,252,0.3)]',
              offlineItems
            )}

          {/* 1. Action Blockbusters & Adrenaline Thrillers */}
          {renderHorizontalRail(
            'Action Blockbusters & Adrenaline Thrillers',
            'High-Octane Stunts, Gun-Fu & Explosive Combat Masters • Original 4K Trailers',
            'ACTION 4K',
            'bg-red-500/20 text-red-400 border-red-500/40',
            actionItems
          )}

          {/* 2. Epic Adventures & Odysseys */}
          {renderHorizontalRail(
            'Epic Adventures & Visual Odysseys',
            'Spectacular World-Building, Expeditions & Mythic Quests • Original 4K Trailers',
            'ADVENTURE 4K',
            'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
            adventureItems
          )}

          {/* 3. Horror, Gothic & Supernatural Chills */}
          {renderHorizontalRail(
            'Horror, Gothic & Supernatural Chills',
            'Atmospheric Dread, Cosmic Terror & Restored Spine-Tingling Classics',
            'HORROR 4K',
            'bg-purple-600/25 text-purple-300 border-purple-500/40',
            horrorItems
          )}

          {/* 4. Cartoons, Animation & Family Masters */}
          {renderHorizontalRail(
            'Cartoons, Modern Animation & Classic Shorts',
            'DreamWorks, Pixar, Fleischer Technicolor & Public Domain Animation',
            'CARTOONS HD',
            'bg-amber-500/20 text-amber-300 border-amber-500/40',
            cartoonItems
          )}

          {/* 5. Web Series & Full Episodic Dramas */}
          {renderHorizontalRail(
            'Web Series & Full Episodic Dramas',
            'Official Multi-Episode Releases with High Clarity 4K / FHD Stream',
            'SERIES 4K',
            'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
            seriesItems
          )}

          {/* 6. Korean Cinema & KOFA Restorations */}
          {renderHorizontalRail(
            'Korean Dramas & Golden Age Masters',
            'Official KOFA Korean Film Archive Preservation Scans • 100% Legal',
            'KOFA 100% FREE',
            'bg-[#00e479]/20 text-[#00e479] border-[#00e479]/40',
            kofaItems
          )}

          {/* 7. Chinese Cinema & Wuxia Classics */}
          {renderHorizontalRail(
            'Chinese Dramas & Wuxia Classics',
            'Green Tea Chinese Dramas Official Channels • 4K Full Episodes',
            'GREEN TEA 4K',
            'bg-[#00eefc]/20 text-[#00eefc] border-[#00eefc]/40',
            greenteaItems
          )}

          {/* 8. Hollywood Public Domain Masterpieces */}
          {renderHorizontalRail(
            'Hollywood Public Domain Masterpieces',
            'Internet Archive & US Copyright Free Theatrical Masters',
            'PUBLIC DOMAIN',
            'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
            hollywoodItems
          )}

          {/* 9. Trending Archival Restorations */}
          {renderHorizontalRail(
            'Trending Archival Restorations',
            'High-Resolution Restorations Indexed from National Archives',
            'TRENDING 4K',
            'bg-purple-500/20 text-purple-300 border-purple-500/40',
            trendingItems
          )}

          {/* 10. Official Theatrical Trailers Only */}
          {renderHorizontalRail(
            'Official Theatrical Trailers Only',
            'Strict Legal Zero-Piracy • 4K Theatrical Original Trailers',
            'TRAILER ONLY',
            'bg-[#e50914]/25 text-[#ff4d5a] border-[#e50914]/50',
            trailerItems
          )}
        </div>
      )}
    </div>
  );
});

MediaShelf.displayName = 'MediaShelf';
