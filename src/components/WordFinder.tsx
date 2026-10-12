import React, { useState, useMemo } from 'react';
import { WordEntry, SortOption, FilterState } from '../types/word';
import { ALL_WORDS } from '../data/words';
import { 
  Search, SlidersHorizontal, ArrowUpDown, Copy, Check, Download, 
  Sparkles, RefreshCw, X, Bookmark, ChevronRight
} from 'lucide-react';

interface WordFinderProps {
  onSelectWord: (word: WordEntry) => void;
  isFavorite: (word: string) => boolean;
  onToggleFavorite: (word: string) => void;
  initialStartsWith?: string;
  initialEndsWith?: string;
  initialTag?: string;
}

export const WordFinder: React.FC<WordFinderProps> = ({
  onSelectWord,
  isFavorite,
  onToggleFavorite,
  initialStartsWith = '',
  initialEndsWith = '',
  initialTag = 'all',
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    startsWith: initialStartsWith,
    endsWith: initialEndsWith,
    contains: '',
    excludes: '',
    pattern: '',
    vowelFilter: 'all',
    minScore: 1,
    maxScore: 35,
    tag: initialTag,
    sortBy: 'popularity',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 60;

  // Pattern input slots (5 slots)
  const [patternSlots, setPatternSlots] = useState<string[]>(['', '', '', '', '']);

  const handleSlotChange = (index: number, val: string) => {
    const char = val.slice(-1).toUpperCase();
    const newSlots = [...patternSlots];
    newSlots[index] = /^[A-Z]$/.test(char) ? char : '';
    setPatternSlots(newSlots);
    setPage(1);

    // Auto advance to next slot if typed
    if (char && index < 4) {
      const nextInput = document.getElementById(`slot-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSlotKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !patternSlots[index] && index > 0) {
      const prevInput = document.getElementById(`slot-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Filter computation
  const filteredWords = useMemo(() => {
    const searchClean = filters.search.trim().toUpperCase();
    const startsClean = filters.startsWith.trim().toUpperCase();
    const endsClean = filters.endsWith.trim().toUpperCase();
    const containsClean = filters.contains.toUpperCase().replace(/[^A-Z]/g, '');
    const excludesClean = filters.excludes.toUpperCase().replace(/[^A-Z]/g, '');
    
    // Check if slots are active
    const hasPatternSlots = patternSlots.some((s) => s !== '');

    return ALL_WORDS.filter((item) => {
      const w = item.word;

      // 1. Text search
      if (searchClean && !w.includes(searchClean)) {
        return false;
      }

      // 2. Starts with
      if (startsClean && !w.startsWith(startsClean)) {
        return false;
      }

      // 3. Ends with
      if (endsClean && !w.endsWith(endsClean)) {
        return false;
      }

      // 4. Contains all specified characters
      if (containsClean) {
        for (const ch of containsClean) {
          if (!w.includes(ch)) return false;
        }
      }

      // 5. Excludes characters
      if (excludesClean) {
        for (const ch of excludesClean) {
          if (w.includes(ch)) return false;
        }
      }

      // 6. 5-slot Pattern Matcher
      if (hasPatternSlots) {
        for (let i = 0; i < 5; i++) {
          const reqChar = patternSlots[i];
          if (reqChar && w[i] !== reqChar) return false;
        }
      }

      // 7. Vowels filter
      if (filters.vowelFilter !== 'all') {
        const vCount = item.vowels;
        if (filters.vowelFilter === '0' && vCount !== 0) return false;
        if (filters.vowelFilter === '1' && vCount !== 1) return false;
        if (filters.vowelFilter === '2' && vCount !== 2) return false;
        if (filters.vowelFilter === '3' && vCount !== 3) return false;
        if (filters.vowelFilter === '4+' && vCount < 4) return false;
      }

      // 8. Tags filter
      if (filters.tag !== 'all') {
        if (!item.tags.includes(filters.tag)) return false;
      }

      // 9. Scrabble score
      if (item.scrabbleScore < filters.minScore || item.scrabbleScore > filters.maxScore) {
        return false;
      }

      return true;
    });
  }, [filters, patternSlots]);

  // Sort computation
  const sortedWords = useMemo(() => {
    const list = [...filteredWords];
    switch (filters.sortBy) {
      case 'alpha-asc':
        return list.sort((a, b) => a.word.localeCompare(b.word));
      case 'alpha-desc':
        return list.sort((a, b) => b.word.localeCompare(a.word));
      case 'scrabble-desc':
        return list.sort((a, b) => b.scrabbleScore - a.scrabbleScore || a.word.localeCompare(b.word));
      case 'scrabble-asc':
        return list.sort((a, b) => a.scrabbleScore - b.scrabbleScore || a.word.localeCompare(b.word));
      case 'vowels-desc':
        return list.sort((a, b) => b.vowels - a.vowels || a.word.localeCompare(b.word));
      case 'popularity':
      default:
        return list.sort((a, b) => {
          if (a.isCommon && !b.isCommon) return -1;
          if (!a.isCommon && b.isCommon) return 1;
          return a.word.localeCompare(b.word);
        });
    }
  }, [filteredWords, filters.sortBy]);

  // Paged results
  const displayedWords = useMemo(() => {
    return sortedWords.slice(0, page * PAGE_SIZE);
  }, [sortedWords, page]);

  const handleCopyAll = () => {
    const text = sortedWords.map((w) => w.word).join(', ');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2200);
  };

  const handleExportCSV = () => {
    const headers = 'Word,ScrabbleScore,WWFScore,Vowels,PartOfSpeech,Definition\n';
    const rows = sortedWords
      .map(
        (w) =>
          `"${w.word}",${w.scrabbleScore},${w.wwfScore},${w.vowels},"${w.partOfSpeech}","${w.definition.replace(
            /"/g,
            '""'
          )}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `5-letter-words-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllFilters = () => {
    setFilters({
      search: '',
      startsWith: '',
      endsWith: '',
      contains: '',
      excludes: '',
      pattern: '',
      vowelFilter: 'all',
      minScore: 1,
      maxScore: 35,
      tag: 'all',
      sortBy: 'popularity',
    });
    setPatternSlots(['', '', '', '', '']);
    setPage(1);
  };

  const isAnyFilterActive =
    filters.search !== '' ||
    filters.startsWith !== '' ||
    filters.endsWith !== '' ||
    filters.contains !== '' ||
    filters.excludes !== '' ||
    filters.vowelFilter !== 'all' ||
    filters.tag !== 'all' ||
    patternSlots.some((s) => s !== '');

  return (
    <div className="space-y-6">
      {/* Hero Search Box */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              5-Letter Words Finder &amp; Dictionary
            </h1>
            <p className="text-sm text-slate-500">
              Filter by starting or ending letters, wildcards, vowels, and Scrabble point values.
            </p>
          </div>

          {/* Main search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by word or letters (e.g. CRANE, AR, O)..."
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setPage(1);
              }}
              className="w-full pl-11 pr-10 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-base font-medium rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all"
            />
            {filters.search && (
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: '' }));
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Presets Bar */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-400 mr-1">Presets:</span>
            {[
              { id: 'all', label: 'All Words' },
              { id: 'wordle-top', label: '⭐ Wordle Best Starters' },
              { id: 'palindrome', label: '🔄 Palindromes' },
              { id: 'double-letters', label: '🔤 Double Letters' },
              { id: 'no-vowels', label: '🚫 No Vowels' },
              { id: 'vowel-rich', label: '💎 3+ Vowels' },
              { id: 'high-scoring', label: '🏆 High Scrabble (15+)' },
            ].map((p) => {
              const active = filters.tag === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, tag: p.id }));
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* 5-Slot Interactive Wildcard Pattern Row */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Exact 5-Letter Pattern Matcher
              </span>
              {patternSlots.some((s) => s !== '') && (
                <button
                  onClick={() => setPatternSlots(['', '', '', '', ''])}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 underline"
                >
                  Clear Pattern
                </button>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-slate-400">Pos {idx + 1}</span>
                  <input
                    id={`slot-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={patternSlots[idx]}
                    placeholder="_"
                    onChange={(e) => handleSlotChange(idx, e.target.value)}
                    onKeyDown={(e) => handleSlotKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-14 sm:h-14 text-center font-black text-xl sm:text-2xl uppercase bg-white border-2 border-slate-300 focus:border-emerald-600 focus:bg-emerald-50/40 rounded-xl shadow-xs outline-hidden transition-all"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Type known letters into exact positions (e.g., place &apos;S&apos; in Pos 1 and &apos;E&apos; in Pos 5). Leave empty for wildcards.
            </p>
          </div>

          {/* Advanced Filters Accordion Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters (Prefix, Suffix, Vowels, Letters)'}
            </button>

            {isAnyFilterActive && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>

          {/* Advanced Filter Inputs Container */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Starts With</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. S, TR"
                  value={filters.startsWith}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, startsWith: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 uppercase font-mono font-bold rounded-lg border border-slate-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ends With</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. ED, Y, T"
                  value={filters.endsWith}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, endsWith: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 uppercase font-mono font-bold rounded-lg border border-slate-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Must Contain</label>
                <input
                  type="text"
                  placeholder="Letters anywhere"
                  value={filters.contains}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, contains: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 uppercase font-mono font-bold rounded-lg border border-slate-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exclude (Doesn&apos;t have)</label>
                <input
                  type="text"
                  placeholder="Excluded letters"
                  value={filters.excludes}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, excludes: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 uppercase font-mono font-bold rounded-lg border border-slate-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              {/* Vowel count dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vowel Count</label>
                <select
                  value={filters.vowelFilter}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, vowelFilter: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-hidden"
                >
                  <option value="all">Any Vowel Count</option>
                  <option value="0">0 Vowels (No vowels)</option>
                  <option value="1">Exactly 1 Vowel</option>
                  <option value="2">Exactly 2 Vowels</option>
                  <option value="3">Exactly 3 Vowels</option>
                  <option value="4+">4 or More Vowels</option>
                </select>
              </div>

              {/* Scrabble Min Score */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Min Scrabble Score: <span className="text-emerald-600 font-bold">{filters.minScore}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={filters.minScore}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, minScore: parseInt(e.target.value, 10) }));
                    setPage(1);
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Sort By */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Sort Words By</label>
                <div className="relative">
                  <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-hidden"
                  >
                    <option value="popularity">Most Common &amp; Wordle Answers First</option>
                    <option value="alpha-asc">Alphabetical (A → Z)</option>
                    <option value="alpha-desc">Alphabetical (Z → A)</option>
                    <option value="scrabble-desc">Scrabble Score: High to Low</option>
                    <option value="scrabble-asc">Scrabble Score: Low to High</option>
                    <option value="vowels-desc">Most Vowels First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">
            {sortedWords.length.toLocaleString()}{' '}
            <span className="text-slate-500 font-normal">5-letter words found</span>
          </span>
          {isAnyFilterActive && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Filtered
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            disabled={sortedWords.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors disabled:opacity-50"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copiedAll ? 'Copied All!' : 'Copy List'}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={sortedWords.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {displayedWords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-lg font-bold text-slate-800">No 5-letter words match your criteria</p>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Try loosening your letter constraints, pattern, or vowel filter.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {displayedWords.map((entry) => {
            const isFav = isFavorite(entry.word);
            return (
              <div
                key={entry.word}
                className="group relative bg-white hover:bg-emerald-50/40 rounded-xl p-3 border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer"
                onClick={() => onSelectWord(entry)}
              >
                {/* Top line: Word tiles + favorite star */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {entry.word.split('').map((c, i) => (
                      <span
                        key={i}
                        className="w-5 h-6 sm:w-5.5 sm:h-6.5 flex items-center justify-center font-black text-xs sm:text-sm bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-800 rounded-sm transition-colors"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(entry.word);
                    }}
                    title={isFav ? 'Remove bookmark' : 'Bookmark word'}
                    className={`p-1 rounded-md transition-colors ${
                      isFav
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300 hover:text-amber-400 group-hover:text-slate-400'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Score badge & part of speech */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                    {entry.scrabbleScore} pts
                  </span>

                  <span className="text-[10px] text-slate-400 capitalize truncate max-w-[65px]">
                    {entry.partOfSpeech.split('/')[0].trim()}
                  </span>
                </div>

                {/* Short definition preview */}
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-snug">
                  {entry.definition}
                </p>

                {/* Arrow hint */}
                <div className="flex items-center justify-end text-[10px] font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {displayedWords.length < sortedWords.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all"
          >
            Load More Words ({sortedWords.length - displayedWords.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
