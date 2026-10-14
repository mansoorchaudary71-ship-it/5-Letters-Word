import { ALL_WORDS } from './words';
import { WordEntry } from '../types/word';

// Overall frequency in 5-letter words
export interface LetterFrequency {
  letter: string;
  count: number;
  percentage: number;
}

export function computeOverallFrequencies(): LetterFrequency[] {
  const counts: Record<string, number> = {};
  for (let c = 65; c <= 90; c++) {
    counts[String.fromCharCode(c)] = 0;
  }

  let totalLetters = 0;
  ALL_WORDS.forEach((item) => {
    for (const char of item.word) {
      if (counts[char] !== undefined) {
        counts[char]++;
        totalLetters++;
      }
    }
  });

  return Object.entries(counts)
    .map(([letter, count]) => ({
      letter,
      count,
      percentage: Number(((count / (totalLetters || 1)) * 100).toFixed(1))
    }))
    .sort((a, b) => b.count - a.count);
}

// Position frequency (slot 1 to 5)
export function computePositionalFrequencies(): Record<number, LetterFrequency[]> {
  const result: Record<number, LetterFrequency[]> = {
    0: [], 1: [], 2: [], 3: [], 4: []
  };

  for (let pos = 0; pos < 5; pos++) {
    const posCounts: Record<string, number> = {};
    for (let c = 65; c <= 90; c++) posCounts[String.fromCharCode(c)] = 0;

    ALL_WORDS.forEach((item) => {
      const char = item.word[pos];
      if (char && posCounts[char] !== undefined) {
        posCounts[char]++;
      }
    });

    const total = ALL_WORDS.length;
    result[pos] = Object.entries(posCounts)
      .map(([letter, count]) => ({
        letter,
        count,
        percentage: Number(((count / (total || 1)) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count);
  }

  return result;
}

// Wordle Solver entropy / letter variety scorer.
// Build the letter table ONCE per candidate list, then score every guess against it. (Rebuilding the
// table for each guess made the solver O(n^2): about a million Set allocations on first render.)
export function buildLetterFreqs(candidates: WordEntry[]): Record<string, number> {
  const freqs: Record<string, number> = {};
  for (const c of candidates) {
    const w = c.word;
    let seen = 0; // bitmask of letters already counted for this word
    for (let i = 0; i < w.length; i++) {
      const bit = 1 << (w.charCodeAt(i) - 65);
      if (!(seen & bit)) {
        seen |= bit;
        freqs[w[i]] = (freqs[w[i]] || 0) + 1;
      }
    }
  }
  return freqs;
}

export function scoreWordWithFreqs(word: string, freqs: Record<string, number>): number {
  const wordChars = new Set(word);
  let score = 0;
  wordChars.forEach((ch) => {
    score += freqs[ch] || 0;
  });

  // Deduct penalty for duplicate letters in guess when looking for information
  if (wordChars.size < 5) {
    score -= (5 - wordChars.size) * 15;
  }
  return score;
}

export function scoreWordForWordle(word: string, currentCandidates: WordEntry[]): number {
  if (currentCandidates.length === 0) return 0;
  return scoreWordWithFreqs(word, buildLetterFreqs(currentCandidates));
}
