import React from 'react';
import { motion } from 'motion/react';
import { LanguageFilter } from '../types';
import { playHoverTick } from '../utils/sound';

interface GlassFilterBarProps {
  selectedLanguage: LanguageFilter;
  onSelectLanguage: (lang: LanguageFilter) => void;
  counts: Record<LanguageFilter, number>;
}

export const GlassFilterBar: React.FC<GlassFilterBarProps> = ({
  selectedLanguage,
  onSelectLanguage,
  counts,
}) => {
  const languages: { key: LanguageFilter; label: string; flag?: string }[] = [
    { key: 'All', label: 'All Catalog' },
    { key: 'Tamil', label: 'Tamil' },
    { key: 'English', label: 'English' },
    { key: 'Hindi', label: 'Hindi' },
    { key: 'Japanese', label: 'Japanese' },
    { key: 'Korean', label: 'Korean' },
    { key: 'Chinese', label: 'Chinese' },
    { key: 'Telugu', label: 'Telugu' },
    { key: 'Kannada', label: 'Kannada' },
  ];

  return (
    <div className="sticky top-15 z-35 px-4 py-2 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-[#101015]/70 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.65),0_0_20px_rgba(229,9,20,0.15)] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {languages.map((lang) => {
            const isActive = selectedLanguage === lang.key;
            return (
              <button
                key={lang.key}
                onClick={() => {
                  playHoverTick();
                  onSelectLanguage(lang.key);
                }}
                onMouseEnter={playHoverTick}
                className={`relative px-3.5 py-1.5 rounded-xl font-mono-tech text-[12px] font-bold tracking-wide transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white scale-105 shadow-[0_0_20px_#e50914]'
                    : 'text-[#e9bcb6] hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Liquid Morph Active Background with LayoutId Spring */}
                {isActive && (
                  <motion.span
                    layoutId="activeFilterPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#e50914] to-[#b30710] -z-10 shadow-[0_0_20px_#e50914,inset_0_0_10px_rgba(255,255,255,0.3)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                )}

                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>

        {/* Legal Badge Indicator on the right */}
        <div className="hidden md:flex items-center gap-2 pr-2 text-[11px] font-mono-tech text-[#00e479]">
          <span className="w-2 h-2 rounded-full bg-[#00e479] animate-pulse" />
          <span className="font-bold tracking-wider">100% LEGAL LICENSED STREAMS</span>
        </div>
      </div>
    </div>
  );
};
