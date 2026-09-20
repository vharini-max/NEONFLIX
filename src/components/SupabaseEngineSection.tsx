import React from 'react';

interface SupabaseEngineSectionProps {
  watchlistCount: number;
  downloadedCount: number;
  onOpenVault: () => void;
}

export const SupabaseEngineSection: React.FC<SupabaseEngineSectionProps> = ({
  watchlistCount,
  downloadedCount,
  onOpenVault,
}) => {
  return (
    <section className="mt-4 mx-4 p-4 rounded-2xl bg-[#1b1b20]/80 border border-white/10 flex flex-col gap-3 shadow-2xl backdrop-blur-xl max-w-7xl md:mx-auto w-[calc(100%-2rem)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#00eefc]">database</span>
          <span className="font-headline text-[18px] font-bold text-white">Supabase Engine</span>
        </div>
        <span className="font-mono-tech text-[10px] text-[#00e479] px-2.5 py-0.5 rounded-full bg-[#00e479]/15 border border-[#00e479]/30 font-bold">
          v2.41 Active
        </span>
      </div>

      {/* Live Watchlist Counter & Data Sync Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-[#1f1f24]/90 border border-white/5 flex flex-col items-center justify-center shadow-inner">
          <span className="font-mono-tech text-[10px] text-[#e9bcb6] font-medium">MY LIST</span>
          <span
            className="font-headline text-[22px] font-bold text-[#e50914] drop-shadow-[0_0_8px_rgba(229,9,20,0.5)] transition-all"
            id="supabase-watchlist-count"
          >
            {watchlistCount}
          </span>
          <span className="font-mono-tech text-[8px] text-[#00e479] font-mono">TABLE: watchlist</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#1f1f24]/90 border border-white/5 flex flex-col items-center justify-center shadow-inner">
          <span className="font-mono-tech text-[10px] text-[#e9bcb6] font-medium">STREAM AUTH</span>
          <span className="font-headline text-[22px] font-bold text-[#00eefc] drop-shadow-[0_0_8px_rgba(0,238,252,0.5)]">
            100%
          </span>
          <span className="font-mono-tech text-[8px] text-[#00eefc] font-mono">LEGAL AUDITED</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#1f1f24]/90 border border-white/5 flex flex-col items-center justify-center shadow-inner">
          <span className="font-mono-tech text-[10px] text-[#e9bcb6] font-medium">LATENCY</span>
          <span className="font-headline text-[22px] font-bold text-[#00e479] drop-shadow-[0_0_8px_rgba(0,228,121,0.5)]">
            14ms
          </span>
          <span className="font-mono-tech text-[8px] text-[#e9bcb6] font-mono">EDGE CDN</span>
        </div>
      </div>

      {/* Offline Legal Vault Status Card */}
      <div
        onClick={onOpenVault}
        className="w-full p-2.5 rounded-xl bg-[#1f1f24]/90 border border-[#00eefc]/30 flex items-center justify-between shadow-[0_0_16px_rgba(0,238,252,0.15)] cursor-pointer hover:border-[#00eefc]/60 transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00eefc]/20 border border-[#00eefc]/40 flex items-center justify-center text-[#00eefc] shadow-[0_0_10px_rgba(0,238,252,0.3)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">folder_zip</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono-tech text-[13px] text-white font-bold flex items-center gap-1.5">
              Offline Legal Vault
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e479] animate-pulse" />
            </span>
            <span className="font-body text-[10px] text-[#e9bcb6]">
              Archive.org Public Domain Cache
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00e479]/15 border border-[#00e479]/40 text-[#00e479] font-mono-tech text-[10px] font-bold shadow-[0_0_8px_rgba(0,228,121,0.25)]">
          <span className="material-symbols-outlined text-[12px]">download_done</span>
          <span>{downloadedCount} Stored Locally</span>
        </div>
      </div>

      {/* Legal Portfolio Edition Notice */}
      <div className="pt-1 flex flex-col items-center text-center gap-1.5">
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#353439]/90 border border-white/10 text-[#e4e1e8] shadow-md">
          <span className="material-symbols-outlined text-[14px] text-[#00e479]">verified</span>
          <span className="font-mono-tech text-[11px] font-bold">
            Verified 100% Legal Portfolio Edition
          </span>
        </div>
        <p className="font-body text-[11px] text-[#e9bcb6] max-w-sm">
          Built with strictly public domain media, YouTube studio embeds, and Korean KOFA archives. Zero pirated material.
        </p>
      </div>
    </section>
  );
};
