import React from 'react';
import { ActiveTab } from './Header';
import { filterHref, tabHref, withBase } from '../seo/links';
import { resolveRoute } from '../seo/routes';

const handleNav = (e: React.MouseEvent, go: () => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  go();
};

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  onNavigateToFinderWithFilter: (filter: { startsWith?: string; endsWith?: string; tag?: string }) => void;
  onNavigate: (path: string) => void;
}

const INFO_LINKS = [
  { label: 'Wordle Strategy Guide', path: '/guides/wordle-strategy/' },
  { label: 'Scrabble 5-Letter Word Guide', path: '/guides/scrabble-five-letter-words/' },
  { label: 'Find a Word From Letters', path: '/guides/find-a-word-from-letters/' },
  { label: 'About', path: '/about/' },
  { label: 'Contact', path: '/contact/' },
  { label: 'Privacy Policy', path: '/privacy-policy/' },
  { label: 'Terms of Use', path: '/terms/' },
  { label: 'Sitemap', path: '/sitemap/' },
].filter((l) => resolveRoute(l.path) !== null);

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onNavigateToFinderWithFilter,
  onNavigate,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Quick Link Navigation Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Popular Starting Letters</h4>
            <ul className="space-y-1.5">
              {['S', 'C', 'B', 'T', 'P', 'M', 'R'].map((letter) => (
                <li key={letter}>
                  <a
                    href={filterHref({ startsWith: letter })}
                    onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ startsWith: letter }))}
                    className="hover:text-emerald-700 transition-colors"
                  >
                    5-Letter Words Starting with {letter}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Popular Ending Letters</h4>
            <ul className="space-y-1.5">
              {['E', 'Y', 'S', 'T', 'D', 'R', 'N'].map((letter) => (
                <li key={letter}>
                  <a
                    href={filterHref({ endsWith: letter })}
                    onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ endsWith: letter }))}
                    className="hover:text-emerald-700 transition-colors"
                  >
                    5-Letter Words Ending with {letter}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Curated Word Lists</h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href={filterHref({ tag: 'wordle-top' })}
                  onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ tag: 'wordle-top' }))}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Best Wordle Opening Words
                </a>
              </li>
              <li>
                <a
                  href={filterHref({ tag: 'palindrome' })}
                  onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ tag: 'palindrome' }))}
                  className="hover:text-emerald-700 transition-colors"
                >
                  5-Letter Palindromes
                </a>
              </li>
              <li>
                <a
                  href={filterHref({ tag: 'no-vowels' })}
                  onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ tag: 'no-vowels' }))}
                  className="hover:text-emerald-700 transition-colors"
                >
                  5-Letter Words with No Vowels
                </a>
              </li>
              <li>
                <a
                  href={filterHref({ tag: 'double-letters' })}
                  onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ tag: 'double-letters' }))}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Words with Double Letters
                </a>
              </li>
              <li>
                <a
                  href={filterHref({ tag: 'high-scoring' })}
                  onClick={(e) => handleNav(e, () => onNavigateToFinderWithFilter({ tag: 'high-scoring' }))}
                  className="hover:text-emerald-700 transition-colors"
                >
                  High Scrabble Point Words
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Word Tools</h4>
            <ul className="space-y-1.5">
              <li>
                <a href={tabHref('solver')} onClick={(e) => handleNav(e, () => setActiveTab('solver'))} className="hover:text-emerald-700 transition-colors">
                  Interactive Wordle Solver
                </a>
              </li>
              <li>
                <a href={tabHref('anagram')} onClick={(e) => handleNav(e, () => setActiveTab('anagram'))} className="hover:text-emerald-700 transition-colors">
                  Letter Unscrambler &amp; Anagrams
                </a>
              </li>
              <li>
                <a href={tabHref('game')} onClick={(e) => handleNav(e, () => setActiveTab('game'))} className="hover:text-emerald-700 transition-colors">
                  Daily Practice Wordle
                </a>
              </li>
              <li>
                <a href={tabHref('stats')} onClick={(e) => handleNav(e, () => setActiveTab('stats'))} className="hover:text-emerald-700 transition-colors">
                  Letter Frequency Heatmaps
                </a>
              </li>
              <li>
                <a href={tabHref('browse')} onClick={(e) => handleNav(e, () => setActiveTab('browse'))} className="hover:text-emerald-700 transition-colors">
                  Complete A-Z Directory
                </a>
              </li>
            </ul>
          </div>
        </div>

        <nav aria-label="Guides and information" className="pt-6 border-t border-slate-200">
          <h4 className="font-bold text-slate-900 text-sm mb-3">Guides &amp; Information</h4>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
            {INFO_LINKS.map((l) => (
              <li key={l.path}>
                <a href={withBase(l.path)} onClick={(e) => handleNav(e, () => onNavigate(l.path))} className="hover:text-emerald-700 transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-2">
          <p className="text-slate-600 font-medium">
            5-Letter Words Directory • The premier reference tool for Wordle, Scrabble, crosswords, and vocabulary enthusiasts.
          </p>
          <p className="text-slate-400 text-[11px]">
            Wordle is a registered trademark of The New York Times Company. Scrabble is a registered trademark of Hasbro and Mattel. This independent educational tool is not affiliated with or endorsed by any trademark holders.
          </p>
        </div>
      </div>
    </footer>
  );
};
