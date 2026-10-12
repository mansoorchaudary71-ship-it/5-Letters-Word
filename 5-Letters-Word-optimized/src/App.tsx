import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { WordFinder } from './components/WordFinder';
import { WordDetailModal } from './components/WordDetailModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { HelpModal } from './components/HelpModal';
import { Footer } from './components/Footer';
import { WordPage } from './components/WordPage';
import { Breadcrumbs, SeoContent } from './components/SeoContent';
import { useFavorites } from './hooks/useFavorites';
import { ALL_WORDS } from './data/words';
import { WordEntry } from './types/word';
import { Filter, HOME_ROUTE, RouteInfo, filterPath, resolveRoute, tabPath } from './seo/routes';
import { applyRouteHead, withBase } from './seo/links';

// Secondary tools are split into their own chunks so the home page (the word finder) loads less JavaScript.
const WordleSolver = lazy(() => import('./components/WordleSolver').then((m) => ({ default: m.WordleSolver })));
const AnagramSolver = lazy(() => import('./components/AnagramSolver').then((m) => ({ default: m.AnagramSolver })));
const BrowseDirectory = lazy(() => import('./components/BrowseDirectory').then((m) => ({ default: m.BrowseDirectory })));
const WordleGame = lazy(() => import('./components/WordleGame').then((m) => ({ default: m.WordleGame })));
const LetterStatsView = lazy(() => import('./components/LetterStatsView').then((m) => ({ default: m.LetterStatsView })));

const BASE = import.meta.env.BASE_URL || '/';
const routeFromLocation = (): RouteInfo => resolveRoute(window.location.pathname, BASE) ?? HOME_ROUTE;

export default function App() {
  // The URL decides which tool (and which filter) is shown, so every tool has its own indexable page.
  const [route, setRoute] = useState<RouteInfo>(routeFromLocation);
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Filter state passed from Browse / Footer into WordFinder
  const [finderFilter, setFinderFilter] = useState<Filter>(route.filter);
  const activeTab: ActiveTab = route.tab;

  // Browser back / forward buttons
  useEffect(() => {
    const onPop = () => {
      const r = routeFromLocation();
      setRoute(r);
      setFinderFilter(r.filter);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Keep <title>, description, canonical and social tags correct on every navigation
  useEffect(() => {
    applyRouteHead(route);
  }, [route]);

  const goToPath = (path: string, filter?: Filter) => {
    const next = resolveRoute(path, '/') ?? HOME_ROUTE;
    window.history.pushState({}, '', withBase(next.path));
    setRoute(next);
    setFinderFilter(filter ?? next.filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-emerald-700 focus:shadow"
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
      />

      {/* Main Content Area */}
      <main id="main-content" className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full">
        <Breadcrumbs route={route} onNavigate={navigate} />

        <Suspense fallback={<div className="py-16 text-center text-sm text-slate-500" role="status">Loading…</div>}>
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
            />
          )}

          {activeTab === 'solver' && <WordleSolver onSelectWord={setSelectedWord} />}

          {activeTab === 'anagram' && <AnagramSolver onSelectWord={setSelectedWord} />}

          {activeTab === 'browse' && (
            <BrowseDirectory onSelectWord={setSelectedWord} onNavigateToFinderWithFilter={handleNavigateToFinderWithFilter} />
          )}

          {activeTab === 'game' && <WordleGame onSelectWord={setSelectedWord} />}

          {activeTab === 'stats' && <LetterStatsView />}
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

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onNavigateToFinderWithFilter={handleNavigateToFinderWithFilter}
        onNavigate={navigate}
      />
    </div>
  );
}
