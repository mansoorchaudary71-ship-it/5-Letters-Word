import React, { Suspense, lazy, startTransition, useEffect, useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { WordFinder } from './components/WordFinder';
import { WordDetailModal } from './components/WordDetailModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { HelpModal } from './components/HelpModal';
import { Footer } from './components/Footer';
import { WordPage } from './components/WordPage';
import { Breadcrumbs, SeoContent } from './components/SeoContent';
import { Hero } from './components/Hero';
import { ToolsGrid } from './components/ToolsGrid';
import { CtaBand } from './components/CtaBand';
import { CommandPalette } from './components/CommandPalette';
import { WaveBackground } from './components/ui/WaveBackground';
import { useFavorites } from './hooks/useFavorites';
import { ALL_WORDS } from './data/words';
import { WordEntry } from './types/word';
import { Filter, HOME_ROUTE, RouteInfo, filterPath, resolveRoute, tabPath } from './seo/routes';
import { applyRouteHead, withBase } from './seo/links';

// Secondary tools are split into their own chunks so the home page (the word finder) loads less JavaScript.
const loadSolver = () => import('./components/WordleSolver').then((m) => ({ default: m.WordleSolver }));
const loadAnagram = () => import('./components/AnagramSolver').then((m) => ({ default: m.AnagramSolver }));
const loadBrowse = () => import('./components/BrowseDirectory').then((m) => ({ default: m.BrowseDirectory }));
const loadGame = () => import('./components/WordleGame').then((m) => ({ default: m.WordleGame }));
const loadStats = () => import('./components/LetterStatsView').then((m) => ({ default: m.LetterStatsView }));

const WordleSolver = lazy(loadSolver);
const AnagramSolver = lazy(loadAnagram);
const BrowseDirectory = lazy(loadBrowse);
const WordleGame = lazy(loadGame);
const LetterStatsView = lazy(loadStats);

/** Fetch every tool chunk in the background so switching tools never waits on the network. */
const preloadTools = () => {
  void loadSolver();
  void loadAnagram();
  void loadBrowse();
  void loadGame();
  void loadStats();
};

const BASE = import.meta.env.BASE_URL || '/';
const routeFromLocation = (): RouteInfo => resolveRoute(window.location.pathname, BASE) ?? HOME_ROUTE;

export default function App() {
  // The URL decides which tool (and which filter) is shown, so every tool has its own indexable page.
  const [route, setRoute] = useState<RouteInfo>(routeFromLocation);
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter state passed from Browse / Footer into WordFinder
  const [finderFilter, setFinderFilter] = useState<Filter>(route.filter);
  const activeTab: ActiveTab = route.tab;
  const isHome = route.path === '/';

  // Browser back / forward buttons
  useEffect(() => {
    const onPop = () => {
      const r = routeFromLocation();
      startTransition(() => {
        setRoute(r);
        setFinderFilter(r.filter);
      });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Once the first page is up, warm the other tools while the browser is idle
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preloadTools, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(preloadTools, 1200);
    return () => window.clearTimeout(t);
  }, []);

  // Global shortcuts: Ctrl/Cmd+K or "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((o) => !o);
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Keep <title>, description, canonical and social tags correct on every navigation
  useEffect(() => {
    applyRouteHead(route);
  }, [route]);

  const goToPath = (path: string, filter?: Filter) => {
    const next = resolveRoute(path, '/') ?? HOME_ROUTE;
    window.history.pushState({}, '', withBase(next.path));
    // A transition keeps the current page on screen until the next tool is ready (no spinner flash)
    startTransition(() => {
      setRoute(next);
      setFinderFilter(filter ?? next.filter);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const setActiveTab = (tab: ActiveTab) => goToPath(tabPath(tab));

  const { favorites, toggleFavorite, isFavorite, clearFavorites } = useFavorites();

  const handleRandomWord = () => {
    const random = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    setSelectedWord(random);
  };

  const handleNavigateToFinderWithFilter = (filter: Filter) => {
    // Filters with a dedicated page get their own URL; others stay on the finder page.
    goToPath(filterPath(filter) ?? '/', filter);
  };

  const navigate = (path: string) => goToPath(path);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onRandomWord={handleRandomWord}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {isHome && <Hero heading={route.h1} onNavigate={navigate} onSelectWord={setSelectedWord} />}

      {/* Main Content Area */}
      <main id="main-content" className={`relative isolate grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${isHome ? 'pt-4 sm:pt-6' : 'pt-8 sm:pt-10'}`}>
        {/* Inner pages: full-bleed abstract waves fading out under the page header */}
        {!isHome && (
          <WaveBackground
            variant="flow"
            className="absolute -z-10 left-1/2 -translate-x-1/2 top-0 w-screen h-60 sm:h-72 text-indigo-200/60 [mask-image:linear-gradient(to_bottom,#000,transparent)]"
          />
        )}
        <Breadcrumbs route={route} onNavigate={navigate} />

        <Suspense fallback={<div className="py-24 flex justify-center" role="status" aria-label="Loading"><span className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-brand animate-spin" /></div>}>
          {activeTab === 'finder' && (
            <WordFinder
              key={`${finderFilter.startsWith || ''}-${finderFilter.endsWith || ''}-${finderFilter.contains || ''}-${finderFilter.tag || ''}`}
              onSelectWord={setSelectedWord}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              initialStartsWith={finderFilter.startsWith || ''}
              initialEndsWith={finderFilter.endsWith || ''}
              initialContains={finderFilter.contains || ''}
              initialTag={finderFilter.tag || 'all'}
              heading={route.h1}
              asSubheading={isHome}
            />
          )}

          {activeTab === 'solver' && <WordleSolver onSelectWord={setSelectedWord} />}

          {activeTab === 'anagram' && <AnagramSolver onSelectWord={setSelectedWord} />}

          {activeTab === 'browse' && (
            <BrowseDirectory onSelectWord={setSelectedWord} onNavigateToFinderWithFilter={handleNavigateToFinderWithFilter} />
          )}

          {activeTab === 'game' && <WordleGame onSelectWord={setSelectedWord} heading={route.h1} />}

          {activeTab === 'stats' && <LetterStatsView heading={route.h1} />}
        </Suspense>

        {activeTab === 'word' && route.wordSlug && (
          <WordPage
            word={route.wordSlug}
            heading={route.h1}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onSelectWord={setSelectedWord}
          />
        )}

        {isHome && <ToolsGrid onNavigate={navigate} />}

        <SeoContent route={route} onNavigate={navigate} variant={activeTab === 'article' ? 'article' : 'under-tool'} />
      </main>

      {/* Word Detail Modal */}
      <WordDetailModal
        wordEntry={selectedWord}
        onClose={() => setSelectedWord(null)}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onSelectWord={setSelectedWord}
      />

      {/* Saved Words Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onClearFavorites={clearFavorites}
        onSelectWord={(entry) => {
          setSelectedWord(entry);
          setIsFavoritesOpen(false);
        }}
      />

      {/* Help & Rules Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
        onSelectWord={setSelectedWord}
      />

      <CtaBand onNavigate={navigate} />

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onNavigateToFinderWithFilter={handleNavigateToFinderWithFilter}
        onNavigate={navigate}
      />
    </div>
  );
}
