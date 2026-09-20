import React, { useEffect, useRef, useState } from 'react';

interface DuneCinematicHeroLoopProps {
  backdropUrl: string;
  className?: string;
}

interface SandParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  baseAlpha: number;
  colorType: 'gold' | 'orange' | 'cyan' | 'white';
  wobbleSpeed: number;
  wobbleDist: number;
  blur: number;
  layer: 'foreground' | 'midground' | 'background';
}

export const DuneCinematicHeroLoop: React.FC<DuneCinematicHeroLoopProps> = ({
  backdropUrl,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Dual-backdrop state for seamless cinematic crossfade
  const [currentBackdrop, setCurrentBackdrop] = useState(backdropUrl);
  const [incomingBackdrop, setIncomingBackdrop] = useState<string | null>(null);
  const [incomingOpacity, setIncomingOpacity] = useState(0);

  // Handle smooth crossfade when backdropUrl prop changes
  useEffect(() => {
    if (backdropUrl === currentBackdrop) return;

    setIncomingBackdrop(backdropUrl);
    setIncomingOpacity(0);

    const img = new Image();
    img.src = backdropUrl;

    const startTransition = () => {
      // Trigger fade in
      requestAnimationFrame(() => {
        setIncomingOpacity(1);
      });

      // Complete crossfade after 800ms
      const timer = setTimeout(() => {
        setCurrentBackdrop(backdropUrl);
        setIncomingBackdrop(null);
        setIncomingOpacity(0);
      }, 850);

      return () => clearTimeout(timer);
    };

    if (img.complete) {
      return startTransition();
    } else {
      img.onload = startTransition;
    }
  }, [backdropUrl, currentBackdrop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = Math.max(container.clientWidth || 0, window.innerWidth || 1280);
    let height = Math.max(container.clientHeight || 0, window.innerHeight || 800);
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      if (!container || !canvas) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw > 0 && ch > 0) {
        width = canvas.width = cw;
        height = canvas.height = ch;
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Initialize sand particles and floating dust motes
    // Total ~120 particles across 3 depth planes (foreground, midground, background)
    const particleCount = Math.min(120, Math.max(30, Math.floor((width * height) / 8000)));
    const particles: SandParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isForeground = i < particleCount * 0.2;
      const isMidground = i >= particleCount * 0.2 && i < particleCount * 0.7;

      let layer: 'foreground' | 'midground' | 'background' = 'background';
      let size = 1 + Math.random() * 1.5;
      let alpha = 0.2 + Math.random() * 0.3;
      let blur = 0;
      let speedX = (0.05 + Math.random() * 0.12) * 0.5; // 0.5x speed
      let speedY = (-0.03 + Math.random() * 0.06) * 0.5;

      if (isForeground) {
        layer = 'foreground';
        size = 3.5 + Math.random() * 3.5; // Large dreamy bokeh dust motes
        alpha = 0.15 + Math.random() * 0.25;
        blur = 2 + Math.random() * 3;
        speedX = (0.12 + Math.random() * 0.2) * 0.5;
        speedY = (-0.08 + Math.random() * 0.08) * 0.5;
      } else if (isMidground) {
        layer = 'midground';
        size = 1.8 + Math.random() * 2;
        alpha = 0.35 + Math.random() * 0.45;
        blur = 0.5;
        speedX = (0.08 + Math.random() * 0.15) * 0.5;
        speedY = (-0.04 + Math.random() * 0.05) * 0.5;
      }

      // Color distribution: mostly desert sand/golden, occasional neon orange and cyan sparkle
      const colorRand = Math.random();
      let colorType: 'gold' | 'orange' | 'cyan' | 'white' = 'gold';
      if (colorRand > 0.88) colorType = 'cyan';
      else if (colorRand > 0.72) colorType = 'orange';
      else if (colorRand < 0.15) colorType = 'white';

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size,
        speedX,
        speedY,
        alpha,
        baseAlpha: alpha,
        colorType,
        wobbleSpeed: 0.15 + Math.random() * 0.3,
        wobbleDist: 15 + Math.random() * 35,
        blur,
        layer,
      });
    }

    const LOOP_DURATION = 15; // 15 seconds seamless loop cycle
    let startTime: number | null = null;

    const render = (now: number) => {
      // Dynamic verification of container size before rendering
      const curW = container.clientWidth;
      const curH = container.clientHeight;

      if (curW > 0 && curH > 0) {
        if (canvas.width !== curW || canvas.height !== curH) {
          canvas.width = curW;
          canvas.height = curH;
          width = curW;
          height = curH;
        }
      }

      // If dimensions are invalid or non-finite, safely defer to next frame
      if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (!startTime) startTime = now;
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw atmospheric slow-drifting desert heat haze & dust clouds (Midground & Horizon)
      // Slow haze drifting horizontally across dunes
      const safeMod1 = Math.max(200, width * 1.5);
      const hazeOffset1 = (elapsed * 8) % safeMod1;
      const hx1 = hazeOffset1 - width * 0.25;
      const hy1 = height * 0.55;
      const hr0 = Math.max(1, width * 0.1);
      const hr1 = Math.max(hr0 + 10, width * 0.7);

      if (Number.isFinite(hx1) && Number.isFinite(hy1) && Number.isFinite(hr0) && Number.isFinite(hr1)) {
        try {
          const hazeGrad1 = ctx.createRadialGradient(hx1, hy1, hr0, hx1, hy1, hr1);
          hazeGrad1.addColorStop(0, 'rgba(255, 122, 26, 0.045)');
          hazeGrad1.addColorStop(0.5, 'rgba(218, 140, 60, 0.025)');
          hazeGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = hazeGrad1;
          ctx.fillRect(0, 0, width, height);
        } catch {
          // Gracefully continue if gradient creation fails
        }
      }

      // Cyan ambient atmospheric drift from distant Arrakis spice atmosphere
      const safeMod2 = Math.max(200, width * 1.8);
      const hazeOffset2 = ((elapsed * 5) % safeMod2) - width * 0.4;
      const hx2 = width - hazeOffset2;
      const hy2 = height * 0.4;
      const hr2_0 = 50;
      const hr2_1 = Math.max(60, width * 0.6);

      if (Number.isFinite(hx2) && Number.isFinite(hy2) && Number.isFinite(hr2_0) && Number.isFinite(hr2_1)) {
        try {
          const hazeGrad2 = ctx.createRadialGradient(hx2, hy2, hr2_0, hx2, hy2, hr2_1);
          hazeGrad2.addColorStop(0, 'rgba(94, 229, 255, 0.035)');
          hazeGrad2.addColorStop(0.6, 'rgba(94, 229, 255, 0.01)');
          hazeGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = hazeGrad2;
          ctx.fillRect(0, 0, width, height);
        } catch {
          // Gracefully continue if gradient creation fails
        }
      }

      // 2. Render Sand Particles & Floating Dust Motes (Slow Motion)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Ensure particle coordinates are valid numbers
        if (!Number.isFinite(p.x)) p.x = Math.random() * width;
        if (!Number.isFinite(p.y)) p.y = Math.random() * height;

        // Update positions with 0.5x slow-mo playback speed
        p.x += p.speedX;
        p.y += p.speedY + Math.sin(elapsed * p.wobbleSpeed + i) * 0.08;

        // Wrap around boundaries seamlessly
        if (p.x > width + 40) p.x = -40;
        if (p.x < -40) p.x = width + 40;
        if (p.y > height + 40) p.y = -40;
        if (p.y < -40) p.y = height + 40;

        // Slow breathing shimmer
        const shimmer =
          0.8 + 0.2 * Math.sin(elapsed * 1.2 + i * 0.5);
        const currentAlpha = p.alpha * shimmer;

        ctx.save();
        if (p.layer === 'foreground') {
          // Soft glowing bokeh dust mote
          const outerR = Math.max(0.5, p.size * 2);
          if (Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(outerR) && outerR > 0) {
            try {
              const radGrad = ctx.createRadialGradient(
                p.x,
                p.y,
                0,
                p.x,
                p.y,
                outerR
              );
              if (p.colorType === 'cyan') {
                radGrad.addColorStop(0, `rgba(94, 229, 255, ${currentAlpha * 1.2})`);
                radGrad.addColorStop(0.5, `rgba(94, 229, 255, ${currentAlpha * 0.4})`);
                radGrad.addColorStop(1, 'rgba(94, 229, 255, 0)');
              } else if (p.colorType === 'orange') {
                radGrad.addColorStop(0, `rgba(255, 122, 26, ${currentAlpha * 1.2})`);
                radGrad.addColorStop(0.5, `rgba(255, 122, 26, ${currentAlpha * 0.4})`);
                radGrad.addColorStop(1, 'rgba(255, 122, 26, 0)');
              } else {
                radGrad.addColorStop(0, `rgba(255, 214, 150, ${currentAlpha * 1.3})`);
                radGrad.addColorStop(0.5, `rgba(240, 180, 100, ${currentAlpha * 0.4})`);
                radGrad.addColorStop(1, 'rgba(240, 180, 100, 0)');
              }
              ctx.fillStyle = radGrad;
              ctx.beginPath();
              ctx.arc(p.x, p.y, outerR, 0, Math.PI * 2);
              ctx.fill();
            } catch {
              // Fallback to solid arc if gradient fails
              ctx.fillStyle = 'rgba(255, 214, 150, 0.2)';
              ctx.beginPath();
              ctx.arc(p.x, p.y, outerR, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else {
          // Sharp midground or micro-background sand grain
          if (p.colorType === 'cyan') {
            ctx.fillStyle = `rgba(162, 243, 255, ${currentAlpha})`;
            ctx.shadowColor = 'rgba(94, 229, 255, 0.8)';
            ctx.shadowBlur = 4;
          } else if (p.colorType === 'orange') {
            ctx.fillStyle = `rgba(255, 164, 81, ${currentAlpha})`;
            ctx.shadowColor = 'rgba(255, 122, 26, 0.8)';
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = `rgba(250, 220, 175, ${currentAlpha})`;
            ctx.shadowColor = 'rgba(230, 170, 90, 0.4)';
            ctx.shadowBlur = 2;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
    >
      {/* 
        ========================================================================
        1. SLOW-MOTION PARALLAX DOLLY CAMERA PUSH FORWARD (0.5x Speed)
        Seamless 15-second infinite camera push-in loop with smooth sine oscillation
        ========================================================================
      */}
      {/* Current Base Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          animation: 'duneDollyZoom 15s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          willChange: 'transform',
        }}
      >
        <div
          className="absolute -inset-[4%] bg-cover bg-no-repeat will-change-transform"
          style={{
            backgroundImage: `url('${currentBackdrop}')`,
            backgroundPosition: 'center 36%',
            transform: 'translateZ(0)',
          }}
        />
      </div>

      {/* Incoming Backdrop with Smooth Fade Transition (when movie switches) */}
      {incomingBackdrop && (
        <div
          className="absolute inset-0 transition-opacity duration-800 ease-in-out"
          style={{
            opacity: incomingOpacity,
            animation: 'duneDollyZoom 15s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            willChange: 'transform, opacity',
          }}
        >
          <div
            className="absolute -inset-[4%] bg-cover bg-no-repeat will-change-transform"
            style={{
              backgroundImage: `url('${incomingBackdrop}')`,
              backgroundPosition: 'center 36%',
              transform: 'translateZ(0)',
            }}
          />
        </div>
      )}

      {/* 
        ========================================================================
        2. NEON ORANGE & CYAN LIGHT TRAILS (0.25x Speed)
        Ultra-slow undulating light pulses gliding across the dune ridges
        ========================================================================
      */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Neon Glow Filters with multi-step specular gaussian blurs */}
          <filter id="duneGlowOrange" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="duneGlowCyan" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Dynamic Light Beam Gradients */}
          <linearGradient id="duneTrailOrange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0" />
            <stop offset="35%" stopColor="#FF7A1A" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#FFA451" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="duneTrailCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5EE5FF" stopOpacity="0" />
            <stop offset="35%" stopColor="#5EE5FF" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#A2F3FF" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#5EE5FF" stopOpacity="0" />
          </linearGradient>

          {/* Ambient dune ridge illumination gradient */}
          <linearGradient id="duneAmbientOrange" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient dune illumination area below orange crest */}
        <path
          d="M -40,620 Q 300,530 640,650 T 1150,470 Q 1340,430 1520,440 L 1520,720 L -40,720 Z"
          fill="url(#duneAmbientOrange)"
          className="opacity-70"
        />

        {/* 
          Ridge Trail 1: Neon Orange (#FF7A1A) traveling at 0.25x speed
          Length ~1600px. Dasharray allows a traveling comet of length 320px 
          moving seamlessly over 15 seconds.
        */}
        <path
          d="M -60,615 Q 280,525 640,655 T 1140,475 Q 1320,425 1520,435"
          stroke="url(#duneTrailOrange)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#duneGlowOrange)"
          style={{
            strokeDasharray: '380 1200',
            animation: 'duneTrailFlowOrange 15s linear infinite',
          }}
        />

        {/* Second faint orange backing wave for depth */}
        <path
          d="M -80,730 Q 340,660 720,760 T 1220,620 Q 1390,570 1550,590"
          stroke="#FF7A1A"
          strokeWidth="1.2"
          strokeOpacity="0.35"
          filter="url(#duneGlowOrange)"
          style={{
            strokeDasharray: '260 900',
            animation: 'duneTrailFlowOrange 20s linear infinite reverse',
          }}
        />

        {/* 
          Ridge Trail 2: Electric Cyan (#5EE5FF) traveling at 0.25x speed
          Counter-crest path sweeping slowly over the secondary dune ridge
        */}
        <path
          d="M 60,520 Q 380,420 740,540 T 1180,380 Q 1360,330 1540,350"
          stroke="url(#duneTrailCyan)"
          strokeWidth="2.2"
          strokeLinecap="round"
          filter="url(#duneGlowCyan)"
          style={{
            strokeDasharray: '320 1100',
            animation: 'duneTrailFlowCyan 15s linear infinite',
          }}
        />
      </svg>

      {/* 
        ========================================================================
        3. DUST MOTES & FLOATING SAND CANVAS (0.5x Speed)
        ========================================================================
      */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[3]"
      />

      {/* 
        ========================================================================
        4. SUBTLE DEPTH OF FIELD - FOREGROUND BLUR & ATMOSPHERIC HAZE
        Foreground dunes slightly blurred for authentic IMAX camera lens depth
        ========================================================================
      */}
      {/* Foreground Dune Ridge with Soft Depth Blur (Bottom Left & Right) */}
      <div className="absolute inset-x-0 bottom-0 h-44 z-[4] pointer-events-none overflow-hidden">
        {/* Soft blurred foreground dune silhouette */}
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 200"
          fill="none"
        >
          <path
            d="M -20,200 L -20,120 Q 240,70 560,140 T 1120,90 Q 1320,120 1460,70 L 1460,200 Z"
            fill="black"
            fillOpacity="0.55"
            style={{ filter: 'blur(3px)' }}
          />
        </svg>
      </div>

      {/* Soft floating warm Arrakis sun haze layer */}
      <div
        className="absolute top-1/4 -right-1/4 w-[60vw] h-[60vh] rounded-full bg-[#FF7A1A]/10 pointer-events-none z-[3]"
        style={{
          filter: 'blur(120px)',
          animation: 'duneHazeFloat 15s ease-in-out infinite alternate',
        }}
      />
      {/* Soft cyan spice atmosphere highlight */}
      <div
        className="absolute top-1/3 left-1/4 w-[45vw] h-[45vh] rounded-full bg-[#5EE5FF]/10 pointer-events-none z-[3]"
        style={{
          filter: 'blur(110px)',
          animation: 'duneHazeFloat 15s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* CSS Keyframes injected for seamless 15s loop and 0.25x speed light trails */}
      <style>{`
        @keyframes duneDollyZoom {
          0% {
            transform: scale(1.0) translate3d(0, 0, 0);
          }
          50% {
            transform: scale(1.06) translate3d(-0.4%, -0.6%, 0);
          }
          100% {
            transform: scale(1.0) translate3d(0, 0, 0);
          }
        }

        @keyframes duneTrailFlowOrange {
          0% {
            stroke-dashoffset: 1580;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes duneTrailFlowCyan {
          0% {
            stroke-dashoffset: -1420;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes duneHazeFloat {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate3d(2%, 1.5%, 0) scale(1.08);
            opacity: 0.95;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};
