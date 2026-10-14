// Data-driven page text. Every list page and every word page gets copy and FAQ answers computed from the
// real dictionary, so no two pages share the same boilerplate (a common thin-content / duplicate-content problem).
// Pure TypeScript; imported by the React app and by scripts/generate-seo-pages.ts.

import { ALL_WORDS } from '../data/words';
import type { WordEntry } from '../types/word';
import type { Faq, Filter, Link } from './routes';

/** Trim to a maximum length at a word boundary (for meta descriptions). */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

const nf = (n: number) => n.toLocaleString('en-US');

/** "A, B and C" */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function wordsForFilter(filter: Filter): WordEntry[] {
  const { startsWith, endsWith, contains, tag } = filter;
  return ALL_WORDS.filter((w) => {
    if (startsWith && !w.word.startsWith(startsWith.toUpperCase())) return false;
    if (endsWith && !w.word.endsWith(endsWith.toUpperCase())) return false;
    if (contains && !w.word.includes(contains.toUpperCase())) return false;
    if (tag && !w.tags.includes(tag)) return false;
    return true;
  });
}

/** Most frequent letters at one position, e.g. [['T', 58], ['H', 41]]. */
function topLetters(words: WordEntry[], index: number, n = 3): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w.word[index], (counts.get(w.word[index]) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n);
}

function topScoring(words: WordEntry[], n = 3): WordEntry[] {
  return [...words].sort((a, b) => b.scrabbleScore - a.scrabbleScore || a.word.localeCompare(b.word)).slice(0, n);
}

/** Familiar words first (those with a written definition), then the rest. */
function examples(words: WordEntry[], n: number): string[] {
  const defined = words.filter((w) => w.isCommon);
  const pool = defined.length >= n ? defined : [...defined, ...words.filter((w) => !w.isCommon)];
  return pool.slice(0, n).map((w) => w.word);
}

export interface ListCopy {
  about: string[];
  faq: Faq[];
}

/**
 * Copy for a list page. `subject` completes the sentence "five-letter words that ___",
 * e.g. "start with S", "end in ER", "contain Q".
 */
export function describeList(words: WordEntry[], subject: string, focus?: { kind: 'start' | 'end' | 'contains'; value: string }): ListCopy {
  const n = words.length;
  const defined = words.filter((w) => w.isCommon).length;
  const best = topScoring(words, 3);
  const avgVowels = n ? words.reduce((s, w) => s + w.vowels, 0) / n : 0;

  const about: string[] = [];
  about.push(
    `Our dictionary contains ${nf(n)} five-letter words that ${subject}. ${nf(defined)} of them have a written definition, part of speech and example sentence, and every word shows its Scrabble and Words With Friends tile score.`,
  );

  if (focus && n > 0) {
    const L = focus.value.toUpperCase();
    if (focus.kind === 'start') {
      const idx = L.length;
      const top = topLetters(words, idx);
      about.push(
        `After ${L}, the most common next letters are ${joinList(top.map(([l, c]) => `${l} (${nf(c)} words)`))}. That makes ${L}${top[0][0]} a strong pair to test early when your first letter is already green.`,
      );
    } else if (focus.kind === 'end') {
      const idx = 4 - L.length;
      const top = topLetters(words, idx);
      about.push(
        `Just before the ending ${L}, the most common letters are ${joinList(top.map(([l, c]) => `${l} (${nf(c)} words)`))}. If your last letters are green, try those first.`,
      );
    } else {
      const positions = [0, 1, 2, 3, 4].map((i) => [i, words.filter((w) => w.word[i] === L).length] as [number, number]).sort((a, b) => b[1] - a[1]);
      const ord = ['first', 'second', 'third', 'fourth', 'fifth'];
      about.push(
        `In this list ${L} most often sits in the ${ord[positions[0][0]]} position (${nf(positions[0][1])} words), followed by the ${ord[positions[1][0]]} position (${nf(positions[1][1])} words). Knowing where a letter is likely to land helps you place a yellow tile.`,
      );
    }
  }

  if (best.length > 0) {
    about.push(
      `The highest-scoring Scrabble words here are ${joinList(best.map((w) => `${w.word} (${w.scrabbleScore} points)`))}. Scores are base tile values before any bonus squares. On average these words contain ${avgVowels.toFixed(1)} vowels, so ${avgVowels >= 2 ? 'they are good vowel-testing guesses' : 'consonant-heavy guesses are common here'}.`,
    );
  }

  const faq: Faq[] = [
    {
      q: `How many 5-letter words ${subject}?`,
      a: `Our dictionary lists ${nf(n)} five-letter words that ${subject}. Official word lists differ slightly, so check your game's own dictionary for rare entries.`,
    },
  ];
  if (n > 0) {
    faq.push({
      q: `What are some common 5-letter words that ${subject}?`,
      a: `Familiar examples include ${joinList(examples(words, 8))}. Open any word on this page for its definition, score and anagrams.`,
    });
    faq.push({
      q: `Which 5-letter word that ${subject} scores the most in Scrabble?`,
      a: `${best[0].word} is the highest-scoring at ${best[0].scrabbleScore} points in Scrabble and ${best[0].wwfScore} in Words With Friends, counting base tile values only.`,
    });
  }
  return { about, faq };
}

// ---------------------------------------------------------------------------------------------
// Word pages: one indexable page per word that has a hand-written definition (thin entries get none).
// ---------------------------------------------------------------------------------------------

const ANAGRAMS = new Map<string, string[]>();
for (const w of ALL_WORDS) {
  const key = w.word.split('').sort().join('');
  const list = ANAGRAMS.get(key) ?? [];
  list.push(w.word);
  ANAGRAMS.set(key, list);
}

// How many five-letter words contain each letter at least once, used for a data-driven Wordle note on each word page.
const LETTER_DOC_FREQ = (() => {
  const counts: Record<string, number> = {};
  for (const w of ALL_WORDS) for (const ch of new Set(w.word.split(''))) counts[ch] = (counts[ch] ?? 0) + 1;
  return counts;
})();
const TOP_LETTERS = Object.entries(LETTER_DOC_FREQ)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([ch]) => ch);

const withArticle = (p: string) => `${/^[aeiou]/i.test(p) ? 'an' : 'a'} ${p}`;
/** "noun / verb" -> "a noun and a verb" */
const usageOf = (pos: string): string => {
  const parts = pos.split('/').map((x) => x.trim()).filter(Boolean).map(withArticle);
  if (parts.length <= 1) return parts[0] ?? 'a word';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
};

export const DEFINED_WORDS: WordEntry[] = ALL_WORDS.filter((w) => w.isCommon);
const DEFINED_SET = new Set(DEFINED_WORDS.map((w) => w.word));
export const wordPath = (word: string) => `/word/${word.toLowerCase()}/`;
export const hasWordPage = (word: string) => DEFINED_SET.has(word.toUpperCase());
export const anagramsOf = (word: string): string[] => (ANAGRAMS.get(word.toUpperCase().split('').sort().join('')) ?? []).filter((w) => w !== word.toUpperCase());

export interface WordCopy {
  about: string[];
  faq: Faq[];
  related: Link[];
  crumbs: Link[];
  title: string;
  description: string;
  h1: string;
}

export function describeWord(entry: WordEntry, startPageExists: (prefix: string) => boolean): WordCopy {
  const W = entry.word;
  const pos = entry.partOfSpeech;
  const v = entry.vowels;
  const anagrams = anagramsOf(W);
  const dbl = entry.tags.includes('double-letters');

  const usage = usageOf(pos);
  const letters = [...new Set(W.split(''))];
  const common = letters.filter((ch) => TOP_LETTERS.includes(ch));
  const repeated = letters.filter((ch) => W.split(ch).length - 1 > 1);
  const wordleNote =
    `As a Wordle guess, ${W} tests ${letters.length} different letter${letters.length === 1 ? '' : 's'}` +
    (common.length > 0
      ? `, and ${common.length} of them (${joinList(common)}) are among the eight most common letters in five-letter words (${joinList(TOP_LETTERS)}), so it is ${common.length >= 3 ? 'a strong' : 'a modest'} way to narrow the field.`
      : `, but none of them are among the eight most common letters in five-letter words (${joinList(TOP_LETTERS)}), so it is better kept for the end of a puzzle than used as an opener.`) +
    (repeated.length > 0
      ? ` Because it repeats ${joinList(repeated)}, a guess can colour one copy yellow or green and the other grey.`
      : '');

  const about: string[] = [`${W} is used as ${usage}. ${entry.definition}`];
  if (entry.example) about.push(`Example: "${entry.example}"`);
  about.push(
    `${W} is spelled ${W.split('').join('-')}. It has ${v} vowel${v === 1 ? '' : 's'} and ${5 - v} consonant${5 - v === 1 ? '' : 's'}, starts with ${W[0]} and ends with ${W[4]}${dbl ? ', and it contains a double letter' : ''}. In Scrabble the base tile score is ${entry.scrabbleScore} points; in Words With Friends it is ${entry.wwfScore}.`,
  );
  about.push(wordleNote);
  about.push(
    anagrams.length > 0
      ? `The letters of ${W} can be rearranged into ${joinList(anagrams)}.`
      : `${W} has no anagram among the five-letter words in our dictionary, so there is no other word to confuse it with when you unscramble letters.`,
  );

  const faq: Faq[] = [
    { q: `What does ${W} mean?`, a: `${W} is used as ${usage}. ${entry.definition}` },
    { q: `Is ${W} a good Wordle guess?`, a: wordleNote },
    {
      q: `How many points is ${W} worth in Scrabble?`,
      a: `${W} scores ${entry.scrabbleScore} points in Scrabble and ${entry.wwfScore} in Words With Friends, counting base tile values only. Double and triple letter or word squares increase the total.`,
    },
    {
      q: `Is ${W} a valid Scrabble word?`,
      a: `${W} is included in our five-letter word list, which is built for word games. Tournament dictionaries differ between regions, so confirm the word in the official dictionary your game uses.`,
    },
  ];
  if (anagrams.length > 0) {
    faq.push({ q: `What words can you make from the letters in ${W}?`, a: `Rearranging ${W} gives ${joinList(anagrams)}.` });
  }

  const related: Link[] = [];
  const seen = new Set<string>([W]);
  const add = (word: string, label?: string) => {
    if (seen.has(word) || !DEFINED_SET.has(word) || related.length >= 12) return;
    seen.add(word);
    related.push({ label: label ?? word, path: wordPath(word) });
  };
  anagrams.forEach((a) => add(a, `${a} (anagram)`));
  DEFINED_WORDS.filter((w) => w.word.startsWith(W.slice(0, 2))).slice(0, 6).forEach((w) => add(w.word));
  DEFINED_WORDS.filter((w) => w.word.endsWith(W.slice(3))).slice(0, 6).forEach((w) => add(w.word));

  const crumbs: Link[] = [{ label: '5-Letter Words A-Z', path: '/5-letter-words-a-z/' }];
  if (startPageExists(W[0])) crumbs.push({ label: `Words Starting With ${W[0]}`, path: `/5-letter-words-starting-with-${W[0].toLowerCase()}/` });

  return {
    about,
    faq,
    related,
    crumbs,
    title: `${W}: Meaning, Scrabble Score & Anagrams`,
    description: `${W} is a 5-letter ${pos.split(' / ')[0]}. ${entry.definition} Scrabble score ${entry.scrabbleScore}, Words With Friends ${entry.wwfScore}.`.slice(0, 160),
    h1: `${W}: Definition, Score & Anagrams`,
  };
}
