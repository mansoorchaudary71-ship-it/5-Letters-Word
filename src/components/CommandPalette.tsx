import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles, BookOpen, Gamepad2, BarChart3, Type, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { ALL_WORDS } from '../data/words';
import { WordEntry } from '../types/word';
import { useDialog } from '../hooks/useDialog';
import { WordTiles } from './ui/WordTiles';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onSelectWord: (word: WordEntry) => void;
}

type Item =
  | { kind: 'tool'; id: string; label: string; hint: string; path: string; icon: React.ComponentType<{ className?: string }> }
  | { kind: 'word'; id: string; entry: WordEntry };

const TOOL_ITEMS: Extract<Item, { kind: 'tool' }>[] = [
  { kind: 'tool', id: 'tool-finder', label: 'Word Finder', hint: 'Search and filter every word', path: '/', icon: Search },
  { kind: 'tool', id: 'tool-solver', label: 'Wordle Solver', hint: 'Narrow down with your clues', path: '/wordle-solver/', icon: Sparkles },
  { kind: 'tool', id: 'tool-anagram', label: 'Anagram Solver', hint: 'Unscramble letters', path: '/anagram-solver/', icon: Type },
  { kind: 'tool', id: 'tool-browse', label: 'A–Z Directory', hint: 'Browse by starting letter', path: '/5-letter-words-a-z/', icon: BookOpen },
  { kind: 'tool', id: 'tool-game', label: 'Practice Game', hint: 'Unlimited Wordle rounds', path: '/wordle-practice/', icon: Gamepad2 },
  { kind: 'tool', id: 'tool-stats', label: 'Letter Frequency', hint: 'Heatmaps and stats', path: '/letter-frequency/', icon: BarChart3 },
];

const MAX_WORDS = 8;

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, onSelectWord }) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const panelRef = useDialog<HTMLDivElement>(isOpen, onClose, { focusContainer: false });

  // Reset every time the palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActive(0);
    }
  }, [isOpen]);

  const items: Item[] = useMemo(() => {
    const q = query.trim();
    if (!q) {
      const starters = ALL_WORDS.filter((w) => w.tags.includes('wordle-top')).slice(0, 5);
      return [...TOOL_ITEMS, ...starters.map<Item>((entry) => ({ kind: 'word', id: `word-${entry.word}`, entry }))];
    }
    const lower = q.toLowerCase();
    const upper = q.toUpperCase().replace(/[^A-Z]/g, '');
    const tools = TOOL_ITEMS.filter((t) => t.label.toLowerCase().includes(lower) || t.hint.toLowerCase().includes(lower));
    let words: WordEntry[] = [];
    if (upper) {
      const starts = ALL_WORDS.filter((w) => w.word.startsWith(upper));
      const contains = ALL_WORDS.filter((w) => !w.word.startsWith(upper) && w.word.includes(upper));
      words = [...starts, ...contains].slice(0, MAX_WORDS);
    }
    return [...tools, ...words.map<Item>((entry) => ({ kind: 'word', id: `word-${entry.word}`, entry }))];
  }, [query]);

  // Keep the highlighted row inside the list's scroll area
  useEffect(() => {
    if (!isOpen) return;
    document.getElementById(`cmdk-${items[active]?.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, items, isOpen]);

  if (!isOpen) return null;

  const run = (item: Item | undefined) => {
    if (!item) return;
    onClose();
    if (item.kind === 'tool') onNavigate(item.path);
    else onSelectWord(item.entry);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (items.length ? (i + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(items[active]);
    }
  };

  const activeId = items[active] ? `cmdk-${items[active].id}` : undefined;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh] bg-ink/40 backdrop-blur-sm animate-fade"
      onMouseDown={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search words and tools"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-pop animate-pop-in"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={activeId}
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search a word or jump to a tool…"
            className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-slate-400 outline-hidden"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center px-1.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500 font-sans">
            Esc
          </kbd>
        </div>

        <ul id="cmdk-list" role="listbox" aria-label="Results" className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
          {items.length === 0 && (
            <li role="presentation" className="px-3 py-10 text-center text-sm text-slate-500">
              No matches for &ldquo;{query}&rdquo;
            </li>
          )}
          {items.map((item, idx) => {
            const isActive = idx === active;
            const prev = items[idx - 1];
            const heading =
              !prev || prev.kind !== item.kind
                ? item.kind === 'tool'
                  ? 'Tools'
                  : query.trim()
                    ? 'Words'
                    : 'Popular starters'
                : null;
            return (
              <React.Fragment key={item.id}>
                {heading && (
                  <li role="presentation" className="eyebrow px-3 pt-3 pb-1.5">
                    {heading}
                  </li>
                )}
                <li
                  id={`cmdk-${item.id}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseMove={() => setActive(idx)}
                  onClick={() => run(item)}
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                    isActive ? 'bg-slate-100' : ''
                  }`}
                >
                  {item.kind === 'tool' ? (
                    <>
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600">
                          <item.icon className="w-4 h-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink">{item.label}</span>
                          <span className="block text-xs text-slate-500 truncate">{item.hint}</span>
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-3 min-w-0">
                        <WordTiles word={item.entry.word} size="xs" state={isActive ? 'ink' : 'soft'} />
                        <span className="text-xs text-slate-500 truncate">{item.entry.definition}</span>
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-slate-400 tabular-nums">
                        {item.entry.scrabbleScore} pts
                      </span>
                    </>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        <div className="hidden sm:flex items-center gap-4 px-4 h-10 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" /> navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" /> open
          </span>
        </div>
      </div>
    </div>
  );
};
