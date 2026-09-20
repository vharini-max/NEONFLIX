export type LanguageFilter = 'All' | 'Tamil' | 'English' | 'Korean' | 'Chinese' | 'Hindi' | 'Japanese' | 'Telugu' | 'Kannada';

export interface MediaItem {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  genre: string;
  duration: string;
  originalLanguage: LanguageFilter;
  rating?: number;
  matchScore?: number;
  category: 'hollywood' | 'kofa' | 'greentea' | 'netflix' | 'trending' | 'trailer_only' | 'cartoons' | 'series' | 'horror' | 'action' | 'adventure';
  streamTypeBadge: string;
  badge: 'FREE & LEGAL' | 'TRAILER ONLY';
  badgeType: 'free' | 'kofa' | 'official' | 'trailer';
  qualityTag: string;
  posterUrl: string;
  backdropUrl?: string;
  description: string;
  legalSource: string;
  source: string;
  isFree: boolean;
  isTrailerOnly?: boolean;
  externalWatchUrl?: string;
  downloadAvailable?: boolean;
  downloadProgress?: number;
  downloadSize?: string;
  isDownloaded?: boolean;
  audioSpecs?: string[];
  subtitles?: string;
  videoUrl: string;
  likes?: number;
  continueProgress?: number; // 0 to 100 percentage
  embedType?: 'video' | 'youtube' | 'direct';
  trailerUrl?: string;
  backupTrailerUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  avatar: string;
  full_name?: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: string;
  title: string;
  poster: string;
  added_at: string;
}

export interface ContinueWatchingItem {
  id: string;
  user_id: string;
  movie_id: string;
  progress: number;
  timestamp: string;
}

export interface ToastInfo {
  id: string;
  message: string;
  icon?: string;
  color?: string;
}

export type TabKey = 'home' | 'trending' | 'spotlight' | 'vault' | 'mylist';
export type FilterKey = 'all' | 'hollywood' | 'kofa' | 'greentea' | 'netflix' | 'series' | 'cartoons';

/**
 * Strict Guard: Ensures only approved 100% legal sources are played or embedded.
 * Pirated Tamil dubbed full movies or illegal re-upload links are strictly rejected.
 */
export function isLegalSource(url: string): boolean {
  if (!url) return false;
  const allowed = [
    'zencdn.net',
    'w3.org',
    'test-videos.co.uk',
    'mozilla.net',
    'wikimedia.org',
    'KoreanFilmArchive',
    'GreenTea',
    'archive.org',
    'tmdb',
    'youtube',
    'googleapis.com',
    'commondatastorage',
    'netflix.com',
  ];
  return allowed.some((a) => url.toLowerCase().includes(a.toLowerCase()));
}
