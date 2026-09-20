import React from 'react';
import { playHoverTick } from '../utils/sound';
import { UserProfile, TabKey } from '../types';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  watchlistCount: number;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenAudit?: () => void;
  onReplayIntro?: () => void;
  ambientDroneActive?: boolean;
  onToggleAmbientDrone?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  watchlistCount,
  onOpenSearch,
  onOpenProfile,
  onOpenAudit,
  onReplayIntro,
  ambientDroneActive = false,
  onToggleAmbientDrone,
}) => {
  const navTabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'trending', label: 'Trending', icon: 'local_fire_department' },
    { key: 'spotlight', label: 'Spotlight', icon: 'auto_awesome' },
    { key: 'vault', label: 'Vault', icon: 'folder_zip' },
    { key: 'mylist', label: 'My List', icon: 'bookmark' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 w-full z-50 pt-safe bg-black/40 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand Logo & Clean Minimal Navigation */}
        <div className="flex items-center gap-8 min-w-0 flex-shrink-0">
          <div
            onClick={() => {
              playHoverTick();
              if (onReplayIntro) onReplayIntro();
            }}
            onMouseEnter={playHoverTick}
            title="NEONFLIX"
            className="flex items-center gap-1.5 cursor-pointer select-none group"
          >
            <div className="font-headline text-[22px] sm:text-[24px] font-black tracking-[0.18em] transition-transform group-hover:scale-105 flex items-center gap-1">
              <span className="text-[#FF7A1A] drop-shadow-[0_0_16px_rgba(255,122,26,0.75)]">NEON</span>
              <span className="text-[#5EE5FF] drop-shadow-[0_0_16px_rgba(94,229,255,0.75)]">FLIX</span>
            </div>
          </div>

          {/* Desktop Navigation Links (Clean & Minimal) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    playHoverTick();
                    onSelectTab(tab.key);
                  }}
                  onMouseEnter={playHoverTick}
                  className={`relative px-3.5 py-1.5 rounded-full font-body text-[13px] tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white font-semibold bg-white/10 shadow-[0_0_16px_rgba(255,122,26,0.25)] border border-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[17px] ${
                      isActive ? 'text-[#FF7A1A]' : 'text-white/50'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>

                  {tab.key === 'mylist' && watchlistCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#FF7A1A] text-white text-[9px] font-mono-tech font-bold shadow-[0_0_8px_#FF7A1A]">
                      {watchlistCount}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute bottom-0 inset-x-3 h-[2px] bg-[#FF7A1A] rounded-full shadow-[0_0_8px_#FF7A1A]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Controls: Search & User Profile */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Spotlight Search Button */}
          <button
            onClick={() => {
              playHoverTick();
              onOpenSearch();
            }}
            onMouseEnter={playHoverTick}
            aria-label="Search"
            className="h-9 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#5EE5FF]/60 flex items-center gap-2 text-[#e4e1e8] hover:text-[#5EE5FF] transition-all active:scale-95 cursor-pointer"
            title="Search (Press ⌘K or K)"
          >
            <span className="material-symbols-outlined text-[17px]">search</span>
            <span className="hidden sm:inline font-body text-[13px] text-white/75">Search</span>
            <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-[10px] font-mono-tech text-[#5EE5FF]">
              ⌘K
            </span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => {
              playHoverTick();
              onOpenProfile();
            }}
            onMouseEnter={playHoverTick}
            aria-label="User Account"
            className="relative flex items-center justify-center p-0.5 rounded-full ring-2 ring-[#e50914] hover:ring-[#5EE5FF] transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(229,9,20,0.4)]"
            title={currentUser ? `Account: ${currentUser.email}` : 'Sign In / Account'}
          >
            {currentUser ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e50914] to-[#ff7a1a] p-0.5 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#16161f] flex items-center justify-center font-headline text-white text-[13px] font-bold">
                  {(currentUser.full_name || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            )}
            {currentUser && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00e479] ring-2 ring-[#0a0a0f] shadow-[0_0_8px_#00e479]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
