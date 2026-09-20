import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="relative pb-3">
      <div className="relative flex flex-col bg-[#16161b] rounded-xl border border-white/10 overflow-hidden shadow-lg skeleton-pulse-glow">
        {/* Poster Skeleton with Shimmer Gradient & Glow */}
        <div className="relative w-full aspect-[2/3] skeleton-shimmer-bar">
          <div className="absolute top-2 left-2 w-20 h-4 rounded-full bg-white/10" />
          <div className="absolute top-2 right-2 w-10 h-4 rounded bg-white/10" />
        </div>

        {/* Info Skeleton */}
        <div className="p-3 flex flex-col gap-2.5 bg-[#16161b]">
          <div className="flex items-center justify-between">
            <div className="w-16 h-3 rounded bg-white/10 skeleton-shimmer-bar" />
            <div className="w-12 h-3 rounded bg-white/10 skeleton-shimmer-bar" />
          </div>

          <div className="w-3/4 h-4 rounded bg-white/15 skeleton-shimmer-bar" />

          <div className="flex items-center gap-2">
            <div className="w-10 h-3 rounded bg-white/10 skeleton-shimmer-bar" />
            <div className="w-16 h-3 rounded bg-white/10 skeleton-shimmer-bar" />
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex-1 h-8 rounded-lg bg-white/10 skeleton-shimmer-bar" />
            <div className="w-8 h-8 rounded-lg bg-white/10 skeleton-shimmer-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};
