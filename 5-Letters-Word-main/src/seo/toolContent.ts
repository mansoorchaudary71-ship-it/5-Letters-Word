// Extra, page-specific copy for the tool pages. It is merged into the route definitions in routes.ts and is
// rendered both in the prerendered HTML (for crawlers) and under the tool in the app (for visitors).
// Keep it factual and specific to the tool: thin or templated copy is what search engines discount.
import type { Faq, Section } from './routes';
import { ENGLISH_LETTER_FREQUENCY, computeOverallFrequencies, computePositionalFrequencies } from '../data/letterStats';
import { ALL_WORDS, WORDS_SET } from '../data/words';

// Numbers quoted in the /letter-frequency/ copy are computed from the word list, so the text can never drift from the charts.
const LF = (() => {
  const nf = (n: number) => n.toLocaleString('en-US');
  const f1 = (n: number) => n.toFixed(1);
  const overall = computeOverallFrequencies();
  const positions = computePositionalFrequencies();
  const total = overall.reduce((sum, x) => sum + x.count, 0);
  const find = (L: string) => overall.find((x) => x.letter === L)!;
  const ordinal = (n: number) => {
    const v = n % 100;
    return `${n}${['th', 'st', 'nd', 'rd'][(v - 20) % 10] || ['th', 'st', 'nd', 'rd'][v] || 'th'}`;
  };
  const rank = (L: string) => overall.findIndex((x) => x.letter === L) + 1;

  // Share of WORDS containing each letter at least once (a letter counted once per word)
  const withLetter: Record<string, number> = {};
  const vowelCounts = [0, 0, 0, 0, 0, 0];
  for (const w of ALL_WORDS) {
    for (const ch of new Set(w.word)) withLetter[ch] = (withLetter[ch] || 0) + 1;
    vowelCounts[[...w.word].filter((c) => 'AEIOU'.includes(c)).length]++;
  }
  const wordPct = (n: number) => f1((n / ALL_WORDS.length) * 100);
  const byWords = Object.entries(withLetter).sort((a, b) => b[1] - a[1]);
  const rarest = [...overall].reverse().slice(0, 4); // least common first
  const en = Object.fromEntries(ENGLISH_LETTER_FREQUENCY.map((x) => [x.letter, x.percentage]));
  const posList = (i: number, n: number) => positions[i].slice(0, n).map((x) => `${x.letter} (${f1(x.percentage)}%)`).join(', ');
  const vowelTotal = overall.filter((x) => 'AEIOU'.includes(x.letter)).reduce((sum, x) => sum + x.count, 0);

  return {
    words: nf(ALL_WORDS.length),
    totalLetters: nf(total),
    top10: overall.slice(0, 10).map((x) => `${x.letter} (${f1(x.percentage)}%)`).join(', '),
    top5: overall.slice(0, 5).map((x) => x.letter).join(', '),
    pct: (L: string) => f1(find(L).percentage),
    pct5: (L: string) => f1(positions[4].find((x) => x.letter === L)!.percentage),
    ord: (L: string) => ordinal(rank(L)),
    eCount: nf(find('E').count),
    ePct: f1(find('E').percentage),
    share: (L: string) => wordPct(withLetter[L] || 0),
    wordShare: `${byWords[0][0]} is found in ${wordPct(byWords[0][1])}% of five-letter words, followed by ${byWords.slice(1, 5).map(([L, n]) => `${L} (${wordPct(n)}%)`).join(', ')}`,
    rarest: rarest.map((x) => `${x.letter} (${f1(x.percentage)}%)`).join(', '),
    rarestFirst: `${rarest[0].letter} (${f1(rarest[0].percentage)}% of letters)`,
    rareDetail: rarest
      .map((x) => `${x.letter} appears in only ${nf(withLetter[x.letter] || 0)} words (${wordPct(withLetter[x.letter] || 0)}%)`)
      .join('; ') + '.',
    pos: (i: number) => posList(i, 3),
    posShort: [0, 1, 2, 3, 4].map((i) => `Letter ${i + 1}: ${posList(i, 3)}`).join('. '),
    vowelShare: f1((vowelTotal / total) * 100),
    oneVowel: wordPct(vowelCounts[1]),
    twoVowels: wordPct(vowelCounts[2]),
    threePlus: wordPct(vowelCounts[3] + vowelCounts[4] + vowelCounts[5]),
    oneToThree: wordPct(vowelCounts[1] + vowelCounts[2] + vowelCounts[3]),
    enPct: (L: string) => en[L].toFixed(2),
    englishOrder: ENGLISH_LETTER_FREQUENCY.map((x) => x.letter).join(', '),
    englishList: ENGLISH_LETTER_FREQUENCY.map((x) => `${x.letter} ${x.percentage.toFixed(2)}%`).join(', '),
  };
})();

// Numbers quoted in the /wordle-practice/ copy come from the same word lists the game uses.
const WP = (() => {
  const pool = ALL_WORDS.filter((w) => w.isWordleAnswer && w.isCommon).length;
  const missing = ['GUCKS', 'VIBEX'].filter((w) => !WORDS_SET.has(w));
  return {
    dict: ALL_WORDS.length.toLocaleString('en-US'),
    pool: pool.toLocaleString('en-US'),
    notAccepted: missing.length === 0 ? 'all five are accepted here' : `${missing.join(' and ')} ${missing.length === 1 ? 'is' : 'are'} not in this game's dictionary, so ${missing.length === 1 ? 'it' : 'they'} would be rejected as a guess`,
  };
})();


// Starting-word statistics for /best-wordle-starting-words/ are computed from the dictionary, so the text cannot drift from the data.
const SW = (() => {
  const n = ALL_WORDS.length;
  const share: Record<string, number> = {};
  for (const w of ALL_WORDS) for (const ch of new Set(w.word)) share[ch] = (share[ch] || 0) + 1;
  // Coverage: the average number of a word's different letters that also appear in a random dictionary word.
  const cover = (word: string) => [...new Set(word)].reduce((sum, ch) => sum + share[ch] / n, 0);
  const c2 = (word: string) => cover(word).toFixed(2);
  const distinct = ALL_WORDS.filter((w) => new Set(w.word).size === 5).map((w) => ({ word: w.word, c: cover(w.word) }));
  const best = distinct.reduce((a, b) => (b.c > a.c ? b : a));
  const tagged = distinct.filter((x) => ALL_WORDS.find((w) => w.word === x.word)!.tags.includes('wordle-top')).sort((a, b) => b.c - a.c || a.word.localeCompare(b.word));
  const names = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
  const scores = (xs: string[]) => names(xs.map((w) => `${w} (${c2(w)})`));
  const letters = Object.entries(share).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([ch, k]) => `${ch} (${Math.round((k / n) * 100)}%)`).join(', ');
  const pos = computePositionalFrequencies();
  const first = pos[0][0], last = pos[4][0];
  const top5 = tagged.slice(0, 5).map((x) => x.word);
  return {
    n: n.toLocaleString('en-US'),
    bestOverall: `${best.word} (${best.c.toFixed(2)})`,
    topTagged: names(top5),
    topFive: names(top5),
    topList: scores(tagged.slice(0, 8).map((x) => x.word)),
    topLetters: letters,
    positions: `${first.letter} is the most common first letter (${first.percentage}% of first letters) and ${last.letter} the most common last letter (${last.percentage}% of last letters)`,
    balanced: `Coverage scores: ${scores(['STARE', 'SLATE', 'RAISE', 'TRACE', 'CRANE'])}`,
    vowelHeavy: `${c2('ADIEU')} and ${c2('AUDIO')}`,
    low: `Coverage scores: ${scores(['POINT', 'PILOT', 'PLANT'])}`,
    pairRaiseClout: (cover('RAISE') + cover('CLOUT')).toFixed(1),
  };
})();

export interface ExtraContent {
  sections?: Section[]; // placed BEFORE the page's existing link sections
  faq?: Faq[]; // appended to the page's existing FAQ
  replaceAbout?: string[]; // replaces the page's generated intro paragraphs
  replaceFaq?: boolean; // when true, `faq` replaces the page's generated FAQ instead of being appended
}

export const TOOL_CONTENT: Record<string, ExtraContent> = {
  '/wordle-solver/': {
    sections: [
      {
        heading: 'How to use the Wordle solver',
        body: [
          'Work through your guesses one at a time. The solver has three clue areas that match the three tile colours, and the list of possible words updates after every change, so you can see how much each guess actually told you.',
        ],
        subsections: [
          {
            heading: 'Step 1: enter the green letters',
            body: [
              'For every green tile, type the letter into the box for the position where it sits. Green letters are fixed: only words with that letter in that exact position stay on the list.',
            ],
          },
          {
            heading: 'Step 2: add the yellow letters and where they cannot go',
            body: [
              'A yellow tile means the letter is in the word but not in the position where you guessed it. Type the letter into the yellow box for that position. The tool adds it to the "all known yellow letters" list, requires it to appear somewhere in the answer and removes words that have it in the position you tried.',
            ],
          },
          {
            heading: 'Step 3: add the grey letters',
            body: [
              'Type every grey letter into the ruled-out box. Words containing those letters disappear. Click a grey letter to remove it again if you entered it by mistake, or use Clear All Clues to start a new puzzle.',
            ],
          },
          {
            heading: 'Step 4: pick your next guess from the suggestions',
            body: [
              'Once more than one word is left, the solver shows the top eight suggested guesses, and above them the number of valid words remaining. It lists up to 96 matches at a time, so add more clues to bring a long list down. Open any word to read its definition and Scrabble score before you commit to it.',
            ],
          },
        ],
      },
      {
        heading: 'Wordle solver for 5 letter words, NYT Wordle and other versions',
        body: [
          'This is a 5 letter Wordle solver: its dictionary and its pattern boxes are built for words of exactly five letters.',
        ],
        subsections: [
          {
            heading: 'NYT Wordle and the daily puzzle',
            body: [
              'The solver works with any five-letter Wordle, including the daily puzzle on the New York Times site, because it only needs your tile colours. It does not know the daily answer and cannot look it up, so it never spoils a puzzle you have not played. This site is independent of the New York Times.',
            ],
          },
          {
            heading: 'Is there a 4, 6, 7 or 8 letter Wordle solver?',
            body: [
              'Not here. Variants with other word lengths need their own dictionaries, and this tool only searches five-letter words. For other lengths use a solver that lists those lengths explicitly, and keep this one for standard Wordle.',
            ],
          },
          {
            heading: 'Wordle solver for other languages',
            body: [
              'The dictionary is English only, so it will not suit Spanish, French or other-language versions of Wordle.',
            ],
          },
        ],
      },
      {
        heading: 'How the Wordle solver works (algorithm)',
        body: [
          'The solver combines a simple filter with a simple ranking. Both run in your browser, and nothing you type is sent to a server.',
        ],
        subsections: [
          {
            heading: 'Filtering: how clues remove words',
            body: [
              'A word stays only if it matches every green letter in position, contains every yellow letter, does not have a yellow letter in the position where you already tried it, and avoids every grey letter. The one exception is a letter you have marked both grey and green or yellow: because that usually means the guess had a repeated letter, the solver keeps the letter rather than throwing it out.',
            ],
          },
          {
            heading: 'Ranking: how the best next guess is chosen',
            body: [
              'Among the words that are still possible, the solver counts how many remaining words contain each letter and scores every remaining word by the sum of those counts for its different letters, with a penalty for repeated letters. The eight highest scores become the suggested guesses. This is a letter-frequency method, not an exhaustive search, and it only suggests words that could still be the answer. It is a sensible default rather than a guarantee of a win in fewer guesses.',
            ],
          },
          {
            heading: 'Is this an AI Wordle solver?',
            body: [
              'It uses statistics on a fixed word list rather than a generative AI model, so every suggestion is a real word from the dictionary and the same clues always give the same list.',
            ],
          },
        ],
      },
      {
        heading: 'Repeated letters and other tricky cases',
        body: [
          'Duplicate letters cause most solver mistakes, and a few patterns of words that differ by one letter can cost you a streak.',
        ],
        subsections: [
          {
            heading: 'Double letters (SPEED, LLAMA and similar)',
            body: [
              'If you guess a word with two Es and only one tile turns yellow or green, the other E is grey, but that does not mean the answer has no E. It means the answer has exactly one. Enter the grey E as usual: because the same letter is also green or yellow, the solver keeps it. Note that it does not count copies, so when you see one E confirmed, check candidates with two Es yourself.',
            ],
          },
          {
            heading: 'Rhyme traps such as BATCH, CATCH, HATCH, LATCH, MATCH and WATCH',
            body: [
              'When the remaining words differ by only one letter, guessing one at random can burn all your remaining tries. Pick a word that contains several of the differing letters, even if it cannot be the answer, so that one guess separates them.',
            ],
          },
        ],
      },
      {
        heading: 'Wordle solver tool, app, website or extension: which do you need?',
        body: [
          'People look for a Wordle solver as a website, an app, a browser extension or an AI chatbot. They all do the same core job of narrowing a word list, so the real difference is convenience.',
        ],
        subsections: [
          {
            heading: 'Online Wordle solver or helper vs an app',
            body: [
              'An online tool needs no download, works on any phone or computer and always has the latest word list. An app only makes sense if you want a home-screen icon. This solver is a web page: open it, enter clues, close it.',
            ],
          },
          {
            heading: 'Free Wordle solver: no subscription needed',
            body: [
              'Everything on this page is free to use, with no account, subscription or sign-up. If a site asks you to pay to unlock a basic Wordle solver, you can safely skip it.',
            ],
          },
          {
            heading: 'AI chatbots vs a dictionary-based solver',
            body: [
              'A chatbot can talk through a puzzle, but it can invent words that are not in the dictionary or forget a clue. A dictionary-based solver checks every candidate against a real word list, so use a chatbot for explanations and a solver for the final list.',
            ],
          },
        ],
      },
      {
        heading: 'Using a Wordle solver without spoiling the puzzle',
        body: [
          'A solver is best used as a coach rather than a crutch.',
        ],
        subsections: [
          {
            heading: 'Is using a Wordle solver cheating?',
            body: [
              'In a casual game, only you can decide. A solver does not know the answer, it only filters words using the clues you entered. Many players try the puzzle first, then check the candidate list when they are stuck on guess four or five or after they finish, to see whether a better guess existed.',
            ],
          },
          {
            heading: 'Practise first, then solve',
            body: [
              'The unlimited practice game lets you rehearse your method without using up the daily puzzle. After a round, enter your guesses into the solver to see how many words each one left.',
            ],
          },
          {
            heading: 'What should I guess first?',
            body: [
              'The first guess is the one decision a solver cannot help with because you have no clues yet. The Best Wordle Starting Words page ranks the popular openers and explains how to choose.',
            ],
          },
        ],
      },
    ],
    faq: [
      {
        q: 'How does a Wordle solver work?',
        a: 'It removes every word that conflicts with your clues: green letters must match their position, yellow letters must appear elsewhere in the word, and grey letters must not appear. Then it suggests guesses from the words that remain.',
      },
      {
        q: 'How do I use this Wordle solver?',
        a: 'After each guess, type your green letters into their position boxes, add yellow letters to the position where they appeared and enter grey letters in the ruled-out box. The list of possible words and the suggested next guesses update as you type.',
      },
      {
        q: 'What is the best Wordle solver?',
        a: 'The best solver is one that checks a real word list, lets you enter all three clue colours and shows its remaining candidates so you can judge them yourself. This one is free, runs in your browser, needs no download and also suggests the strongest next guesses.',
      },
      {
        q: 'Is there a free Wordle solver online with no download or sign-up?',
        a: 'Yes. This page works in any modern browser on desktop and mobile, with no app, extension, account or subscription.',
      },
      {
        q: 'Does the solver give me the Wordle answer for today?',
        a: 'No. It only filters a word list using the clues you type in. It does not know which word is the daily answer, so it cannot reveal it before you enter your own guesses.',
      },
      {
        q: 'What is the best opening word for Wordle?',
        a: 'A word with common, different letters such as AROSE, RAISE, STARE or SLATE is a strong choice. The Best Wordle Starting Words page ranks the popular options.',
      },
      {
        q: 'Why does the solver show words I have never heard of?',
        a: 'The dictionary includes valid five-letter words, not just everyday ones, and the list is shown in alphabetical order. Open a word that has a definition to read its meaning, and treat the suggested guesses as the best first picks.',
      },
      {
        q: 'How do I handle repeated letters in the solver?',
        a: 'Enter the colours exactly as shown. If a repeated letter shows one tile green or yellow and the other grey, put it in the green or yellow boxes and also in the grey box: the solver keeps the letter rather than excluding it.',
      },
      {
        q: 'Can the solver help with 6, 7 or 8 letter Wordle games?',
        a: 'No. It is built for five-letter Wordle only.',
      },
      {
        q: 'Does the solver work with the New York Times Wordle?',
        a: 'Yes, for any five-letter Wordle. This site is independent and not affiliated with The New York Times.',
      },
      {
        q: 'Is using a Wordle solver cheating?',
        a: 'That is up to you. The tool only narrows a word list from clues you supply and you still choose the guess, so many players use it only after trying the puzzle themselves, or to check afterwards whether a better guess existed.',
      },
      {
        q: 'Is the Wordle answer randomly generated?',
        a: 'As far as is publicly known, the original game walked through a fixed list of answers in a set order, and the New York Times chooses the daily word since taking it over. Either way, the word is not generated at random at the moment you play.',
      },
      {
        q: 'Is there a Wordle solver app, or one I can use offline?',
        a: 'There is no app to install. The solver is a web page that works on phones, tablets and computers, and the filtering runs on your own device.',
      },
      {
        q: 'Can I practise before using the solver?',
        a: 'Yes. The Wordle practice game gives you unlimited random five-letter words with the same green, yellow and grey tiles, so you can build a method and then check your results with the solver.',
      },
    ],
  },

  '/anagram-solver/': {
    sections: [
      {
        heading: 'How the 5-letter anagram solver works',
        body: [
          'Enter the letters you have and the solver checks them against its dictionary of five-letter English words. Because the list is limited to five letters, results appear instantly and every result is a real word you can play.',
        ],
        subsections: [
          {
            heading: 'Exact anagrams from five letters',
            body: [
              'Type exactly five letters and the solver lists every word that uses precisely those letters in any order. TEARS returns ASTER, RATES, STARE, TARES and TEARS, and STONE returns NOTES, ONSET, STENO, STONE and TONES.',
            ],
          },
          {
            heading: 'Blank tiles and wildcards (? and *)',
            body: [
              'Use a question mark or asterisk as a blank tile. Each wildcard stands for any single letter, so four letters plus one wildcard list every five-letter word those four letters can form with one extra letter of your choice, just like a blank tile in Scrabble. Four letters CRAN plus one wildcard returns ACORN, CAIRN, CRANE, CRANK, FRANC and RANCH, for example.',
            ],
          },
          {
            heading: 'Longer racks: find all possible words from your letters',
            body: [
              'Enter more than five letters, such as a seven-tile Scrabble rack, and the solver lists every five-letter word that can be made from any five of them. STONEAR returns AROSE, ARSON, ASTER, ATONE and NOTES among many others. To allow a repeated letter that is not on your rack, add a wildcard: SPED plus one wildcard returns SPEED, DEEPS and SPEND among others.',
            ],
          },
          {
            heading: 'Results are sorted by Scrabble score',
            body: [
              'Matches are listed from the highest Scrabble tile score to the lowest, with each word\'s definition and score shown on its card. That puts the strongest play first, and you can open a word for its Words With Friends score and its own anagrams.',
            ],
          },
        ],
      },
      {
        heading: 'Free online anagram solver for word games',
        body: [
          'An anagram solver is useful whenever you hold letters but not their order.',
        ],
        subsections: [
          {
            heading: 'Scrabble and Words With Friends racks',
            body: [
              'Enter your rack, add a wildcard for a blank tile and compare scores to pick the best option. Official dictionaries differ between countries and game editions, so check your own rulebook if a word is challenged.',
            ],
          },
          {
            heading: 'Wordle and crossword checks',
            body: [
              'Wordle players use an anagram solver to check whether the letters from their green and yellow tiles can be arranged into more than one answer, which shows how risky a guess is. For a full filter by green, yellow and grey tiles, use the Wordle Solver. Crossword fans use it for jumbled-word clues.',
            ],
          },
          {
            heading: 'Word finder and anagram solver: what is the difference?',
            body: [
              'An anagram solver starts from letters in any order. A word finder starts from a pattern, such as a known first letter, last letter or letters in fixed positions. If you know where some letters go, use the 5 letter Word Finder; if you only know which letters you have, use this solver.',
            ],
          },
        ],
      },
      {
        heading: 'Anagram solver for multiple words, phrases and names',
        body: [
          'This tool returns single five-letter words only, so it does not solve two-word anagrams, phrases, names or sentences. Here is what to do instead.',
        ],
        subsections: [
          {
            heading: 'Two or more words from one set of letters',
            body: [
              'Split your letters into groups of five, solve each group and combine the results by hand. For a ten-letter phrase, that means two five-letter groups, and you can swap letters between groups until both make words.',
            ],
          },
          {
            heading: 'Names and phrases',
            body: [
              'The dictionary contains ordinary English words, not proper names, so a name will not appear in the results. Use the same group-and-combine method, and use a wildcard for any letter you are unsure of.',
            ],
          },
          {
            heading: 'Other word lengths',
            body: [
              'The solver only outputs five-letter words, no matter how many letters you enter, and the dictionary is English only.',
            ],
          },
        ],
      },
      {
        heading: 'Tips for unscrambling faster',
        body: [
          'Look for common endings first (ER, ED, ES, LY) and common starting pairs (ST, CH, TR, BL). Group vowels and consonants separately, then try each vowel in the middle. If nothing fits, try a wildcard: it shows which single extra letter would unlock a word.',
        ],
        subsections: [
          {
            heading: 'Anagram families: one set of letters, several words',
            body: [
              'Many sets of letters have several valid arrangements. The letters of STONE also spell NOTES, ONSET, STENO and TONES, and the letters of TEARS also spell ASTER, RATES, STARE and TARES. Where a set has more than one answer, compare definitions and scores, then choose the word that suits your game. Some sets have only one: AROSE has no other arrangement in this dictionary.',
            ],
          },
        ],
      },
    ],
    faq: [
      {
        q: 'What is an anagram solver?',
        a: 'An anagram solver is a tool that rearranges a set of letters into every valid word they can form. This one checks your letters against a dictionary of five-letter English words, so TEARS returns ASTER, RATES, STARE, TARES and TEARS.',
      },
      {
        q: 'What is an anagram?',
        a: 'An anagram is a word or phrase made by rearranging the letters of another, using every letter exactly once. STONE, NOTES, ONSET, STENO and TONES are anagrams of one another.',
      },
      {
        q: 'How do I use an anagram solver with blanks or missing letters?',
        a: 'Type a question mark or asterisk for each blank or unknown letter. Four known letters plus one blank list every five-letter word that contains those four letters, which is how a blank tile works in Scrabble.',
      },
      {
        q: 'How do I find all possible words from my letters?',
        a: 'Enter all your letters. With more than five, the solver lists every five-letter word that can be made from any five of them. Add a wildcard to see words that need one extra letter.',
      },
      {
        q: 'Can an anagram solver repeat letters or use a letter more than once?',
        a: 'Each letter you type is used once, so a word with two Es needs two Es in your rack. To allow an extra copy of a letter, add a blank. For example SPED plus a blank returns SPEED, DEEPS and SPEND among others.',
      },
      {
        q: 'Does it solve two-word anagrams, phrases, names or sentences?',
        a: 'No. This solver returns single five-letter words only. For a phrase, a name or a celebrity anagram, split the letters into groups and solve each five-letter chunk, then combine the results by hand.',
      },
      {
        q: 'Is there an anagram solver for Scrabble and Words With Friends?',
        a: 'Yes. Results are sorted by Scrabble tile score and each word opens to its Scrabble and Words With Friends values. Check your own game dictionary before playing a word, since official lists differ.',
      },
      {
        q: 'Can I use an anagram solver for Wordle?',
        a: 'Yes. Enter your green and yellow letters to see whether they can be arranged into more than one answer, which tells you how risky a guess is. For a full filter by green, yellow and grey tiles, use the Wordle Solver.',
      },
      {
        q: 'Do I need to download an app or browser extension?',
        a: 'No. The solver runs in your browser on phones, tablets and computers, with no account, download or extension. It is free to use and your letters are not sent to a server.',
      },
      {
        q: 'How do online anagram solvers and AI tools find words?',
        a: 'Most solvers compare your letters against a fixed dictionary, so every result is a real word. AI chatbots can unscramble letters too, but they can invent words or miss valid ones, so check any answer against a dictionary-based solver.',
      },
      {
        q: 'Does the solver work for other languages or longer words?',
        a: 'No. The dictionary is English and limited to five-letter words, so a 20-letter rack still returns only five-letter words made from it.',
      },
    ],
  },

  '/best-wordle-starting-words/': {
    replaceAbout: [
      `The best Wordle starting words use common letters, five different letters and a mix of vowels and consonants. By letter coverage in this site's ${SW.n}-word dictionary, ${SW.bestOverall} leads, and ${SW.topTagged} are the strongest openers on this page. Pick one, learn how it performs and use it every day.`,
      'This page ranks the popular openers, explains why they work, and answers the common questions about two-word and three-word starting strategies. Every word below links to its definition and Scrabble score.',
    ],
    sections: [
      {
        heading: 'What makes a good Wordle starting word?',
        body: [
          'A first guess has to work with no clues, so it should test as many likely letters as it can. Three properties matter.',
        ],
        subsections: [
          {
            heading: 'Common letters',
            body: [
              `Letters that appear in many words give you the most information. In this dictionary the most widespread letters, by share of words containing them, are ${SW.topLetters}. A guess made of those letters is likely to turn several tiles yellow or green.`,
            ],
          },
          {
            heading: 'Five different letters',
            body: [
              'A repeated letter wastes a slot, because the second copy tells you almost nothing new. Every word on this page has five different letters.',
            ],
          },
          {
            heading: 'A balance of vowels and consonants',
            body: [
              'Vowels are easy to place once you know them, but consonants carry more of the structure of a word. Most strong openers hold two vowels and three consonants, such as STARE, SLATE and CRANE.',
            ],
          },
          {
            heading: 'Letter position',
            body: [
              `Position matters for green tiles. ${SW.positions}. That is why S-words are common openers and why endings such as -S, -E and -Y deserve a thought.`,
            ],
          },
        ],
      },
      {
        heading: 'Best Wordle starting words ranked by letter coverage',
        body: [
          `Letter coverage is the average number of a word's five letters that also appear in a random word from this dictionary. A score of 1.9 means the guess tests letters that are present in the answer almost two times out of five. It is a simple measure that ignores letter position and how a guess splits the remaining answers, so treat it as a guide, not a verdict.`,
        ],
        subsections: [
          {
            heading: 'Top openers on this page',
            body: [`By coverage the strongest popular openers are ${SW.topList}.`],
          },
          {
            heading: 'Best balanced openers: STARE, SLATE, CRANE, TRACE and RAISE',
            body: [
              `These mix two vowels with common consonants. ${SW.balanced}. CRANE and TRACE score lower on this measure but are popular because their letters often land in useful positions.`,
            ],
          },
          {
            heading: 'Vowel-heavy openers: ADIEU and AUDIO',
            body: [
              `ADIEU and AUDIO test four vowels at once, which makes the rest of the word easier to read. Their coverage is lower (${SW.vowelHeavy}) because they spend slots on rarer vowels and no common consonants, so most players follow them with a consonant-heavy second guess.`,
            ],
          },
          {
            heading: 'Openers that rank lower: POINT, PLANT and PILOT',
            body: [
              `Words built from less common letters give less information. ${SW.low}. They can still be good guesses later in a puzzle when the clues point to them.`,
            ],
          },
        ],
      },
      {
        heading: 'Best two-word and three-word Wordle starting combinations',
        body: [
          'Some players plan two or three opening guesses together so that they test as many different letters as possible before they use the clues.',
        ],
        subsections: [
          {
            heading: 'The two best words to start Wordle',
            body: [
              `A good pair has ten different letters between them. RAISE then CLOUT, or CLOSE then TRAIN, are examples: each pair tests ten letters, and on average about ${SW.pairRaiseClout} of those letters appear in a random answer. Both are real words that can occasionally be the answer, so they are not wasted guesses.`,
            ],
          },
          {
            heading: 'The three-word Wordle trick',
            body: [
              'The idea is to use three guesses with fifteen different letters in total, such as CRANE, SLOTH and PUDGY. It tests most of the common letters before you start to narrow down. The cost is that the later guesses are unlikely to be the answer, so it suits players who value certainty over speed, and it is slower than adapting each guess to the clues.',
            ],
          },
        ],
      },
      {
        heading: 'How to use a Wordle starting word',
        subsections: [
          {
            heading: 'Pick one word and stay consistent',
            body: [
              'Choose an opener and use it for 20 games. You will learn how it performs and which follow-up guesses work best after it. Compare it with a second opener afterwards in the Wordle practice game, which keeps your win rate and streak.',
            ],
          },
          {
            heading: 'What should my second guess be?',
            body: [
              'If the first guess left you with many candidates, use five new common letters even if the word cannot be the answer. If it left you with a handful, guess a word that could be the answer. The Wordle Solver lists what is still possible after each guess.',
            ],
          },
          {
            heading: 'Starting words for hard mode',
            body: [
              'Hard mode requires every revealed hint to be used in later guesses, so the first guess matters more because you cannot spend a turn on pure information. A balanced opener such as STARE or SLATE is a sensible choice.',
            ],
          },
        ],
      },
    ],
    replaceFaq: true,
    faq: [
      {
        q: 'What is the best Wordle starting word?',
        a: `There is no single best word, but words with five common, different letters score highest. By letter coverage in this dictionary, ${SW.topFive} lead the popular openers, and ${SW.bestOverall} leads the whole dictionary.`,
      },
      {
        q: 'Is ADIEU a good starting word?',
        a: 'It is a decent one if you want to find vowels quickly because it tests four of them. It has lower letter coverage than words such as STARE or RAISE because it contains no common consonants, so many players pair it with a consonant-heavy second guess.',
      },
      {
        q: 'What are the two best words to start Wordle?',
        a: 'Pick two words that share no letters and are made of common letters, such as RAISE and CLOUT or CLOSE and TRAIN. Together they test ten different letters.',
      },
      {
        q: 'What is the 3 word Wordle trick?',
        a: 'It means opening with three words that together use fifteen different letters, for example CRANE, SLOTH and PUDGY, so you test most of the common letters before using the clues. It reduces luck but spends three guesses on words that are unlikely to be the answer.',
      },
      {
        q: 'Should I use the same starting word every day?',
        a: 'Many players do. A consistent opener lets you learn how it performs and which second guesses work well after it. Change it only if you have tested the new word and it does better.',
      },
      {
        q: 'How do I choose a second Wordle word?',
        a: 'If the first guess left many possible words, test five new common letters. If it left only a few, guess one of the remaining words. The Wordle Solver shows the words that still fit your clues.',
      },
      {
        q: 'What is the best Wordle starting word for hard mode?',
        a: 'A balanced opener such as STARE or SLATE works well, because hard mode forces you to reuse every hint and a strong first guess gives you more to work with.',
      },
      {
        q: 'How are these starting words ranked?',
        a: `They are ranked by letter coverage: the average number of a word's different letters that also appear in a random word from this site's ${SW.n}-word dictionary. It is a simple measure of letter presence and does not account for letter position or for exactly how a guess splits the remaining answers.`,
      },
    ],
  },

  '/5-letter-words-a-z/': {
    sections: [
      {
        heading: 'How to browse the directory',
        body: [
          'Choose any letter of the alphabet to open its page. Each letter has a list of words that start with it, a list of words that end with it and a list of words that contain it somewhere. Every list shows how many words it holds, so you can tell at a glance which letters are crowded (S, C and B) and which are rare (Q, X and Z).',
          'Pairs of letters have their own pages too, such as words starting with ST, CH or SH and words ending in ER, ED or LY. Use these when you know the opening or closing sound of a word but not the rest.',
        ],
      },
      {
        heading: 'Curated collections',
        body: [
          'Beyond the alphabet, the directory groups words by a feature that matters in play: the best Wordle starting words, palindromes, words with double letters, words with no vowels, words with many vowels and high-scoring Scrabble words. These are the lists most players ask for when they want a specific advantage rather than a complete dictionary.',
          'Every word on a list links to a short entry with its definition, part of speech, an example sentence, Scrabble and Words With Friends scores, and any anagrams.',
        ],
      },
      {
        heading: 'Why browse instead of search?',
        body: [
          'Searching works when you already know a pattern. Browsing works when you do not: scanning the S words reminds you of options you would never have typed, and comparing two similar endings often shows which one fits a crossword grid. Use the directory to learn the vocabulary, then switch to the Word Finder when you need to filter by position.',
        ],
      },
    ],
    faq: [
      {
        q: 'How many 5-letter words does the directory contain?',
        a: 'The dictionary holds several thousand five-letter English words. The exact count for each letter is shown on its page and updates automatically as the list grows.',
      },
      {
        q: 'Which letter starts the most five-letter words?',
        a: 'S starts more five-letter words than any other letter, followed by C and B. Open the S page to see the full list and sort it by Scrabble score or alphabetically.',
      },
    ],
  },

  '/wordle-practice/': {
    sections: [
      {
        heading: 'How to play Wordle practice',
        body: [
          'Guess the hidden five-letter word in six tries. Type a word on your keyboard or tap the on-screen keys, press Enter, and every letter is scored against the answer. Use the colors to narrow down your next guess.',
        ],
        subsections: [
          {
            heading: 'What the green, yellow and grey tiles mean',
            body: [
              'A green tile is the right letter in the right place. A yellow tile is a letter that is in the word but in a different place. A grey tile is a letter that is not in the word, or one more copy of a letter than the word contains: if you guess ERASE and the answer has only one E, just one E is colored and the other is grey.',
              'The on-screen keyboard remembers the best result for every letter you have tried, so you can see at a glance which letters are still untested.',
            ],
          },
          {
            heading: 'Valid guesses and the six-guess limit',
            body: [
              `Every guess must be a real word from the game's dictionary of ${WP.dict} five-letter words. A guess that is too short or not in the list shakes the row and does not use up one of your six tries. Answers are drawn from ${WP.pool} common five-letter words that appear in Wordle answer lists, so you practice on everyday words like the ones in the daily puzzle.`,
            ],
          },
          {
            heading: 'Playing on a computer or phone',
            body: [
              'Use a physical keyboard (Enter to submit, Backspace to delete) or tap the on-screen keyboard. The game runs in your browser, so there is nothing to download and no app store: it works the same on phones, tablets and computers.',
            ],
          },
        ],
      },
      {
        heading: 'Unlimited free Wordle practice games online',
        body: [
          'Press New Word at any time and a fresh random word starts instantly. There is no daily limit, no wait for tomorrow and no sign-up, so you can play one round to warm up or twenty in a row to drill a pattern. The game is free to use.',
        ],
        subsections: [
          {
            heading: 'Wordle practice vs the daily puzzle',
            body: [
              'The daily puzzle gives everyone the same single word once a day. Practice gives you as many words as you want, picked at random, so there is no archive of past practice words and no "today\'s practice answer" to look up: the answer appears only when your round ends. This site is independent and does not publish the daily Wordle answer or hints for it.',
              'If you are stuck on a daily puzzle, enter your clues into the Wordle Solver instead; it lists the words that still fit without giving away more than you ask for.',
            ],
          },
          {
            heading: 'Wordle unlimited practice game: no daily limit',
            body: [
              'This is an unlimited practice game in the literal sense: there is no cap on rounds, no cooldown between words and no sign-up. It is separate from the daily puzzle, so playing as many practice games as you like never affects the daily Wordle.',
            ],
          },
          {
            heading: 'Learn the answer after each round',
            body: [
              'When a round ends the answer is revealed with its definition. Choose View Definition & Clues to open the full entry, including its meaning, Scrabble score and anagrams, so every game also adds to your vocabulary.',
            ],
          },
          {
            heading: 'Track your practice progress',
            body: [
              `The stats bar shows games played, win percentage, current streak and best streak. Only completed rounds count, so pressing New Word in the middle of a round does not affect your record. Stats are saved in your browser on this device: they persist between visits but do not sync to other devices, and clearing site data resets them. With ${WP.pool} possible answers you can play many rounds before seeing a repeat, though repeats are possible because words are picked at random.`,
            ],
          },
        ],
      },
      {
        heading: 'How to get better at Wordle with practice',
        body: [
          'Wordle rewards a repeatable method more than inspiration, and unlimited rounds are the cheapest way to build one. The goal of each practice round is not only to win but to notice how much each guess narrowed the list of possible words.',
        ],
        subsections: [
          {
            heading: 'Practice with one starting word',
            body: [
              'Choose one opening word and use it for 20 rounds. Notice which letters it tests and how often it leaves you with too many candidates, then try a different opener and compare your win rate in the stats bar. The list of best Wordle starting words explains the trade-offs between popular choices such as CRANE, SLATE and ADIEU.',
            ],
          },
          {
            heading: 'How to solve Wordle in three guesses',
            body: [
              'A three-guess solve needs two guesses that remove most of the list. Open with a word made of common letters, build your second guess from five new letters if the first told you little, and guess a plausible answer only once a handful of candidates remain. After a round, enter your guesses into the Wordle Solver to see how many words each one left. Luck plays a part, but this routine raises your odds.',
            ],
          },
          {
            heading: 'Practice double letters and tricky patterns',
            body: [
              'Words with repeated letters, such as SPEED, cause many lost games because the colors for the second copy are easy to misread. When you have two guesses left and several words that differ by a single letter, pick a guess that contains the differing letters rather than gambling on one of them.',
            ],
          },
          {
            heading: 'Wordle practice for beginners and kids',
            body: [
              'New players can use the practice game to learn how the tiles work without the pressure of a single daily attempt. There is no account to create and no personal information to enter, and the definition shown after each round makes it a gentle way for children and learners of English to build vocabulary with ordinary words.',
            ],
          },
        ],
      },
      {
        heading: 'Play Wordle practice with friends',
        body: [
          'This is a single-player game: there is no live multiplayer, shared room or account. Every round uses a different random word, so you and a friend will normally have different answers.',
          'To compare results, finish a round and choose Share Grid. It copies a grid of colored squares with your score out of six (or X for a loss) that you can paste into a message without revealing the answer. Then challenge each other to beat the same number of guesses.',
        ],
      },
      {
        heading: 'Wordle practice modes and difficulty',
        body: [
          'There is one mode: five letters, six guesses, and any word from the dictionary is accepted as a guess. There is no hard-mode switch, timer, custom difficulty or six-letter version.',
          'You can make your own hard mode: after every guess, use only words that keep each green letter in place and include each yellow letter. Practicing that discipline here prepares you for the Hard Mode setting in the official game.',
        ],
      },
      {
        heading: 'Why use a dedicated Wordle practice game',
        body: [
          'A good free practice game should offer unlimited rounds, accept only real words, show clear tile feedback, record your results and work without sign-up or installation. This game does all five, and adds a definition for every answer so you learn something even when you lose.',
        ],
      },
    ],
    faq: [
      {
        q: 'What is Wordle practice?',
        a: 'Wordle practice means playing extra Wordle-style rounds outside the daily puzzle so you can improve without waiting for the next day. Here every round uses a new random five-letter word and six guesses.',
      },
      {
        q: 'Is Wordle practice free, and do I need an app or account?',
        a: 'It is free, and there is no app to install and no account to create. The game runs in your web browser on desktop and mobile.',
      },
      {
        q: 'Is there an unlimited Wordle practice game?',
        a: 'Yes. This practice game is unlimited and free: press New Word for a fresh random five-letter word as often as you like, with no daily limit or account.',
      },
      {
        q: 'How many Wordle practice games can I play?',
        a: 'As many as you like. There is no daily limit; press New Word whenever you want another round.',
      },
      {
        q: 'Is this the official daily Wordle?',
        a: 'No. This is an independent practice game with its own word list. It is a way to warm up and test strategies without waiting for the next daily puzzle.',
      },
      {
        q: "What is today's Wordle answer, and can I get a hint?",
        a: 'This site does not publish the daily Wordle answer. Practice words are random and unrelated to the daily puzzle. If you need help with a daily puzzle, enter your clues into the Wordle Solver.',
      },
      {
        q: 'Can I play past or archived Wordle puzzles?',
        a: 'No. Practice words are random rather than taken from a calendar, so there is no archive of old puzzles. You get a different word every time you start a round.',
      },
      {
        q: 'Can I play Wordle with friends online?',
        a: 'Not in real time: the game is single-player. After a round you can copy a grid of colored squares with Share Grid and send it to a friend to compare scores.',
      },
      {
        q: 'How can I improve my Wordle skills?',
        a: 'Practice one starting word until you know how it performs, use your second guess to test five new letters, and review each lost round to see which guess could have narrowed the list further.',
      },
      {
        q: 'What are the best words to start Wordle with?',
        a: 'Words with common, different letters, such as CRANE, SLATE and ADIEU, are popular. The Best Wordle Starting Words page ranks them.',
      },
      {
        q: 'What are the five magic words for Wordle?',
        a: `There is no official set. A famous puzzle found five words that together use 25 different letters: FJORD, GUCKS, NYMPH, VIBEX and WALTZ. It is a curiosity rather than a strategy, because it spends five guesses on unlikely answers and leaves you only one try, and ${WP.notAccepted}. Adapting each guess to the clues works better.`,
      },
      {
        q: 'Is there a hard mode in this Wordle practice game?',
        a: 'There is no hard-mode switch, but you can play by its rules yourself by reusing every green and yellow letter you have found in each following guess.',
      },
      {
        q: 'Are practice words repeated?',
        a: 'Words are picked at random, so a repeat is possible but rare in a short session. Statistics only count completed games.',
      },
      {
        q: 'What is the best free Wordle game for practice?',
        a: 'Look for a game that is unlimited, checks guesses against a real word list, shows clear tile feedback, tracks your results and needs no sign-up. This practice game offers all of these and shows a definition for each answer.',
      },
    ],
  },

  '/letter-frequency/': {
    sections: [
      {
        heading: 'How to read the letter frequency charts',
        body: [
          `The 5-letter chart counts every occurrence of a letter across all ${LF.words} words, so a word such as ERASE adds two to the count for E. Tall bars mean a letter is a safe test: it turns tiles green or yellow often and removes many candidates. Short bars mean a letter is a poor early guess but may be a decisive late one. Vowel bars are amber and consonant bars are indigo.`,
          'The position heatmap goes one step further. Choose slot 1 to 5 and it shows the share of words that have each letter in that exact position, so the percentages in one slot add up to 100%. Some letters are common overall but concentrated in one place, which is why a letter can be a good guess in one slot and a wasted guess in another.',
        ],
      },
      {
        heading: 'Letter frequency in the English language',
        body: [
          `In ordinary English text the most frequent letters, from most to least common, are E, T, A, O, I, N, S, H, R and D. E alone accounts for roughly one letter in eight (${LF.enPct('E')}%), while Q, X, J and Z are each well under 1%. These are the widely cited figures from Robert Lewand's analysis of English prose, and they are the numbers in the English letter frequency chart above.`,
          `English letter frequency table, most to least common: ${LF.englishList}.`,
        ],
        subsections: [
          {
            heading: 'English letter frequency in order',
            body: [
              `From most to least common the full order is ${LF.englishOrder}. Linotype typesetting machines arranged their keys in roughly this order, which is where the phrase ETAOIN SHRDLU comes from.`,
            ],
          },
          {
            heading: 'Most common letter in the English language',
            body: [
              `E is the most common letter in English by a clear margin, ahead of T (${LF.enPct('T')}%) and A (${LF.enPct('A')}%). It appears in very common words such as the, be, he and were, and in endings such as -ed, -er and -es.`,
            ],
          },
          {
            heading: 'Rarest letter in English',
            body: [
              `Z is the least common letter in English text at about ${LF.enPct('Z')}% of letters, just behind Q (${LF.enPct('Q')}%). J and X are only slightly more common at ${LF.enPct('J')}% each. In five-letter words the rarest letters are different: ${LF.rarest}.`,
            ],
          },
        ],
      },
      {
        heading: 'Wordle letter frequency: letters in 5-letter words',
        body: [
          `The 5-letter statistics on this page are calculated from all ${LF.words} five-letter words in this site's dictionary, ${LF.totalLetters} letters in total. The ten most frequent letters are ${LF.top10}.`,
          `That ranking is not the same as ordinary English. S ranks ${LF.ord('S')} here but only 7th in running text, while T drops from 2nd in English to ${LF.ord('T')} and H from 8th to ${LF.ord('H')}. Running English is dominated by short function words such as the, of, to and that, which are not five-letter words, whereas five-letter words include a great many plurals and verb forms that end in S.`,
        ],
        subsections: [
          {
            heading: 'Wordle letter frequency by position',
            body: [
              `Position matters as much as the total count. Letter 1: ${LF.pos(0)}. Letter 2: ${LF.pos(1)}. Letter 3: ${LF.pos(2)}. Letter 4: ${LF.pos(3)}. Letter 5: ${LF.pos(4)}. Vowels dominate the middle of the word, while S, E and Y dominate the end. Use the slot buttons above to see all 26 letters for any position.`,
            ],
          },
          {
            heading: 'Most common letters in 5-letter words',
            body: [
              `Counting words rather than letters gives a different view: ${LF.wordShare}. These shares are much larger than the letter shares in the chart because they are out of words, not letters: each word adds five letters to the total but is counted only once for every letter it contains.`,
            ],
          },
          {
            heading: 'Least common letters in 5-letter words',
            body: [
              `${LF.rareDetail} Rare letters make poor opening guesses because so few words contain them, but they are often decisive late in a game, when one of them separates two remaining candidates.`,
            ],
          },
          {
            heading: 'Vowels and consonants in 5-letter words',
            body: [
              `Vowels (A, E, I, O, U) make up ${LF.vowelShare}% of all letters in five-letter words. ${LF.twoVowels}% of words contain exactly two vowels, ${LF.oneVowel}% contain exactly one and ${LF.threePlus}% contain three or more. Y is counted as a consonant in these figures, although it works as a vowel in words such as LYMPH and RHYME; it is the ${LF.ord('Y')} most common letter overall and is especially common as the last letter.`,
            ],
          },
        ],
      },
      {
        heading: 'How letter frequency is calculated',
        body: [
          'A letter frequency count is the number of times a letter appears in a text or a word list. Relative frequency divides that count by the total number of letters and is usually written as a percentage, so texts and word lists of different sizes can be compared fairly.',
        ],
        subsections: [
          {
            heading: 'Relative letter frequency formula',
            body: [
              `Relative frequency (%) = letter count ÷ total letters × 100. For example, E appears ${LF.eCount} times among the ${LF.totalLetters} letters in this dictionary, so its relative frequency is ${LF.ePct}%.`,
            ],
          },
          {
            heading: 'Frequency table and frequency distribution',
            body: [
              'A frequency table lists each letter from A to Z next to its count and percentage. Sorted from highest to lowest, the same data becomes a frequency distribution, which is what the bar charts on this page draw. The position heatmap is a second distribution that is calculated separately for each of the five slots.',
            ],
          },
        ],
      },
      {
        heading: 'Choosing a starting word from the data',
        body: [
          `A strong opener combines letters that score highly overall with letters that score highly in the slot where you place them, and avoids repeating a letter so that all five tiles give new information. The five most common letters in this dictionary are ${LF.top5}, so openers built from them test the largest share of the word list at once.`,
          `Vowel counts matter as well. ${LF.oneToThree}% of five-letter words have between one and three vowels, so an opener with two vowels is a reasonable balance between finding them and leaving room for consonants. Compare the heatmap with the list of best Wordle starting words to see why words such as CRANE and SLATE are so popular.`,
        ],
        links: [
          { label: 'Best Wordle starting words', path: '/best-wordle-starting-words/' },
          { label: 'Wordle Solver', path: '/wordle-solver/' },
          { label: 'All 5-letter words A-Z', path: '/5-letter-words-a-z/' },
        ],
      },
      {
        heading: 'Scrabble letter frequency and crossword strategy',
        body: [
          'Frequency also helps outside Wordle. Scrabble tile counts follow the same broad pattern as English, adjusted for playability: the English set has 100 tiles, with 12 Es, 9 As and Is, 8 Os, 6 each of N, R and T, and a single Q, J, X and Z. Knowing that E, A, R and S are common helps you judge which letters to keep on your rack, and knowing which letters are rare helps you spot high-value plays with Q, X and Z.',
        ],
      },
      {
        heading: 'Letter frequency analysis and ciphers',
        body: [
          'Letter frequency analysis is a codebreaking technique for simple substitution ciphers, including the Caesar cipher. The analyst counts how often each symbol appears in the ciphertext, matches the most common symbols to the most common letters of the language (E, T and A in English), then checks the guesses against common letter pairs such as TH, HE, IN, ER and AN. It works well on long messages and poorly on short ones, because a small sample does not follow the average.',
          'This page shows pre-computed statistics for English and for five-letter words. It does not analyze text that you paste in.',
        ],
      },
      {
        heading: 'Letter frequency in other languages',
        body: [
          'Every language has its own letter distribution, so English tables should not be used to analyze Spanish, French, German or Dutch text. E is the most frequent letter in all four, but the runner-up differs: A in Spanish, and N in German and Dutch. The statistics on this page are for English only.',
        ],
      },
    ],
    faq: [
      {
        q: 'What is letter frequency?',
        a: 'Letter frequency is how often each letter of the alphabet appears in a text or a word list, shown as a count or as a percentage of all letters. This page shows it for ordinary English and for five-letter words.',
      },
      {
        q: 'What is the most common letter in the English language?',
        a: `E is the most common letter in English, at about ${LF.enPct('E')}% of all letters, followed by T (${LF.enPct('T')}%) and A (${LF.enPct('A')}%).`,
      },
      {
        q: 'What is the most common letter in 5-letter words?',
        a: `In this dictionary E is the most common letter in five-letter words at ${LF.pct('E')}% of all letters, with S close behind at ${LF.pct('S')}%. E appears in ${LF.share('E')}% of the words and S in ${LF.share('S')}%.`,
      },
      {
        q: 'What is the order of letters by frequency in English?',
        a: `From most to least common: ${LF.englishOrder}.`,
      },
      {
        q: 'How often is each letter of the alphabet used?',
        a: `In English text the letters range from E at ${LF.enPct('E')}% down to Z at ${LF.enPct('Z')}%. The full table is in the English letter frequency chart on this page. In five-letter words the range is ${LF.pct('E')}% for E down to ${LF.pct('Q')}% for Q.`,
      },
      {
        q: 'What is the rarest letter in the alphabet?',
        a: `In English text Z is the rarest letter at about ${LF.enPct('Z')}%, just behind Q (${LF.enPct('Q')}%). In this dictionary of five-letter words the rarest is ${LF.rarestFirst}.`,
      },
      {
        q: 'Why is letter frequency in 5-letter words different from normal English?',
        a: `Running English text is dominated by short words such as the, of and that, which are not five letters long, while five-letter words contain many plurals and verb forms ending in S. As a result S ranks ${LF.ord('S')} in five-letter words but only 7th in English text, and ${LF.pct5('S')}% of five-letter words end in S.`,
      },
      {
        q: 'Which letters are most common in each position of a Wordle word?',
        a: `${LF.posShort}. The slot buttons on this page show all 26 letters for each position.`,
      },
      {
        q: 'What is a frequency count, and how is relative frequency calculated?',
        a: 'A frequency count is the number of times something occurs, here the number of times a letter appears. Relative frequency is that count divided by the total number of letters, multiplied by 100 to give a percentage.',
      },
      {
        q: 'How does letter frequency analysis break a cipher?',
        a: 'In a simple substitution cipher every letter is replaced by another symbol, but the pattern of frequencies survives. Counting the symbols in the ciphertext and matching the most common ones to E, T and A gives a starting point for decoding. It needs a reasonably long message to be reliable.',
      },
      {
        q: 'Can this page count the letters in my own text?',
        a: 'No. It shows pre-computed statistics for English and for the five-letter words in this dictionary, so it does not analyze pasted text.',
      },
      {
        q: 'Are the statistics based on Wordle answers only?',
        a: `No. The 5-letter statistics are calculated from the full dictionary of ${LF.words} five-letter words on this site, which is larger than the list of past Wordle answers.`,
      },
    ],
  },

  '/guides/': {
    sections: [
      {
        heading: 'Which guide should you read?',
        body: [
          'If you play Wordle every day, start with the strategy guide. It explains how to choose an opening word, how to use your second guess, how to avoid rhyme traps and when a solver is a sensible choice.',
          'If you play Scrabble or Words With Friends, read the five-letter words guide. It covers scoring, high-value letters, bonus squares and the short words that give the best return for the tiles they use.',
          'If you are trying to remember a word from a few letters, read the guide on finding a word from the letters you know. It walks through patterns, wildcards and elimination step by step.',
        ],
      },
      {
        heading: 'How the guides are written',
        body: [
          'Each guide is based on the word list and statistics used by the tools on this site, so advice such as which letters are most common is checked against real data. Every guide links to the tool that puts its advice into practice, and shows the date it was last reviewed.',
        ],
      },
    ],
  },
};
