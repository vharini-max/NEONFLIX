import React from 'react';

export const AuroraBackground: React.FC = React.memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#07070b]">
      {/* Deep Theatrical Edge Vignette */}
      <div className="pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,8,0.92)_100%)]" />

      {/* Atmospheric Cyan Ambient Light - Pure GPU CSS radial glow, zero CPU cost */}
      <div
        className="pointer-events-none fixed -top-24 -left-20 w-[480px] h-[480px] rounded-full opacity-35 blur-[70px]"
        style={{
          background: 'radial-gradient(circle, rgba(0,238,252,0.3) 0%, rgba(0,255,255,0.08) 50%, transparent 70%)',
          transform: 'translateZ(0)',
        }}
      />

      {/* Atmospheric Cinema Red Ambient Light (#E50914) */}
      <div
        className="pointer-events-none fixed top-1/4 -right-24 w-[480px] h-[480px] rounded-full opacity-35 blur-[70px]"
        style={{
          background: 'radial-gradient(circle, rgba(229,9,20,0.35) 0%, rgba(255,46,61,0.1) 50%, transparent 70%)',
          transform: 'translateZ(0)',
        }}
      />

      {/* Subtle Emerald Deep Tone */}
      <div
        className="pointer-events-none fixed bottom-10 left-1/3 w-[500px] h-[400px] rounded-full opacity-25 blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(0,228,121,0.18) 0%, rgba(0,180,216,0.08) 50%, transparent 75%)',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
});

