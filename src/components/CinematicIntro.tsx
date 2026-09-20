import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playCinematicChime } from '../utils/sound';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Play subtle cinematic neon chime on start
    playCinematicChime();

    // Auto complete intro after 2.4s
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 400);
    }, 2400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setShow(false);
    setTimeout(onComplete, 200);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.12, filter: 'blur(12px)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          onClick={handleSkip}
          className="fixed inset-0 z-[99999] bg-[#07070a] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
        >
          {/* Background Cinematic Radial Light Bloom */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.8, 2.2], opacity: [0, 0.45, 0.15] }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute w-[400px] h-[400px] rounded-full bg-[#e50914] blur-[120px] pointer-events-none -z-10"
          />

          {/* Anamorphic Blue/Red Lens Flare Streak */}
          <motion.div
            initial={{ width: '0%', opacity: 0 }}
            animate={{ width: ['0%', '100%', '120%'], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.8, times: [0, 0.5, 1], ease: 'easeInOut' }}
            className="absolute h-[2px] bg-gradient-to-r from-transparent via-[#00eefc] to-transparent pointer-events-none shadow-[0_0_20px_#00eefc]"
          />

          {/* Netflix Style "N" SVG with Path Draw + Neon Glow */}
          <div className="relative w-36 h-48 flex items-center justify-center">
            <svg
              viewBox="0 0 100 140"
              className="w-full h-full drop-shadow-[0_0_35px_rgba(229,9,20,0.85)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Stem */}
              <motion.path
                d="M15 15 V125"
                stroke="#B81D24"
                strokeWidth="20"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />

              {/* Right Stem */}
              <motion.path
                d="M85 15 V125"
                stroke="#B81D24"
                strokeWidth="20"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeInOut' }}
              />

              {/* Diagonal Ribbon Overlay */}
              <motion.path
                d="M15 15 L85 125"
                stroke="#E50914"
                strokeWidth="22"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4, ease: 'easeInOut' }}
              />
            </svg>

            {/* Glowing Center Core */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 2.5], opacity: [0, 0.8, 0] }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="absolute inset-0 rounded-full bg-[#ff2e3d] blur-xl pointer-events-none -z-10"
            />
          </div>

          {/* Title Wordmark Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
            className="mt-6 flex flex-col items-center gap-1"
          >
            <span className="font-headline text-[24px] tracking-[0.25em] font-black text-white text-shadow-lg">
              NEON<span className="text-[#e50914]">FLIX</span>
            </span>
            <span className="font-mono-tech text-[10px] text-[#00eefc] tracking-[0.3em] font-bold uppercase opacity-85">
              CYBER ARCHIVE CINEMA
            </span>
          </motion.div>

          {/* Quick Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="absolute bottom-8 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white/70 font-mono-tech text-[11px] cursor-pointer"
          >
            Press anywhere or Skip ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
