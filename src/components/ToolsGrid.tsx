import React from 'react';
import { ArrowUpRight } from './ui/Icons';
import { tabHref } from '../seo/links';
import { Tab } from '../seo/routes';
import { WordTiles } from './ui/WordTiles';

interface ToolsGridProps {
  onNavigate: (path: string) => void;
}

const handleNav = (e: React.MouseEvent, go: () => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  go();
};

/* Small illustrations built from the same tiles the tools use */
const SolverArt = () => (
  <div className="flex flex-col gap-1.5">
    <WordTiles word="CRANE" state={['miss', 'near', 'miss', 'miss', 'hit']} size="sm" />
    <WordTiles word="SPOKE" state={['hit', 'miss', 'near', 'miss', 'hit']} size="sm" />
    <WordTiles word="SHAPE" state="hit" size="sm" />
  </div>
);
const AnagramArt = () => (
  <div className="flex flex-col items-center gap-3">
    <WordTiles word="ACERT" state="soft" size="sm" />
    <span aria-hidden="true" className="text-slate-400 text-lg leading-none">↓</span>
    <WordTiles word="CRATE" state="ink" size="sm" />
  </div>
);
const DirectoryArt = () => (
  <div className="grid grid-cols-7 gap-1" aria-hidden="true">
    {'ABCDEFGHIJKLMN'.split('').map((l, i) => (
      <span
        key={l}
        className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-semibold ${
          i === 3 ? 'bg-brand text-white' : 'bg-white text-slate-500 border border-slate-200'
        }`}
      >
        {l}
      </span>
    ))}
  </div>
);
const PracticeArt = () => (
  <div className="flex flex-col gap-1.5">
    <WordTiles word="PLANT" state={['miss', 'near', 'hit', 'miss', 'miss']} size="sm" />
    <WordTiles word="CLAMP" state={['miss', 'hit', 'hit', 'near', 'miss']} size="sm" />
    <span className="flex gap-1" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="w-7 h-8 rounded-md border border-dashed border-slate-300" />
      ))}
    </span>
  </div>
);
const StatsArt = () => (
  <div className="flex items-end gap-1.5 h-20" aria-hidden="true">
    {[88, 62, 74, 40, 100, 28, 55, 36, 68].map((h, i) => (
      <span key={i} className={`w-3.5 rounded-t-md ${i === 4 ? 'bg-brand' : 'bg-slate-300'}`} style={{ height: `${h}%` }} />
    ))}
  </div>
);

const TOOLS: {
  tab: Exclude<Tab, 'finder' | 'article' | 'word'>;
  path: string;
  title: string;
  body: string;
  art: React.ReactNode;
  span?: string;
}[] = [
  {
    tab: 'solver',
    path: '/wordle-solver/',
    title: 'Wordle Solver',
    body: 'Enter your green, yellow and grey clues and instantly see every word that still fits.',
    art: <SolverArt />,
    span: 'lg:col-span-2',
  },
  {
    tab: 'anagram',
    path: '/anagram-solver/',
    title: 'Anagram Solver',
    body: 'Unscramble any set of letters, with ? and * wildcards for blank tiles.',
    art: <AnagramArt />,
  },
  {
    tab: 'browse',
    path: '/5-letter-words-a-z/',
    title: 'A–Z Directory',
    body: 'Browse the full dictionary by starting letter and curated collections.',
    art: <DirectoryArt />,
  },
  {
    tab: 'game',
    path: '/wordle-practice/',
    title: 'Practice Game',
    body: 'Unlimited Wordle rounds with instant definitions after every game.',
    art: <PracticeArt />,
  },
  {
    tab: 'stats',
    path: '/letter-frequency/',
    title: 'Letter Frequency',
    body: 'Heatmaps of which letters show up most, and where, to pick better openers.',
    art: <StatsArt />,
  },
];

export const ToolsGrid: React.FC<ToolsGridProps> = ({ onNavigate }) => (
  <section aria-labelledby="tools-heading" className="mt-20 sm:mt-28">
    <div className="max-w-2xl">
      <p className="eyebrow">The toolkit</p>
      <h2 id="tools-heading" className="mt-3 text-3xl sm:text-4xl font-semibold tracking-[-0.035em] text-ink text-balance">
        One library for every five-letter puzzle.
      </h2>
      <p className="mt-3 text-slate-500 leading-relaxed">
        Everything runs in your browser, with no sign-up. Jump from searching to solving to practising without losing your place.
      </p>
    </div>

    <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TOOLS.map((t) => (
        <li key={t.tab} className={t.span ?? ''}>
          <a
            href={tabHref(t.tab)}
            onClick={(e) => handleNav(e, () => onNavigate(t.path))}
            className="group flex flex-col h-full rounded-3xl border border-slate-200 bg-white p-2 shadow-card hover:shadow-lift hover:border-slate-300 transition-all duration-300"
          >
            <div className="flex items-center justify-center min-h-44 rounded-2xl bg-slate-50 border border-slate-100 px-6 py-8 transition-colors group-hover:bg-slate-100/70">
              {t.art}
            </div>
            <div className="flex items-start justify-between gap-4 p-4 pt-5">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-ink">{t.title}</h3>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">{t.body}</p>
              </div>
              <span
                aria-hidden="true"
                className="shrink-0 mt-0.5 flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-slate-500 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  </section>
);
