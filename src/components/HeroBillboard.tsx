import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';
import { FEATURED_HEROES } from '../data/catalog';
import { playHoverTick } from '../utils/sound';
import { DuneCinematicHeroLoop } from './DuneCinematicHeroLoop';
import { getRandomHeroMovie } from '../utils/heroSelector';

interface HeroBillboardProps {
  item?: MediaItem;
  featuredItems?: MediaItem[];
  isInWatchlist?: boolean;
  onToggleWatchlist?: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  onOpenDetails?: (item: MediaItem) => void;
  onShowToast?: (msg: string, icon?: string, color?: string) => void;
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({
  item: initialItem,
  featuredItems = FEATURED_HEROES,
  onPlay,
}) => {
  // Dynamically select the hero movie from props or randomly from the catalog
  const activeMovie = useMemo(() => {
    return initialItem || getRandomHeroMovie(featuredItems);
  }, [initialItem, featuredItems]);

  const backdropImage =
    activeMovie.backdropUrl ||
    'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg';

  const handleWatchTrailer = () => {
    playHoverTick();
    onPlay(activeMovie);
  };

  // Clean primary genre and director / subtitle
  const primaryGenre =
    activeMovie.genre?.split('/')[0]?.trim() || 'Sci-Fi';

  const directorName =
    activeMovie.subtitle?.split('•')[0]?.trim() ||
    activeMovie.subtitle ||
    'Official Selection';

  return (
    <section className="relative w-full -mt-16 min-h-[92vh] sm:min-h-[95vh] lg:min-h-screen flex flex-col justify-end overflow-hidden bg-black select-none">
      {/* 
        SLOW MOTION CINEMATIC VIDEO LOOP:
        - Procedural sand particles & dust motes floating in slow-mo
        - Parallax dolly push-in camera loop (0.5x speed)
        - Neon orange (#FF7A1A) & cyan (#5EE5FF) light trails along ridges
        - Seamless 15s loop cycle with smooth backdrop crossfade
      */}
      <DuneCinematicHeroLoop backdropUrl={backdropImage} />

      {/* Cinematic Gradients: Transparent Top to Solid Black Bottom for Pristine Readability */}
      <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-[5] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 via-45% to-transparent z-[5] pointer-events-none max-w-4xl" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-[#050508] via-[#050508]/80 via-40% to-transparent z-[5] pointer-events-none" />

      {/* Hero Content Aligned Left Bottom with Smooth Fade Transition */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 md:px-16 pb-16 sm:pb-20 md:pb-24 pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMovie.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            {/* Title: In Large Bold White 72px */}
            <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-[72px] font-black text-white tracking-tight leading-[1.05] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] max-w-4xl uppercase">
              {activeMovie.title}
            </h1>

            {/* Below: Pill Badges in Soft Rounded Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {/* Match Score (green) */}
              <span className="px-3 py-1 rounded-full bg-[#00e479]/20 border border-[#00e479]/50 text-[#00e479] font-mono-tech text-xs sm:text-sm font-bold shadow-[0_0_12px_rgba(0,228,121,0.3)]">
                {activeMovie.matchScore || 98}% MATCH
              </span>

              {/* Rating with Star */}
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white font-mono-tech text-xs sm:text-sm font-semibold flex items-center gap-1.5 backdrop-blur-md">
                <span
                  className="material-symbols-outlined text-[15px] text-amber-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span>{activeMovie.rating ? activeMovie.rating.toFixed(1) : '8.6'}</span>
              </span>

              {/* Year */}
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 font-mono-tech text-xs sm:text-sm font-medium backdrop-blur-md">
                {activeMovie.year || 2024}
              </span>

              {/* Duration */}
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 font-mono-tech text-xs sm:text-sm font-medium backdrop-blur-md">
                {activeMovie.duration || '2h 15m'}
              </span>

              {/* Language */}
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 font-mono-tech text-xs sm:text-sm font-medium backdrop-blur-md">
                {activeMovie.originalLanguage || 'English'}
              </span>

              {/* Genre */}
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 font-mono-tech text-xs sm:text-sm font-medium backdrop-blur-md">
                {primaryGenre}
              </span>
            </div>

            {/* Director / Subtitle in Small Cyan Text */}
            <p className="font-headline text-xs sm:text-sm font-semibold tracking-wider text-[#5EE5FF] uppercase drop-shadow-[0_0_10px_rgba(94,229,255,0.4)]">
              {directorName}
            </p>

            {/* Description: 2 Lines Max in Gray */}
            <p className="font-body text-sm sm:text-base text-gray-300 line-clamp-2 max-w-2xl leading-relaxed text-shadow-sm">
              {activeMovie.description}
            </p>

            {/* One Button Only: Orange Rounded Pill "▶ Watch Trailer" */}
            <div className="pt-2">
              <button
                onClick={handleWatchTrailer}
                onMouseEnter={playHoverTick}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#FF7A1A] hover:bg-[#ff8f3d] text-white font-headline text-sm sm:text-base font-bold tracking-wide shadow-[0_0_28px_rgba(255,122,26,0.6)] hover:shadow-[0_0_38px_rgba(255,122,26,0.85)] transition-all hover:scale-105 active:scale-95 cursor-pointer w-fit"
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
                <span>Watch Trailer</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
