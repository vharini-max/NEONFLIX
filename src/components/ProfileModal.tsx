import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { playHoverTick } from '../utils/sound';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
}) => {
  if (!isOpen || !currentUser) return null;

  const handleSignOutClick = () => {
    playHoverTick();
    onSignOut();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-500 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="relative w-full max-w-md bg-[#121217] border border-white/20 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(229,9,20,0.25)] flex flex-col gap-5 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Cyber Flares */}
          <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#e50914]/25 rounded-full blur-[70px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-[#00eefc]/20 rounded-full blur-[70px] pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center shadow-[0_0_15px_#e50914]">
                <span className="material-symbols-outlined text-white text-[20px]">account_circle</span>
              </div>
              <h3 className="font-headline text-[18px] text-white font-bold tracking-wide">
                Your Profile
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Profile Modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* TOP SECTION: Supabase Active (Preview Mode) + PostgreSQL / Auth */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 font-mono-tech text-[12px] relative z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isSupabaseConfigured ? 'bg-[#00e479] animate-pulse shadow-[0_0_8px_#00e479]' : 'bg-[#00eefc] animate-pulse shadow-[0_0_8px_#00eefc]'
                }`}
              />
              <span className="text-white font-semibold">
                {isSupabaseConfigured ? 'Supabase Active (Live Connected)' : 'Supabase Active (Preview Mode)'}
              </span>
            </div>
            <span className="text-[#00e479] font-bold tracking-wider">
              PostgreSQL / Auth
            </span>
          </div>

          {/* MIDDLE SECTION: User avatar, Name, Email ID from supabase.auth.getUser() */}
          <div className="flex flex-col gap-4 py-1 relative z-10">
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#e50914] via-[#ff1e2b] to-[#ff7a1a] p-0.5 shadow-[0_0_20px_rgba(229,9,20,0.5)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#16161f] flex items-center justify-center font-headline text-white text-[22px] font-black tracking-wide">
                    {(currentUser.full_name || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00e479] ring-2 ring-[#121217] shadow-[0_0_8px_#00e479]" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-headline text-[17px] text-white font-bold truncate tracking-wide">
                  {currentUser.full_name || 'Google Streamer'}
                </span>
                <span className="font-mono-tech text-[12px] text-[#00eefc] truncate mt-0.5">
                  {currentUser.email}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-[#00e479]">verified</span>
                  <span className="font-mono-tech text-[10px] text-white/50 uppercase tracking-wider">
                    supabase.auth.getUser() session
                  </span>
                </div>
              </div>
            </div>

            {/* WATCHLIST SYNC (Active green) & STREAM TIER (4K Cinema VIP) */}
            <div className="grid grid-cols-2 gap-3 text-center font-mono-tech text-[12px]">
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex flex-col items-center justify-center gap-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-white/60 text-[11px] tracking-wider uppercase">WATCHLIST SYNC</span>
                <span className="text-[#00e479] font-bold text-[14px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00e479] inline-block animate-pulse" />
                  Active
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex flex-col items-center justify-center gap-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-white/60 text-[11px] tracking-wider uppercase">STREAM TIER</span>
                <span className="text-[#e50914] font-bold text-[14px] tracking-wide shadow-[0_0_10px_rgba(229,9,20,0.3)]">
                  4K Cinema VIP
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Sign Out button */}
          <div className="pt-2 relative z-10">
            <button
              onClick={handleSignOutClick}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-[#e50914] text-white font-mono-tech text-[13px] font-bold tracking-wider transition-all duration-200 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(229,9,20,0.6)] active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
