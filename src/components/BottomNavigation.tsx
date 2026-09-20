import React from 'react';
import { motion } from 'motion/react';
import { TabKey } from '../types';
import { playHoverTick } from '../utils/sound';

interface BottomNavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  watchlistCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  watchlistCount,
}) => {
  const tabs: { key: TabKey; label: string; icon: string; color: string; glow: string }[] = [
    { key: 'home', label: 'Home', icon: 'home', color: '#e50914', glow: 'rgba(229,9,20,1)' },
    { key: 'trending', label: 'Trending', icon: 'local_fire_department', color: '#e50914', glow: 'rgba(229,9,20,1)' },
    { key: 'spotlight', label: 'Spotlight', icon: 'auto_awesome', color: '#e50914', glow: 'rgba(229,9,20,1)' },
    { key: 'vault', label: 'Vault', icon: 'folder_zip', color: '#00eefc', glow: 'rgba(0,238,252,1)' },
    { key: 'mylist', label: 'My List', icon: 'bookmark', color: '#00e479', glow: 'rgba(0,228,121,1)' },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 inset-x-3 max-w-lg mx-auto z-50 rounded-2xl pb-safe bottom-nav-glass overflow-hidden select-none">
      {/* Radiant Neon Top Border Streak */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] via-[#E50914] to-transparent shadow-[0_0_12px_#e50914]" />

      <div className="flex items-center justify-around h-16 px-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              onClick={() => {
                playHoverTick();
                onSelectTab(tab.key);
              }}
              onMouseEnter={playHoverTick}
              animate={isActive ? { scale: 1.12, y: -2 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className={`relative flex flex-col items-center justify-center min-w-[58px] h-13 gap-0.5 transition-colors cursor-pointer ${
                isActive ? 'font-bold' : 'text-[#e9bcb6] hover:text-white'
              }`}
              style={{ color: isActive ? tab.color : undefined }}
            >
              {/* Neon Glow Aura Behind Active Icon */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-aura"
                  className="absolute -inset-1 rounded-xl blur-md -z-10"
                  style={{ backgroundColor: `${tab.glow.replace('1)', '0.35)')}` }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}

              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={
                    isActive
                      ? {
                          textShadow: `0 0 12px ${tab.glow}, 0 0 24px ${tab.glow}`,
                          fontVariationSettings: "'FILL' 1",
                        }
                      : {}
                  }
                >
                  {tab.icon}
                </span>

                {/* Badge for My List */}
                {tab.key === 'mylist' && watchlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full bg-[#e50914] text-white text-[9px] font-mono-tech font-black shadow-[0_0_10px_#e50914] border border-black animate-pulse">
                    {watchlistCount}
                  </span>
                )}
              </div>

              <span
                className="font-mono-tech text-[10px] tracking-wide"
                style={isActive ? { textShadow: `0 0 8px ${tab.glow}` } : {}}
              >
                {tab.label}
              </span>

              {/* Active Neon Bar Indicator */}
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active-pill"
                  className="absolute -bottom-1 w-6 h-1 rounded-full"
                  style={{
                    backgroundColor: tab.color,
                    boxShadow: `0 0 12px ${tab.glow}, 0 0 20px ${tab.glow}`,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
