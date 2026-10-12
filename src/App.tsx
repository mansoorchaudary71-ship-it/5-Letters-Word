import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { WordFinder } from './components/WordFinder';
import { WordleSolver } from './components/WordleSolver';
import { AnagramSolver } from './components/AnagramSolver';
import { BrowseDirectory } from './components/BrowseDirectory';
import { WordleGame } from './components/WordleGame';
import { LetterStatsView } from './components/LetterStatsView';
import { WordDetailModal } from './components/WordDetailModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { HelpModal } from './components/HelpModal';
import { Footer } from './components/Footer';
import { useFavorites } from './hooks/useFavorites';
import { ALL_WORDS } from './data/words';
import { WordEntry } from './types/word';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('finder');
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Filter state passed from Browse / Footer into WordFinder
  const [finderFilter, setFinderFilter] = useState<{
    startsWith?: string;
    endsWith?: string;
    tag?: string;
  }>({});

  const { favorites, toggleFavorite, isFavorite, clearFavorites } = useFavorites();

  const handleRandomWord = () => {
    const random = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    setSelectedWord(random);
  };

  const handleNavigateToFinderWithFilter = (filter: {
    startsWith?: string;
    endsWith?: string;
    tag?: string;
  }) => {
    setFinderFilter(filter);
    setActiveTab('finder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
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
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full">
        {activeTab === 'finder' && (
          <WordFinder
            key={`${finderFilter.startsWith || ''}-${finderFilter.endsWith || ''}-${finderFilter.tag || ''}`}
            onSelectWord={setSelectedWord}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            initialStartsWith={finderFilter.startsWith || ''}
            initialEndsWith={finderFilter.endsWith || ''}
            initialTag={finderFilter.tag || 'all'}
          />
        )}

        {activeTab === 'solver' && (
          <WordleSolver onSelectWord={setSelectedWord} />
        )}

        {activeTab === 'anagram' && (
          <AnagramSolver onSelectWord={setSelectedWord} />
        )}

        {activeTab === 'browse' && (
          <BrowseDirectory
            onSelectWord={setSelectedWord}
            onNavigateToFinderWithFilter={handleNavigateToFinderWithFilter}
          />
        )}

        {activeTab === 'game' && (
          <WordleGame onSelectWord={setSelectedWord} />
        )}

        {activeTab === 'stats' && (
          <LetterStatsView />
        )}
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
      />
    </div>
  );
}
