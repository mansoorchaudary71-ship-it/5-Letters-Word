import React from 'react';
import { tabHref } from '../seo/links';
import { Search, Sparkles, BookOpen, Shuffle, Bookmark, Gamepad2, BarChart3, HelpCircle } from 'lucide-react';

export type ActiveTab = 'finder' | 'solver' | 'anagram' | 'browse' | 'game' | 'stats' | 'article' | 'word';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedCount: number;
  onOpenFavorites: () => void;
  onRandomWord: () => void;
  onOpenHelp: () => void;
}

// Real <a href> links so search engines can discover every page; clicks are handled in-app without a reload.
const handleNav = (e: React.MouseEvent, go: () => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" work
  e.preventDefault();
  go();
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenFavorites,
  onRandomWord,
  onOpenHelp,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with 5 tiles */}
          <a
            href={tabHref('finder')}
            onClick={(e) => handleNav(e, () => setActiveTab('finder'))}
            aria-label="5-Letter Words home"
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="flex gap-0.5">
              {['5', 'W', 'O', 'R', 'D'].map((char, idx) => (
                <span
                  key={idx}
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-black text-sm sm:text-base rounded-md text-white transition-transform duration-200 group-hover:-translate-y-0.5 ${
                    idx === 0
                      ? 'bg-amber-500 shadow-xs'
                      : idx % 2 === 1
                      ? 'bg-emerald-600 shadow-xs'
                      : 'bg-emerald-700 shadow-xs'
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                5-Letter<span className="text-emerald-600 font-black">Words</span>
              </span>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest -mt-1">
                Wordle &amp; Scrabble Dictionary
              </span>
            </div>
          </a>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href={tabHref('finder')}
              onClick={(e) => handleNav(e, () => setActiveTab('finder'))}
              aria-current={activeTab === 'finder' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'finder'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              Word Finder
            </a>

            <a
              href={tabHref('solver')}
              onClick={(e) => handleNav(e, () => setActiveTab('solver'))}
              aria-current={activeTab === 'solver' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'solver'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Wordle Solver
            </a>

            <a
              href={tabHref('anagram')}
              onClick={(e) => handleNav(e, () => setActiveTab('anagram'))}
              aria-current={activeTab === 'anagram' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'anagram'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="font-mono font-bold text-xs bg-slate-200 text-slate-700 px-1 py-0.5 rounded">A-Z</span>
              Anagrams
            </a>

            <a
              href={tabHref('browse')}
              onClick={(e) => handleNav(e, () => setActiveTab('browse'))}
              aria-current={activeTab === 'browse' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'browse'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              A-Z Directory
            </a>

            <a
              href={tabHref('game')}
              onClick={(e) => handleNav(e, () => setActiveTab('game'))}
              aria-current={activeTab === 'game' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'game'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-amber-500" />
              Practice Game
            </a>

            <a
              href={tabHref('stats')}
              onClick={(e) => handleNav(e, () => setActiveTab('stats'))}
              aria-current={activeTab === 'stats' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Stats &amp; Heatmap
            </a>
          </nav>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRandomWord}
              title="Pick a random 5-letter word"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80"
            >
              <Shuffle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Random Word</span>
            </button>

            <button
              onClick={onOpenFavorites}
              title="View saved 5-letter words"
              className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenHelp}
              title="Wordle &amp; Scrabble guidelines"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Scroller */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1.5 no-scrollbar">
          {[
            { id: 'finder', label: 'Finder', icon: Search },
            { id: 'solver', label: 'Wordle Solver', icon: Sparkles },
            { id: 'anagram', label: 'Anagrams', icon: BookOpen },
            { id: 'browse', label: 'A-Z Lists', icon: BookOpen },
            { id: 'game', label: 'Play Wordle', icon: Gamepad2 },
            { id: 'stats', label: 'Letter Stats', icon: BarChart3 },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={tabHref(item.id as ActiveTab)}
                onClick={(e) => handleNav(e, () => setActiveTab(item.id as ActiveTab))}
                aria-current={isCurrent ? 'page' : undefined}
                className={`flex items-center gap-1 px-3 py-1.5 whitespace-nowrap rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
};
