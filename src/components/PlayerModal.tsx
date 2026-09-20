import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, isLegalSource } from '../types';
import { playHoverTick } from '../utils/sound';
import { updateContinueWatchingDb } from '../lib/supabase';

interface PlayerModalProps {
  item: MediaItem | null;
  onClose: () => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  onShowToast: (msg: string, icon?: string, color?: string) => void;
  currentUserId?: string;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  item,
  onClose,
  isInWatchlist,
  onToggleWatchlist,
  onShowToast,
  currentUserId = 'guest_user',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);

  const isTrailerBadge = item?.badge === 'TRAILER ONLY' || item?.isTrailerOnly || item?.embedType === 'youtube';
  const hasTrailer = Boolean(item?.trailerUrl);

  const [playerMode, setPlayerMode] = useState<'stream' | 'trailer'>('trailer');
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>(() => {
    if (item?.videoUrl && isLegalSource(item.videoUrl)) return item.videoUrl;
    return '';
  });

  // Track active trailer URL & allow switching to backup trailer if primary is restricted
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string>(item?.trailerUrl || '');
  const [isUsingBackupTrailer, setIsUsingBackupTrailer] = useState(false);
  const [showUnavailableHelp, setShowUnavailableHelp] = useState(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [clarityMode, setClarityMode] = useState<'4k' | '1080p' | '720p'>('4k');
  const [showClarityMenu, setShowClarityMenu] = useState(false);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);

  // Sync whenever item changes
  useEffect(() => {
    if (!item) return;
    setCurrentTime(0);
    setVideoError(false);
    setIsBuffering(true);
    setActiveTrailerUrl(item.trailerUrl || '');
    setIsUsingBackupTrailer(false);
    setShowUnavailableHelp(false);

    const validSrc = item.videoUrl && isLegalSource(item.videoUrl) ? item.videoUrl : '';
    setCurrentVideoSrc(validSrc);

    // If item is a trailer-only release or has no direct video stream, default strictly to trailer mode
    const shouldDefaultToTrailer = isTrailerBadge || !validSrc;
    setPlayerMode(shouldDefaultToTrailer && hasTrailer ? 'trailer' : 'stream');
    setIsPlaying(true);
  }, [item?.id]);

  // Format seconds into HH:MM:SS or MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (playerMode === 'stream') {
        if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          togglePlay();
        }
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFullscreen();
        }
        if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          toggleMute();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          seekRelative(10);
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          seekRelative(-10);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, onClose, playerMode]);

  const togglePlay = () => {
    playHoverTick();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (seconds: number) => {
    playHoverTick();
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
    );
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Save progress throttled
    const now = Date.now();
    if (item && videoRef.current.duration && now - lastProgressUpdateRef.current > 4000) {
      lastProgressUpdateRef.current = now;
      const pct = (current / videoRef.current.duration) * 100;
      updateContinueWatchingDb(item.id, pct, currentUserId);
    }

    // Update buffer progress
    if (videoRef.current.buffered.length > 0) {
      const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      const dur = videoRef.current.duration || 1;
      setBufferedPercent((end / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    setIsBuffering(false);
    setVideoError(false);

    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay with sound blocked: fallback to muted autoplay
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          }
        });
    }
  };

  const handleVideoError = () => {
    // Strictly respect USER INTENT: Never substitute another movie's video!
    if (item?.trailerUrl && playerMode === 'stream') {
      setPlayerMode('trailer');
      setIsBuffering(false);
      setVideoError(false);
      onShowToast(`Streaming official original trailer for "${item.title}"`, 'smart_display', 'text-[#00eefc]');
    } else {
      setVideoError(true);
      setIsBuffering(false);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubBarRef.current || !videoRef.current || !duration) return;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const handleScrubMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubBarRef.current || !duration) return;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
    setHoverX(e.clientX - rect.left);
  };

  const toggleMute = () => {
    playHoverTick();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    onShowToast(!isMuted ? 'Muted' : 'Sound Enabled', !isMuted ? 'volume_off' : 'volume_up', 'text-[#00eefc]');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    playHoverTick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    playHoverTick();
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch {
      onShowToast('Picture-in-Picture not supported in this frame', 'info', 'text-yellow-400');
    }
  };

  const cyclePlaybackRate = () => {
    playHoverTick();
    if (!videoRef.current) return;
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    videoRef.current.playbackRate = next;
    setPlaybackRate(next);
    onShowToast(`Playback Speed: ${next}x`, 'speed', 'text-[#00eefc]');
  };

  if (!item) return null;

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,0.96)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-0 md:p-6 overflow-hidden select-none"
      onClick={onClose}
      onWheel={(e) => {
        // Close on strong scroll down gesture (like Instagram reels)
        if (e.deltaY > 90) {
          playHoverTick();
          onClose();
        }
      }}
    >
      {/* Radial Spotlight on Video */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.25)_0%,rgba(0,238,252,0.14)_35%,rgba(0,0,0,0.95)_75%)] pointer-events-none"
      />

      {/* Swipe/Scroll down indicator banner */}
      <div className="flex items-center gap-2 mb-2 text-white/50 text-[11px] font-mono-tech tracking-wider pointer-events-none select-none">
        <span className="w-8 h-1 rounded-full bg-white/30" />
        <span className="hidden sm:inline">DRAG DOWN OR SCROLL DOWN TO CLOSE</span>
      </div>

      {/* Main Player Container with drag-to-close gesture */}
      <motion.div
        ref={containerRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.75 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 450) {
            playHoverTick();
            onClose();
          }
        }}
        initial={{ scale: 0.9, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 50 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleUserActivity}
        className="relative w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] aspect-video bg-[#08080c] md:rounded-2xl border border-white/15 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_35px_rgba(229,9,20,0.3)] flex flex-col justify-between"
      >
        {/* PLAYER DISPLAY AREA */}
        {playerMode === 'trailer' && activeTrailerUrl ? (
          /* Official YouTube 4K Trailer Iframe with Original Movie Recovery Controls */
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <iframe
              key={activeTrailerUrl}
              src={`${activeTrailerUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={`${item.title} Official Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            {/* Quick Source Recovery Floater */}
            <div className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none flex-wrap gap-2">
              <div className="flex items-center gap-2 pointer-events-auto">
                {item.backupTrailerUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playHoverTick();
                      if (!isUsingBackupTrailer) {
                        setActiveTrailerUrl(item.backupTrailerUrl!);
                        setIsUsingBackupTrailer(true);
                        onShowToast(`Switched to Backup 4K Trailer for ${item.title}`, 'swap_horiz', 'text-[#00eefc]');
                      } else {
                        setActiveTrailerUrl(item.trailerUrl || '');
                        setIsUsingBackupTrailer(false);
                        onShowToast(`Switched to Primary 4K Trailer for ${item.title}`, 'swap_horiz', 'text-[#00eefc]');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black/85 hover:bg-black text-[#00eefc] border border-[#00eefc]/50 font-mono-tech text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg cursor-pointer transition-all hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                    <span>{isUsingBackupTrailer ? 'Primary Trailer' : 'Backup 4K Trailer'}</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playHoverTick();
                    setShowUnavailableHelp(!showUnavailableHelp);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-black/85 hover:bg-black text-white/80 hover:text-white border border-white/20 font-mono-tech text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg cursor-pointer transition-all"
                  title="If video says unavailable"
                >
                  <span className="material-symbols-outlined text-[15px] text-yellow-400">help_outline</span>
                  <span>Video Unavailable?</span>
                </button>
              </div>

              {item.externalWatchUrl && (
                <a
                  href={item.externalWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-mono-tech text-[11px] font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,9,20,0.6)] cursor-pointer transition-all hover:scale-105"
                >
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  <span>Watch on {item.legalSource.split(' ')[0] || 'Official Portal'}</span>
                </a>
              )}
            </div>

            {/* If YouTube shows video unavailable helper modal */}
            <AnimatePresence>
              {showUnavailableHelp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-4 md:inset-8 z-50 bg-[#0d0d12]/95 border border-white/20 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-2xl overflow-y-auto"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-14 h-20 object-cover rounded-lg border border-white/20 shadow-lg"
                      />
                      <div>
                        <span className="px-2 py-0.5 rounded bg-[#e50914] text-white font-mono-tech text-[9px] font-black uppercase">
                          Original Video Recovery
                        </span>
                        <h3 className="font-headline text-[17px] text-white font-bold mt-1">
                          {item.title}
                        </h3>
                        <p className="text-white/60 font-mono-tech text-[11px]">
                          {item.legalSource}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUnavailableHelp(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <div className="my-3 bg-white/5 p-3 rounded-xl border border-white/10 text-[12px] text-white/80 leading-relaxed">
                    <p className="font-bold text-white mb-1">
                      Does the player say "Video unavailable"?
                    </p>
                    <p className="text-white/70">
                      If YouTube restricts third-party video embedding in your browser region, switch to the official backup trailer for this exact movie or open the official publisher directly:
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {item.backupTrailerUrl && (
                      <button
                        onClick={() => {
                          playHoverTick();
                          setActiveTrailerUrl(item.backupTrailerUrl!);
                          setIsUsingBackupTrailer(true);
                          setShowUnavailableHelp(false);
                          onShowToast(`Switched to Backup 4K Trailer for ${item.title}`, 'swap_horiz', 'text-[#00eefc]');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#00eefc] text-black font-mono-tech text-[11px] font-black flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_#00eefc]"
                      >
                        <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                        <span>Load Backup Trailer for {item.title}</span>
                      </button>
                    )}

                    {item.externalWatchUrl && (
                      <a
                        href={item.externalWatchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#e50914] text-white font-mono-tech text-[11px] font-black flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_#e50914]"
                      >
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        <span>Watch on {item.legalSource}</span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        playHoverTick();
                        const current = activeTrailerUrl;
                        setActiveTrailerUrl('');
                        setTimeout(() => setActiveTrailerUrl(current), 100);
                        setShowUnavailableHelp(false);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono-tech text-[11px] font-bold cursor-pointer"
                    >
                      Reload Video
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : !currentVideoSrc ? (
          /* When item is a trailer-only release with no direct MP4 file: */
          <div
            className="relative w-full h-full bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(8,8,12,0.95), rgba(8,8,12,0.8)), url(${item.backdropUrl || item.posterUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex flex-col items-center max-w-lg z-10 gap-3">
              <span className="px-3 py-1 rounded-full bg-[#e50914]/30 border border-[#e50914] text-[#e50914] font-mono-tech text-[10px] font-black tracking-widest uppercase">
                OFFICIAL THEATRICAL RELEASE
              </span>
              <h3 className="font-headline text-[22px] md:text-[26px] text-white font-bold tracking-tight">
                {item.title}
              </h3>
              <p className="text-white/70 text-[13px] leading-relaxed line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
                {item.trailerUrl && (
                  <button
                    onClick={() => {
                      playHoverTick();
                      setPlayerMode('trailer');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-mono-tech text-[12px] font-black flex items-center gap-2 shadow-[0_0_20px_#e50914] cursor-pointer transition-all hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-[18px]">smart_display</span>
                    <span>WATCH ORIGINAL 4K TRAILER</span>
                  </button>
                )}
                {item.externalWatchUrl && (
                  <a
                    href={item.externalWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-mono-tech text-[12px] font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>STREAM ON {item.legalSource.split(' ')[0] || 'OFFICIAL'}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Real Working HTML5 Video Stream */
          <div
            className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={togglePlay}
          >
            {videoError ? (
              <div
                className="flex flex-col items-center justify-center gap-3 p-6 text-center z-20 w-full h-full relative"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(8,8,12,0.95), rgba(8,8,12,0.85)), url(${item.backdropUrl || item.posterUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-[48px] text-[#e50914]">error_outline</span>
                <p className="text-white font-headline text-[16px] font-bold">
                  Stream Interrupted for {item.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => {
                      playHoverTick();
                      setVideoError(false);
                      setIsBuffering(true);
                      if (videoRef.current) {
                        videoRef.current.load();
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#00eefc] text-black font-mono-tech text-[12px] font-bold cursor-pointer"
                  >
                    RETRY STREAM
                  </button>
                  {item.trailerUrl && (
                    <button
                      onClick={() => {
                        playHoverTick();
                        setPlayerMode('trailer');
                        setVideoError(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#e50914] text-white font-mono-tech text-[12px] font-black shadow-[0_0_15px_#e50914] cursor-pointer"
                    >
                      WATCH ORIGINAL TRAILER
                    </button>
                  )}
                  {item.externalWatchUrl && (
                    <a
                      href={item.externalWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono-tech text-[12px] font-bold cursor-pointer border border-white/20"
                    >
                      WATCH ON {item.legalSource.split(' ')[0] || 'OFFICIAL SOURCE'}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={currentVideoSrc}
                style={{
                  filter:
                    clarityMode === '4k'
                      ? 'contrast(1.08) saturate(1.06) brightness(1.02)'
                      : clarityMode === '1080p'
                      ? 'contrast(1.03) saturate(1.02)'
                      : 'none',
                  imageRendering: clarityMode === '4k' ? 'crisp-edges' : 'auto',
                }}
                className="w-full h-full object-contain pointer-events-auto transition-all duration-300"
                playsInline
                autoPlay
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onError={handleVideoError}
              />
            )}

            {/* Central Play/Pause Animation Overlay on Hover / Pause */}
            <AnimatePresence>
              {(!isPlaying || showControls) && !isBuffering && !videoError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <div className="w-18 h-18 rounded-full bg-black/60 border border-white/25 flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.5)] backdrop-blur-md">
                    <span
                      className="material-symbols-outlined text-[36px] text-white"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Muted Banner Indicator */}
            {isMuted && isPlaying && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="absolute bottom-20 left-4 z-30 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-[#00eefc] border border-[#00eefc]/50 font-mono-tech text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg cursor-pointer animate-pulse"
              >
                <span className="material-symbols-outlined text-[16px]">volume_off</span>
                <span>Audio is muted • Click to Unmute</span>
              </button>
            )}

            {/* Buffering Spinner */}
            {isBuffering && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40 z-30">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-transparent border-t-[#e50914] border-r-[#00eefc] animate-spin shadow-[0_0_20px_#e50914]" />
                  <span className="font-mono-tech text-[11px] text-white tracking-widest uppercase font-bold">
                    Buffering 4K Stream...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOP BAR OVERLAY */}
        <div
          className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/95 via-black/60 to-transparent transition-opacity duration-300 z-40 flex items-center justify-between ${
            showControls || playerMode === 'trailer' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#e50914] text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-lg active:scale-90"
              title="Close Player [ESC]"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#00e479] text-black font-mono-tech text-[9px] font-black tracking-wider shadow-[0_0_10px_#00e479]">
                  {item.qualityTag || '4K ULTRA HD'}
                </span>

                {playerMode === 'trailer' ? (
                  <span className="px-2 py-0.5 rounded bg-[#e50914] text-white font-mono-tech text-[9px] font-black tracking-wider shadow-[0_0_12px_#e50914]">
                    OFFICIAL 4K TRAILER
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-[#00eefc]/25 border border-[#00eefc] text-[#00eefc] font-mono-tech text-[9px] font-bold">
                    FULL 4K STREAM
                  </span>
                )}

                <span className="text-white/60 font-mono-tech text-[10px] hidden sm:inline truncate max-w-xs">
                  {item.legalSource}
                </span>
              </div>

              <h2 className="font-headline text-[16px] sm:text-[18px] text-white font-bold truncate mt-0.5">
                {item.title}
              </h2>
            </div>
          </div>

          {/* Right Actions: Mode Switcher + Clarity Enhancer */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mode Switcher Pill */}
            <div className="flex items-center bg-black/60 border border-white/20 rounded-xl p-0.5 backdrop-blur-md">
              <button
                onClick={() => {
                  playHoverTick();
                  setPlayerMode('stream');
                }}
                className={`px-2.5 py-1 rounded-lg font-mono-tech text-[10px] font-bold transition-all cursor-pointer ${
                  playerMode === 'stream' ? 'bg-[#00eefc] text-black' : 'text-white/70 hover:text-white'
                }`}
              >
                Stream
              </button>
              {item.trailerUrl && (
                <button
                  onClick={() => {
                    playHoverTick();
                    setPlayerMode('trailer');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono-tech text-[10px] font-bold transition-all cursor-pointer ${
                    playerMode === 'trailer' ? 'bg-[#e50914] text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Trailer
                </button>
              )}
            </div>

            {/* Clarity / Resolution Enhancement Badge */}
            <div className="relative">
              <button
                onClick={() => {
                  playHoverTick();
                  setShowClarityMenu(!showClarityMenu);
                }}
                className="px-2.5 py-1 rounded-xl bg-black/60 border border-[#00eefc]/40 hover:border-[#00eefc] text-[#00eefc] font-mono-tech text-[10px] font-black tracking-wider flex items-center gap-1 backdrop-blur-md cursor-pointer transition-all shadow-[0_0_12px_rgba(0,238,252,0.2)]"
                title="Clarity / Resolution Enhancer"
              >
                <span className="material-symbols-outlined text-[13px]">high_quality</span>
                <span>{clarityMode.toUpperCase()} CLARITY</span>
                <span className="material-symbols-outlined text-[12px]">expand_more</span>
              </button>

              {showClarityMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[#141419] border border-white/20 shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl">
                  <div className="text-[9px] font-mono-tech text-white/50 px-2 py-1 uppercase tracking-wider">
                    Video Clarity Profile
                  </div>
                  {(
                    [
                      { id: '4k', label: '4K Ultra Clarity', desc: 'Sharpened HDR Profile' },
                      { id: '1080p', label: '1080p FHD Crisp', desc: 'Natural Clarity' },
                      { id: '720p', label: '720p Standard', desc: 'Original Stream' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        playHoverTick();
                        setClarityMode(opt.id);
                        setShowClarityMenu(false);
                        onShowToast(`Video Clarity: ${opt.label}`, 'high_quality', 'text-[#00eefc]');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex flex-col transition-all cursor-pointer ${
                        clarityMode === opt.id
                          ? 'bg-[#00eefc]/20 text-[#00eefc] border border-[#00eefc]/40 font-bold'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[11px] font-mono-tech">{opt.label}</span>
                      <span className="text-[9px] text-white/40">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {playerMode === 'stream' && (
              <button
                onClick={togglePiP}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Picture-in-Picture"
              >
                <span className="material-symbols-outlined text-[18px]">picture_in_picture_alt</span>
              </button>
            )}
          </div>
        </div>

        {/* BOTTOM CONTROLS (HTML5 Stream mode) */}
        {playerMode === 'stream' && (
          <div
            className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-40 flex flex-col gap-2.5 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Seekable Progress Timeline */}
            <div
              ref={scrubBarRef}
              onClick={handleScrub}
              onMouseMove={handleScrubMouseMove}
              onMouseLeave={() => setHoverTime(null)}
              className="relative w-full h-4 flex items-center cursor-pointer group/timeline py-1"
            >
              <div className="relative w-full h-1.5 group-hover/timeline:h-2.5 bg-white/20 rounded-full transition-all overflow-hidden">
                <div
                  className="absolute top-0 left-0 bottom-0 bg-white/35 rounded-full"
                  style={{ width: `${bufferedPercent}%` }}
                />
                <div
                  className="absolute top-0 left-0 bottom-0 bg-[#e50914] shadow-[0_0_12px_#e50914] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div
                className="absolute w-3.5 h-3.5 bg-[#e50914] rounded-full shadow-[0_0_15px_#e50914] -translate-x-1/2 scale-0 group-hover/timeline:scale-100 transition-transform pointer-events-none"
                style={{ left: `${progressPercent}%` }}
              />

              {hoverTime !== null && hoverX !== null && (
                <div
                  className="absolute -top-8 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-white font-mono-tech text-[10px] -translate-x-1/2 pointer-events-none shadow-lg"
                  style={{ left: `${hoverX}px` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Controls Bottom Row */}
            <div className="flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-[#e50914] hover:bg-[#ff1e2b] text-white flex items-center justify-center shadow-[0_0_15px_#e50914] transition-transform active:scale-90 cursor-pointer"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <button
                  onClick={() => seekRelative(-10)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-[#e4e1e8] hover:text-white transition-colors cursor-pointer"
                  title="Rewind 10s"
                >
                  <span className="material-symbols-outlined text-[20px]">replay_10</span>
                </button>

                <button
                  onClick={() => seekRelative(10)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-[#e4e1e8] hover:text-white transition-colors cursor-pointer"
                  title="Forward 10s"
                >
                  <span className="material-symbols-outlined text-[20px]">forward_10</span>
                </button>

                {/* Volume & Mute */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-[#e4e1e8] hover:text-white transition-colors cursor-pointer"
                    title="Mute / Unmute (M)"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isMuted || volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'}
                    </span>
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 accent-[#e50914] h-1 bg-white/25 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Real-time Time Display */}
                <div className="font-mono-tech text-[12px] text-[#e4e1e8] tracking-wider pl-1">
                  <span className="text-white font-bold">{formatTime(currentTime)}</span>
                  <span className="text-white/40 mx-1.5">/</span>
                  <span className="text-[#e9bcb6]">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Group: Speed, Watchlist, Fullscreen */}
              <div className="flex items-center gap-2">
                <button
                  onClick={cyclePlaybackRate}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono-tech text-[11px] font-bold transition-all cursor-pointer"
                  title="Playback Speed"
                >
                  {playbackRate}x
                </button>

                <button
                  onClick={() => onToggleWatchlist(item)}
                  className={`px-3 py-1 rounded-lg border font-mono-tech text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    isInWatchlist
                      ? 'bg-[#00e479]/20 text-[#00e479] border-[#00e479]/60 shadow-[0_0_10px_rgba(0,228,121,0.3)]'
                      : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isInWatchlist ? 'bookmark_added' : 'bookmark_add'}
                  </span>
                  <span className="hidden sm:inline">{isInWatchlist ? 'Saved' : 'Watchlist'}</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Toggle Fullscreen (F)"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
