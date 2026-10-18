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

// Letter frequency in ordinary English prose, as a percentage of all letters.
// Source: Robert Lewand, "Cryptological Mathematics" (2000), the figures most often cited for English text.
// This is general English (running text), NOT five-letter words; the five-letter statistics above are computed from the word list.
const ENGLISH_PERCENTAGES: Record<string, number> = {
  A: 8.17, B: 1.49, C: 2.78, D: 4.25, E: 12.7, F: 2.23, G: 2.02, H: 6.09, I: 6.97,
  J: 0.15, K: 0.77, L: 4.03, M: 2.41, N: 6.75, O: 7.51, P: 1.93, Q: 0.1, R: 5.99,
  S: 6.33, T: 9.06, U: 2.76, V: 0.98, W: 2.36, X: 0.15, Y: 1.97, Z: 0.07,
};

/** English letters ranked from most to least common (E, T, A, O, I, N, S, H, R, D ...). */
export const ENGLISH_LETTER_FREQUENCY: { letter: string; percentage: number }[] = Object.entries(ENGLISH_PERCENTAGES)
  .map(([letter, percentage]) => ({ letter, percentage }))
  .sort((a, b) => b.percentage - a.percentage);

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
