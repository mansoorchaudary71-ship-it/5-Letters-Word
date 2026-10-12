import React from 'react';
import { ActiveTab } from './Header';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  onNavigateToFinderWithFilter: (filter: { startsWith?: string; endsWith?: string; tag?: string }) => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onNavigateToFinderWithFilter,
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
                  <button
                    onClick={() => {
                      setActiveTab('finder');
                      onNavigateToFinderWithFilter({ startsWith: letter });
                    }}
                    className="hover:text-emerald-700 transition-colors"
                  >
                    5-Letter Words Starting with {letter}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Popular Ending Letters</h4>
            <ul className="space-y-1.5">
              {['E', 'Y', 'S', 'T', 'D', 'R', 'N'].map((letter) => (
                <li key={letter}>
                  <button
                    onClick={() => {
                      setActiveTab('finder');
                      onNavigateToFinderWithFilter({ endsWith: letter });
                    }}
                    className="hover:text-emerald-700 transition-colors"
                  >
                    5-Letter Words Ending with {letter}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Curated Word Lists</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('finder');
                    onNavigateToFinderWithFilter({ tag: 'wordle-top' });
                  }}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Best Wordle Opening Words
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('finder');
                    onNavigateToFinderWithFilter({ tag: 'palindrome' });
                  }}
                  className="hover:text-emerald-700 transition-colors"
                >
                  5-Letter Palindromes
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('finder');
                    onNavigateToFinderWithFilter({ tag: 'no-vowels' });
                  }}
                  className="hover:text-emerald-700 transition-colors"
                >
                  5-Letter Words with No Vowels
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('finder');
                    onNavigateToFinderWithFilter({ tag: 'double-letters' });
                  }}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Words with Double Letters
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('finder');
                    onNavigateToFinderWithFilter({ tag: 'high-scoring' });
                  }}
                  className="hover:text-emerald-700 transition-colors"
                >
                  High Scrabble Point Words
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Word Tools</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setActiveTab('solver')} className="hover:text-emerald-700 transition-colors">
                  Interactive Wordle Solver
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('anagram')} className="hover:text-emerald-700 transition-colors">
                  Letter Unscrambler &amp; Anagrams
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('game')} className="hover:text-emerald-700 transition-colors">
                  Daily Practice Wordle
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('stats')} className="hover:text-emerald-700 transition-colors">
                  Letter Frequency Heatmaps
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('browse')} className="hover:text-emerald-700 transition-colors">
                  Complete A-Z Directory
                </button>
              </li>
            </ul>
          </div>
        </div>

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
