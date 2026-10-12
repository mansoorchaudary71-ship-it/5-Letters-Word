import React from 'react';
import { X, HelpCircle, Sparkles, BookOpen, Trophy } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[85vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-lg text-slate-900">
              How to Use 5-Letter Words
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Wordle Solver Clue Logic
            </h3>
            <p>
              • <strong>Green (Correct position):</strong> Type letters you know are in the exact slot (1 to 5).
            </p>
            <p>
              • <strong>Yellow (Present in word):</strong> Enter letters that exist somewhere in the word, along with slots where they cannot appear.
            </p>
            <p>
              • <strong>Gray (Absent):</strong> Add all letters ruled out by previous guesses to eliminate them instantly.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Scrabble &amp; Words With Friends Points
            </h3>
            <p>
              Every 5-letter word displays official tournament point scores computed from individual letter values (e.g. Q=10, Z=10, J=8, X=8, K=5).
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Pattern &amp; Wildcards
            </h3>
            <p>
              In the Anagram solver, use <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">?</code> or <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">*</code> for blank wildcard tiles.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
        >
          Got It, Start Finding Words!
        </button>
      </div>
    </div>
  );
};
