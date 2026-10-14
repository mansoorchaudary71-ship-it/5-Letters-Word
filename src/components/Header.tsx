import React, { useEffect, useState } from 'react';
import { tabHref } from '../seo/links';
import { Search, Sparkles, BookOpen, Shuffle, Bookmark, Gamepad2, BarChart3, HelpCircle, Type } from './ui/Icons';

export type ActiveTab = 'finder' | 'solver' | 'anagram' | 'browse' | 'game' | 'stats' | 'article' | 'word';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedCount: number;
  onOpenFavorites: () => void;
  onRandomWord: () => void;
  onOpenHelp: () => void;
  onOpenSearch: () => void;
}

// Real <a href> links so search engines can discover every page; clicks are handled in-app without a reload.
const handleNav = (e: React.MouseEvent, go: () => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" work
  e.preventDefault();
  go();
};

const NAV: { id: ActiveTab; label: string; short: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'finder', label: 'Word Finder', short: 'Finder', icon: Search },
  { id: 'solver', label: 'Wordle Solver', short: 'Solver', icon: Sparkles },
  { id: 'anagram', label: 'Anagrams', short: 'Anagrams', icon: Type },
  { id: 'browse', label: 'A–Z Directory', short: 'A–Z', icon: BookOpen },
  { id: 'game', label: 'Practice', short: 'Practice', icon: Gamepad2 },
  { id: 'stats', label: 'Letter Stats', short: 'Stats', icon: BarChart3 },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenFavorites,
  onRandomWord,
  onOpenHelp,
  onOpenSearch,
}) => {
  const [isMac, setIsMac] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-white/80 backdrop-blur-xl transition-[border-color,box-shadow] duration-200 border-b ${
        scrolled ? 'border-slate-200 shadow-[0_1px_0_rgb(10_10_10/0.02)]' : 'border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          {/* Brand */}
          <a
            href={tabHref('finder')}
            onClick={(e) => handleNav(e, () => setActiveTab('finder'))}
            aria-label="5-Letter Words home"
            className="flex items-center gap-2.5 select-none group shrink-0"
          >
            <span
              aria-hidden="true"
              className="grid grid-cols-5 gap-[2px] p-[3px] rounded-lg bg-brand transition-transform duration-300 group-hover:rotate-[-4deg]"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`w-[5px] h-[14px] rounded-[1.5px] ${i === 1 ? 'bg-hit' : i === 3 ? 'bg-near' : 'bg-white/90'}`}
                />
              ))}
            </span>
            <span className="font-semibold text-[15px] tracking-tight text-ink">
              5-Letter Words
            </span>
          </a>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5">
            {NAV.map((item) => {
              const active = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={tabHref(item.id)}
                  onClick={(e) => handleNav(e, () => setActiveTab(item.id))}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                    active ? 'bg-brand-soft text-brand font-semibold' : 'text-slate-500 hover:text-ink hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search words and tools"
              className="group flex items-center gap-2 h-9 pl-3 pr-2 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[13px]">Search</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500 font-sans">
                {isMac ? '⌘' : 'Ctrl'} K
              </kbd>
            </button>

            <button
              type="button"
              onClick={onRandomWord}
              title="Pick a random 5-letter word"
              aria-label="Random word"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-ink hover:bg-slate-100 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenFavorites}
              title="Saved words"
              aria-label={`Saved words${savedCount > 0 ? `, ${savedCount} saved` : ''}`}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-ink hover:bg-slate-100 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-brand text-white text-[10px] font-semibold flex items-center justify-center">
                  {savedCount > 99 ? '99+' : savedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenHelp}
              title="How it works"
              aria-label="Help"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / tablet pill rail */}
        <nav aria-label="Tools" className="flex lg:hidden overflow-x-auto pb-2.5 gap-1.5 no-scrollbar -mx-1 px-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={tabHref(item.id)}
                onClick={(e) => handleNav(e, () => setActiveTab(item.id))}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 h-8 px-3 whitespace-nowrap rounded-full text-xs font-medium shrink-0 border transition-colors ${
                  active
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.short}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
