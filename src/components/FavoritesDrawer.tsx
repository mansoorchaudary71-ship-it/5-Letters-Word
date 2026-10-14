import React, { useState } from 'react';
import { WordEntry } from '../types/word';
import { ALL_WORDS } from '../data/words';
import { copyText } from '../lib/clipboard';
import { useDialog } from '../hooks/useDialog';
import { WordTiles } from './ui/WordTiles';
import { X, Bookmark, Trash2, Copy, Check, Download, BookOpen } from 'lucide-react';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  onToggleFavorite: (word: string) => void;
  onClearFavorites: () => void;
  onSelectWord: (word: WordEntry) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onToggleFavorite,
  onClearFavorites,
  onSelectWord,
}) => {
  const [copied, setCopied] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState<number | null>(null);
  const [revealMeaning, setRevealMeaning] = useState(false);
  const panelRef = useDialog<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const favoriteEntries = ALL_WORDS.filter((w) => favorites.includes(w.word));

  const handleCopyAll = async () => {
    if (await copyText(favorites.join(', '))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportTXT = () => {
    const blob = new Blob([favorites.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-saved-5-letter-words-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFlashcard = flashcardIndex !== null ? favoriteEntries[flashcardIndex] : null;
  const ghostBtn =
    'h-9 px-4 rounded-full border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:border-slate-300 hover:text-ink disabled:opacity-40 disabled:pointer-events-none transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm animate-fade" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-title"
        tabIndex={-1}
        className="w-full max-w-md h-full bg-white shadow-pop flex flex-col outline-hidden animate-slide-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 h-16 shrink-0 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-[18px] h-[18px] fill-ink" />
            <h2 id="saved-title" className="font-semibold tracking-tight text-ink">
              Saved words <span className="text-slate-400 font-normal tabular-nums">({favorites.length})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-9 h-9 -mr-2 rounded-full text-slate-500 hover:text-ink hover:bg-slate-100 transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="grow overflow-y-auto p-5 space-y-4">
          {flashcardIndex !== null && activeFlashcard && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="eyebrow">
                  Card {flashcardIndex + 1} of {favoriteEntries.length}
                </span>
                <button
                  type="button"
                  onClick={() => setFlashcardIndex(null)}
                  className="text-xs font-medium text-slate-500 hover:text-ink underline underline-offset-4"
                >
                  Exit
                </button>
              </div>

              <div className="text-center py-3 space-y-3">
                <WordTiles word={activeFlashcard.word} size="md" state="ink" className="justify-center" />
                <p className="text-xs text-slate-500">
                  {activeFlashcard.scrabbleScore} points &middot; {activeFlashcard.partOfSpeech}
                </p>
              </div>

              {revealMeaning ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 leading-relaxed">
                  {activeFlashcard.definition}
                  {activeFlashcard.example && (
                    <p className="italic text-slate-500 mt-2">&ldquo;{activeFlashcard.example}&rdquo;</p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealMeaning(true)}
                  className="w-full h-10 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-slate-800 transition-colors"
                >
                  Reveal definition
                </button>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setRevealMeaning(false);
                    setFlashcardIndex((prev) => (prev !== null ? prev - 1 : 0));
                  }}
                  className={ghostBtn}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={flashcardIndex === favoriteEntries.length - 1}
                  onClick={() => {
                    setRevealMeaning(false);
                    setFlashcardIndex((prev) => (prev !== null ? prev + 1 : 0));
                  }}
                  className={ghostBtn}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {favoriteEntries.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="mx-auto flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-400">
                <Bookmark className="w-5 h-5" />
              </span>
              <p className="font-semibold text-ink">No saved words yet</p>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Tap the bookmark on any word to keep it here for studying.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {favoriteEntries.map((item) => (
                <li
                  key={item.word}
                  className="group relative flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-lift transition-all"
                >
                  <button
                    type="button"
                    onClick={() => onSelectWord(item)}
                    aria-label={`${item.word}: view definition`}
                    className="absolute inset-0 rounded-2xl"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <WordTiles word={item.word} size="xs" state="soft" />
                      <span className="text-[11px] font-medium text-slate-500 tabular-nums">{item.scrabbleScore} pts</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1.5">{item.definition}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.word)}
                    aria-label={`Remove ${item.word} from saved words`}
                    className="relative z-10 shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {favoriteEntries.length > 0 && (
          <div className="shrink-0 p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFlashcardIndex(0);
                  setRevealMeaning(false);
                }}
                className="inline-flex items-center justify-center gap-1.5 h-10 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-slate-800 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Study
              </button>
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center justify-center gap-1.5 h-10 rounded-full border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:border-slate-300 hover:text-ink transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-hit" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy list'}
              </button>
            </div>
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handleExportTXT}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-ink transition-colors"
              >
                <Download className="w-3 h-3" />
                Download TXT
              </button>
              <button
                type="button"
                onClick={onClearFavorites}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
