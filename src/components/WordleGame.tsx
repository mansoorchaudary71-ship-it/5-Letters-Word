import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WordEntry } from '../types/word';
import { ALL_WORDS, WORDS_SET } from '../data/words';
import { RotateCcw, Trophy, Sparkles, BookOpen, Share2, Check } from 'lucide-react';
import { copyText } from '../lib/clipboard';

interface WordleGameProps {
  onSelectWord: (word: WordEntry) => void;
}

export const WordleGame: React.FC<WordleGameProps> = ({ onSelectWord }) => {
  // Pool of candidate target words (common/wordle answers)
  const targetPool = useMemo(() => {
    return ALL_WORDS.filter((w) => w.isWordleAnswer && w.isCommon);
  }, []);

  const getRandomTarget = useCallback(() => {
    const list = targetPool.length > 0 ? targetPool : ALL_WORDS;
    const item = list[Math.floor(Math.random() * list.length)];
    return item.word;
  }, [targetPool]);

  const [targetWord, setTargetWord] = useState<string>(() => getRandomTarget());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'in_progress' | 'won' | 'lost'>('in_progress');
  const [message, setMessage] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Stats from localStorage
  const [stats, setStats] = useState(() => {
    try {
      const s = localStorage.getItem('wordle_5letter_stats');
      return s ? JSON.parse(s) : { played: 0, won: 0, streak: 0, maxStreak: 0 };
    } catch {
      return { played: 0, won: 0, streak: 0, maxStreak: 0 };
    }
  });

  const saveStats = (won: boolean) => {
    setStats((prev: any) => {
      const played = prev.played + 1;
      const wonCount = prev.won + (won ? 1 : 0);
      const streak = won ? prev.streak + 1 : 0;
      const maxStreak = Math.max(prev.maxStreak, streak);
      const updated = { played, won: wonCount, streak, maxStreak };
      localStorage.setItem('wordle_5letter_stats', JSON.stringify(updated));
      return updated;
    });
  };

  const showTempMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  };

  // Check letter status for a guess against target word
  const evaluateGuess = (guess: string, target: string) => {
    const result: Array<'green' | 'yellow' | 'gray'> = ['gray', 'gray', 'gray', 'gray', 'gray'];
    const targetArr = target.split('');
    const guessArr = guess.split('');

    // First pass: Greens
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = 'green';
        targetArr[i] = '#';
        guessArr[i] = '*';
      }
    }

    // Second pass: Yellows
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] !== '*') {
        const foundIdx = targetArr.indexOf(guessArr[i]);
        if (foundIdx !== -1) {
          result[i] = 'yellow';
          targetArr[foundIdx] = '#';
        }
      }
    }

    return result;
  };

  // Keyboard letter color mapping
  const letterStatuses = useMemo(() => {
    const map: Record<string, 'green' | 'yellow' | 'gray'> = {};
    guesses.forEach((guess) => {
      const evalColors = evaluateGuess(guess, targetWord);
      guess.split('').forEach((char, idx) => {
        const color = evalColors[idx];
        const current = map[char];
        if (color === 'green') {
          map[char] = 'green';
        } else if (color === 'yellow' && current !== 'green') {
          map[char] = 'yellow';
        } else if (color === 'gray' && !current) {
          map[char] = 'gray';
        }
      });
    });
    return map;
  }, [guesses, targetWord]);

  const handleKeyPress = useCallback(
    (char: string) => {
      if (gameStatus !== 'in_progress') return;

      if (char === 'ENTER') {
        if (currentGuess.length !== 5) {
          setShakeRow(true);
          setTimeout(() => setShakeRow(false), 600);
          showTempMessage('Word must be 5 letters');
          return;
        }

        if (!WORDS_SET.has(currentGuess)) {
          setShakeRow(true);
          setTimeout(() => setShakeRow(false), 600);
          showTempMessage('Not in dictionary word list');
          return;
        }

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess('');

        if (currentGuess === targetWord) {
          setGameStatus('won');
          saveStats(true);
          showTempMessage('Magnificent! You solved it! 🎉');
        } else if (newGuesses.length === 6) {
          setGameStatus('lost');
          saveStats(false);
          showTempMessage(`Game Over! The word was ${targetWord}`);
        }
        return;
      }

      if (char === 'BACKSPACE' || char === 'DEL') {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (/^[A-Z]$/.test(char) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + char);
      }
    },
    [currentGuess, gameStatus, guesses, targetWord]
  );

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else {
        const char = e.key.toUpperCase();
        if (/^[A-Z]$/.test(char)) {
          handleKeyPress(char);
        }
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKeyPress]);

  const handleNewGame = () => {
    setTargetWord(getRandomTarget());
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('in_progress');
    setMessage(null);
  };

  const handleShareGrid = () => {
    const header = `5-Letter Words Practice ${gameStatus === 'won' ? guesses.length : 'X'}/6\n`;
    const rows = guesses
      .map((g) => {
        const evalColors = evaluateGuess(g, targetWord);
        return evalColors
          .map((c) => (c === 'green' ? '🟩' : c === 'yellow' ? '🟨' : '⬛'))
          .join('');
      })
      .join('\n');
    void copyText(header + rows);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const targetEntry = useMemo(() => {
    return ALL_WORDS.find((w) => w.word === targetWord);
  }, [targetWord]);

  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Title & Stats Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Wordle Practice: Unlimited 5-Letter Word Game
          </h1>
          <p className="text-xs text-slate-500">Practice Wordle unlimited times with instant definition lookup</p>
        </div>

        <button
          onClick={handleNewGame}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-full border border-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Word
        </button>
      </div>

      {/* Floating Status Message */}
      {message && (
        <div className="bg-slate-900 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg text-center animate-bounce">
          {message}
        </div>
      )}

      {/* 6-Row Wordle Board */}
      <div className="flex flex-col items-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((rowIdx) => {
          const isCurrentRow = rowIdx === guesses.length;
          const guess = guesses[rowIdx] || (isCurrentRow ? currentGuess : '');
          const colors = guesses[rowIdx] ? evaluateGuess(guesses[rowIdx], targetWord) : null;

          return (
            <div
              key={rowIdx}
              className={`flex gap-2 ${isCurrentRow && shakeRow ? 'animate-shake' : ''}`}
            >
              {[0, 1, 2, 3, 4].map((colIdx) => {
                const char = guess[colIdx] || '';
                const color = colors ? colors[colIdx] : null;

                let tileBg = 'bg-white border-slate-300 text-slate-900';
                if (char && !color) {
                  tileBg = 'bg-white border-slate-500 text-slate-900 scale-102';
                }
                if (color === 'green') {
                  tileBg = 'bg-emerald-600 border-emerald-600 text-white shadow-card';
                } else if (color === 'yellow') {
                  tileBg = 'bg-amber-500 border-amber-500 text-white shadow-card';
                } else if (color === 'gray') {
                  tileBg = 'bg-slate-500 border-slate-500 text-white';
                }

                return (
                  <div
                    key={colIdx}
                    className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-semibold text-xl sm:text-2xl uppercase rounded-xl border-2 transition-all duration-200 select-none ${tileBg}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Game Finished Summary & Target Word Definition Reveal */}
      {gameStatus !== 'in_progress' && targetEntry && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                The Target Word Was:
              </span>
              <h3 className="text-2xl font-semibold text-ink tracking-wider">
                {targetWord}
              </h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleShareGrid}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-ink" /> : <Share2 className="w-3.5 h-3.5" />}
                {copiedShare ? 'Copied Grid!' : 'Share Grid'}
              </button>

              <button
                onClick={() => onSelectWord(targetEntry)}
                className="flex items-center gap-1.5 px-3 py-2 bg-ink hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-card transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                View Definition &amp; Clues
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            <strong>Definition:</strong> {targetEntry.definition}
          </p>
        </div>
      )}

      {/* Virtual On-Screen Keyboard */}
      <div className="space-y-1.5 pt-2 select-none">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((key) => {
              const status = letterStatuses[key];
              let keyBg = 'bg-slate-200 hover:bg-slate-300 text-slate-800';
              if (status === 'green') {
                keyBg = 'bg-emerald-600 text-white font-bold';
              } else if (status === 'yellow') {
                keyBg = 'bg-amber-500 text-white font-bold';
              } else if (status === 'gray') {
                keyBg = 'bg-slate-400 text-slate-100 opacity-60';
              }

              const isAction = key === 'ENTER' || key === 'DEL';

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`h-11 sm:h-12 flex items-center justify-center font-bold text-xs sm:text-sm rounded-lg active:scale-95 transition-all shadow-card ${
                    isAction ? 'px-3 sm:px-4 text-[10px] sm:text-xs bg-slate-300 text-slate-800' : 'w-8 sm:w-10'
                  } ${keyBg}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Quick Player Stats */}
      <div className="grid grid-cols-4 gap-2 bg-white rounded-xl p-3 border border-slate-200 text-center text-xs">
        <div>
          <div className="font-semibold text-base text-slate-900">{stats.played}</div>
          <div className="text-[10px] text-slate-400 font-medium">Played</div>
        </div>
        <div>
          <div className="font-semibold text-base text-slate-900">
            {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Win %</div>
        </div>
        <div>
          <div className="font-semibold text-base text-ink">{stats.streak}</div>
          <div className="text-[10px] text-slate-400 font-medium">Current Streak</div>
        </div>
        <div>
          <div className="font-semibold text-base text-amber-500">{stats.maxStreak}</div>
          <div className="text-[10px] text-slate-400 font-medium">Max Streak</div>
        </div>
      </div>
    </div>
  );
};
