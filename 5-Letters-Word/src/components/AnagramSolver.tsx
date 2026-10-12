import React, { useState, useMemo } from 'react';
import { WordEntry } from '../types/word';
import { ALL_WORDS } from '../data/words';
import { Shuffle, HelpCircle, ChevronRight, Copy, Check } from 'lucide-react';

interface AnagramSolverProps {
  onSelectWord: (word: WordEntry) => void;
}

export const AnagramSolver: React.FC<AnagramSolverProps> = ({ onSelectWord }) => {
  const [lettersInput, setLettersInput] = useState<string>('EARTH');
  const [allowSubAnagrams, setAllowSubAnagrams] = useState<boolean>(false);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  // Quick preset letter racks
  const presets = ['EARTH', 'CRANE', 'STARE', 'PLANT', 'LIGHT', 'AUDIO', 'STONE', 'DREAM'];

  const results = useMemo(() => {
    const raw = lettersInput.toUpperCase().replace(/[^A-Z\?\*]/g, '');
    if (!raw) return [];

    const wildcardsCount = (raw.match(/[\?\*]/g) || []).length;
    const cleanLetters = raw.replace(/[\?\*]/g, '');

    // Letter frequency map of input
    const inputCounts: Record<string, number> = {};
    for (const char of cleanLetters) {
      inputCounts[char] = (inputCounts[char] || 0) + 1;
    }

    return ALL_WORDS.filter((entry) => {
      const w = entry.word;
      const wordCounts: Record<string, number> = {};
      for (const char of w) {
        wordCounts[char] = (wordCounts[char] || 0) + 1;
      }

      let neededWildcards = 0;
      for (const [char, count] of Object.entries(wordCounts)) {
        const available = inputCounts[char] || 0;
        if (available < count) {
          neededWildcards += count - available;
        }
      }

      if (neededWildcards > wildcardsCount) {
        return false;
      }

      // If strict exact anagram (and no wildcards)
      if (!allowSubAnagrams && wildcardsCount === 0 && cleanLetters.length === 5) {
        return cleanLetters.split('').sort().join('') === w.split('').sort().join('');
      }

      return true;
    }).sort((a, b) => b.scrabbleScore - a.scrabbleScore);
  }, [lettersInput, allowSubAnagrams]);

  const handleCopyWord = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Container */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shuffle className="w-6 h-6 text-emerald-600" />
            5-Letter Anagram Solver &amp; Letter Unscrambler
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unscramble any letters to discover all valid 5-letter anagrams. Use <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">?</code> for wildcards.
          </p>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative grow">
            <input
              type="text"
              placeholder="Enter your rack letters (e.g. TEARS, A?LE, OUND)..."
              value={lettersInput}
              onChange={(e) => setLettersInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-slate-50 uppercase font-mono font-black text-xl tracking-widest text-slate-900 rounded-xl border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all"
            />
          </div>

          <button
            onClick={() => setLettersInput(lettersInput.split('').sort(() => 0.5 - Math.random()).join(''))}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <Shuffle className="w-4 h-4 text-emerald-600" />
            Shuffle Letters
          </button>
        </div>

        {/* Presets and options */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Try racks:</span>
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setLettersInput(preset)}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-slate-700 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowSubAnagrams}
              onChange={(e) => setAllowSubAnagrams(e.target.checked)}
              className="rounded-sm text-emerald-600 focus:ring-emerald-500"
            />
            <span>Include partial letter matches (sub-anagrams)</span>
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-extrabold text-slate-900">
          {results.length.toLocaleString()}{' '}
          <span className="text-slate-500 font-normal">Matching 5-letter anagrams</span>
        </h2>
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-base font-bold text-slate-800">No 5-letter anagrams found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adding wildcards like &apos;?&apos; or check for letter typos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {results.map((wordEntry) => (
            <div
              key={wordEntry.word}
              onClick={() => onSelectWord(wordEntry)}
              className="bg-white hover:bg-emerald-50/50 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-base tracking-widest text-slate-900 group-hover:text-emerald-700">
                  {wordEntry.word}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyWord(wordEntry.word);
                  }}
                  title="Copy word"
                  className="p-1 text-slate-300 hover:text-emerald-600 rounded transition-colors"
                >
                  {copiedWord === wordEntry.word ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                {wordEntry.definition}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {wordEntry.scrabbleScore} pts
                </span>
                <span className="font-semibold text-slate-500 flex items-center group-hover:text-emerald-600">
                  View <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
