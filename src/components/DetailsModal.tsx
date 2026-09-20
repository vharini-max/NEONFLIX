import React from 'react';
import { MediaItem } from '../types';

interface DetailsModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onPlay: (item: MediaItem) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  item,
  onClose,
  onPlay,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#1b1b20] border border-white/15 p-5 flex flex-col gap-4 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#00eefc]">info</span>
            <h3 className="font-headline text-[18px] text-white font-bold truncate">{item.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1f1f24] border border-white/10 flex items-center justify-center text-[#e4e1e8] hover:bg-[#2a292e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Poster & Synopsis */}
        <div className="flex gap-4">
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-28 h-40 object-cover rounded-xl border border-white/10 flex-shrink-0 shadow-lg"
          />
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="font-mono-tech text-[10px] text-[#00e479] font-bold uppercase">
              {item.qualityTag}
            </span>
            <h4 className="font-headline text-[16px] text-white font-bold">{item.subtitle}</h4>
            <div className="flex items-center gap-2 text-[#e9bcb6] font-mono-tech text-[11px] flex-wrap">
              <span>{item.year}</span>
              <span>•</span>
              <span>{item.genre}</span>
              <span>•</span>
              <span>{item.duration}</span>
            </div>
            {item.rating && (
              <div className="flex items-center gap-1 text-[#00eefc] font-mono-tech text-[11px] font-bold">
                <span
                  className="material-symbols-outlined text-[13px] text-yellow-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span>{item.rating} / 10 IMDb</span>
              </div>
            )}
          </div>
        </div>

        <p className="font-body text-[13px] text-[#e4e1e8]/90 leading-relaxed">
          {item.description}
        </p>

        {/* Audio/Video Technical Specs */}
        {item.audioSpecs && (
          <div className="p-3 rounded-xl bg-[#1f1f24] border border-white/10 flex flex-col gap-1.5">
            <span className="font-mono-tech text-[10px] text-[#00eefc] font-bold uppercase">
              Master Format Specifications
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.audioSpecs.map((spec) => (
                <span
                  key={spec}
                  className="px-2 py-0.5 rounded bg-[#353439] border border-white/10 text-white font-mono-tech text-[10px]"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Legal Origin Box */}
        <div className="p-3 rounded-xl bg-[#0e0e12] border border-[#00e479]/30 flex items-start gap-2 text-[#00e479]">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">
            verified_user
          </span>
          <div className="flex flex-col text-[11px]">
            <span className="font-mono-tech font-bold uppercase">Verified Rights & Copyright</span>
            <span className="text-[#e9bcb6]">{item.legalSource}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              onPlay(item);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#e50914] text-white font-mono-tech text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(229,9,20,0.5)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
            <span>{item.isTrailerOnly ? 'Watch 4K Trailer' : 'Stream Master'}</span>
          </button>

          <button
            onClick={() => onToggleWatchlist(item)}
            className="px-4 py-2.5 rounded-xl bg-[#2a292e] hover:bg-[#353439] text-[#e4e1e8] font-mono-tech text-[13px] flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isInWatchlist ? 'bookmark_added' : 'bookmark'}
            </span>
            <span>{isInWatchlist ? 'In Watchlist' : 'Add to List'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
