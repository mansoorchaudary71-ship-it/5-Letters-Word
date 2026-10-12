import React, { useState, useMemo } from 'react';
import { WordEntry } from '../types/word';
import { ALL_WORDS } from '../data/words';
import { BookOpen, ChevronRight, Hash, Sparkles } from 'lucide-react';

interface BrowseDirectoryProps {
  onSelectWord: (word: WordEntry) => void;
  onNavigateToFinderWithFilter: (filter: { startsWith?: string; endsWith?: string; tag?: string }) => void;
}

export const BrowseDirectory: React.FC<BrowseDirectoryProps> = ({
  onSelectWord,
  onNavigateToFinderWithFilter,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [browseMode, setBrowseMode] = useState<'starts' | 'ends'>('starts');

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Counts per starting letter
  const startLetterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALPHABET.forEach((l) => (counts[l] = 0));
    ALL_WORDS.forEach((w) => {
      const first = w.word[0];
      if (counts[first] !== undefined) counts[first]++;
    });
    return counts;
  }, []);

  // Counts per ending letter
  const endLetterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALPHABET.forEach((l) => (counts[l] = 0));
    ALL_WORDS.forEach((w) => {
      const last = w.word[4];
      if (counts[last] !== undefined) counts[last]++;
    });
    return counts;
  }, []);

  const activeWords = useMemo(() => {
    return ALL_WORDS.filter((entry) => {
      if (browseMode === 'starts') {
        return entry.word.startsWith(selectedLetter);
      } else {
        return entry.word.endsWith(selectedLetter);
      }
    });
  }, [selectedLetter, browseMode]);

  const collections = [
    {
      title: 'Wordle Best Openers',
      desc: 'Top starting words with highest vowel & consonant coverage (ADIEU, CRANE, SLATE...)',
      tag: 'wordle-top',
      icon: '⭐',
      count: ALL_WORDS.filter((w) => w.tags.includes('wordle-top')).length,
    },
    {
      title: 'Palindromes (Reads Same Backwards)',
      desc: 'Symmetrical 5-letter words like RADAR, KAYAK, LEVEL, MADAM, ROTOR, CIVIC',
      tag: 'palindrome',
      icon: '🔄',
      count: ALL_WORDS.filter((w) => w.tags.includes('palindrome')).length,
    },
    {
      title: 'Words with Zero Vowels',
      desc: 'Tournament words without A, E, I, O, U like GLYPH, CRYPT, DRYLY, LYNCH, MYRRH',
      tag: 'no-vowels',
      icon: '🚫',
      count: ALL_WORDS.filter((w) => w.tags.includes('no-vowels')).length,
    },
    {
      title: 'Double Letters',
      desc: 'Words featuring consecutive repeated letters (APPLE, SPEED, PIZZA, CHILL)',
      tag: 'double-letters',
      icon: '🔤',
      count: ALL_WORDS.filter((w) => w.tags.includes('double-letters')).length,
    },
    {
      title: 'High Scrabble Value (15+ Points)',
      desc: 'Words loaded with heavy tournament tiles (Q, Z, J, X, K)',
      tag: 'high-scoring',
      icon: '🏆',
      count: ALL_WORDS.filter((w) => w.tags.includes('high-scoring')).length,
    },
    {
      title: 'Vowel-Rich (3+ Vowels)',
      desc: 'Vowel-heavy words like AUDIO, ADIEU, EQUAL, HOUSE, OCEAN',
      tag: 'vowel-rich',
      icon: '💎',
      count: ALL_WORDS.filter((w) => w.tags.includes('vowel-rich')).length,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Directory Title */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              5-Letter Words A-Z Directory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse canonical lists of 5-letter words indexed by starting letter, ending letter, or curated niche collections.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setBrowseMode('starts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                browseMode === 'starts'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Starts With
            </button>
            <button
              onClick={() => setBrowseMode('ends')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                browseMode === 'ends'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ends With
            </button>
          </div>
        </div>

        {/* 26 Letters Alphabet Picker */}
        <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-1.5 sm:gap-2 mt-6">
          {ALPHABET.map((letter) => {
            const count = browseMode === 'starts' ? startLetterCounts[letter] : endLetterCounts[letter];
            const isSelected = selectedLetter === letter;

            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs scale-105'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <span className="font-black text-base sm:text-lg">{letter}</span>
                <span
                  className={`text-[9px] font-semibold ${
                    isSelected ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Curated Niche Collections Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Featured 5-Letter Word Collections
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col.tag}
              onClick={() => onNavigateToFinderWithFilter({ tag: col.tag })}
              className="bg-white hover:bg-emerald-50/40 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{col.icon}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {col.count} words
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {col.desc}
                </p>
              </div>

              <div className="flex items-center justify-end text-xs font-bold text-emerald-600 mt-3 pt-2 border-t border-slate-100 group-hover:translate-x-1 transition-transform">
                <span>Browse All</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Words for Currently Selected Letter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">
            5-Letter Words {browseMode === 'starts' ? 'Starting with' : 'Ending in'}{' '}
            <span className="text-emerald-600 font-black text-xl">&apos;{selectedLetter}&apos;</span>{' '}
            <span className="text-slate-400 font-normal text-sm">({activeWords.length} words)</span>
          </h2>

          <button
            onClick={() =>
              onNavigateToFinderWithFilter(
                browseMode === 'starts' ? { startsWith: selectedLetter } : { endsWith: selectedLetter }
              )
            }
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Open in Advanced Finder <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {activeWords.slice(0, 48).map((entry) => (
            <div
              key={entry.word}
              onClick={() => onSelectWord(entry)}
              className="bg-white hover:bg-emerald-50/50 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-base tracking-widest text-slate-900 group-hover:text-emerald-700">
                  {entry.word}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                  {entry.scrabbleScore}p
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                {entry.definition}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
