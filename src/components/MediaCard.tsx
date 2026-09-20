import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';
import { playHoverTick } from '../utils/sound';
import { isItemDownloaded } from '../utils/offlineStorage';

interface MediaCardProps {
  item: MediaItem;
  isInWatchlist: boolean;
  onPlay: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  onShowToast: (msg: string, icon?: string, color?: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  isInWatchlist,
  onPlay,
  onToggleWatchlist,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloadedState, setIsDownloadedState] = useState(() =>
    isItemDownloaded(item.id, item.isDownloaded)
  );
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setIsDownloadedState(isItemDownloaded(item.id, item.isDownloaded));
    };
    window.addEventListener('neonflix_downloads_updated', handleUpdate);
    return () => window.removeEventListener('neonflix_downloads_updated', handleUpdate);
  }, [item.id, item.isDownloaded]);

  const isKofa = item.category === 'kofa';
  const isNetflix = item.category === 'netflix';
  const isGreenTea = item.category === 'greentea';

  const badgeText = isNetflix
    ? '4K FULL STREAM'
    : isKofa
    ? 'KOFA 4K ARCHIVE'
    : isGreenTea
    ? 'OFFICIAL 4K'
    : '100% FREE';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Calculate 3D tilt (-9 to +9 degrees)
    const rotateX = ((y - centerY) / centerY) * -9;
    const rotateY = ((x - centerX) / centerX) * 9;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playHoverTick();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="relative pb-10 group" style={{ perspective: '1000px' }}>
      {/* 3D Tilted Card Container with Real Outer Neon Glow (#E50914 blur 40px) + Inner Glow + Breathing Pulse */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.05, 1.05, 1.05)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered
            ? 'transform 0.08s ease-out, box-shadow 0.3s ease, border-color 0.3s ease'
            : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease, border-color 0.3s ease',
          boxShadow: isHovered
            ? '0 0 25px #E50914, 0 0 50px rgba(229, 9, 20, 0.8), inset 0 0 20px rgba(229, 9, 20, 0.45), 0 20px 45px rgba(0, 0, 0, 0.9)'
            : undefined,
        }}
        className={`relative flex flex-col bg-[#141419] rounded-xl border border-white/10 overflow-hidden chromatic-hover card-neon-pulse ${
          isHovered ? 'border-[#e50914] z-20' : 'border-white/10 z-10'
        }`}
      >
        {/* Inner Neon Edge Highlight Accent */}
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-[#e50914]/25 z-30" />

        {/* Poster Container with Light Sweep Shine & Chromatic Aberration */}
        <div
          className="relative w-full aspect-[2/3] overflow-hidden bg-[#1f1f24] cursor-pointer"
          onClick={() => onPlay(item)}
        >
          <img
            src={item.posterUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover chromatic-img transition-transform duration-500 group-hover:scale-110"
          />

          {/* Real Light Sweep Shine Across Poster (0.8s on hover from left to right) */}
          <div className="pointer-events-none absolute inset-0 -translate-x-[150%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/60 via-[#00eefc]/30 to-transparent shine-on-hover z-20" />

          {/* Vignette Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-transparent to-transparent opacity-90 z-10 pointer-events-none" />

          {/* Top Status Badges */}
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 border border-white/20 backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.8)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e479] animate-pulse" />
              <span className="font-mono-tech text-[9px] text-[#00e479] font-black tracking-wider">
                {badgeText}
              </span>
            </div>

            {isDownloadedState && (
              <div
                id={`badge-offline-card-${item.id}`}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00eefc]/25 border border-[#00eefc] text-[#00eefc] backdrop-blur-md shadow-[0_0_12px_rgba(0,238,252,0.6)]"
                title="Stored Offline: Ready for instant zero-buffering local playback"
              >
                <span
                  className="material-symbols-outlined text-[11px] text-[#00eefc]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  offline_pin
                </span>
                <span className="font-mono-tech text-[8px] text-white font-black tracking-wider uppercase drop-shadow-[0_0_4px_#00eefc]">
                  STORED OFFLINE
                </span>
              </div>
            )}
          </div>

          {item.rating && (
            <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/15 flex items-center gap-0.5 text-yellow-400 font-mono-tech text-[10px] font-bold shadow-[0_0_10px_rgba(0,0,0,0.8)]">
              <span
                className="material-symbols-outlined text-[11px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span>{item.rating}</span>
            </div>
          )}

          {/* Center Play Button on Hover */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
            <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-[0_0_30px_#e50914,0_0_50px_#e50914] transform scale-75 group-hover:scale-100 transition-transform">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </div>
        </div>

        {/* Card Info Details */}
        <div className="p-3 flex flex-col gap-2 flex-1 justify-between bg-[#141419] z-10">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[#00eefc] font-mono-tech text-[9px] font-semibold">
              <span className="truncate tracking-wider">{item.qualityTag || '4K ULTRA HD'}</span>
              <span className="text-[#e9bcb6]">{item.duration}</span>
            </div>

            {/* Title with Chromatic RGB Shift on Hover */}
            <h3
              onClick={() => onPlay(item)}
              className="font-headline text-[14px] text-white font-bold truncate chromatic-title group-hover:text-[#e50914] transition-colors cursor-pointer"
            >
              {item.title}
            </h3>

            <div className="flex items-center gap-1.5 text-[#e9bcb6] font-mono-tech text-[10px]">
              <span>{item.year}</span>
              <span>•</span>
              <span className="truncate">{item.genre}</span>
            </div>
          </div>

          {/* Action Buttons: 100% Internal Play + Save */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => {
                playHoverTick();
                onPlay(item);
              }}
              onMouseEnter={playHoverTick}
              className="flex-1 py-1.5 px-2 rounded-lg bg-[#e50914] hover:bg-[#ff1e2b] text-white font-mono-tech text-[11px] font-black tracking-wider flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(229,9,20,0.6)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
              <span>PLAY</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                playHoverTick();
                onToggleWatchlist(item);
              }}
              onMouseEnter={playHoverTick}
              title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                isInWatchlist
                  ? 'bg-[#00e479]/20 text-[#00e479] border-[#00e479]/60 shadow-[0_0_14px_rgba(0,228,121,0.4)]'
                  : 'bg-[#2a292e] text-[#e4e1e8] hover:text-white border-white/15 hover:border-white/40'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isInWatchlist ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Apple TV-Style Floor Reflection Below Card */}
      <div className="absolute -bottom-8 left-2 right-2 h-10 overflow-hidden pointer-events-none opacity-30 group-hover:opacity-70 transition-opacity duration-300 transform scale-y-[-1] rounded-b-xl -z-10">
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
};
