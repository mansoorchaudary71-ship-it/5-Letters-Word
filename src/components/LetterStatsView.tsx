import React, { useMemo, useState } from 'react';
import { computeOverallFrequencies, computePositionalFrequencies } from '../data/letterStats';
import { BarChart3, TrendingUp, Lightbulb } from 'lucide-react';

export const LetterStatsView: React.FC = () => {
  const overallFreqs = useMemo(() => computeOverallFrequencies(), []);
  const positionalFreqs = useMemo(() => computePositionalFrequencies(), []);
  const [activePos, setActivePos] = useState<number>(0);

  const topOpeners = [
    { word: 'ADIEU', vowels: 4, consonants: 1, score: 6, why: 'Tests 4 out of 5 common vowels on guess 1.' },
    { word: 'CRANE', vowels: 2, consonants: 3, score: 7, why: 'High-frequency consonants C, R, N plus A and E.' },
    { word: 'SOARE', vowels: 3, consonants: 2, score: 5, why: 'Mathematically top-ranked starter by computer simulations.' },
    { word: 'SLATE', vowels: 2, consonants: 3, score: 5, why: 'Contains top-frequency consonants S, L, T plus A, E.' },
    { word: 'AUDIO', vowels: 4, consonants: 1, score: 6, why: 'Covers A, U, I, O in a single opening turn.' },
    { word: 'ROAST', vowels: 2, consonants: 3, score: 5, why: 'Tests R, S, T together with O, A.' },
  ];

  const maxOverall = overallFreqs[0]?.count || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-card">
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-ink" />
          Letter Frequency in 5-Letter Words
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Strategic letter distribution analytics across 5-letter words to supercharge your Wordle and Scrabble game.
        </p>
      </div>

      {/* Top Openers Strategy Cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-ink" />
          Best Statistically Proven Wordle Starters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topOpeners.map((op) => (
            <div key={op.word} className="bg-white p-4 rounded-xl border border-slate-200 shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xl tracking-widest text-ink">
                  {op.word}
                </span>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {op.vowels} Vowels • {op.consonants} Consonants
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">{op.why}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Position Heatmap Table */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Position-by-Position Letter Frequency
            </h2>
            <p className="text-xs text-slate-500">
              Select a position slot (1 to 5) to see which letters appear most commonly.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[0, 1, 2, 3, 4].map((pos) => (
              <button
                key={pos}
                onClick={() => setActivePos(pos)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activePos === pos
                    ? 'bg-ink text-white shadow-card'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Slot {pos + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Position letter rankings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-2">
          {positionalFreqs[activePos].slice(0, 16).map((item, idx) => (
            <div
              key={item.letter}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-colors ${
                idx === 0
                  ? 'bg-slate-100 border-slate-300'
                  : idx < 4
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                <span className="font-semibold text-xl text-slate-900">{item.letter}</span>
              </div>
              <span className="text-xs font-bold text-ink mt-0.5">
                {item.percentage}%
              </span>
              <span className="text-[10px] text-slate-400">({item.count} words)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Letter Frequency Chart */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Overall Letter Frequency in 5-Letter English Words
        </h2>

        <div className="space-y-2">
          {overallFreqs.map((item, idx) => {
            const barWidth = `${Math.max(6, Math.round((item.count / maxOverall) * 100))}%`;
            const isVowel = 'AEIOU'.includes(item.letter);

            return (
              <div key={item.letter} className="flex items-center gap-3 text-xs">
                <div className="w-8 flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-400 w-3">{idx + 1}</span>
                  <span className={`font-semibold text-sm ${isVowel ? 'text-amber-600' : 'text-slate-900'}`}>
                    {item.letter}
                  </span>
                </div>

                <div className="grow bg-slate-100 h-5 rounded-md overflow-hidden relative">
                  <div
                    className={`h-full rounded-md transition-all ${
                      isVowel ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: barWidth }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">
                    {item.percentage}% ({item.count})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
