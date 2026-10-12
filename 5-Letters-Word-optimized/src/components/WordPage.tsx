import React from 'react';
import { Bookmark } from 'lucide-react';
import { ALL_WORDS } from '../data/words';
import { WordEntry } from '../types/word';

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
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{heading}</h1>
      <div className="flex gap-1.5 my-5" aria-label={entry.word.split('').join(' ')}>
        {entry.word.split('').map((ch, i) => (
          <span key={i} className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg bg-emerald-600 text-white text-2xl font-black shadow-xs">
            {ch}
          </span>
        ))}
      </div>
      <p className="text-slate-700">
        <span className="font-semibold">{entry.partOfSpeech}</span> &middot; Scrabble {entry.scrabbleScore} pts &middot; Words With Friends {entry.wwfScore} pts
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggleFavorite(entry.word)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Bookmark className={`w-4 h-4 ${fav ? 'fill-amber-500 text-amber-500' : ''}`} />
          {fav ? 'Saved' : 'Save word'}
        </button>
        <button
          type="button"
          onClick={() => onSelectWord(entry)}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Open full detail
        </button>
      </div>
    </div>
  );
};
