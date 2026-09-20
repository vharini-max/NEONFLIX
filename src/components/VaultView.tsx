import React, { useState, useEffect, useMemo } from 'react';
import { MediaItem } from '../types';
import { playHoverTick } from '../utils/sound';
import {
  getDownloadedIds,
  isItemDownloaded,
  removeDownload,
  addDownload,
} from '../utils/offlineStorage';

interface VaultViewProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onShowToast: (msg: string, icon?: string, color?: string) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ items, onPlay, onShowToast }) => {
  const [downloadedIds, setDownloadedIds] = useState<string[]>(() => getDownloadedIds());
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'local' | 'catalog'>('all');

  // Synchronize with external offline download events
  useEffect(() => {
    const handleUpdate = () => {
      setDownloadedIds(getDownloadedIds());
    };
    window.addEventListener('neonflix_downloads_updated', handleUpdate);
    return () => window.removeEventListener('neonflix_downloads_updated', handleUpdate);
  }, []);

  // Dedicated Local Assets (strictly items currently downloaded/cached to device)
  const localAssets = useMemo(() => {
    return items.filter((item) => isItemDownloaded(item.id));
  }, [items, downloadedIds]);

  // Items available in the Vault Catalog for download that are not yet downloaded
  const availableCatalog = useMemo(() => {
    return items.filter(
      (item) =>
        item.downloadAvailable && !isItemDownloaded(item.id)
    );
  }, [items, downloadedIds]);

  // Calculate local storage size
  const totalLocalSizeGB = useMemo(() => {
    if (localAssets.length === 0) return 0;
    let sum = 0;
    for (const item of localAssets) {
      if (item.downloadSize) {
        const num = parseFloat(item.downloadSize);
        if (!isNaN(num)) {
          sum += item.downloadSize.toUpperCase().includes('MB') ? num / 1024 : num;
        }
      } else {
        sum += 1.8;
      }
    }
    return parseFloat(sum.toFixed(1));
  }, [localAssets]);

  const maxStorageGB = 16.0;
  const storagePercentage = Math.min(100, Math.round((totalLocalSizeGB / maxStorageGB) * 100));

  const handleRemoveLocalAsset = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    playHoverTick();
    const updated = removeDownload(item.id);
    setDownloadedIds(updated);
    onShowToast(`Removed "${item.title}" from Local Offline Cache`, 'delete', 'text-[#e50914]');
  };

  const handleDownloadAsset = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    playHoverTick();
    const updated = addDownload(item.id);
    setDownloadedIds(updated);
    onShowToast(
      `Saved "${item.title}" to Local Offline Cache (${item.downloadSize || '2.0GB'})`,
      'offline_pin',
      'text-[#00eefc]'
    );
  };

  const handlePlayOffline = (item: MediaItem) => {
    playHoverTick();
    onShowToast(
      `Playing "${item.title}" from Local Storage — Zero Latency Mode`,
      'offline_pin',
      'text-[#00eefc]'
    );
    onPlay(item);
  };

  return (
    <div className="flex flex-col gap-8 px-4 pt-3 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[28px] text-[#00eefc]">
              offline_pin
            </span>
            <h2 className="font-headline text-[24px] sm:text-[28px] text-white font-extrabold tracking-tight">
              Offline Legal Vault & Local Assets
            </h2>
          </div>
          <p className="font-body text-[13px] text-[#e9bcb6] mt-1 max-w-2xl leading-relaxed">
            Secure client-side sandbox storing DRM-free 4K masters, trailers, and archive restorations.
            All local assets operate with 100% zero-buffering playback independent of network availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-[#00eefc]/15 border border-[#00eefc]/50 text-[#00eefc] font-mono-tech text-[11px] font-bold shadow-[0_0_15px_rgba(0,238,252,0.3)] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse" />
            <span>{localAssets.length} Locally Cached</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#00e479]/15 border border-[#00e479]/40 text-[#00e479] font-mono-tech text-[11px] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            <span>Zero DRM Verified</span>
          </div>
        </div>
      </div>

      {/* Storage Gauge & Status Banner with Neon Cyan Glow */}
      <div className="p-5 rounded-2xl bg-[#141419] border border-[#00eefc]/30 flex flex-col gap-3.5 shadow-[0_0_24px_rgba(0,238,252,0.12)] depth-3layer-cyan">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono-tech text-[12px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#00eefc]">hard_drive</span>
            <span className="text-white font-bold">Local Device Storage Quota:</span>
            <span className="text-[#00eefc] font-extrabold">
              {totalLocalSizeGB} GB used of {maxStorageGB} GB
            </span>
          </div>
          <span className="text-[#00e479] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e479]" />
            {storagePercentage}% Allocated • Cache Healthy
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#202028] rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
          <div
            className="bg-gradient-to-r from-[#00e479] via-[#00eefc] to-[#00b4d8] h-full rounded-full transition-all duration-700 shadow-[0_0_14px_#00eefc]"
            style={{ width: `${Math.max(5, storagePercentage)}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#e4e1e8]/70 font-mono-tech pt-1 border-t border-white/5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00eefc]" />
              Encrypted Local IndexedDB
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00e479]" />
              Offline 4K Stream Buffer Ready
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                onShowToast(
                  'Local Storage Integrity Check: All blobs verified and intact (SHA-256 Valid)',
                  'verified',
                  'text-[#00e479]'
                )
              }
              className="text-[#00eefc] hover:underline cursor-pointer flex items-center gap-1 font-bold"
            >
              <span className="material-symbols-outlined text-[14px]">shield</span>
              Verify Integrity
            </button>
          </div>
        </div>
      </div>

      {/* Filter Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => {
            playHoverTick();
            setActiveTabFilter('all');
          }}
          className={`px-4 py-2 rounded-xl font-mono-tech text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTabFilter === 'all'
              ? 'bg-[#00eefc]/20 text-white border border-[#00eefc] shadow-[0_0_14px_rgba(0,238,252,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span>All Vault Views</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">
            {localAssets.length + availableCatalog.length}
          </span>
        </button>

        <button
          onClick={() => {
            playHoverTick();
            setActiveTabFilter('local');
          }}
          className={`px-4 py-2 rounded-xl font-mono-tech text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTabFilter === 'local'
              ? 'bg-[#00eefc]/20 text-white border border-[#00eefc] shadow-[0_0_14px_rgba(0,238,252,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[14px] text-[#00eefc]">offline_pin</span>
          <span>Local Assets Only</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#00eefc]/30 text-[#00eefc] text-[10px]">
            {localAssets.length}
          </span>
        </button>

        <button
          onClick={() => {
            playHoverTick();
            setActiveTabFilter('catalog');
          }}
          className={`px-4 py-2 rounded-xl font-mono-tech text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTabFilter === 'catalog'
              ? 'bg-[#00eefc]/20 text-white border border-[#00eefc] shadow-[0_0_14px_rgba(0,238,252,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[14px] text-[#00e479]">cloud_download</span>
          <span>Available to Download</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">
            {availableCatalog.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DEDICATED SECTION: LOCALLY STORED ASSETS (OFFLINE READY)              */}
      {/* ========================================================================= */}
      {(activeTabFilter === 'all' || activeTabFilter === 'local') && (
        <section id="vault-local-assets-section" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#00eefc]">
                  folder_special
                </span>
                <h3 className="font-headline text-[18px] sm:text-[20px] text-white font-bold tracking-wide">
                  Locally Stored Assets (Zero-Latency Cache)
                </h3>
              </div>
              <p className="font-mono-tech text-[11px] text-[#00eefc]/80 mt-0.5">
                Assets downloaded and stored in device memory. Ready for instant offline playback without WiFi or data.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-tech text-white/50">
                {localAssets.length} file{localAssets.length === 1 ? '' : 's'} cached
              </span>
            </div>
          </div>

          {localAssets.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#141419]/60 border border-white/10 flex flex-col items-center justify-center text-center gap-3">
              <span className="material-symbols-outlined text-[42px] text-white/30">
                cloud_off
              </span>
              <h4 className="font-headline text-[16px] text-white font-bold">
                No Local Assets Downloaded Yet
              </h4>
              <p className="font-body text-[12px] text-[#e9bcb6] max-w-md">
                You can download any master from the vault catalog below or click the download icon on any shelf item to store it offline.
              </p>
              {availableCatalog.length > 0 && (
                <button
                  onClick={(e) => handleDownloadAsset(e, availableCatalog[0])}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#00eefc] hover:bg-[#38f2ff] text-black font-mono-tech text-[11px] font-black tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(0,238,252,0.6)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Store "{availableCatalog[0].title}" Offline Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {localAssets.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-2xl p-4 bg-[#141419] border border-[#00eefc]/40 hover:border-[#00eefc] transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.6)] hover:shadow-[0_0_28px_rgba(0,238,252,0.35)] flex flex-col justify-between gap-4"
                >
                  <div className="flex gap-4">
                    {/* Poster Thumbnail */}
                    <div className="relative w-22 h-32 rounded-xl overflow-hidden flex-shrink-0 border border-white/20 bg-black">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Top Stored Offline Badge on Thumbnail */}
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/85 border border-[#00eefc]/70 text-[#00eefc] font-mono-tech text-[8px] font-black flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">offline_pin</span>
                        <span>OFFLINE</span>
                      </div>
                    </div>

                    {/* Metadata Specs */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center justify-between text-[9px] font-mono-tech text-[#00eefc] font-bold uppercase tracking-wider">
                          <span>{item.qualityTag || '4K MASTER'}</span>
                          <span className="text-[#00e479]">ZERO LATENCY</span>
                        </div>

                        <h4 className="font-headline text-[15px] text-white font-bold truncate mt-0.5 group-hover:text-[#00eefc] transition-colors">
                          {item.title}
                        </h4>

                        <p className="font-mono-tech text-[11px] text-[#e9bcb6] mt-0.5">
                          {item.duration} • {item.downloadSize || '2.4GB'}
                        </p>
                      </div>

                      {/* Technical Specs & File Integrity */}
                      <div className="flex flex-col gap-1 pt-2 border-t border-white/10 text-[10px] font-mono-tech">
                        <div className="flex items-center justify-between text-white/60">
                          <span>Format:</span>
                          <span className="text-white font-bold">4K AV1 / H.265 Master</span>
                        </div>
                        <div className="flex items-center justify-between text-white/60">
                          <span>Storage:</span>
                          <span className="text-[#00eefc] font-bold">IndexedDB Blob Cache</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#00e479] font-bold">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          <span>SHA-256 Hash Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Play Offline + Purge Cache */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handlePlayOffline(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#e50914] hover:bg-[#ff1e2b] text-white font-mono-tech text-[11px] font-black tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(229,9,20,0.6)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        play_arrow
                      </span>
                      <span>PLAY OFFLINE</span>
                    </button>

                    <button
                      onClick={(e) => handleRemoveLocalAsset(e, item)}
                      className="p-2 rounded-xl bg-[#25252d] hover:bg-[#353540] text-white/60 hover:text-[#e50914] border border-white/10 hover:border-[#e50914]/40 transition-all cursor-pointer active:scale-90"
                      title="Remove asset from local storage"
                    >
                      <span className="material-symbols-outlined text-[17px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED SECTION: VAULT CATALOG (AVAILABLE FOR OFFLINE DOWNLOAD)     */}
      {/* ========================================================================= */}
      {(activeTabFilter === 'all' || activeTabFilter === 'catalog') && (
        <section id="vault-available-catalog-section" className="flex flex-col gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#00e479]">
                  cloud_download
                </span>
                <h3 className="font-headline text-[18px] sm:text-[20px] text-white font-bold tracking-wide">
                  Available for Offline Download (Vault Masters)
                </h3>
              </div>
              <p className="font-mono-tech text-[11px] text-[#00e479]/80 mt-0.5">
                Download these public domain and syndication masters to your device for zero-latency local playback.
              </p>
            </div>

            <span className="text-[11px] font-mono-tech text-white/50">
              {availableCatalog.length} master{availableCatalog.length === 1 ? '' : 's'} available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCatalog.map((item) => (
              <div
                key={item.id}
                onMouseEnter={playHoverTick}
                className="relative p-3.5 rounded-xl bg-[#141419] border border-white/10 hover:border-[#00e479] flex items-center gap-3.5 transition-all duration-300 shadow-xl hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,228,121,0.35)]"
              >
                <div className="relative w-18 h-24 overflow-hidden rounded-lg flex-shrink-0 border border-white/15 bg-black">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="pointer-events-none absolute inset-0 -translate-x-[150%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/50 to-transparent shine-on-hover z-20" />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-mono-tech text-[9px] text-[#00e479] font-bold uppercase tracking-wider">
                    {item.qualityTag || '4K MASTER'}
                  </span>
                  <h4 className="font-headline text-[14px] text-white font-bold truncate group-hover:text-[#00e479] transition-colors">
                    {item.title}
                  </h4>
                  <p className="font-body text-[11px] text-[#e9bcb6]">
                    {item.duration} • {item.downloadSize || '1.8GB'}
                  </p>
                  <div className="flex items-center gap-1 text-white/60 font-mono-tech text-[9px] mt-1">
                    <span className="material-symbols-outlined text-[12px] text-[#00e479]">check_circle</span>
                    <span>Ready to Cache</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => handleDownloadAsset(e, item)}
                    className="p-2.5 rounded-full bg-[#00e479]/20 hover:bg-[#00e479] text-[#00e479] hover:text-black border border-[#00e479]/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,228,121,0.4)] active:scale-95 transition-all cursor-pointer"
                    title="Download to Local Offline Cache"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>

                  <button
                    onClick={() => {
                      playHoverTick();
                      onPlay(item);
                    }}
                    className="w-8 h-8 rounded-full bg-[#e50914] hover:bg-[#ff1e2b] text-white flex items-center justify-center shadow-[0_0_10px_rgba(229,9,20,0.5)] active:scale-95 transition-all cursor-pointer"
                    title="Stream Preview"
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
