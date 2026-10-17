import React, { useMemo } from 'react';
import { ArrowRight, Sparkles } from './ui/Icons';
import { ALL_WORDS } from '../data/words';
import { WordEntry } from '../types/word';
import { tabHref } from '../seo/links';
import { TileState, WordTiles } from './ui/WordTiles';
import { WaveDivider } from './ui/WaveDivider';
import { Blob } from './ui/Blobs';
import { WaveBackground } from './ui/WaveBackground';

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
      <Blob className="absolute -z-10 -top-16 -right-16 w-64 sm:w-96 text-indigo-100" />
      <Blob className="absolute -z-10 top-40 -left-24 w-56 sm:w-80 text-amber-100 opacity-80" />

      {/* Abstract line waves flowing behind the lower half of the hero */}
      <WaveBackground
        variant="flow"
        className="absolute -z-10 inset-x-0 bottom-0 w-full h-3/5 text-indigo-300/60 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]"
      />

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
          Search 5 letter words by starting letter, ending letter, included letters or pattern, solve Wordle clues and
          unscramble tiles. Open any word for its definition and Scrabble score.
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
