import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playIntroWhoosh } from '../utils/sound';

interface NetflixIntroProps {
  onComplete: () => void;
}

export const NetflixIntro: React.FC<NetflixIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'drawing' | 'fill' | 'zoomOut'>('drawing');

  useEffect(() => {
    // Play signature cinematic whoosh / chord
    playIntroWhoosh();

    const t1 = setTimeout(() => {
      setStage('fill');
    }, 700);

    const t2 = setTimeout(() => {
      setStage('zoomOut');
    }, 1100);

    const t3 = setTimeout(() => {
      onComplete();
    }, 1450);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        className="fixed inset-0 z-500 bg-black flex flex-col items-center justify-center overflow-hidden select-none"
      >
        {/* Ambient Theatrical Glow in background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: stage === 'fill' ? 0.9 : 0.4,
            scale: stage === 'fill' ? 1.4 : 1,
          }}
          transition={{ duration: 0.8 }}
          className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.6)_0%,rgba(0,238,252,0.25)_50%,transparent_75%)] blur-[100px] pointer-events-none"
        />

        {/* N Logo Container with Shared Zoom-Out Transition */}
        <motion.div
          animate={
            stage === 'zoomOut'
              ? { scale: [1, 2.2, 0], opacity: [1, 1, 0] }
              : stage === 'fill'
              ? { scale: [1, 1.06, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center justify-center cursor-pointer"
          onClick={onComplete}
        >
          {/* Authentic Netflix 'N' 3-Ribbon SVG with Path Draw & Neon Fill */}
          <svg
            viewBox="0 0 100 150"
            className="w-32 h-48 md:w-44 md:h-64 filter drop-shadow-[0_0_25px_#e50914]"
          >
            <defs>
              {/* Left & Right ribbons linear gradient */}
              <linearGradient id="neonRibbonRed" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff2e3d" />
                <stop offset="100%" stopColor="#b30710" />
              </linearGradient>

              {/* Diagonal ribbon linear gradient */}
              <linearGradient id="neonDiagonalRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d5a" />
                <stop offset="50%" stopColor="#e50914" />
                <stop offset="100%" stopColor="#8f0007" />
              </linearGradient>
            </defs>

            {/* Left Vertical Ribbon */}
            <motion.path
              d="M 15 10 L 35 10 L 35 140 L 15 140 Z"
              fill={stage !== 'drawing' ? 'url(#neonRibbonRed)' : 'none'}
              stroke="#e50914"
              strokeWidth="2.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            />

            {/* Right Vertical Ribbon */}
            <motion.path
              d="M 65 10 L 85 10 L 85 140 L 65 140 Z"
              fill={stage !== 'drawing' ? 'url(#neonRibbonRed)' : 'none'}
              stroke="#e50914"
              strokeWidth="2.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: 'easeInOut' }}
            />

            {/* Center Diagonal Ribbon (Crossing from top-left to bottom-right) */}
            <motion.path
              d="M 15 10 L 35 10 L 85 140 L 65 140 Z"
              fill={stage !== 'drawing' ? 'url(#neonDiagonalRed)' : 'none'}
              stroke="#00eefc"
              strokeWidth="2.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
              filter="drop-shadow(0px 0px 8px rgba(0,238,252,0.8))"
            />
          </svg>

          {/* Brand Wordmark Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: stage !== 'drawing' ? 1 : 0,
              y: stage !== 'drawing' ? 0 : 15,
            }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mt-6"
          >
            <h1 className="font-headline text-[28px] md:text-[34px] font-black tracking-[0.25em] text-[#e50914] drop-shadow-[0_0_20px_#e50914]">
              NEON<span className="text-[#00eefc] drop-shadow-[0_0_20px_#00eefc]">FLIX</span>
            </h1>
            <p className="font-mono-tech text-[11px] text-[#00e479] tracking-widest uppercase font-bold mt-1 shadow-[0_0_10px_rgba(0,228,121,0.5)]">
              100% Legal • Zero Piracy Stream
            </p>
          </motion.div>
        </motion.div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute bottom-8 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-tech text-[12px] tracking-wider transition-all cursor-pointer backdrop-blur-md"
        >
          SKIP INTRO [ESC]
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
