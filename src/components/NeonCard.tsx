import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';
import { playHoverTick } from '../utils/sound';
import { toggleMovieLike, isMovieLiked } from '../lib/supabase';
import { isItemDownloaded, toggleDownload } from '../utils/offlineStorage';

interface NeonCardProps {
  item: MediaItem;
  index: number;
  isInWatchlist: boolean;
  onPlay: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  onShowToast: (msg: string, icon?: string, color?: string) => void;
}

export const NeonCard: React.FC<NeonCardProps> = React.memo(({
  item,
  isInWatchlist,
  onPlay,
  onToggleWatchlist,
  onShowToast,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes || 120);
  const [isLiked, setIsLiked] = useState(() => isMovieLiked(item.id));
  const [isDownloadedState, setIsDownloadedState] = useState(() =>
    isItemDownloaded(item.id, item.isDownloaded)
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setIsDownloadedState(isItemDownloaded(item.id, item.isDownloaded));
    };
    window.addEventListener('neonflix_downloads_updated', handleUpdate);
    return () => window.removeEventListener('neonflix_downloads_updated', handleUpdate);
  }, [item.id, item.isDownloaded]);

  const isTrailer = item.badge === 'TRAILER ONLY' || item.isTrailerOnly;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // 3D tilt: max 5 to 6 degrees via direct GPU style
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    cardRef.current.style.transform = `perspective(1000px) translateY(-12px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.08, 1.08, 1.08)`;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playHoverTick();
    // Delay video preview slightly for smooth performance
    hoverTimerRef.current = setTimeout(() => {
      setShowVideoPreview(true);
    }, 450);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowVideoPreview(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) translateY(0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    playHoverTick();
    const result = toggleMovieLike(item.id);
    setIsLiked(result.isLiked);
    setLikesCount((prev) => (result.isLiked ? prev + 1 : Math.max(0, prev - 1)));
    onShowToast(
      result.isLiked ? `Liked "${item.title}"` : `Unliked "${item.title}"`,
      'favorite',
      'text-[#e50914]'
    );
  };

  return (
    <div
      className="relative pb-10 group transition-opacity duration-300"
      style={{ perspective: '1000px' }}
    >
      {/* 3D Tilted Card with Real Outer Neon Glow #E50914 Blur 40px + Inner Glow + Breathing Pulse */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: 'perspective(1000px) translateY(0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered
            ? 'box-shadow 0.25s ease, border-color 0.25s ease'
            : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease',
          boxShadow: isHovered
            ? isTrailer
              ? '0 0 12px #E50914, 0 0 28px rgba(229, 9, 20, 0.8), 0 0 50px rgba(229, 9, 20, 0.4), 0 24px 48px rgba(0, 0, 0, 0.95)'
              : '0 0 12px #00e479, 0 0 26px rgba(0, 228, 121, 0.7), 0 0 45px rgba(0, 228, 121, 0.35), 0 24px 48px rgba(0, 0, 0, 0.95)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.65), 0 12px 24px -4px rgba(0, 0, 0, 0.8)',
          willChange: 'transform',
        }}
        className={`relative flex flex-col bg-[#141419] rounded-xl border overflow-hidden chromatic-hover card-neon-pulse cursor-pointer ${
          isHovered
            ? isTrailer
              ? 'border-[#e50914] z-30'
              : 'border-[#00e479] z-30'
            : 'border-white/10 z-10'
        }`}
        onClick={() => onPlay(item)}
      >
        {/* Poster & Muted Auto-Play Preview Video Container */}
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#1a1a20]">
          {/* Static Poster with Zoom 1.2 on hover */}
          <img
            src={item.posterUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop';
            }}
            className={`w-full h-full object-cover chromatic-img transition-transform duration-500 ${
              isHovered ? 'scale-115 filter brightness-105' : 'scale-100'
            }`}
          />

          {/* Auto-Play Muted Preview Video on Hover for valid streamable media */}
          {showVideoPreview && item.videoUrl && !item.isTrailerOnly && item.badge !== 'TRAILER ONLY' && (
            <div className="absolute inset-0 z-15 bg-black">
              <video
                src={item.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/75 border border-white/20 text-[9px] font-mono-tech text-[#00eefc] backdrop-blur-md">
                PREVIEW
              </div>
            </div>
          )}

          {/* Light Sweep Shine Sweeps Across Poster from Left to Right (0.8s on hover) */}
          <div className="pointer-events-none absolute inset-0 -translate-x-[150%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/60 via-[#00eefc]/30 to-transparent shine-on-hover z-20" />

          {/* Vignette Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-transparent to-transparent opacity-90 z-10 pointer-events-none" />

          {/* Legal Badge & Stored Offline Badge: Neon Badges Container */}
          <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 items-start">
            {isTrailer ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e50914]/30 border border-[#e50914] backdrop-blur-md shadow-[0_0_12px_#e50914,0_0_24px_rgba(229,9,20,0.6)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-ping" />
                <span className="font-mono-tech text-[9px] text-white font-black tracking-wider uppercase">
                  TRAILER ONLY
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00e479]/25 border border-[#00e479] backdrop-blur-md animate-neon-flicker shadow-[0_0_12px_#00e479,0_0_24px_rgba(0,228,121,0.5)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e479] animate-pulse" />
                <span className="font-mono-tech text-[9px] text-[#00e479] font-black tracking-wider uppercase">
                  FREE & LEGAL
                </span>
              </div>
            )}

            {/* Stored Offline Visual Badge */}
            {isDownloadedState && (
              <div
                id={`badge-offline-${item.id}`}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00eefc]/25 border border-[#00eefc] text-[#00eefc] backdrop-blur-md shadow-[0_0_12px_rgba(0,238,252,0.6)] transition-all hover:scale-105"
                title="Stored Offline: Ready for instant zero-buffering local playback"
              >
                <span
                  className="material-symbols-outlined text-[12px] text-[#00eefc]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  offline_pin
                </span>
                <span className="font-mono-tech text-[8.5px] text-white font-black tracking-wider uppercase drop-shadow-[0_0_4px_#00eefc]">
                  STORED OFFLINE
                </span>
              </div>
            )}
          </div>

          {/* Language & Rating Badges */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/20 text-[#00eefc] font-mono-tech text-[9px] font-bold">
              {item.originalLanguage}
            </span>
            {item.rating && (
              <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/20 text-yellow-400 font-mono-tech text-[9px] font-bold flex items-center gap-0.5">
                ★ {item.rating}
              </span>
            )}
          </div>

          {/* Play Icon Center Button on Hover */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 backdrop-blur-[2px]">
            <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-[0_0_30px_#e50914,0_0_50px_#e50914] transform scale-75 group-hover:scale-100 transition-transform">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </div>
        </div>

        {/* Card Info Details (Glass Info Slide Up) */}
        <div className="p-3 flex flex-col gap-2 flex-1 justify-between bg-[#141419] z-10">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[#00eefc] font-mono-tech text-[9px] font-semibold">
              <span className="truncate tracking-wider">{item.qualityTag}</span>
              <span className="text-[#e9bcb6]">{item.duration}</span>
            </div>

            {/* Title with Chromatic RGB Shift on Hover */}
            <h3 className="font-headline text-[14px] text-white font-bold truncate chromatic-title group-hover:text-[#e50914] transition-colors">
              {item.title}
            </h3>

            <div className="flex items-center gap-1.5 text-[#e9bcb6] font-mono-tech text-[10px]">
              <span>{item.year}</span>
              <span>•</span>
              <span className="truncate">{item.genre}</span>
            </div>
          </div>

          {/* Action Row: Play / Trailer + Like + Save */}
          <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                playHoverTick();
                onPlay(item);
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-[#e50914] hover:bg-[#ff1e2b] text-white font-mono-tech text-[11px] font-black tracking-wider flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(229,9,20,0.6)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
              <span>{isTrailer ? 'TRAILER' : 'PLAY'}</span>
            </button>

            {/* Like Button with Glow */}
            <button
              onClick={handleLike}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                isLiked
                  ? 'bg-[#e50914]/20 text-[#e50914] border-[#e50914]/70 shadow-[0_0_14px_rgba(229,9,20,0.6)]'
                  : 'bg-[#25252b] text-[#e4e1e8] hover:text-white border-white/10 hover:border-white/30'
              }`}
              title="Like with glow"
            >
              <span
                className="material-symbols-outlined text-[15px]"
                style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </button>

            {/* Watchlist Toggle Button */}
            <button
              onClick={() => {
                playHoverTick();
                onToggleWatchlist(item);
              }}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                isInWatchlist
                  ? 'bg-[#00e479]/20 text-[#00e479] border-[#00e479]/60 shadow-[0_0_14px_rgba(0,228,121,0.4)]'
                  : 'bg-[#25252b] text-[#e4e1e8] hover:text-white border-white/10 hover:border-white/30'
              }`}
              title={isInWatchlist ? 'Remove from My List' : 'Save to My List'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isInWatchlist ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>

            {/* Offline Vault Download / Store Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playHoverTick();
                const res = toggleDownload(item.id);
                setIsDownloadedState(res.isDownloaded);
                onShowToast(
                  res.isDownloaded
                    ? `Stored "${item.title}" to Offline Vault`
                    : `Removed "${item.title}" from Offline Vault`,
                  'offline_pin',
                  'text-[#00eefc]'
                );
              }}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                isDownloadedState
                  ? 'bg-[#00eefc]/20 text-[#00eefc] border-[#00eefc]/70 shadow-[0_0_12px_rgba(0,238,252,0.5)]'
                  : 'bg-[#25252b] text-[#e4e1e8] hover:text-[#00eefc] border-white/10 hover:border-[#00eefc]/40'
              }`}
              title={
                isDownloadedState
                  ? 'Stored Offline (Click to remove from Vault)'
                  : 'Download / Store to Offline Vault'
              }
            >
              <span
                className="material-symbols-outlined text-[15px]"
                style={isDownloadedState ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {isDownloadedState ? 'offline_pin' : 'download'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Apple TV-Style Floor Reflection Below Card */}
      <div className="absolute -bottom-8 left-2 right-2 h-10 overflow-hidden pointer-events-none opacity-30 group-hover:opacity-75 transition-opacity duration-300 transform scale-y-[-1] rounded-b-xl -z-10">
        <img
          src={item.posterUrl}
          alt=""
          className="w-full h-20 object-cover filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#0d0d11]/85 to-[#0d0d11]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#e50914]/25 to-transparent mix-blend-screen" />
      </div>
    </div>
  );
});

NeonCard.displayName = 'NeonCard';
