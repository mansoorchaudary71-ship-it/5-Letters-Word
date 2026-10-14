import React, { useState, useEffect } from 'react';
import { WordEntry } from '../types/word';
import { SCRABBLE_VALUES } from '../data/wordScoring';
import { ALL_WORDS } from '../data/words';
import { hasWordPage, wordPath } from '../seo/content';
import { withBase } from '../seo/links';
import { copyText } from '../lib/clipboard';
import { useDialog } from '../hooks/useDialog';
import { X, Volume2, Bookmark, Copy, Check, Sparkles, Lightbulb, HelpCircle, History, ArrowUpRight } from './ui/Icons';

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
  const panelRef = useDialog<HTMLDivElement>(Boolean(wordEntry), onClose);

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

  const handleCopy = async () => {
    if (await copyText(word)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find exact anagrams
  const sortedWordChars = word.split('').sort().join('');
  const anagrams = ALL_WORDS.filter((w) => w.word !== word && w.word.split('').sort().join('') === sortedWordChars);

  // Fetch AI insights (needs the Express server; on static hosting it falls back to built-in hints)
  const fetchAIInsights = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/word-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      if (!res.ok) throw new Error(`Insights unavailable (${res.status})`);
      const data = await res.json();
      setAiInsights(data);
    } catch {
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

  const iconBtn =
    'flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-ink hover:bg-slate-100 transition-colors';
  const pillBtn =
    'inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:border-slate-300 hover:text-ink transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-ink/40 backdrop-blur-sm animate-fade"
      onMouseDown={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Definition of ${word}`}
        tabIndex={-1}
        className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white border border-slate-200 shadow-pop outline-hidden animate-pop-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 h-14 bg-white/90 backdrop-blur border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="eyebrow">Definition</span>
            {wordEntry.isWordleAnswer && (
              <span className="inline-flex items-center h-5 px-2 rounded-full bg-near/20 text-[11px] font-semibold text-slate-800">
                Wordle answer
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onToggleFavorite(word)}
              aria-pressed={isFav}
              aria-label={isFav ? 'Remove from saved words' : 'Save word'}
              className={iconBtn}
            >
              <Bookmark className={`w-[18px] h-[18px] ${isFav ? 'fill-brand text-brand' : ''}`} />
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className={iconBtn}>
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-7 pb-7 pt-6 space-y-7">
          {/* Tiles + actions */}
          <div className="flex flex-col items-center gap-5">
            <div className="flex gap-2" role="img" aria-label={word.split('').join(' ')}>
              {word.split('').map((char, idx) => (
                <div
                  key={idx}
                  aria-hidden="true"
                  className="relative w-12 h-14 sm:w-16 sm:h-[4.5rem] flex items-center justify-center rounded-xl sm:rounded-2xl bg-ink text-white font-semibold text-2xl sm:text-3xl select-none shadow-card"
                >
                  {char}
                  <span className="absolute bottom-1 right-1.5 text-[10px] font-medium text-white/50 tabular-nums">
                    {SCRABBLE_VALUES[char] || 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={handleSpeak} className={pillBtn}>
                <Volume2 className="w-3.5 h-3.5" />
                Listen
              </button>
              <button type="button" onClick={handleCopy} className={pillBtn}>
                {copied ? <Check className="w-3.5 h-3.5 text-hit" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              {hasWordPage(word) && (
                <a href={withBase(wordPath(word))} className={pillBtn}>
                  Full page
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-slate-100 font-medium text-slate-700 tabular-nums">
                Scrabble {wordEntry.scrabbleScore}
              </span>
              <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-slate-100 font-medium text-slate-700 tabular-nums">
                Words With Friends {wordEntry.wwfScore}
              </span>
            </div>
          </div>

          {/* Definition */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium italic text-slate-600 capitalize">{wordEntry.partOfSpeech}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" aria-hidden="true" />
              <span className="text-xs text-slate-500">
                {wordEntry.vowels} {wordEntry.vowels === 1 ? 'vowel' : 'vowels'}, {5 - wordEntry.vowels} consonants
              </span>
            </div>
            <p className="text-[15px] text-ink leading-relaxed font-medium">{wordEntry.definition}</p>
            {wordEntry.example && (
              <p className="text-sm text-slate-500 italic pt-3 border-t border-slate-200">&ldquo;{wordEntry.example}&rdquo;</p>
            )}
          </div>

          {/* Anagrams */}
          {anagrams.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-ink">
                Anagrams <span className="text-slate-400 font-normal tabular-nums">({anagrams.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {anagrams.map((an) => (
                  <button
                    key={an.word}
                    type="button"
                    onClick={() => onSelectWord(an)}
                    className="h-8 px-3.5 rounded-full border border-slate-200 bg-white text-xs font-semibold tracking-wide text-ink hover:bg-brand hover:text-white hover:border-brand transition-colors"
                  >
                    {an.word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="rounded-2xl bg-ink text-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-near" />
                <h3 className="font-semibold text-sm tracking-tight">Clue &amp; etymology</h3>
              </div>
              {!aiInsights && (
                <button
                  type="button"
                  onClick={fetchAIInsights}
                  disabled={loadingAi}
                  className="h-8 px-3.5 rounded-full bg-white text-ink text-xs font-medium hover:bg-slate-100 disabled:opacity-50 transition-colors"
                >
                  {loadingAi ? 'Working…' : 'Generate'}
                </button>
              )}
            </div>

            {aiInsights ? (
              <div className="space-y-2.5 text-xs">
                {aiInsights.hint && (
                  <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl">
                    <Lightbulb className="w-4 h-4 text-near shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Spoiler-free clue</span>
                      <span className="text-slate-300">{aiInsights.hint}</span>
                    </div>
                  </div>
                )}
                {aiInsights.mnemonic && (
                  <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl">
                    <HelpCircle className="w-4 h-4 text-hit shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Memory hook</span>
                      <span className="text-slate-300">{aiInsights.mnemonic}</span>
                    </div>
                  </div>
                )}
                {aiInsights.etymology && (
                  <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl">
                    <History className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Origin</span>
                      <span className="text-slate-300">{aiInsights.etymology}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate a spoiler-free clue, a memory hook and a short origin note for {word}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
