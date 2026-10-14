import React from 'react';
import { X, Sparkles, BookOpen, Trophy } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Dot: React.FC<{ className: string }> = ({ className }) => (
  <span aria-hidden="true" className={`inline-block w-2.5 h-2.5 rounded-[3px] mr-2 ${className}`} />
);

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const panelRef = useDialog<HTMLDivElement>(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-ink/40 backdrop-blur-sm animate-fade"
      onMouseDown={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        tabIndex={-1}
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white border border-slate-200 shadow-pop outline-hidden p-6 sm:p-8 space-y-6 animate-pop-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Guide</p>
            <h2 id="help-title" className="mt-2 text-xl font-semibold tracking-tight text-ink">
              How to use 5-Letter Words
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-9 h-9 -mr-2 -mt-1 rounded-full text-slate-500 hover:text-ink hover:bg-slate-100 transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-semibold text-ink flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Wordle solver clues
            </h3>
            <p><Dot className="bg-hit" /><strong className="text-ink font-medium">Green:</strong> letters in the exact slot (1 to 5).</p>
            <p><Dot className="bg-near" /><strong className="text-ink font-medium">Yellow:</strong> letters in the word, plus the slots they cannot be in.</p>
            <p><Dot className="bg-miss" /><strong className="text-ink font-medium">Grey:</strong> letters ruled out by earlier guesses.</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-ink flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Scrabble &amp; Words With Friends
            </h3>
            <p>Every word shows tile-value scores (for example Q and Z are 10, J and X are 8, K is 5).</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-ink flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Wildcards &amp; shortcuts
            </h3>
            <p>
              In the anagram solver, use{' '}
              <code className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-xs font-semibold text-ink">?</code> or{' '}
              <code className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-xs font-semibold text-ink">*</code> for blank tiles.
              Press{' '}
              <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 text-xs font-semibold text-ink font-sans">Ctrl / ⌘ K</kbd> or{' '}
              <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 text-xs font-semibold text-ink font-sans">/</kbd> anywhere to search.
            </p>
          </section>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-full bg-ink text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.99] transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
