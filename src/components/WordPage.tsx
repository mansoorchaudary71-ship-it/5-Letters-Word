import React from 'react';
import { Bookmark } from './ui/Icons';
import { ALL_WORDS } from '../data/words';
import { WordEntry } from '../types/word';
import { WordTiles } from './ui/WordTiles';

interface WordPageProps {
  word: string;
  heading: string;
  isFavorite: (word: string) => boolean;
  onToggleFavorite: (word: string) => void;
  onSelectWord: (entry: WordEntry) => void;
}

/** Hero card for a /word/<word>/ page. The long-form text, FAQ and related links are rendered by SeoContent below it. */
export const WordPage: React.FC<WordPageProps> = ({ word, heading, isFavorite, onToggleFavorite, onSelectWord }) => {
  const entry = ALL_WORDS.find((w) => w.word === word);
  if (!entry) return null;
  const fav = isFavorite(entry.word);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-card p-6 sm:p-10 max-w-3xl">
      <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.04em] text-ink text-balance">{heading}</h1>
      <WordTiles word={entry.word} size="lg" state="ink" className="my-7" />
      <p className="text-slate-600">
        <span className="font-medium text-ink">{entry.partOfSpeech}</span> &middot; Scrabble {entry.scrabbleScore} pts &middot; Words
        With Friends {entry.wwfScore} pts
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggleFavorite(entry.word)}
          aria-pressed={fav}
          className="inline-flex items-center gap-2 h-10 rounded-full border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 hover:border-slate-300 hover:text-ink transition-colors"
        >
          <Bookmark className={`w-4 h-4 ${fav ? 'fill-brand text-brand' : ''}`} />
          {fav ? 'Saved' : 'Save word'}
        </button>
        <button
          type="button"
          onClick={() => onSelectWord(entry)}
          className="inline-flex items-center h-10 rounded-full bg-brand px-5 text-[13px] font-medium text-white hover:bg-brand-hover transition-colors"
        >
          Open full detail
        </button>
      </div>
    </div>
  );
};
