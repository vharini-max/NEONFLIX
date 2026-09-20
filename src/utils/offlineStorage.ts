import { MediaItem } from '../types';

const STORAGE_KEY = 'neonflix_downloaded_items';

// Clean default initial downloaded movie IDs (empty until user downloads)
const DEFAULT_DOWNLOADED_IDS: string[] = [];

/**
 * Retrieves the list of movie IDs stored offline from localStorage
 */
export function getDownloadedIds(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Clean out any legacy dummy demo IDs
        return parsed.filter((id) => id !== 'cartoon-big-buck-bunny-open');
      }
    }
  } catch {
    // Sandboxed iframe protection
  }
  return DEFAULT_DOWNLOADED_IDS;
}

/**
 * Saves downloaded movie IDs to localStorage
 */
export function saveDownloadedIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('neonflix_downloads_updated', { detail: ids }));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Checks if a specific media item is marked as downloaded
 */
export function isItemDownloaded(id: string, _itemProp?: boolean): boolean {
  const current = getDownloadedIds();
  return current.includes(id);
}

/**
 * Toggles offline storage status for an item
 */
export function toggleDownload(id: string): { isDownloaded: boolean; downloadedIds: string[] } {
  const current = getDownloadedIds();
  const exists = current.includes(id);
  const updated = exists ? current.filter((x) => x !== id) : [...current, id];
  saveDownloadedIds(updated);
  return { isDownloaded: !exists, downloadedIds: updated };
}

/**
 * Removes an asset from offline storage
 */
export function removeDownload(id: string): string[] {
  const current = getDownloadedIds();
  const updated = current.filter((x) => x !== id);
  saveDownloadedIds(updated);
  return updated;
}

/**
 * Adds an asset to offline storage
 */
export function addDownload(id: string): string[] {
  const current = getDownloadedIds();
  if (!current.includes(id)) {
    const updated = [...current, id];
    saveDownloadedIds(updated);
    return updated;
  }
  return current;
}
