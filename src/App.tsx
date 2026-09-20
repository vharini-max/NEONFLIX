import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';

import { Header } from './components/Header';
import { SubHeaderBeacon } from './components/SubHeaderBeacon';
import { HeroBillboard } from './components/HeroBillboard';
import { GlassFilterBar } from './components/GlassFilterBar';
import { MediaShelf } from './components/MediaShelf';
import { SupabaseEngineSection } from './components/SupabaseEngineSection';
import { BottomNavigation } from './components/BottomNavigation';
import { PlayerModal } from './components/PlayerModal';
import { ComplianceModal } from './components/ComplianceModal';
import { CommandPalette } from './components/CommandPalette';
import { DetailsModal } from './components/DetailsModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthPage } from './components/AuthPage';
import { VaultView } from './components/VaultView';
import { MyListView } from './components/MyListView';
import { TrendingView } from './components/TrendingView';
import { SpotlightView } from './components/SpotlightView';
import { Toast } from './components/Toast';
import { GlowCursor } from './components/GlowCursor';
import { NetflixIntro } from './components/NetflixIntro';
import { AuroraBackground } from './components/AuroraBackground';

import { HERO_FEATURE, FEATURED_HEROES, CATALOG_ITEMS } from './data/catalog';
import { MediaItem, TabKey, LanguageFilter, ToastInfo, UserProfile } from './types';
import { toggleCyberAmbientDrone } from './utils/sound';
import { getRandomHeroMovie } from './utils/heroSelector';
import { isItemDownloaded } from './utils/offlineStorage';
import {
  supabase,
  getCurrentUser,
  fetchWatchlist,
  fetchContinueWatching,
  addToWatchlistDb,
  removeFromWatchlistDb,
  signOutUser,
} from './lib/supabase';

export default function App() {
  // Navigation & Route Protection State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    try {
      return window.location.pathname || '/';
    } catch {
      return '/';
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilter>('All');
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('neonflix_intro_seen');
    } catch {
      return false;
    }
  });
  const [ambientDroneActive, setAmbientDroneActive] = useState(false);

  // Supabase Auth & State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [continueWatching, setContinueWatching] = useState<{ movie_id: string; progress: number }[]>([]);

  // Pick a random hero movie from catalog.ts on every app load / refresh, avoiding consecutive repeats
  const [heroMovie, setHeroMovie] = useState<MediaItem>(() => getRandomHeroMovie(CATALOG_ITEMS));

  // Modals state
  const [activePlayerItem, setActivePlayerItem] = useState<MediaItem | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<MediaItem | null>(null);

  // Toast notification
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = useCallback((message: string, icon = 'check_circle', color = 'text-[#00e479]') => {
    setToast({ id: Date.now().toString(), message, icon, color });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  }, []);

  const handleCompleteIntro = useCallback(() => {
    try {
      sessionStorage.setItem('neonflix_intro_seen', '1');
    } catch {
      // silent
    }
    setShowIntro(false);
  }, []);

  // 1. Initialize Lenis Smooth Scroll with crisp, snappy parameters
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.15,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // 2. Global Shortcut: 'K' or 'Cmd+K' / 'Ctrl+K' opens Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if ((e.key === 'k' || e.key === 'K') && !isInput && !activePlayerItem && !isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activePlayerItem, isSearchOpen]);

  // 3. Load Supabase Data (User, Watchlist, Continue Watching) & Route Protection
  const loadUserData = useCallback(async (userId: string) => {
    try {
      const wl = await fetchWatchlist(userId);
      if (wl && wl.length > 0) {
        setWatchlistIds(wl.map((w) => w.movie_id));
      } else {
        setWatchlistIds([]);
      }
      const cw = await fetchContinueWatching(userId);
      if (cw && cw.length > 0) {
        setContinueWatching(cw.map((c) => ({ movie_id: c.movie_id, progress: c.progress })));
      } else {
        setContinueWatching([]);
      }
    } catch (err) {
      console.warn('Error loading user data:', err);
    }
  }, []);

  useEffect(() => {
    async function loadSupabaseState() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        if (user) {
          if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
            window.history.replaceState(null, '', '/');
            setCurrentPath('/');
          }
          await loadUserData(user.id);
        } else {
          // Route Protection: If not logged in, redirect to /login
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.history.replaceState(null, '', '/login');
            setCurrentPath('/login');
          }
        }
      } catch (err) {
        console.warn('Supabase initial state load error:', err);
      } finally {
        setAuthLoading(false);
      }
    }

    loadSupabaseState();

    // Listen to browser Back/Forward navigation
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);
    };
    window.addEventListener('popstate', handlePopState);

    // Listen to auth changed events
    const handleAuthEvent = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (!user) {
        window.history.replaceState(null, '', '/login');
        setCurrentPath('/login');
      }
    };
    window.addEventListener('neonflix_auth_changed', handleAuthEvent);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('neonflix_auth_changed', handleAuthEvent);
    };
  }, [loadUserData]);

  // Handle successful login or sign-up redirect
  const handleAuthSuccess = useCallback(
    async (user: UserProfile) => {
      setCurrentUser(user);
      window.history.pushState(null, '', '/');
      setCurrentPath('/');
      // Automatically show profile modal as specified:
      // "If correct, redirect to home page and show profile modal as in screenshot"
      setIsProfileModalOpen(true);
      await loadUserData(user.id);
    },
    [loadUserData]
  );

  // 100% Reliable Sign Out / Logout
  const handleSignOut = useCallback(async () => {
    await signOutUser();
    setCurrentUser(null);
    setWatchlistIds([]);
    setContinueWatching([]);
    setIsProfileModalOpen(false);
    window.history.pushState(null, '', '/login');
    setCurrentPath('/login');
    showToast('Signed out of NEONFLIX', 'logout', 'text-[#e50914]');
  }, [showToast]);

  const handleToggleWatchlist = useCallback(async (item: MediaItem) => {
    const userId = currentUser?.id || 'usr_neon_prime_77';
    if (watchlistIds.includes(item.id)) {
      setWatchlistIds((prev) => prev.filter((id) => id !== item.id));
      await removeFromWatchlistDb(item.id, userId);
      showToast(`Removed "${item.title}" from My List`, 'bookmark_remove', 'text-[#e9bcb6]');
    } else {
      setWatchlistIds((prev) => [...prev, item.id]);
      await addToWatchlistDb(item, userId);
      showToast(`Saved "${item.title}" to My List`, 'bookmark_added', 'text-[#00e479]');
    }
  }, [currentUser?.id, watchlistIds, showToast]);

  const handlePlay = useCallback((item: MediaItem) => {
    setActivePlayerItem(item);
    showToast(`Streaming "${item.title}" in NEONFLIX Player`, 'smart_display', 'text-[#e50914]');
  }, [showToast]);

  const allItems = useMemo(
    () => Array.from(new Map([HERO_FEATURE, ...CATALOG_ITEMS].map((i) => [i.id, i])).values()),
    []
  );

  // Language count dictionary for GlassFilterBar (memoized)
  const languageCounts = useMemo<Record<LanguageFilter, number>>(() => {
    const counts: Record<LanguageFilter, number> = {
      All: allItems.length,
      Tamil: 0,
      English: 0,
      Korean: 0,
      Chinese: 0,
      Hindi: 0,
      Japanese: 0,
      Telugu: 0,
      Kannada: 0,
    };
    for (const item of allItems) {
      if (counts[item.originalLanguage] !== undefined) {
        counts[item.originalLanguage]++;
      }
    }
    return counts;
  }, [allItems]);

  const [downloadVersion, setDownloadVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setDownloadVersion((v) => v + 1);
    };
    window.addEventListener('neonflix_downloads_updated', handleUpdate);
    return () => window.removeEventListener('neonflix_downloads_updated', handleUpdate);
  }, []);

  const downloadedCount = useMemo(
    () => allItems.filter((i) => isItemDownloaded(i.id, i.isDownloaded)).length,
    [allItems, downloadVersion]
  );

  // 1. Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#e50914] flex items-center justify-center font-headline font-black text-white text-2xl shadow-[0_0_30px_#e50914] animate-pulse">
            N
          </div>
          <span className="font-mono-tech text-[12px] text-white/60 tracking-widest uppercase">
            Connecting Supabase PostgreSQL Auth...
          </span>
        </div>
      </div>
    );
  }

  // 2. Protect Routes: If user not logged in, don't allow home page. Redirect to /login
  if (!currentUser) {
    const authMode = currentPath === '/signup' ? 'signup' : 'login';
    return (
      <>
        <AuthPage
          mode={authMode}
          onModeChange={(newMode) => {
            const nextPath = newMode === 'signup' ? '/signup' : '/login';
            window.history.pushState(null, '', nextPath);
            setCurrentPath(nextPath);
          }}
          onSuccess={handleAuthSuccess}
          onShowToast={showToast}
        />
        <Toast toast={toast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-[#e4e1e8] relative selection:bg-[#e50914] selection:text-white overflow-x-hidden font-body">
      {/* 1. Custom Glowing Cursor with Mix-Blend-Difference & Magnetic Snap */}
      <GlowCursor />

      {/* 2. Netflix N 2-Second SVG Draw & Neon Glow Intro */}
      {showIntro && <NetflixIntro onComplete={handleCompleteIntro} />}

      {/* 3. Dynamic Aurora Blobs (Cyan & Red) + 35mm Film Grain + Vignette */}
      <AuroraBackground />

      {/* 4. Global Header with User Avatar, Desktop Navigation, Search & Synth Drone */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        watchlistCount={watchlistIds.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onReplayIntro={() => setShowIntro(true)}
        ambientDroneActive={ambientDroneActive}
        onToggleAmbientDrone={() => {
          const isPlaying = toggleCyberAmbientDrone();
          setAmbientDroneActive(isPlaying);
          if (isPlaying) {
            showToast('Cyber-Ambient Synth Drone Active', 'graphic_eq', 'text-[#00eefc]');
          } else {
            showToast('Cyber-Ambient Synth Drone Muted', 'volume_off', 'text-white/70');
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-16 pb-28 min-h-screen z-10">
        {/* View Transitions: Netflix style - old page zooms out 0.95 + new page zooms in from 1.05 with blur */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {activeTab === 'home' && (
              <div className="flex flex-col gap-4">
                {/* Hero Billboard with Ken Burns Zoom, Anamorphic Lens Flare, Ambient Trailer */}
                <HeroBillboard
                  item={heroMovie}
                  featuredItems={CATALOG_ITEMS}
                  isInWatchlist={watchlistIds.includes(heroMovie.id)}
                  onToggleWatchlist={handleToggleWatchlist}
                  onPlay={handlePlay}
                  onOpenDetails={(item) => setDetailsItem(item)}
                  onShowToast={showToast}
                />

                {/* Floating Glass Filter Bar [All | Tamil | English | Korean | Chinese | Hindi] */}
                <GlassFilterBar
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                  counts={languageCounts}
                />

                {/* Curated Channels & 4-Col Grid (KOFA, GreenTea, Hollywood, Trending, Trailers) */}
                <MediaShelf
                  items={CATALOG_ITEMS}
                  selectedLanguage={selectedLanguage}
                  watchlistIds={watchlistIds}
                  continueWatchingItems={continueWatching}
                  onPlay={handlePlay}
                  onToggleWatchlist={handleToggleWatchlist}
                  onShowToast={showToast}
                />

                {/* Supabase Engine Realtime & Vault Metrics */}
                <SupabaseEngineSection
                  watchlistCount={watchlistIds.length}
                  downloadedCount={downloadedCount}
                  onOpenVault={() => setActiveTab('vault')}
                />
              </div>
            )}

            {activeTab === 'trending' && (
              <TrendingView
                items={allItems}
                onPlay={handlePlay}
                onToggleWatchlist={handleToggleWatchlist}
                watchlistIds={watchlistIds}
              />
            )}

            {activeTab === 'spotlight' && (
              <SpotlightView
                items={allItems}
                onPlay={handlePlay}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'vault' && (
              <VaultView
                items={allItems}
                onPlay={handlePlay}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'mylist' && (
              <MyListView
                items={allItems}
                watchlistIds={watchlistIds}
                onPlay={handlePlay}
                onRemoveFromWatchlist={handleToggleWatchlist}
                onShowToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Theatrical Legal Compliance Footer */}
        <footer className="w-full max-w-7xl mx-auto px-4 pt-12 pb-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-white/50 font-mono-tech text-[11px]">
          <div className="flex flex-col gap-1">
            <p className="text-white/80 font-bold tracking-wider">
              NEONFLIX • 100% LEGAL STREAM ARCHIVE
            </p>
            <p className="text-white/40">
              Built with only public domain & official embeds. No pirated content. For portfolio/education.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-[#00e479]/15 text-[#00e479] border border-[#00e479]/30">
              Zero Piracy Guard Active
            </span>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="hover:text-white underline cursor-pointer"
            >
              Audit Sources
            </button>
          </div>
        </footer>
      </main>

      {/* Floating Glassmorphic Bottom Navigation Dock */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        watchlistCount={watchlistIds.length}
      />

      {/* 4K Video Player Modal with Red Timeline, Pip, Fullscreen, Netflix Button */}
      <AnimatePresence>
        {activePlayerItem && (
          <PlayerModal
            item={activePlayerItem}
            onClose={() => setActivePlayerItem(null)}
            isInWatchlist={watchlistIds.includes(activePlayerItem.id)}
            onToggleWatchlist={handleToggleWatchlist}
            onShowToast={showToast}
            currentUserId={currentUser?.id}
          />
        )}
      </AnimatePresence>

      {/* Command Palette (Press K or Cmd+K) Spotlight Search */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={allItems}
        onPlay={handlePlay}
        onToggleWatchlist={handleToggleWatchlist}
        watchlistIds={watchlistIds}
      />

      {/* Supabase Profile Modal: Top: Supabase Active, Middle: User avatar, Name, Email from getUser(), WATCHLIST SYNC, STREAM TIER, Bottom: Sign Out */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Details Modal */}
      <DetailsModal
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onPlay={handlePlay}
        isInWatchlist={detailsItem ? watchlistIds.includes(detailsItem.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Compliance / Audit Modal */}
      <ComplianceModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Interactive Toast Notifications */}
      <Toast toast={toast} />
    </div>
  );
}
