import React, { useState, useMemo } from 'react';
import { CardBlobs } from './ui/Blobs';
import { WordEntry } from '../types/word';
import { ALL_WORDS } from '../data/words';
import { buildLetterFreqs, scoreWordWithFreqs } from '../data/letterStats';
import { Sparkles, RotateCcw, AlertCircle, Copy, Check, ChevronRight } from './ui/Icons';
import { copyText } from '../lib/clipboard';

interface WordleSolverProps {
  onSelectWord: (word: WordEntry) => void;
  /** Page <h1>; comes from the route in src/seo/routes.ts so the visible H1 always matches the SEO title. */
  heading?: string;
}

export const WordleSolver: React.FC<WordleSolverProps> = ({ onSelectWord, heading = 'Wordle Solver & Wordle Helper' }) => {
  // Green letters: exact position (index 0 to 4)
  const [greens, setGreens] = useState<string[]>(['', '', '', '', '']);

  // Yellow letters: letter -> Set of positions it CANNOT be in (e.g. 'A' cannot be in pos 0)
  // We can represent yellow letters as: array of 5 slots, where each slot has letters excluded from that slot
  const [yellowSlots, setYellowSlots] = useState<string[]>(['', '', '', '', '']);
  const [mustContain, setMustContain] = useState<string>('');

  // Gray / excluded letters
  const [grays, setGrays] = useState<string>('');

  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  // Handle green changes
  const handleGreenChange = (idx: number, val: string) => {
    const char = val.slice(-1).toUpperCase();
    const newGreens = [...greens];
    newGreens[idx] = /^[A-Z]$/.test(char) ? char : '';
    setGreens(newGreens);

    if (char && idx < 4) {
      document.getElementById(`green-input-${idx + 1}`)?.focus();
    }
  };

  // Handle yellow slots changes
  const handleYellowSlotChange = (idx: number, val: string) => {
    const chars = val.toUpperCase().replace(/[^A-Z]/g, '');
    const newYellows = [...yellowSlots];
    newYellows[idx] = chars;
    setYellowSlots(newYellows);

    // Auto update mustContain with all unique yellow chars
    const allYellow = new Set(newYellows.join('').split(''));
    mustContain.split('').forEach((ch) => allYellow.add(ch));
    setMustContain(Array.from(allYellow).join(''));
  };

  const handleReset = () => {
    setGreens(['', '', '', '', '']);
    setYellowSlots(['', '', '', '', '']);
    setMustContain('');
    setGrays('');
  };

  // Calculate matching candidates
  const matchingWords = useMemo(() => {
    const graySet = new Set(grays.toUpperCase().replace(/[^A-Z]/g, '').split(''));
    const mustSet = new Set(mustContain.toUpperCase().replace(/[^A-Z]/g, '').split(''));

    // Also include yellow slot letters in mustSet
    yellowSlots.forEach((slot) => {
      slot.split('').forEach((ch) => {
        if (ch) mustSet.add(ch);
      });
    });

    return ALL_WORDS.filter((entry) => {
      const w = entry.word;

      // 1. Green check: must match green at exact slot
      for (let i = 0; i < 5; i++) {
        if (greens[i] && w[i] !== greens[i]) {
          return false;
        }
      }

      // 2. Must contain all required yellow letters
      for (const ch of mustSet) {
        if (!w.includes(ch)) return false;
      }

      // 3. Yellow slot exclusion: word[i] cannot be any of the letters in yellowSlots[i]
      for (let i = 0; i < 5; i++) {
        const excludedInThisSlot = yellowSlots[i];
        if (excludedInThisSlot && excludedInThisSlot.includes(w[i])) {
          return false;
        }
      }

      // 4. Gray check: cannot contain gray letters UNLESS that letter is already in green or mustSet
      for (const ch of graySet) {
        if (w.includes(ch)) {
          // If the letter was also confirmed green or yellow, it might be allowed if count matches,
          // but standard Wordle gray means letter is completely absent
          const isKnownInWord = greens.includes(ch) || mustSet.has(ch);
          if (!isKnownInWord) {
            return false;
          }
        }
      }

      return true;
    });
  }, [greens, yellowSlots, mustContain, grays]);

  // Top recommended next guesses based on letter entropy
  const topRecommendations = useMemo(() => {
    if (matchingWords.length <= 1) return matchingWords;

    const freqs = buildLetterFreqs(matchingWords);
    const scored = matchingWords.map((entry) => ({
      entry,
      score: scoreWordWithFreqs(entry.word, freqs),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((s) => s.entry);
  }, [matchingWords]);

  const handleCopyWord = (word: string) => {
    void copyText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Solver Instructions Header */}
      <div className="relative isolate">
        <CardBlobs />
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand" />
              {heading}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter known Green (correct position), Yellow (present letters), and Gray (absent) clues to instantly uncover remaining solutions.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors self-start sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All Clues
          </button>
        </div>

        {/* Input Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {/* 1. GREEN LETTERS */}
          <div className="bg-hit/10 border border-hit/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-hit"></span>
                1. Correct Positions (Green)
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">Letters in the right spot</p>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {[0, 1, 2, 3, 4].map((idx) => (
                <input
                  key={idx}
                  id={`green-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={greens[idx]}
                  placeholder="_"
                  onChange={(e) => handleGreenChange(idx, e.target.value)}
                  aria-label={`Correct letter in position ${idx + 1}`}
                  className={`w-11 h-12 text-center font-semibold text-xl uppercase rounded-lg border-2 outline-hidden transition-colors placeholder:text-emerald-700/40 focus:ring-4 focus:ring-hit/30 ${
                    greens[idx] ? 'bg-hit border-hit-dark text-ink shadow-card' : 'bg-white border-hit/50 text-slate-900'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 2. YELLOW LETTERS */}
          <div className="bg-near/10 border border-near/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-near"></span>
                2. Present In Word (Yellow)
              </span>
            </div>
            <p className="text-[11px] text-amber-700">Enter letters excluded from each spot</p>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {[0, 1, 2, 3, 4].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={4}
                  value={yellowSlots[idx]}
                  placeholder={`≠`}
                  onChange={(e) => handleYellowSlotChange(idx, e.target.value)}
                  title={`Letters NOT at position ${idx + 1}`}
                  aria-label={`Letters not in position ${idx + 1}`}
                  className={`w-11 h-12 text-center font-bold text-sm uppercase rounded-lg border-2 outline-hidden transition-colors placeholder:text-amber-700/50 focus:ring-4 focus:ring-near/30 ${
                    yellowSlots[idx] ? 'bg-near border-near-dark text-ink shadow-card' : 'bg-white border-near/50 text-slate-900'
                  }`}
                />
              ))}
            </div>
            <div className="pt-1">
              <label className="block text-[10px] font-semibold text-amber-900 mb-1">
                All Known Yellow Letters:
              </label>
              <input
                type="text"
                placeholder="e.g. E, R, T"
                value={mustContain}
                onChange={(e) => setMustContain(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                className="w-full px-2.5 py-1.5 bg-white uppercase font-bold text-xs rounded-lg border border-near/50 focus:border-near-dark focus:ring-4 focus:ring-near/30 outline-hidden"
              />
            </div>
          </div>

          {/* 3. GRAY LETTERS */}
          <div className="bg-miss/10 border border-miss/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-miss"></span>
                3. Ruled Out Letters (Gray)
              </span>
            </div>
            <p className="text-[11px] text-slate-600">Letters definitely not in the word</p>
            <textarea
              rows={3}
              placeholder="Type ruled out letters (e.g. B, C, D, M, P, U)..."
              value={grays}
              onChange={(e) => setGrays(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              className="w-full px-3 py-2 bg-white text-slate-900 font-mono font-bold text-sm uppercase rounded-lg border border-miss/50 focus:border-miss focus:ring-4 focus:ring-miss/25 outline-hidden resize-none"
            />
            {grays && (
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(grays.split(''))).sort().map((ch) => (
                  <span
                    key={ch}
                    onClick={() => setGrays(grays.replace(new RegExp(ch, 'g'), ''))}
                    title="Click to remove from excluded"
                    className="cursor-pointer px-1.5 py-0.5 bg-miss hover:bg-rose-600 text-white font-mono text-[10px] font-bold rounded"
                  >
                    {ch} ×
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Recommended Next Guesses Banner */}
      {topRecommendations.length > 0 && matchingWords.length > 1 && (
        <div className="bg-ink text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h2 className="font-semibold text-base tracking-tight">
                Top Statistically Recommended Next Guesses
              </h2>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
              Eliminates Most Possibilities
            </span>
          </div>
          <p className="text-xs text-slate-400">
            These words test the most frequent remaining letters to narrow down the target word fastest:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {topRecommendations.map((rec) => (
              <button
                key={rec.word}
                onClick={() => onSelectWord(rec)}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-sm tracking-widest shadow-card transition-all hover:scale-105"
              >
                <span>{rec.word}</span>
                <span className="text-[10px] text-slate-400 font-normal">({rec.scrabbleScore} pts)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {matchingWords.length.toLocaleString()}{' '}
            <span className="text-slate-500 font-normal">Valid Words Remaining</span>
          </h3>
        </div>
      </div>

      {/* Matching Words Grid */}
      {matchingWords.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <AlertCircle className="w-8 h-8 text-near-dark mx-auto mb-2" />
          <p className="text-base font-bold text-slate-800">No matching words found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Please check your clues. You might have contradictory green, yellow, or gray letters.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-brand text-white font-medium text-xs rounded-full hover:bg-brand-hover"
          >
            Reset Clues
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {matchingWords.slice(0, 96).map((wordEntry) => (
            <div
              key={wordEntry.word}
              onClick={() => onSelectWord(wordEntry)}
              className="bg-white hover:bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-slate-300 shadow-card hover:shadow-card transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base tracking-widest text-slate-900 group-hover:text-ink">
                  {wordEntry.word}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyWord(wordEntry.word);
                  }}
                  title="Copy word"
                  className="p-1 text-slate-300 hover:text-ink rounded transition-colors"
                >
                  {copiedWord === wordEntry.word ? (
                    <Check className="w-3.5 h-3.5 text-ink" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                {wordEntry.definition}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100">
                <span>{wordEntry.scrabbleScore} pts</span>
                <span className="font-semibold text-ink flex items-center group-hover:translate-x-0.5 transition-transform">
                  Details <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
