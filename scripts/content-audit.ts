/**
 * Content quality audit for the dictionary. Run: npm run content:check
 * Fails (exit 1) when an authored entry has a quality problem. Add words to RAW_WORDS_DATA in src/data/words.ts;
 * every entry with a definition automatically gets its own page, so these rules protect page quality.
 */
import { ALL_WORDS, RAW_WORDS_DATA } from '../src/data/words';

const problems: string[] = [];
const seenDefs = new Map<string, string>();
const seenWords = new Set<string>();

for (const [word, def, pos, example] of RAW_WORDS_DATA) {
  const W = word.toUpperCase();
  const wholeWord = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
  if (!/^[A-Z]{5}$/.test(W)) problems.push(`${W}: not exactly five letters`);
  if (seenWords.has(W)) problems.push(`${W}: duplicate entry`);
  seenWords.add(W);
  if (def.length < 12) problems.push(`${W}: definition too short`);
  if (def.length > 140) problems.push(`${W}: definition longer than 140 characters`);
  if (!/[.!?]$/.test(def)) problems.push(`${W}: definition must end with punctuation`);
  if (wholeWord.test(def)) problems.push(`${W}: definition uses the word itself`);
  if (/Accepted five-letter word|Valid 5-letter/i.test(def)) problems.push(`${W}: placeholder definition on an authored entry`);
  if (!pos) problems.push(`${W}: missing part of speech`);
  if (!example) problems.push(`${W}: missing example sentence`);
  else if (!example.toLowerCase().includes(word.toLowerCase().slice(0, 3))) problems.push(`${W}: example sentence does not use the word`);
  const prior = seenDefs.get(def);
  if (prior) problems.push(`${W}: same definition as ${prior}`);
  seenDefs.set(def, W);
}

const defined = RAW_WORDS_DATA.length;
console.log(`Content audit: ${ALL_WORDS.length} words, ${defined} with authored definitions (${((defined / ALL_WORDS.length) * 100).toFixed(1)}%).`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n - ` + problems.slice(0, 40).join('\n - '));
  process.exit(1);
}
console.log('All authored entries pass: unique, non-circular definitions with examples and part of speech.');
