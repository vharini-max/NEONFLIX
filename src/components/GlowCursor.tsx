import React, { useEffect, useState, useRef } from 'react';

export const GlowCursor: React.FC = React.memo(() => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const mouseRef = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only activate on devices with fine pointer
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    let isRunning = true;

    const renderLoop = () => {
      // Smooth lerp for outer ring
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;

      ringPos.current.x += (targetX - ringPos.current.x) * 0.25;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.25;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX - 4}px, ${targetY - 4}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px, 0)`;
      }

      if (isRunning) {
        rafId.current = requestAnimationFrame(renderLoop);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest('button, a, [role="button"], .cursor-pointer');
      setIsHovered(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    rafId.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Precision Core Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-white mix-blend-difference pointer-events-none transition-transform duration-75 ${
          isClicking ? 'scale-75' : isHovered ? 'scale-150' : 'scale-100'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Magnetic Outer Glow Halo */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-9 h-9 rounded-full pointer-events-none border transition-all duration-150 ${
          isHovered
            ? 'border-[#e50914] shadow-[0_0_18px_#e50914] scale-125'
            : 'border-[#00eefc]/70 shadow-[0_0_12px_rgba(0,238,252,0.4)] scale-100'
        } ${isClicking ? 'scale-90' : ''}`}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
});

