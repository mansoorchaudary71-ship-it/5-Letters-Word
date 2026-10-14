import React, { useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ALL_WORDS } from '../data/words';
import { WordEntry } from '../types/word';
import { tabHref } from '../seo/links';
import { TileState, WordTiles } from './ui/WordTiles';
import { WaveDivider } from './ui/WaveDivider';

interface HeroProps {
  heading: string;
  onNavigate: (path: string) => void;
  onSelectWord: (word: WordEntry) => void;
}

// Decorative Wordle-style result patterns cycled across the marquee cards
const PATTERNS: TileState[][] = [
  ['soft', 'hit', 'soft', 'near', 'soft'],
  ['near', 'soft', 'soft', 'hit', 'hit'],
  ['hit', 'soft', 'near', 'soft', 'soft'],
  ['soft', 'soft', 'hit', 'hit', 'near'],
  ['near', 'hit', 'soft', 'soft', 'hit'],
];

const handleNav = (e: React.MouseEvent, go: () => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  go();
};

/** Deterministic sample (no randomness, so it never differs between renders) of well-known words. */
function pickMarqueeWords(count: number): WordEntry[] {
  const pool = ALL_WORDS.filter((w) => w.isCommon && w.definition);
  if (pool.length <= count) return pool;
  const step = pool.length / count;
  return Array.from({ length: count }, (_, i) => pool[Math.floor(i * step)]);
}

const MarqueeRow: React.FC<{
  words: WordEntry[];
  direction: 'left' | 'right';
  onSelectWord: (w: WordEntry) => void;
  offset: number;
}> = ({ words, direction, onSelectWord, offset }) => {
  // Two identical halves => translateX(-50%) loops seamlessly. The second half is hidden from assistive tech.
  const doubled = [...words, ...words];
  return (
    <div className="marquee overflow-hidden mask-fade-x">
      <div
        className={`marquee-track flex w-max gap-3 py-1.5 ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        }`}
      >
        {doubled.map((w, i) => {
          const isClone = i >= words.length;
          return (
            <button
              key={`${w.word}-${i}`}
              type="button"
              onClick={() => onSelectWord(w)}
              tabIndex={isClone ? -1 : 0}
              aria-hidden={isClone ? true : undefined}
              className="group shrink-0 w-60 text-left rounded-2xl bg-white border border-slate-200 p-3.5 shadow-card hover:shadow-lift hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300"
            >
              <WordTiles word={w.word} state={PATTERNS[(i + offset) % PATTERNS.length]} size="sm" />
              <span className="mt-2.5 block text-[12px] leading-snug text-slate-500 line-clamp-2">{w.definition}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Hero: React.FC<HeroProps> = ({ heading, onNavigate, onSelectWord }) => {
  const total = ALL_WORDS.length;
  const defined = useMemo(() => ALL_WORDS.filter((w) => w.isCommon).length, []);
  const rows = useMemo(() => {
    const picked = pickMarqueeWords(32);
    return [picked.slice(0, 16), picked.slice(16)];
  }, []);

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-white">
      {/* Backdrop: dotted grid that fades out toward the bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_20%,transparent_75%)]"
      />

      {/* Organic corner blobs */}
      <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -z-10 -top-16 -right-16 w-64 sm:w-96 text-indigo-100" fill="currentColor">
        <path d="M44.7-52.6C57.3-41.7 66.2-26.6 69.6-10c3.4 16.6 1.3 34.7-8.1 47.6C52.1 50.5 36.2 58.2 19 63.3c-17.2 5.1-35.7 7.6-49.3.8C-43.9 57.4-52.6 41.9-58.9 25.5c-6.3-16.4-10.2-33.7-3.9-47.4C-56.5-35.6-39.3-45.7-23.1-54.9c16.2-9.2 32.5-17.5 46.1-14.3 8.6 2 14.4 8.8 21.7 16.6Z" transform="translate(100 100)" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -z-10 top-40 -left-24 w-56 sm:w-80 text-amber-100/80" fill="currentColor">
        <path d="M39.9-47.8C51.7-36.3 61.2-23.6 64.9-9 68.6 5.6 66.5 22.1 57.4 33.7 48.3 45.3 32.2 52 15.5 58.2-1.2 64.4-18.5 70.1-32.3 64.6-46.1 59.1-56.3 42.3-62 24.5c-5.7-17.8-6.9-36.6.3-50.4C-54.5-39.7-39.5-48.6-24.3-58.5-9.1-68.4 6.4-79.4 18.4-74.6 30.4-69.8 28.1-59.3 39.9-47.8Z" transform="translate(100 100)" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 sm:pb-14 text-center">
        <a
          href={tabHref('solver')}
          onClick={(e) => handleNav(e, () => onNavigate('/wordle-solver/'))}
          className="inline-flex items-center gap-2 h-8 pl-2 pr-3 rounded-full border border-slate-200 bg-white/80 backdrop-blur text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-ink transition-colors animate-fade-up"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-brand text-white px-2 py-0.5 text-[10px] font-semibold">
            <Sparkles className="w-3 h-3" />
            Free
          </span>
          Wordle solver, anagram unscrambler &amp; more
          <ArrowRight className="w-3 h-3" />
        </a>

        <h1
          id="hero-heading"
          className="mt-6 text-balance text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl font-semibold tracking-[-0.045em] text-ink"
        >
          {heading}
        </h1>

        <p className="mt-5 mx-auto max-w-2xl text-balance text-base sm:text-lg leading-relaxed text-slate-500">
          Search, solve and unscramble every five-letter word. Filter by pattern, vowels and Scrabble score, then open
          any word for its definition.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up [animation-delay:180ms]">
          <a
            href="#finder"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-hover active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            Start searching
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href={tabHref('solver')}
            onClick={(e) => handleNav(e, () => onNavigate('/wordle-solver/'))}
            className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-white text-ink text-sm font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            Open Wordle solver
          </a>
        </div>

        <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 animate-fade-up [animation-delay:240ms]">
          {[
            { k: total.toLocaleString(), v: 'five-letter words' },
            { k: defined.toLocaleString(), v: 'with definitions' },
            { k: '6', v: 'free tools' },
          ].map((s) => (
            <div key={s.v} className="text-center">
              <dt className="sr-only">{s.v}</dt>
              <dd className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink tabular-nums">
                {s.k}
                <span className="block mt-0.5 text-xs font-medium text-slate-500 tracking-normal">{s.v}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Word marquee: two rows moving in opposite directions */}
      <div className="pb-4 sm:pb-6 space-y-1" role="group" aria-label="Example words">
        <MarqueeRow words={rows[0]} direction="left" onSelectWord={onSelectWord} offset={0} />
        <MarqueeRow words={rows[1]} direction="right" onSelectWord={onSelectWord} offset={2} />
      </div>

      {/* Curved divider: hero (white) into the tool area (slate-50) */}
      <WaveDivider className="text-slate-50 -mb-px" variant="swoosh" />
    </section>
  );
};
