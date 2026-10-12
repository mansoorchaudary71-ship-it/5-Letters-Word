import React, { useState } from 'react';
import { WordEntry } from '../types/word';
import { ALL_WORDS } from '../data/words';
import { 
  X, Bookmark, Trash2, Copy, Check, Download, BookOpen, ChevronRight 
} from 'lucide-react';

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

  if (!isOpen) return null;

  const favoriteEntries = ALL_WORDS.filter((w) => favorites.includes(w.word));

  const handleCopyAll = () => {
    navigator.clipboard.writeText(favorites.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTXT = () => {
    const content = favorites.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-saved-5-letter-words-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFlashcard = flashcardIndex !== null ? favoriteEntries[flashcardIndex] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="font-extrabold text-lg text-slate-900">
              Saved Word List ({favorites.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grow p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Flashcard Study Mode Popup if active */}
          {flashcardIndex !== null && activeFlashcard ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Flashcard {flashcardIndex + 1} of {favoriteEntries.length}
                </span>
                <button
                  onClick={() => setFlashcardIndex(null)}
                  className="text-xs text-emerald-700 underline font-semibold"
                >
                  Exit Study Mode
                </button>
              </div>

              <div className="text-center py-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-widest">
                  {activeFlashcard.word}
                </h3>
                <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">
                  {activeFlashcard.scrabbleScore} Scrabble Points • {activeFlashcard.partOfSpeech}
                </span>
              </div>

              {revealMeaning ? (
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-slate-700">
                  <strong>Meaning:</strong> {activeFlashcard.definition}
                  {activeFlashcard.example && (
                    <p className="italic text-slate-500 mt-1">&quot;{activeFlashcard.example}&quot;</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setRevealMeaning(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Reveal Definition
                </button>
              )}

              <div className="flex justify-between pt-2">
                <button
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setRevealMeaning(false);
                    setFlashcardIndex((prev) => (prev !== null ? prev - 1 : 0));
                  }}
                  className="px-3 py-1 bg-white disabled:opacity-40 text-slate-700 font-bold text-xs rounded-lg border border-slate-200"
                >
                  Previous
                </button>
                <button
                  disabled={flashcardIndex === favoriteEntries.length - 1}
                  onClick={() => {
                    setRevealMeaning(false);
                    setFlashcardIndex((prev) => (prev !== null ? prev + 1 : 0));
                  }}
                  className="px-3 py-1 bg-white disabled:opacity-40 text-slate-700 font-bold text-xs rounded-lg border border-slate-200"
                >
                  Next Word
                </button>
              </div>
            </div>
          ) : null}

          {/* Words List */}
          {favoriteEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600">No saved words yet</p>
              <p className="text-xs">
                Click the bookmark star on any word in the finder to save it here for studying.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteEntries.map((item) => (
                <div
                  key={item.word}
                  onClick={() => onSelectWord(item)}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200/80 cursor-pointer group transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base tracking-wider text-slate-900 group-hover:text-emerald-700">
                        {item.word}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {item.scrabbleScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.definition}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.word);
                    }}
                    title="Remove from saved"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {favoriteEntries.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setFlashcardIndex(0);
                  setRevealMeaning(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Study Flashcards
              </button>

              <button
                onClick={handleCopyAll}
                className="flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied All!' : 'Copy List'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleExportTXT}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                <Download className="w-3 h-3" />
                Download TXT
              </button>

              <button
                onClick={onClearFavorites}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
