import React from 'react';
import { playHoverTick } from '../utils/sound';

interface SubHeaderBeaconProps {
  onOpenAudit: () => void;
  isOnline?: boolean;
}

export const SubHeaderBeacon: React.FC<SubHeaderBeaconProps> = ({ onOpenAudit }) => {
  return (
    <section className="px-4 pt-3 pb-2 flex items-center justify-between gap-3 max-w-7xl mx-auto w-full">
      {/* Left: FREE & LEGAL Real Neon Sign Flicker Badge */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#141419]/90 backdrop-blur-md border border-[#00e479]/40 shadow-[0_0_8px_#00e479,0_0_20px_rgba(0,228,121,0.35)] animate-neon-flicker">
          <span className="w-2 h-2 rounded-full bg-[#00e479] animate-pulse shadow-[0_0_8px_#00e479]" />
          <span className="font-mono-tech text-[11px] text-[#00e479] font-black tracking-wider uppercase">
            FREE & LEGAL VAULT
          </span>
        </div>
      </div>

      {/* Right: Rotating Conic Gradient Border + Double Glow Buttons */}
      <div className="flex items-center gap-2">
        <div className="rotating-border-glow rounded-full">
          <button
            onClick={() => {
              playHoverTick();
              onOpenAudit();
            }}
            onMouseEnter={playHoverTick}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1b20]/95 text-[#e4e1e8] hover:text-white transition-all font-mono-tech text-[11px] active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(0,238,252,0.25)]"
          >
            <span className="material-symbols-outlined text-[15px] text-[#00e479]">verified_user</span>
            <span className="font-bold">Audit</span>
          </button>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1b1b20]/95 border border-[#00eefc]/30 text-[#00eefc] font-mono-tech text-[10px] font-bold shadow-[0_0_8px_#00eefc,0_0_20px_rgba(0,238,252,0.3)] select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping" />
          <span>VAULT READY</span>
        </div>
      </div>
    </section>
  );
};
