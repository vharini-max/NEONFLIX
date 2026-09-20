import { MediaItem } from '../types';
import { CATALOG_ITEMS, FEATURED_HEROES } from '../data/catalog';

const STORAGE_KEY = 'neonflix_last_hero_movie_id';

/**
 * Picks a random movie from catalog.ts on every app load / page refresh.
 * Stores the last shown movie in localStorage and avoids repeating it next time.
 */
export function getRandomHeroMovie(catalog: MediaItem[] = CATALOG_ITEMS): MediaItem {
  // Pool of candidate movies with valid backdrop and title
  const pool = catalog.filter(
    (item) => item.backdropUrl && item.backdropUrl.trim() !== '' && item.title
  );

  if (pool.length === 0) {
    return FEATURED_HEROES[0];
  }

  let lastId: string | null = null;
  try {
    lastId = localStorage.getItem(STORAGE_KEY);
  } catch {
    // LocalStorage may be restricted in sandboxed environments
  }

  // Filter out the last shown movie so we never repeat it consecutively
  const candidates = pool.filter((item) => item.id !== lastId);
  const eligiblePool = candidates.length > 0 ? candidates : pool;

  // Pick a random movie
  const randomIndex = Math.floor(Math.random() * eligiblePool.length);
  const selected = eligiblePool[randomIndex];

  // Store the newly selected movie ID for next session
  try {
    localStorage.setItem(STORAGE_KEY, selected.id);
  } catch {
    // Ignore storage write failures
  }

  return selected;
}
