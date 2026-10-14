import React from 'react';
import { ArrowRight } from 'lucide-react';
import { tabHref } from '../seo/links';
import { WordTiles } from './ui/WordTiles';
import { Blob, Squiggle } from './ui/Blobs';

interface CtaBandProps {
  onNavigate: (path: string) => void;
}

const handleNav = (e: React.MouseEvent, go: () => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  go();
};

/** Closing call to action shown above the footer. */
export const CtaBand: React.FC<CtaBandProps> = ({ onNavigate }) => (
  <section aria-labelledby="cta-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
    <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 sm:px-14 sm:py-20 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,#000,transparent_80%)]"
      />
      <Blob className="absolute -top-20 -right-16 w-72 text-brand/40" />
      <Squiggle className="absolute bottom-6 left-6 w-28 text-brand/60 hidden sm:block" />
      <div className="relative">
        <WordTiles word="FIND?" state={['hit', 'near', 'soft', 'soft', 'miss']} size="md" className="justify-center" />
        <h2 id="cta-heading" className="mt-7 text-3xl sm:text-5xl font-semibold tracking-[-0.04em] text-white text-balance">
          Find the word that works.
        </h2>
        <p className="mt-4 mx-auto max-w-lg text-slate-400 leading-relaxed text-balance">
          Stuck on a Wordle clue or hunting for a high-scoring Scrabble play? Start with the finder.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={tabHref('finder')}
            onClick={(e) => handleNav(e, () => onNavigate('/'))}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-white text-ink text-sm font-medium hover:bg-slate-100 active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            Open the word finder
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href={tabHref('solver')}
            onClick={(e) => handleNav(e, () => onNavigate('/wordle-solver/'))}
            className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/10 active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            Try the Wordle solver
          </a>
        </div>
      </div>
    </div>
  </section>
);
