import React, { useState, useMemo } from 'react';
import { CardBlobs } from './ui/Blobs';
import { WordEntry, SortOption, FilterState } from '../types/word';
import { ALL_WORDS } from '../data/words';
import { copyText } from '../lib/clipboard';
import { WordTiles } from './ui/WordTiles';
import {
  Search, SlidersHorizontal, ArrowUpDown, Copy, Check, Download,
  RefreshCw, X, Bookmark, ArrowUpRight
} from 'lucide-react';

interface WordFinderProps {
  onSelectWord: (word: WordEntry) => void;
  isFavorite: (word: string) => boolean;
  onToggleFavorite: (word: string) => void;
  initialStartsWith?: string;
  initialEndsWith?: string;
  initialTag?: string;
  initialContains?: string;
  heading?: string;
  /** Render the heading as an <h2> (used on the home page, where the hero owns the <h1>). */
  asSubheading?: boolean;
}

export const WordFinder: React.FC<WordFinderProps> = ({
  onSelectWord,
  isFavorite,
  onToggleFavorite,
  initialStartsWith = '',
  initialEndsWith = '',
  initialTag = 'all',
  initialContains = '',
  heading = '5-Letter Word Finder',
  asSubheading = false,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    startsWith: initialStartsWith,
    endsWith: initialEndsWith,
    contains: initialContains,
    excludes: '',
    pattern: '',
    vowelFilter: 'all',
    minScore: 1,
    maxScore: 35,
    tag: initialTag,
    sortBy: 'popularity',
  });

  const [showAdvanced, setShowAdvanced] = useState(Boolean(initialContains));
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

  const handleCopyAll = async () => {
    const text = sortedWords.map((w) => w.word).join(', ');
    if (await copyText(text)) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2200);
    }
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
    URL.revokeObjectURL(url);
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

  const inputClass =
    'w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-ink placeholder:text-slate-400 outline-hidden transition-all focus:border-brand focus:ring-4 focus:ring-brand/5';
  const labelClass = 'block text-xs font-medium text-slate-600 mb-1.5';
  const Heading = asSubheading ? 'h2' : 'h1';

  const PRESETS = [
    { id: 'all', label: 'All words' },
    { id: 'wordle-top', label: 'Wordle starters' },
    { id: 'palindrome', label: 'Palindromes' },
    { id: 'double-letters', label: 'Double letters' },
    { id: 'no-vowels', label: 'No vowels' },
    { id: 'vowel-rich', label: '3+ vowels' },
    { id: 'high-scoring', label: 'High scoring (15+)' },
  ];

  return (
    <section id="finder" aria-label="Word finder" className="scroll-mt-24 space-y-6">
      {/* Search card */}
      <div className="relative isolate">
        <CardBlobs />
        <div className="rounded-3xl border border-slate-200 bg-white shadow-card p-4 sm:p-7">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className={asSubheading ? 'text-center' : ''}>
            {asSubheading && <p className="eyebrow mb-3">Word finder</p>}
            <Heading
              className={
                asSubheading
                  ? 'text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink'
                  : 'text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-ink text-balance'
              }
            >
              {asSubheading ? 'Search every five-letter word' : heading}
            </Heading>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Filter by starting or ending letters, exact positions, vowels and Scrabble value.
            </p>
          </div>

          {/* Main search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search by word or letters"
              placeholder="Search by word or letters, e.g. CRANE, AR, O"
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setPage(1);
              }}
              className="w-full h-14 pl-12 pr-12 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-base font-medium text-ink placeholder:text-slate-400 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 outline-hidden transition-all"
            />
            {filters.search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: '' }));
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-slate-400 hover:text-ink hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Preset pills */}
          <div role="group" aria-label="Quick filters" className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 sm:flex-wrap sm:overflow-visible">
            {PRESETS.map((p) => {
              const active = filters.tag === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, tag: p.id }));
                    setPage(1);
                  }}
                  className={`shrink-0 h-8 px-3.5 rounded-full text-[13px] font-medium border transition-all ${
                    active
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-ink'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Exact position pattern */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">Exact pattern</h3>
                <p className="text-xs text-slate-500 mt-0.5">Type known letters into their slots. Empty slots match anything.</p>
              </div>
              {patternSlots.some((s) => s !== '') && (
                <button
                  type="button"
                  onClick={() => setPatternSlots(['', '', '', '', ''])}
                  className="text-xs font-medium text-slate-500 hover:text-ink underline underline-offset-4 decoration-slate-300 hover:decoration-ink transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {[0, 1, 2, 3, 4].map((idx) => {
                const filled = patternSlots[idx] !== '';
                return (
                  <input
                    key={idx}
                    id={`slot-input-${idx}`}
                    type="text"
                    maxLength={1}
                    inputMode="text"
                    autoComplete="off"
                    aria-label={`Letter ${idx + 1}`}
                    value={patternSlots[idx]}
                    placeholder="·"
                    onChange={(e) => handleSlotChange(idx, e.target.value)}
                    onKeyDown={(e) => handleSlotKeyDown(idx, e)}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center font-semibold text-2xl uppercase rounded-xl border-2 outline-hidden transition-all placeholder:text-slate-300 ${
                      filled
                        ? 'bg-hit border-hit text-ink shadow-card'
                        : 'bg-white border-slate-200 hover:border-slate-300 focus:border-brand focus:ring-4 focus:ring-brand/5'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Advanced toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-expanded={showAdvanced}
              aria-controls="advanced-filters"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:border-slate-300 hover:text-ink transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showAdvanced ? 'Hide filters' : 'More filters'}
            </button>

            {isAnyFilterActive && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium text-slate-500 hover:text-ink hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {showAdvanced && (
            <div id="advanced-filters" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-slate-100 animate-fade">
              <div>
                <label htmlFor="f-starts" className={labelClass}>Starts with</label>
                <input
                  id="f-starts"
                  type="text"
                  maxLength={4}
                  placeholder="S, TR"
                  value={filters.startsWith}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, startsWith: e.target.value }));
                    setPage(1);
                  }}
                  className={`${inputClass} uppercase font-mono font-semibold`}
                />
              </div>

              <div>
                <label htmlFor="f-ends" className={labelClass}>Ends with</label>
                <input
                  id="f-ends"
                  type="text"
                  maxLength={4}
                  placeholder="ED, Y, T"
                  value={filters.endsWith}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, endsWith: e.target.value }));
                    setPage(1);
                  }}
                  className={`${inputClass} uppercase font-mono font-semibold`}
                />
              </div>

              <div>
                <label htmlFor="f-contains" className={labelClass}>Must contain</label>
                <input
                  id="f-contains"
                  type="text"
                  placeholder="Letters anywhere"
                  value={filters.contains}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, contains: e.target.value }));
                    setPage(1);
                  }}
                  className={`${inputClass} uppercase font-mono font-semibold`}
                />
              </div>

              <div>
                <label htmlFor="f-excludes" className={labelClass}>Exclude letters</label>
                <input
                  id="f-excludes"
                  type="text"
                  placeholder="Letters to rule out"
                  value={filters.excludes}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, excludes: e.target.value }));
                    setPage(1);
                  }}
                  className={`${inputClass} uppercase font-mono font-semibold`}
                />
              </div>

              <div>
                <label htmlFor="f-vowels" className={labelClass}>Vowel count</label>
                <select
                  id="f-vowels"
                  value={filters.vowelFilter}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, vowelFilter: e.target.value }));
                    setPage(1);
                  }}
                  className={inputClass}
                >
                  <option value="all">Any</option>
                  <option value="0">No vowels</option>
                  <option value="1">Exactly 1</option>
                  <option value="2">Exactly 2</option>
                  <option value="3">Exactly 3</option>
                  <option value="4+">4 or more</option>
                </select>
              </div>

              <div>
                <label htmlFor="f-minscore" className={labelClass}>
                  Min Scrabble score: <span className="text-ink font-semibold tabular-nums">{filters.minScore}</span>
                </label>
                <input
                  id="f-minscore"
                  type="range"
                  min="1"
                  max="25"
                  value={filters.minScore}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, minScore: parseInt(e.target.value, 10) }));
                    setPage(1);
                  }}
                  className="w-full h-10 cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="f-sort" className={labelClass}>Sort by</label>
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select
                    id="f-sort"
                    value={filters.sortBy}
                    onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))}
                    className={`${inputClass} pl-9`}
                  >
                    <option value="popularity">Most common and Wordle answers first</option>
                    <option value="alpha-asc">Alphabetical (A to Z)</option>
                    <option value="alpha-desc">Alphabetical (Z to A)</option>
                    <option value="scrabble-desc">Scrabble score, high to low</option>
                    <option value="scrabble-asc">Scrabble score, low to high</option>
                    <option value="vowels-desc">Most vowels first</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Results toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <p className="flex items-center gap-2.5" aria-live="polite">
          <span className="text-lg font-semibold tracking-tight text-ink tabular-nums">{sortedWords.length.toLocaleString()}</span>
          <span className="text-sm text-slate-500">words found</span>
          {isAnyFilterActive && (
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">Filtered</span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={sortedWords.length === 0}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:border-slate-300 hover:text-ink transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-hit" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? 'Copied' : 'Copy list'}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={sortedWords.length === 0}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:border-slate-300 hover:text-ink transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Results */}
      {displayedWords.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
          <WordTiles word="NOPE?" state={['soft', 'soft', 'soft', 'soft', 'soft']} size="md" className="justify-center" />
          <p className="mt-6 text-lg font-semibold tracking-tight text-ink">No words match these filters</p>
          <p className="text-sm text-slate-500 mt-1.5 mb-6 max-w-sm mx-auto">
            Try loosening your letter constraints, pattern or vowel filter.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center h-10 px-5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-hover active:scale-[0.98] transition-all"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {displayedWords.map((entry) => {
            const isFav = isFavorite(entry.word);
            return (
              <li
                key={entry.word}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-card hover:shadow-lift hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Whole-card hit area (keyboard accessible) */}
                <button
                  type="button"
                  onClick={() => onSelectWord(entry)}
                  aria-label={`${entry.word}: view definition`}
                  className="absolute inset-0 rounded-2xl"
                />

                <div className="flex items-start justify-between gap-1">
                  <WordTiles word={entry.word} size="card" state="soft" className="group-hover:[&>span]:bg-brand group-hover:[&>span]:text-white [&>span]:transition-colors" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(entry.word);
                    }}
                    aria-pressed={isFav}
                    aria-label={isFav ? `Remove ${entry.word} from saved words` : `Save ${entry.word}`}
                    className={`relative z-10 -mr-1 -mt-1 flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                      isFav ? 'text-ink' : 'text-slate-300 hover:text-ink hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-brand' : ''}`} />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center h-5 px-1.5 rounded-md bg-slate-100 font-semibold text-slate-700 tabular-nums">
                    {entry.scrabbleScore} pts
                  </span>
                  <span className="text-slate-400 capitalize truncate">{entry.partOfSpeech.split('/')[0].trim()}</span>
                </div>

                {entry.isCommon && (
                  <p className="mt-2 text-[12px] leading-snug text-slate-500 line-clamp-2">{entry.definition}</p>
                )}

                <ArrowUpRight
                  aria-hidden="true"
                  className="absolute bottom-3 right-3 w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-ink transition-opacity"
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* Load more */}
      {displayedWords.length < sortedWords.length && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            className="inline-flex items-center h-11 px-6 rounded-full border border-slate-200 bg-white text-sm font-medium text-ink hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            Show more ({(sortedWords.length - displayedWords.length).toLocaleString()} remaining)
          </button>
        </div>
      )}
    </section>
  );
};
