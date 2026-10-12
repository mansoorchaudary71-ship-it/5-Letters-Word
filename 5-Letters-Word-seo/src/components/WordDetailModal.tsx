import React, { useState, useEffect } from 'react';
import { WordEntry } from '../types/word';
import { SCRABBLE_VALUES } from '../data/wordScoring';
import { ALL_WORDS } from '../data/words';
import { 
  X, Volume2, Bookmark, Copy, Check, Sparkles, BookOpen, Share2, 
  HelpCircle, Lightbulb, History, Info
} from 'lucide-react';

interface WordDetailModalProps {
  wordEntry: WordEntry | null;
  onClose: () => void;
  isFavorite: (word: string) => boolean;
  onToggleFavorite: (word: string) => void;
  onSelectWord: (word: WordEntry) => void;
}

interface AIInsights {
  hint?: string;
  mnemonic?: string;
  etymology?: string;
  funFact?: string;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  wordEntry,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectWord,
}) => {
  const [copied, setCopied] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    setAiInsights(null);
    setLoadingAi(false);
  }, [wordEntry?.word]);

  if (!wordEntry) return null;

  const word = wordEntry.word;
  const isFav = isFavorite(word);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.toLowerCase());
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(word);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find exact anagrams
  const sortedWordChars = word.split('').sort().join('');
  const anagrams = ALL_WORDS.filter(
    (w) => w.word !== word && w.word.split('').sort().join('') === sortedWordChars
  );

  // Fetch AI Insights
  const fetchAIInsights = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/word-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      // On static hosting (GitHub Pages) there is no /api server, so fall back to the built-in hints below.
      if (!res.ok) throw new Error(`Insights unavailable (${res.status})`);
      const data = await res.json();
      setAiInsights(data);
    } catch (err) {
      console.error(err);
      setAiInsights({
        hint: `A 5-letter word starting with '${word[0]}' and ending with '${word[4]}'.`,
        mnemonic: `Keep in mind: ${word.split('').join('-')}.`,
        etymology: `Standard English dictionary entry.`,
        funFact: `Scrabble score of ${wordEntry.scrabbleScore} points.`,
      });
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              5-Letter Word Definition
            </span>
            {wordEntry.isWordleAnswer && (
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                Wordle Answer List
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(word)}
              title={isFav ? 'Remove from bookmarks' : 'Add to bookmarks'}
              className="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${isFav ? 'text-amber-500 fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Word Tiles & Scrabble points */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex gap-2">
            {word.split('').map((char, idx) => {
              const charVal = SCRABBLE_VALUES[char] || 1;
              return (
                <div
                  key={idx}
                  className="relative w-13 h-14 sm:w-16 sm:h-17 flex items-center justify-center bg-amber-100/90 text-amber-950 border-2 border-amber-300 rounded-2xl shadow-xs font-black text-2xl sm:text-3xl select-none"
                >
                  <span>{char}</span>
                  <span className="absolute bottom-1 right-1.5 text-[10px] sm:text-xs font-bold text-amber-800/80">
                    {charVal}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Action Pills: Pronounce, Copy */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSpeak}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              Listen
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                Scrabble: {wordEntry.scrabbleScore} pts
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                WWF: {wordEntry.wwfScore} pts
              </span>
            </div>
          </div>
        </div>

        {/* Word Definition Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-emerald-700 capitalize italic bg-emerald-100/60 px-2 py-0.5 rounded-md">
              {wordEntry.partOfSpeech}
            </span>
            <span className="text-xs text-slate-400">
              {wordEntry.vowels} {wordEntry.vowels === 1 ? 'vowel' : 'vowels'} •{' '}
              {5 - wordEntry.vowels} consonants
            </span>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {wordEntry.definition}
          </p>

          {wordEntry.example && (
            <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-200/60">
              &quot;{wordEntry.example}&quot;
            </p>
          )}
        </div>

        {/* Anagrams if any */}
        {anagrams.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              5-Letter Anagrams ({anagrams.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {anagrams.map((an) => (
                <button
                  key={an.word}
                  onClick={() => onSelectWord(an)}
                  className="px-3 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors shadow-2xs"
                >
                  {an.word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gemini AI Clue & Insights Box */}
        <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="font-extrabold text-sm tracking-tight text-white">
                Wordle Clue &amp; AI Etymology
              </h4>
            </div>

            {!aiInsights && (
              <button
                onClick={fetchAIInsights}
                disabled={loadingAi}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
              >
                {loadingAi ? 'Analyzing...' : 'Generate AI Insights'}
              </button>
            )}
          </div>

          {aiInsights ? (
            <div className="space-y-3 text-xs pt-1">
              {aiInsights.hint && (
                <div className="flex items-start gap-2 bg-white/10 p-2.5 rounded-xl">
                  <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-200 block">Wordle Clue (No Spoiler):</span>
                    <span className="text-slate-200">{aiInsights.hint}</span>
                  </div>
                </div>
              )}

              {aiInsights.mnemonic && (
                <div className="flex items-start gap-2 bg-white/10 p-2.5 rounded-xl">
                  <HelpCircle className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-200 block">Memory Mnemonic:</span>
                    <span className="text-slate-200">{aiInsights.mnemonic}</span>
                  </div>
                </div>
              )}

              {aiInsights.etymology && (
                <div className="flex items-start gap-2 bg-white/10 p-2.5 rounded-xl">
                  <History className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-200 block">Origin &amp; History:</span>
                    <span className="text-slate-200">{aiInsights.etymology}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Click to generate a spoiler-free Wordle crossword clue, memory hook, and linguistic origin for &apos;{word}&apos;.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
