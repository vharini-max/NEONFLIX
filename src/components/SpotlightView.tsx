import React from 'react';
import { MediaItem } from '../types';

interface SpotlightViewProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onShowToast: (msg: string, icon?: string, color?: string) => void;
}

export const SpotlightView: React.FC<SpotlightViewProps> = ({ items, onPlay, onShowToast }) => {
  const spotlights = [
    {
      title: 'Lokesh Kanagaraj: The Cinematic Universe Phenomenon',
      curator: 'LCU Master Showcase',
      desc: 'From Vikram to Leo: Bloody Sweet, exploring high-octane hyper-connected Tamil cinema storytelling.',
      featuredItem: items.find((i) => i.id === 'leo-tamil-hero') || items[0],
      tag: 'DIRECTOR SPOTLIGHT',
      tagColor: 'text-[#e50914] bg-[#e50914]/15 border-[#e50914]/40',
    },
    {
      title: 'Marvel Studios: Deadpool & Wolverine',
      curator: 'Multiverse Blockbuster Vault',
      desc: 'Ryan Reynolds and Hugh Jackman unite in a chaotic, R-rated superhero team-up with official 4K theatrical trailers.',
      featuredItem: items.find((i) => i.id === 'movie-deadpool-wolverine-trailer') || items[0],
      tag: 'MARVEL BLOCKBUSTER',
      tagColor: 'text-[#e50914] bg-[#e50914]/15 border-[#e50914]/40',
    },
    {
      title: 'Christopher Nolan: The 70mm Phenomenon',
      curator: 'Historical Drama Vault',
      desc: 'Cillian Murphy in Oppenheimer (2023) — sweeping 70mm cinematography and Ludwig Göransson score.',
      featuredItem: items.find((i) => i.id === 'oppenheimer-hero') || items[1],
      tag: 'DIRECTOR SPOTLIGHT',
      tagColor: 'text-[#00e479] bg-[#00e479]/15 border-[#00e479]/40',
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 pt-3 pb-24 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      <div>
        <h2 className="font-headline text-[22px] text-white font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-[#00eefc]">explore</span>
          Editorial Spotlight & Retrospectives
        </h2>
        <p className="font-body text-[12px] text-[#e9bcb6]">
          Curated deep-dives into film history, public domain legal archives, and restored cinematic art.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {spotlights.map((spot, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#1b1b20] border border-white/10 overflow-hidden flex flex-col justify-between shadow-xl group hover:border-[#00eefc]/40 transition-all"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={spot.featuredItem.backdropUrl || spot.featuredItem.posterUrl}
                alt={spot.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b20] via-transparent to-transparent" />
              <span
                className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full font-mono-tech text-[10px] font-bold border backdrop-blur-md ${spot.tagColor}`}
              >
                {spot.tag}
              </span>
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1">
              <h3 className="font-headline text-[16px] text-white font-bold group-hover:text-[#00eefc] transition-colors leading-snug">
                {spot.title}
              </h3>
              <span className="font-mono-tech text-[10px] text-[#e9bcb6] font-semibold">
                Curated by {spot.curator}
              </span>
              <p className="font-body text-[12px] text-[#e4e1e8]/80 leading-relaxed">{spot.desc}</p>
            </div>

            <div className="p-4 pt-0 flex items-center gap-2">
              <button
                onClick={() => onPlay(spot.featuredItem)}
                className="flex-1 py-2 rounded-xl bg-[#e50914] text-white font-mono-tech text-[11px] font-bold flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(229,9,20,0.5)] cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">play_circle</span>
                <span>Play Restored Master</span>
              </button>
              <button
                onClick={() => onShowToast(`Read monograph: ${spot.title}`, 'menu_book', 'text-[#00eefc]')}
                className="px-3 py-2 rounded-xl bg-[#2a292e] text-[#e4e1e8] hover:text-white font-mono-tech text-[11px] border border-white/10 cursor-pointer"
              >
                Read
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
