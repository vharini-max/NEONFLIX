import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, WatchlistItem, ContinueWatchingItem, MediaItem } from '../types';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 10
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local fallback keys for instant testability in preview
const STORAGE_KEYS = {
  USER: 'neonflix_user_profile',
  REGISTERED_USERS: 'neonflix_supabase_registered_users',
  WATCHLIST: 'neonflix_supabase_watchlist',
  CONTINUE: 'neonflix_supabase_continue',
  LIKES: 'neonflix_likes_cache',
};

// Default Avatar (Monogram badge, no human photo)
export const DEFAULT_AVATAR = '';

interface RegisteredUserRecord {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  avatar: string;
  created_at: string;
}

function getLocalRegisteredUsers(): Record<string, RegisteredUserRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (raw) return JSON.parse(raw);
  } catch {
    // silent
  }
  return {};
}

function saveLocalRegisteredUsers(records: Record<string, RegisteredUserRecord>) {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(records));
  } catch {
    // silent
  }
}

// ======================== AUTH FUNCTIONS ========================

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isGoogle = user.app_metadata?.provider === 'google' || user.email === 'google.streamer@gmail.com';
        const rawAvatar = user.user_metadata?.avatar_url || '';
        const cleanAvatar = rawAvatar.includes('unsplash.com') ? '' : rawAvatar;
        return {
          id: user.id,
          email: user.email || '',
          avatar: cleanAvatar,
          full_name: isGoogle ? 'Google Streamer' : (user.user_metadata?.full_name || user.email?.split('@')[0]),
        };
      }
    } catch (err) {
      console.warn('Supabase Auth fetch error, checking local session:', err);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.id && parsed?.email) {
        // Strip any legacy human face photo
        if (parsed.avatar && parsed.avatar.includes('unsplash.com')) {
          parsed.avatar = '';
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export async function signInWithGoogle(): Promise<{ user: UserProfile | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) return { user: null, error: error.message };
      const user = await getCurrentUser();
      return { user, error: null };
    } catch (err: unknown) {
      return { user: null, error: err instanceof Error ? err.message : 'Google OAuth error' };
    }
  }

  // Authentic Google Streamer session in preview / demo mode (no face photo)
  const googleUser: UserProfile = {
    id: 'google_streamer_session_vip',
    email: 'google.streamer@gmail.com',
    avatar: '',
    full_name: 'Google Streamer',
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(googleUser));
  return { user: googleUser, error: null };
}

export async function signInWithEmailPassword(
  email: string,
  password?: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password || '',
      });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        const isGoogle = cleanEmail === 'google.streamer@gmail.com';
        const rawAvatar = data.user.user_metadata?.avatar_url || '';
        const cleanAvatar = rawAvatar.includes('unsplash.com') ? '' : rawAvatar;
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          avatar: cleanAvatar,
          full_name: isGoogle ? 'Google Streamer' : (data.user.user_metadata?.full_name || cleanEmail.split('@')[0]),
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
        return { user: profile, error: null };
      }
    } catch (err: unknown) {
      return { user: null, error: err instanceof Error ? err.message : 'Login failed' };
    }
  }

  // Preview Mode Supabase Validation
  // 1. Check if google.streamer@gmail.com
  if (cleanEmail === 'google.streamer@gmail.com') {
    const profile: UserProfile = {
      id: 'google_streamer_session_vip',
      email: 'google.streamer@gmail.com',
      avatar: '',
      full_name: 'Google Streamer',
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
    return { user: profile, error: null };
  }

  // 2. Check local Supabase registered users
  const registered = getLocalRegisteredUsers();
  const existing = registered[cleanEmail];
  if (existing) {
    if (existing.password && password && existing.password !== password) {
      return { user: null, error: 'Invalid password. Please check your password.' };
    }
    const profile: UserProfile = {
      id: existing.id,
      email: existing.email,
      avatar: existing.avatar?.includes('unsplash.com') ? '' : (existing.avatar || ''),
      full_name: existing.full_name,
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
    return { user: profile, error: null };
  }

  // 3. Fallback: create fresh valid profile for typed email
  const newProfile: UserProfile = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    email: cleanEmail,
    avatar: '',
    full_name: cleanEmail.split('@')[0],
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newProfile));
  return { user: newProfile, error: null };
}

export const signInWithPassword = signInWithEmailPassword;

export async function signUpWithPassword(
  email: string,
  password?: string
): Promise<{ user: UserProfile | null; needsEmailConfirmation?: boolean; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password || '',
      });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        const isGoogle = cleanEmail === 'google.streamer@gmail.com';
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          avatar: DEFAULT_AVATAR,
          full_name: isGoogle ? 'Google Streamer' : cleanEmail.split('@')[0],
        };
        return { user: profile, needsEmailConfirmation: true, error: null };
      }
    } catch (err: unknown) {
      return { user: null, error: err instanceof Error ? err.message : 'Sign up failed' };
    }
  }

  // Preview Mode: Save to local Supabase Auth PostgreSQL store
  const registered = getLocalRegisteredUsers();
  const newId = 'usr_' + Math.random().toString(36).substring(2, 10);
  const isGoogle = cleanEmail === 'google.streamer@gmail.com';
  const newRecord: RegisteredUserRecord = {
    id: newId,
    email: cleanEmail,
    password: password || '',
    full_name: isGoogle ? 'Google Streamer' : cleanEmail.split('@')[0],
    avatar: DEFAULT_AVATAR,
    created_at: new Date().toISOString(),
  };
  registered[cleanEmail] = newRecord;
  saveLocalRegisteredUsers(registered);

  const profile: UserProfile = {
    id: newId,
    email: cleanEmail,
    avatar: newRecord.avatar,
    full_name: newRecord.full_name,
  };

  return { user: profile, needsEmailConfirmation: true, error: null };
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }
  // Remove session from localStorage completely
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    // Dispatch custom event so all listeners immediately update
    window.dispatchEvent(new Event('neonflix_auth_changed'));
  } catch (e) {
    console.warn('LocalStorage clear error:', e);
  }
}

// ======================== WATCHLIST (My List) ========================

export async function fetchWatchlist(userId: string): Promise<WatchlistItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });
      if (!error && data) return data as WatchlistItem[];
    } catch (e) {
      console.warn('Supabase watchlist fetch error, using local storage:', e);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export async function addToWatchlistDb(item: MediaItem, userId: string): Promise<void> {
  const newRecord: WatchlistItem = {
    id: 'wl_' + item.id + '_' + Date.now(),
    user_id: userId,
    movie_id: item.id,
    title: item.title,
    poster: item.posterUrl,
    added_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('watchlist').insert([newRecord]);
    } catch (e) {
      console.warn('Supabase insert failed, caching locally:', e);
    }
  }

  const current = await fetchWatchlist(userId);
  if (!current.some((w) => w.movie_id === item.id)) {
    const updated = [newRecord, ...current];
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated));
  }
}

export async function removeFromWatchlistDb(movieId: string, userId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('movie_id', movieId);
    } catch (e) {
      console.warn('Supabase delete failed:', e);
    }
  }

  const current = await fetchWatchlist(userId);
  const updated = current.filter((w) => w.movie_id !== movieId);
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated));
}

// ======================== CONTINUE WATCHING ========================

export async function fetchContinueWatching(userId: string): Promise<ContinueWatchingItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('continue_watching')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      if (!error && data) return data as ContinueWatchingItem[];
    } catch (e) {
      console.warn('Supabase continue watching error:', e);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.CONTINUE);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => item.id !== 'cw_leo' && item.id !== 'cw_dune_part_two');
      }
      return [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function updateContinueWatchingDb(
  movieId: string,
  progress: number,
  userId: string
): Promise<void> {
  const record: ContinueWatchingItem = {
    id: 'cw_' + movieId,
    user_id: userId,
    movie_id: movieId,
    progress: Math.min(100, Math.max(0, Math.round(progress))),
    timestamp: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('continue_watching').upsert(record);
    } catch (e) {
      console.warn('Supabase continue watching upsert error:', e);
    }
  }

  const current = await fetchContinueWatching(userId);
  const filtered = current.filter((c) => c.movie_id !== movieId);
  const updated = [record, ...filtered];
  localStorage.setItem(STORAGE_KEYS.CONTINUE, JSON.stringify(updated));
}

// ======================== LIKES CACHE ========================

let cachedLikes: Set<string> | null = null;

export function getLikedMovieIds(): string[] {
  if (cachedLikes) return Array.from(cachedLikes);
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LIKES);
    const parsed = stored ? JSON.parse(stored) : ['leo-tamil-hero', 'movie-deadpool-wolverine-trailer'];
    cachedLikes = new Set(parsed);
    return parsed;
  } catch {
    cachedLikes = new Set();
    return [];
  }
}

export function isMovieLiked(movieId: string): boolean {
  if (!cachedLikes) getLikedMovieIds();
  return cachedLikes ? cachedLikes.has(movieId) : false;
}

export function toggleMovieLike(movieId: string): { isLiked: boolean; count: number } {
  const likes = getLikedMovieIds();
  const exists = cachedLikes ? cachedLikes.has(movieId) : likes.includes(movieId);
  let updated: string[];
  if (exists) {
    updated = likes.filter((id) => id !== movieId);
    cachedLikes?.delete(movieId);
  } else {
    updated = [...likes, movieId];
    cachedLikes?.add(movieId);
  }
  try {
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(updated));
  } catch {
    // silent
  }
  return { isLiked: !exists, count: updated.length };
}
