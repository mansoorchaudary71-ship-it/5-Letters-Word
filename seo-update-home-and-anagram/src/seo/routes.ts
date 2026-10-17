// Single source of truth for every URL on the site: path, tab, filter and all SEO text.
// Pure TypeScript (no DOM / Vite APIs) so the build script and the React app can both import it.

import { ALL_WORDS } from '../data/words';
import { SITE_NAME } from './site';
import { TOOL_CONTENT } from './toolContent';
import { DEFINED_WORDS, clip, describeList, describeWord, hasWordPage, wordPath, wordsForFilter } from './content';
import { GUIDE_ROUTES, STATIC_ROUTES } from './pages';

export { SITE_NAME };
export type Tab = 'finder' | 'solver' | 'anagram' | 'browse' | 'game' | 'stats' | 'article' | 'word';
export interface Filter {
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  tag?: string;
}
export interface Faq {
  q: string;
  a: string;
}
export interface Link {
  label: string;
  path: string;
}
export interface Subsection {
  heading: string; // rendered as an <h3> under the section's <h2>
  body: string[];
}
export interface Section {
  heading: string;
  body?: string[];
  subsections?: Subsection[]; // H3 blocks, rendered after body and before links
  links?: Link[];
}
export type RouteKind = 'home' | 'tool' | 'list' | 'guide' | 'page' | 'word';
export interface RouteInfo {
  path: string; // always starts and ends with "/"
  tab: Tab;
  kind: RouteKind;
  filter: Filter;
  title: string; // keep <= 60 characters
  description: string; // keep <= 160 characters
  h1: string;
  about: string[]; // visible paragraphs rendered under the tool and in the prerendered HTML
  faq: Faq[];
  sections?: Section[]; // extra headed content blocks (guides, home page)
  related?: Link[]; // "related pages" links shown under the content
  crumbs?: Link[]; // breadcrumb trail between Home and this page
  wordSlug?: string; // for word pages
  published?: string; // YYYY-MM-DD, guides only
  updated?: string; // YYYY-MM-DD, policy pages only
}

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const MIN_WORDS = 10; // list pages with fewer words would be thin content, so they are not created at all

const TAB_PATHS: Record<Exclude<Tab, 'article' | 'word'>, string> = {
  finder: '/',
  solver: '/wordle-solver/',
  anagram: '/anagram-solver/',
  browse: '/5-letter-words-a-z/',
  game: '/wordle-practice/',
  stats: '/letter-frequency/',
};

const TAG_PATHS: Record<string, string> = {
  'wordle-top': '/best-wordle-starting-words/',
  palindrome: '/5-letter-palindromes/',
  'no-vowels': '/5-letter-words-with-no-vowels/',
  'double-letters': '/5-letter-words-with-double-letters/',
  'high-scoring': '/high-scoring-5-letter-scrabble-words/',
  'vowel-rich': '/5-letter-words-with-many-vowels/',
};

export const tabPath = (tab: Tab): string => (tab === 'article' || tab === 'word' ? '/' : TAB_PATHS[tab]);

/** Letter groups that get their own list page (only created when they hold at least MIN_WORDS words). */
export const PREFIXES = ['ST', 'CH', 'SH', 'TH', 'BR', 'TR', 'PR', 'CR', 'GR', 'FL', 'BL', 'CL'];
export const SUFFIXES = ['ER', 'ED', 'LY', 'ES', 'AL', 'ST', 'NT', 'NG', 'TH', 'CH'];

const startsPath = (v: string) => `/5-letter-words-starting-with-${v.toLowerCase()}/`;
const endsPath = (v: string) => `/5-letter-words-ending-with-${v.toLowerCase()}/`;
const containsPath = (v: string) => `/5-letter-words-containing-${v.toLowerCase()}/`;

const FAQ_FINDER: Faq[] = [
  {
    q: 'How do I find a 5 letter word when I only know some of the letters?',
    a: 'Type the letters you know into the pattern boxes, one per position, and leave the unknown positions empty. For example S _ _ R T returns SHORT, SMART and SPORT. If you know letters but not their positions, add them to the "must contain" box, or use the Anagram Solver when you hold all five letters.',
  },
  {
    q: 'What are some good 5 letter words for Wordle, and which one should I start with?',
    a: 'A strong first guess covers several of the most frequent letters in different positions. ADIEU tests four vowels at once, while AROSE, RAISE, STARE, SLATE and CRANE balance vowels with common consonants. After that, the Wordle Solver filters the full list from your green, yellow and grey tiles, and the Best Wordle Starting Words page compares the openers.',
  },
  {
    q: "What is today's 5 letter word?",
    a: 'This site does not publish daily puzzle answers. Instead, enter the clues from your own guesses into the Wordle Solver to see which words are still possible, or rehearse with the unlimited practice game so the daily puzzle stays a surprise.',
  },
  {
    q: 'How many possible Wordle words are there?',
    a: 'The original Wordle shipped with 2,315 possible answers and accepted roughly 13,000 five-letter words as valid guesses in total. The New York Times has edited both lists since, so exact figures change over time.',
  },
  {
    q: 'What 5 letter words start with A, or start with A and end with E?',
    a: 'Words starting with A include ABOUT, ACTOR, ADORE and AFTER. Words that start with A and end with E include ABOVE, ALONE, ARISE, AWAKE and AZURE. Put the letters in the first and last pattern boxes, or open the starting-with-A list for every match.',
  },
  {
    q: 'Which 5 letter word has the most vowels?',
    a: 'ADIEU, AUDIO, AERIE, EERIE and QUEUE each contain four vowels. No five-letter word in this dictionary contains all five vowels.',
  },
  {
    q: 'Is there a 5 letter word without vowels?',
    a: 'Yes, if Y does not count as a vowel. CRYPT, GLYPH, LYMPH, NYMPH, MYRRH, PSYCH and TRYST have no A, E, I, O or U. CRWTH is the rare exception that uses W instead of Y.',
  },
  {
    q: 'Which 5 letter word becomes shorter when you add two letters?',
    a: 'SHORT. Add the two letters ER and you get SHORTER, which is longer, so the riddle plays on the word "short". It is a classic riddle that plays on the word itself.',
  },
  {
    q: 'Is there a list of all 5 letter words?',
    a: 'Yes. The A-Z directory lists every word in the dictionary by first letter, and each starting-letter, ending-letter and containing-letter page lists its matching words with Scrabble scores.',
  },
  {
    q: 'What are some free 5 letter word games?',
    a: 'Wordle is the best known. On this site you can play unlimited free Wordle-style rounds in the practice game, use the Wordle Solver to check your logic, or unscramble tiles with the Anagram Solver for Scrabble-style play.',
  },
  {
    q: 'Are all of these words valid in Scrabble?',
    a: 'Every entry shows its Scrabble and Words With Friends tile score, but official dictionaries differ between tournaments and countries. Check your own rulebook before relying on a word in competition.',
  },
  {
    q: 'Do the words have definitions?',
    a: 'Familiar words have a written definition, part of speech and example sentence, and each of those words has its own page. Rarer game words are listed with their scores.',
  },
];

const TOOL_LINKS: Link[] = [
  { label: 'Word Finder', path: '/' },
  { label: 'Wordle Solver', path: '/wordle-solver/' },
  { label: 'Anagram Solver', path: '/anagram-solver/' },
  { label: 'A-Z Directory', path: '/5-letter-words-a-z/' },
];

const BASE_ROUTES: RouteInfo[] = [
  {
    path: '/',
    tab: 'finder',
    kind: 'home',
    filter: {},
    title: '5 Letter Words: Word Finder by Start, End & Letters',
    description:
      'Find any 5 letter word by starting letter, ending letter, letters it contains or vowels. Free word finder with Wordle solver, definitions and Scrabble scores.',
    h1: '5 Letter Words: Word Finder by Letters',
    about: [
      `Looking for a 5 letter word? This free finder searches ${ALL_WORDS.length.toLocaleString('en-US')} five-letter English words by starting letter, ending letter, letters the word contains, letters to leave out, vowel count or an exact pattern such as S _ _ R T. Familiar words come with a short definition, part of speech and Scrabble and Words With Friends score.`,
      'Whether you are stuck on a Wordle guess, unscrambling a Scrabble rack or filling a crossword, start with the finder below. The Wordle Solver, Anagram Solver and A-Z directory cover the other ways people search for 5 letter words.',
    ],
    sections: [
      {
        heading: 'How to find a 5 letter word from the letters you know',
        body: [
          'Start with whatever you are sure about. The finder updates as you type, so you can watch each clue narrow the list. Which boxes you use depends on what you know about the word.',
        ],
        subsections: [
          {
            heading: 'Search by exact pattern (letters in known positions)',
            body: [
              'Type each known letter into its own position box and leave the rest empty. S _ _ R T finds SHORT, SMART and SPORT. The same method answers questions such as "5 letter word with A in the middle" (put A in the third box: CRANE, PLANT, SHARK) or "second letter is A" (put it in the second box).',
            ],
          },
          {
            heading: 'Find words from a few starting or ending letters',
            body: [
              'Partial clues work too. Typing ELE as the start returns ELECT and ELEGY, RIT returns RITES, an ending of OPSE returns COPSE, an ending of ETA returns THETA and a USUR pattern returns USURP and USURY. Searches like these are common when you have a handful of letters from a crossword or a word puzzle.',
            ],
          },
          {
            heading: 'Unscramble letters you have (5 letter word unscrambler)',
            body: [
              'If you hold the letters but not their order, as in "what 5 letter word can I make with these letters", use the Anagram Solver. It accepts a question mark or asterisk as a blank tile and lists every five-letter word those tiles can form.',
            ],
          },
          {
            heading: 'Looking for a 5 letter word with a certain meaning?',
            body: [
              'For a clue such as a word meaning courage or happy, enter the letters you already have from crossing answers, then scan the results. Open any word with a definition to check its meaning, part of speech and example sentence before you commit to it.',
            ],
          },
        ],
        links: [{ label: 'Anagram Solver', path: '/anagram-solver/' }],
      },
      {
        heading: '5 letter words by starting letter',
        body: [
          '"Starts with", "begins with" and "starting with" all describe the same filter: put the first letter in the starting-letter box. Sorting by Scrabble score or commonness puts the most useful words first.',
        ],
        subsections: [
          {
            heading: '5 letter words starting with a single letter (A to Z)',
            body: [
              'Every letter has its own list page. S is the most common first letter in this dictionary, followed by C, P, T, F and B. Examples starting with A include ABOUT, ACTOR, ADORE and AFTER.',
            ],
          },
          {
            heading: '5 letter words starting with two letters (ST, CH, TR and more)',
            body: [
              'Opening letter pairs such as ST, CH, SH, TH, BR and TR are useful when you only remember how a word begins. STR also narrows quickly, returning STRAP, STRAW, STRAY, STRIP, STRUM and STRUT among others.',
            ],
          },
          {
            heading: '5 letter words that start with one letter and end with another',
            body: [
              'Fill the first and last boxes together. Starting with A and ending in E gives ABOVE, ALONE, ARISE, AWAKE and AZURE. Add a third known letter, such as A in the third position, and the list shrinks to about ten words.',
            ],
          },
        ],
      },
      {
        heading: '5 letter words by ending letter',
        body: [
          'Use the ending-letter box for "ends with", "ending in" and "ends in" searches. These are popular for crossword fill and for rhyming. S is by far the most common last letter in this dictionary because of plurals, followed by E, Y, D, R and T.',
        ],
        subsections: [
          {
            heading: '5 letter words ending in E, Y, T and other single letters',
            body: [
              'Every ending letter has a list page. Words ending in E include ABOVE, ALONE and ARISE, and words ending in Y include DRYLY, PROXY and PYGMY.',
            ],
          },
          {
            heading: '5 letter words ending in ER, ED, LY and other letter groups',
            body: [
              'Common suffixes such as ER, ED, LY, ES and ST have their own pages, and you can type any ending of up to five letters into the ending box to search your own.',
            ],
          },
        ],
      },
      {
        heading: '5 letter words containing specific letters',
        body: [
          'Letters in the "must contain" box can appear in any position, which matches the yellow tiles in Wordle. Letters in the exclude box must be absent, which matches grey tiles.',
        ],
        subsections: [
          {
            heading: '5 letter words with two or more known letters (A and E, R and E, A and O)',
            body: [
              'Enter both letters in the must-contain box. Containing A and O, for example, returns ABODE, ABORT, ABOUT, ACORN, ACTOR and many others. Add an excluded letter to remove the ones you have ruled out.',
            ],
          },
          {
            heading: '5 letter words without certain letters',
            body: [
              'Searches such as "5 letter word without A and E" are answered with the exclude box. List every letter that must not appear, and add a must-contain letter or two to keep the list short.',
            ],
          },
          {
            heading: '5 letter words with double letters',
            body: [
              'Words with a repeated letter, such as LLAMA, ABBEY or AGREE, are easy to overlook. The double-letters list gathers them in one place, and the Wordle strategy guide explains how repeated letters show up in your clues.',
            ],
          },
        ],
        links: [{ label: '5-letter words with double letters', path: '/5-letter-words-with-double-letters/' }],
      },
      {
        heading: '5 letter words by number of vowels',
        body: [
          'The vowel filter limits results by how many of A, E, I, O and U a word has, which is the quickest way to answer most "most vowels" and "no vowels" questions.',
        ],
        subsections: [
          {
            heading: '5 letter words with the most vowels',
            body: [
              'ADIEU, AUDIO, AERIE, EERIE and QUEUE each have four vowels. No five-letter word in this dictionary has all five, so four is the maximum. These are popular Wordle openers because they test several vowels at once.',
            ],
          },
          {
            heading: '5 letter words with no vowels',
            body: [
              'When Y acts as the vowel, words such as CRYPT, GLYPH, LYMPH, NYMPH, MYRRH, PSYCH and TRYST contain none of A, E, I, O or U. CRWTH is rarer still and uses W. Words where Y is the only vowel are also handy when you need a vowel-light guess.',
            ],
          },
        ],
        links: [
          { label: '5-letter words with no vowels', path: '/5-letter-words-with-no-vowels/' },
          { label: '5-letter words with many vowels', path: '/5-letter-words-with-many-vowels/' },
        ],
      },
      {
        heading: '5 letter words for Wordle',
        body: [
          'Wordle is the main reason people search for 5 letter words today, and this finder is built to work alongside it.',
        ],
        subsections: [
          {
            heading: 'Best 5 letter words to start Wordle',
            body: [
              'A good opener uses common letters in different positions. AROSE, RAISE, STARE, SLATE and CRANE are widely used, and ADIEU tests four vowels in a single guess. The starting words page ranks them, and the letter frequency chart shows why they work.',
            ],
          },
          {
            heading: 'How many Wordle words are there?',
            body: [
              'The original game used 2,315 possible answers and accepted about 13,000 words as valid guesses. The New York Times has edited both lists since, so treat those as approximate. Not every valid guess can be an answer, which is why a solver ranks common words first.',
            ],
          },
          {
            heading: "Today's Wordle word",
            body: [
              'This site does not publish daily answers, so the puzzle is still yours to solve. Enter your green, yellow and grey clues into the Wordle Solver to see what remains possible, or practise in the free unlimited game.',
            ],
          },
        ],
        links: [
          { label: 'Best Wordle starting words', path: '/best-wordle-starting-words/' },
          { label: 'Wordle Solver', path: '/wordle-solver/' },
          { label: 'Wordle practice game', path: '/wordle-practice/' },
        ],
      },
      {
        heading: '5 letter word finder, solver or unscrambler: which one do you need?',
        body: [
          'The three tools answer different questions. The word finder filters the whole list by position, start, end, contained letters and vowels, and is the right choice when you know some of the word. The Wordle Solver takes your guesses and tile colours and returns the words still possible. The Anagram Solver takes letters in any order, with blanks, and returns every word they can make.',
          'For browsing instead of searching, the A-Z directory is a full list of 5 letter words by first letter, and the high-scoring Scrabble words page ranks them by tile score.',
        ],
      },
      {
        heading: 'Why five-letter words matter',
        body: [
          'Five letters is the length of Wordle and its many spin-offs, and one of the most useful lengths in Scrabble because such words reach bonus squares without needing a perfect rack. They are also common in crosswords and vocabulary exercises, which is why a dedicated reference helps.',
        ],
      },
      {
        heading: 'Popular word lists',
        links: [
          { label: 'Best Wordle starting words', path: '/best-wordle-starting-words/' },
          { label: '5-letter words with double letters', path: '/5-letter-words-with-double-letters/' },
          { label: 'High-scoring Scrabble words', path: '/high-scoring-5-letter-scrabble-words/' },
          { label: '5-letter palindromes', path: '/5-letter-palindromes/' },
          { label: '5-letter words with no vowels', path: '/5-letter-words-with-no-vowels/' },
          { label: '5-letter words with many vowels', path: '/5-letter-words-with-many-vowels/' },
        ],
      },
      {
        heading: 'Learn more',
        links: [
          { label: 'Wordle strategy guide', path: '/guides/wordle-strategy/' },
          { label: 'Scrabble five-letter words guide', path: '/guides/scrabble-five-letter-words/' },
          { label: 'How to find a word from the letters you know', path: '/guides/find-a-word-from-letters/' },
        ],
      },
    ],
    faq: FAQ_FINDER,
  },
  {
    path: TAB_PATHS.solver,
    tab: 'solver',
    kind: 'tool',
    filter: {},
    title: 'Wordle Solver: Find Possible Answers From Your Clues',
    description:
      'Enter your green, yellow and grey Wordle letters and see every remaining 5-letter answer, ranked by how likely it is. Free Wordle solver and helper.',
    h1: 'Wordle Solver & Helper',
    about: [
      'The Wordle Solver filters the word list using the feedback from your guesses. Mark each letter green when it is in the right place, yellow when it is in the word but in a different place, and grey when it is not in the word. The remaining candidates update instantly.',
      'Tip: a good second guess uses common letters you have not tested yet, even if the word cannot be the answer. That removes the most possibilities for the next round.',
    ],
    sections: [
      {
        heading: 'Related Wordle resources',
        links: [
          { label: 'Wordle strategy guide', path: '/guides/wordle-strategy/' },
          { label: 'Best Wordle starting words', path: '/best-wordle-starting-words/' },
          { label: 'Wordle practice game', path: '/wordle-practice/' },
          { label: 'Letter frequency heatmap', path: '/letter-frequency/' },
        ],
      },
    ],
    faq: [
      {
        q: 'How does the Wordle solver work?',
        a: 'It removes every word that conflicts with your clues: green letters must match their position, yellow letters must appear elsewhere in the word, and grey letters must not appear.',
      },
      {
        q: 'What are the best Wordle starting words?',
        a: 'Words that combine common letters such as A, E, R, S, T, O and L work well, for example CRANE, SLATE, ADIEU and AUDIO. Open the Best Wordle Starting Words list to see more.',
      },
    ],
  },
  {
    path: TAB_PATHS.anagram,
    tab: 'anagram',
    kind: 'tool',
    filter: {},
    title: 'Anagram Solver: Unscramble Letters Into 5 Letter Words',
    description:
      'Free anagram solver for 5 letter words. Unscramble letters with blanks and wildcards for Scrabble, Words With Friends, Wordle and crosswords. No download.',
    h1: 'Anagram Solver & Word Unscrambler for 5 Letter Words',
    about: [
      'This free anagram solver rearranges the letters you type into valid five-letter English words. Enter exactly five letters for exact anagrams, add a question mark or asterisk for a blank tile, or enter a longer Scrabble rack to see every five-letter word it can make. Each result shows its definition and Scrabble score.',
      'It is built for five-letter words only. That makes it fast and accurate for Scrabble and Words With Friends racks, Wordle checks, jumbled-word puzzles and crossword fill, but it does not solve multi-word phrases or names. The sections below explain exactly what it can and cannot do.',
    ],
    sections: [
      {
        heading: 'Related tools',
        links: [
          { label: 'Word Finder', path: '/' },
          { label: 'Wordle Solver', path: '/wordle-solver/' },
          { label: 'Scrabble five-letter words guide', path: '/guides/scrabble-five-letter-words/' },
          { label: 'High-scoring Scrabble words', path: '/high-scoring-5-letter-scrabble-words/' },
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
        q: 'Can an anagram solver repeat letters or use a letter more than once?',
        a: 'Each letter you type is used once, so a word with two Es needs two Es in your rack. To allow an extra copy of a letter, add a blank. For example SPED plus a blank returns SPEED, DEEPS and SPEND among others.',
      },
      {
        q: 'Can I enter more than five letters?',
        a: 'Yes. Enter a longer rack, such as seven Scrabble tiles, and the solver lists every five-letter word that can be made from any five of those letters. STONEAR, for example, returns AROSE, ARSON, ASTER, ATONE and NOTES.',
      },
      {
        q: 'Does it solve two-word anagrams, phrases, names or sentences?',
        a: 'No. This solver returns single five-letter words only. For a phrase, a name or a celebrity anagram, split the letters into groups and solve each five-letter chunk, then combine the results by hand.',
      },
      {
        q: 'Is there an anagram solver for Scrabble and Words With Friends?',
        a: 'Yes. Results are sorted by Scrabble tile score and open to the Scrabble and Words With Friends values. Check your own game dictionary before playing a word, since official lists differ.',
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
  {
    path: TAB_PATHS.browse,
    tab: 'browse',
    kind: 'tool',
    filter: {},
    title: '5-Letter Words A-Z: Browse the Full Directory',
    description:
      'Browse 5-letter words from A to Z by starting or ending letter, plus curated lists such as palindromes, double letters and high-scoring Scrabble words.',
    h1: '5-Letter Words A-Z Directory',
    about: [
      'Pick a letter to see every five-letter word that starts or ends with it, or open one of the curated collections such as palindromes, words with double letters and high-scoring Scrabble words.',
    ],
    faq: [],
  },
  {
    path: TAB_PATHS.game,
    tab: 'game',
    kind: 'tool',
    filter: {},
    title: 'Wordle Practice: Play Unlimited 5-Letter Word Games',
    description:
      'Practise Wordle with unlimited random 5-letter words. Free word game with green, yellow and grey feedback and no sign-up.',
    h1: 'Wordle Practice: Unlimited 5-Letter Word Game',
    about: [
      'Guess the hidden five-letter word in six tries. After each guess the tiles turn green, yellow or grey to show how close you are. Play as many rounds as you like to build your Wordle strategy.',
    ],
    sections: [
      {
        heading: 'Improve your game',
        links: [
          { label: 'Wordle strategy guide', path: '/guides/wordle-strategy/' },
          { label: 'Best Wordle starting words', path: '/best-wordle-starting-words/' },
          { label: 'Wordle Solver', path: '/wordle-solver/' },
        ],
      },
    ],
    faq: [
      {
        q: 'Is this the official daily Wordle?',
        a: 'No. This is an independent practice game with its own word list. It is a way to warm up and test strategies without waiting for the next daily puzzle.',
      },
    ],
  },
  {
    path: TAB_PATHS.stats,
    tab: 'stats',
    kind: 'tool',
    filter: {},
    title: '5-Letter Word Letter Frequency Chart & Heatmap',
    description:
      'See which letters are most common in 5-letter words and in each position. Letter frequency heatmap to choose better Wordle guesses.',
    h1: 'Letter Frequency in 5-Letter Words',
    about: [
      'These charts show how often each letter appears in five-letter words and how often it appears in each of the five positions. Use them to pick starting words that test the most likely letters.',
    ],
    sections: [
      {
        heading: 'Put the statistics to work',
        links: [
          { label: 'Best Wordle starting words', path: '/best-wordle-starting-words/' },
          { label: 'Wordle strategy guide', path: '/guides/wordle-strategy/' },
        ],
      },
    ],
    faq: [],
  },
];

interface TagDef {
  tag: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  subject: string;
}

const TAG_DEFS: TagDef[] = [
  {
    tag: 'wordle-top',
    title: 'Best Wordle Starting Words: Top 5-Letter Openers',
    description: 'The best Wordle starting words, built from the most common letters, with definitions and Scrabble scores.',
    h1: 'Best Wordle Starting Words',
    intro: 'A strong opening guess tests common letters and vowels in positions where they often appear. The words below are popular starters chosen for that reason. Pick one and use it consistently so you learn how it performs.',
    subject: 'are popular Wordle opening words',
  },
  {
    tag: 'palindrome',
    title: '5-Letter Palindromes: Words That Read the Same Backwards',
    description: 'A list of 5-letter palindromes, words that read the same forwards and backwards, with definitions.',
    h1: '5-Letter Palindromes',
    intro: 'A palindrome reads the same forwards and backwards, like LEVEL or RADAR. Here are the five-letter palindromes in the dictionary.',
    subject: 'are palindromes',
  },
  {
    tag: 'no-vowels',
    title: '5-Letter Words With No Vowels (A, E, I, O, U)',
    description: 'Five-letter words without the vowels A, E, I, O or U, useful for tricky Wordle and Scrabble situations.',
    h1: '5-Letter Words With No Vowels',
    intro: 'These words contain none of the letters A, E, I, O or U. They usually rely on Y, so they are worth remembering when a Wordle board has no vowel left.',
    subject: 'contain no vowels',
  },
  {
    tag: 'double-letters',
    title: '5-Letter Words With Double Letters',
    description: 'Five-letter words that contain a repeated letter, such as SPEED or HAPPY, for Wordle and Scrabble.',
    h1: '5-Letter Words With Double Letters',
    intro: 'Words with a repeated letter are easy to forget in Wordle. This list shows five-letter words in which two identical letters sit side by side.',
    subject: 'contain a double letter',
  },
  {
    tag: 'high-scoring',
    title: 'High-Scoring 5-Letter Scrabble Words',
    description: 'High-value 5-letter Scrabble words using J, Q, X, Z and K, with tile scores.',
    h1: 'High-Scoring 5-Letter Scrabble Words',
    intro: 'Words that use high-value tiles such as J, Q, X, Z and K score the most. Tile scores are shown for Scrabble and Words With Friends.',
    subject: 'score 15 or more points in Scrabble',
  },
  {
    tag: 'vowel-rich',
    title: '5-Letter Words With Many Vowels',
    description: 'Five-letter words containing three or more vowels, ideal for finding vowels quickly in Wordle.',
    h1: '5-Letter Words With Many Vowels',
    intro: 'Vowel-heavy words such as AUDIO and ADIEU help you test several vowels in one guess.',
    subject: 'contain three or more vowels',
  },
];

function listRoute(
  path: string,
  filter: Filter,
  title: string,
  descLead: string,
  h1: string,
  intro: string[],
  subject: string,
  focus: { kind: 'start' | 'end' | 'contains'; value: string } | undefined,
  related: Link[],
  extraSections: Section[] = [],
): RouteInfo | null {
  const words = wordsForFilter(filter);
  if (words.length < MIN_WORDS) return null;
  const copy = describeList(words, subject, focus);
  return {
    path,
    tab: 'finder',
    kind: 'list',
    filter,
    title,
    description: clip(`${descLead} ${words.length.toLocaleString('en-US')} words with Scrabble scores, plus definitions for the familiar ones. Free list for Wordle and Scrabble.`, 160),
    h1,
    about: [...intro, ...copy.about],
    faq: copy.faq,
    crumbs: [{ label: '5-Letter Words A-Z', path: TAB_PATHS.browse }],
    related,
    sections: extraSections,
  };
}

function listRoutes(): RouteInfo[] {
  const out: RouteInfo[] = [];
  const push = (r: RouteInfo | null) => {
    if (r) out.push(r);
  };

  for (const t of TAG_DEFS) {
    const words = wordsForFilter({ tag: t.tag });
    if (words.length < MIN_WORDS && t.tag !== 'palindrome' && t.tag !== 'wordle-top') continue;
    const copy = describeList(words, t.subject);
    out.push({
      path: TAG_PATHS[t.tag],
      tab: 'finder',
      kind: 'list',
      filter: { tag: t.tag },
      title: t.title,
      description: t.description,
      h1: t.h1,
      about: [t.intro, ...copy.about],
      faq: copy.faq,
      crumbs: [{ label: '5-Letter Words A-Z', path: TAB_PATHS.browse }],
      related: [
        ...TOOL_LINKS,
        { label: 'Wordle strategy guide', path: '/guides/wordle-strategy/' },
        ...Object.entries(TAG_PATHS)
          .filter(([k]) => k !== t.tag)
          .slice(0, 4)
          .map(([k, p]) => ({ label: TAG_DEFS.find((d) => d.tag === k)!.h1, path: p })),
      ],
    });
  }

  const startsHub = (L: string) => ({ kind: 'start' as const, value: L });
  for (const L of LETTERS) {
    const l = L.toLowerCase();
    const near = [LETTERS[(LETTERS.indexOf(L) + 25) % 26], LETTERS[(LETTERS.indexOf(L) + 1) % 26]];
    push(
      listRoute(
        startsPath(L),
        { startsWith: L },
        `5-Letter Words Starting With ${L}: Full List & Scores`,
        `Every 5-letter word that starts with ${L}:`,
        `5-Letter Words Starting With ${L}`,
        [`Below are five-letter words that begin with the letter ${L}. Select a word to see its definition, Scrabble score and anagrams, or use the Word Finder filters to combine this starting letter with other letters.`],
        `start with ${L}`,
        startsHub(L),
        [
          { label: `5-letter words ending with ${L}`, path: endsPath(L) },
          { label: `5-letter words containing ${L}`, path: containsPath(L) },
          ...near.map((n) => ({ label: `5-letter words starting with ${n}`, path: startsPath(n) })),
          ...TOOL_LINKS,
        ],
      ),
    );
    push(
      listRoute(
        endsPath(L),
        { endsWith: L },
        `5-Letter Words Ending in ${L}: Full List & Scores`,
        `Every 5-letter word that ends in ${L}:`,
        `5-Letter Words Ending in ${L}`,
        [`Below are five-letter words that end with the letter ${L}. Select a word to see its definition, Scrabble score and anagrams, or use the Word Finder filters to combine this ending with other letters.`],
        `end in ${L}`,
        { kind: 'end', value: L },
        [
          { label: `5-letter words starting with ${L}`, path: startsPath(L) },
          { label: `5-letter words containing ${L}`, path: containsPath(L) },
          ...near.map((n) => ({ label: `5-letter words ending with ${n}`, path: endsPath(n) })),
          ...TOOL_LINKS,
        ],
      ),
    );
    push(
      listRoute(
        containsPath(L),
        { contains: L },
        `5-Letter Words Containing ${L}: List & Scores`,
        `Every 5-letter word with the letter ${L} in it:`,
        `5-Letter Words Containing ${L}`,
        [`These five-letter words all contain the letter ${L}, whether it is the first letter, the last or somewhere in the middle. It is the quickest way to find candidates when ${L} is a yellow tile in Wordle.`],
        `contain ${L}`,
        { kind: 'contains', value: L },
        [
          { label: `5-letter words starting with ${L}`, path: startsPath(L) },
          { label: `5-letter words ending with ${L}`, path: endsPath(L) },
          ...near.map((n) => ({ label: `5-letter words containing ${n}`, path: containsPath(n) })),
          ...TOOL_LINKS,
        ],
      ),
    );
  }

  for (const P of PREFIXES) {
    push(
      listRoute(
        startsPath(P),
        { startsWith: P },
        `5-Letter Words Starting With ${P}: Full List`,
        `Every 5-letter word that starts with ${P}:`,
        `5-Letter Words Starting With ${P}`,
        [`These five-letter words begin with the letter pair ${P}. Common letter pairs are useful in Wordle because they narrow the board quickly once the first two tiles are green.`],
        `start with ${P}`,
        { kind: 'start', value: P },
        [{ label: `5-letter words starting with ${P[0]}`, path: startsPath(P[0]) }, ...TOOL_LINKS],
      ),
    );
  }
  for (const S of SUFFIXES) {
    push(
      listRoute(
        endsPath(S),
        { endsWith: S },
        `5-Letter Words Ending in ${S}: Full List`,
        `Every 5-letter word that ends in ${S}:`,
        `5-Letter Words Ending in ${S}`,
        [`These five-letter words end with ${S}. Endings such as ${S} are worth testing early in Wordle because they reveal the last two tiles in a single guess.`],
        `end in ${S}`,
        { kind: 'end', value: S },
        [{ label: `5-letter words ending with ${S[S.length - 1]}`, path: endsPath(S[S.length - 1]) }, ...TOOL_LINKS],
      ),
    );
  }
  return out;
}

const LIST_ROUTES = listRoutes();
const KNOWN_LIST_PATHS = new Set(LIST_ROUTES.map((r) => r.path));
const startPageExists = (L: string) => KNOWN_LIST_PATHS.has(startsPath(L));

/** URL for a finder filter, or null when the filter has no dedicated page. */
export function filterPath(filter: Filter): string | null {
  const keys = (Object.keys(filter) as Array<keyof Filter>).filter((k) => filter[k]);
  if (keys.length === 0) return '/';
  if (keys.length > 1) return null;
  let candidate: string | null = null;
  if (filter.startsWith && /^[a-z]{1,2}$/i.test(filter.startsWith)) candidate = startsPath(filter.startsWith);
  else if (filter.endsWith && /^[a-z]{1,2}$/i.test(filter.endsWith)) candidate = endsPath(filter.endsWith);
  else if (filter.contains && /^[a-z]$/i.test(filter.contains)) candidate = containsPath(filter.contains);
  else if (filter.tag && TAG_PATHS[filter.tag]) candidate = TAG_PATHS[filter.tag];
  return candidate && KNOWN_LIST_PATHS.has(candidate) ? candidate : null;
}

// ---- Assemble -------------------------------------------------------------------------------

const withSitemapPage = (routes: RouteInfo[]): RouteInfo => ({
  path: '/sitemap/',
  tab: 'article',
  kind: 'page',
  filter: {},
  title: `Sitemap: All Pages on ${SITE_NAME}`,
  description: 'A complete list of every tool, word list, guide and information page on the 5-letter word finder.',
  h1: 'Sitemap',
  about: ['Every page on the site, grouped by type.'],
  faq: [],
  sections: [
    { heading: 'Tools', links: routes.filter((r) => r.kind === 'tool' || r.kind === 'home').map((r) => ({ label: r.h1, path: r.path })) },
    { heading: 'Guides', links: routes.filter((r) => r.kind === 'guide').map((r) => ({ label: r.h1, path: r.path })) },
    { heading: 'Curated word lists', links: routes.filter((r) => r.kind === 'list' && Object.values(TAG_PATHS).includes(r.path)).map((r) => ({ label: r.h1, path: r.path })) },
    { heading: 'Words by starting letter', links: routes.filter((r) => r.path.includes('-starting-with-')).map((r) => ({ label: r.h1, path: r.path })) },
    { heading: 'Words by ending letter', links: routes.filter((r) => r.path.includes('-ending-with-')).map((r) => ({ label: r.h1, path: r.path })) },
    { heading: 'Words containing a letter', links: routes.filter((r) => r.path.includes('-containing-')).map((r) => ({ label: r.h1, path: r.path })) },
    { heading: 'About the site', links: routes.filter((r) => r.kind === 'page').map((r) => ({ label: r.h1, path: r.path })) },
  ].filter((s) => s.links.length > 0),
});

// Hub links: give the home page and the A-Z directory a crawlable link to every list page that exists.
const hubLinks = (make: (v: string) => string, values: string[], label: (v: string) => string): Link[] =>
  values.filter((v) => KNOWN_LIST_PATHS.has(make(v))).map((v) => ({ label: label(v), path: make(v) }));
const START_LINKS = hubLinks(startsPath, LETTERS, (v) => v);
const END_LINKS = hubLinks(endsPath, LETTERS, (v) => v);
const CONTAINS_LINKS = hubLinks(containsPath, LETTERS, (v) => v);
const PREFIX_LINKS = hubLinks(startsPath, PREFIXES, (v) => v);
const SUFFIX_LINKS = hubLinks(endsPath, SUFFIXES, (v) => v);
const HUB_SECTIONS: Section[] = [
  { heading: '5-letter words by starting letter', links: START_LINKS },
  { heading: '5-letter words by ending letter', links: END_LINKS },
  { heading: '5-letter words containing a letter', links: CONTAINS_LINKS },
  { heading: 'Common starting letter pairs', links: PREFIX_LINKS },
  { heading: 'Common endings', links: SUFFIX_LINKS },
];
// Home hub: attach the crawlable A-Z, ending-letter and containing-letter link sets to the matching home sections
// (instead of adding duplicate H2s), so every list page is one click from the home page.
const attachHubLinks = (heading: string, links: Link[]) => {
  const sec = BASE_ROUTES[0].sections!.find((x) => x.heading === heading);
  if (sec) sec.links = [...(sec.links ?? []), ...links];
};
attachHubLinks('5 letter words by starting letter', [...START_LINKS, ...PREFIX_LINKS]);
attachHubLinks('5 letter words by ending letter', [...END_LINKS, ...SUFFIX_LINKS]);
attachHubLinks('5 letter words containing specific letters', CONTAINS_LINKS);
BASE_ROUTES.find((r) => r.path === TAB_PATHS.browse)!.sections = HUB_SECTIONS;

const CORE_ROUTES = [...BASE_ROUTES, ...GUIDE_ROUTES, ...LIST_ROUTES, ...STATIC_ROUTES];

// Page-specific copy for the tool pages (src/seo/toolContent.ts). Body sections go before the link-only sections.
for (const r of CORE_ROUTES) {
  const extra = TOOL_CONTENT[r.path];
  if (!extra) continue;
  r.sections = [...(extra.sections ?? []), ...(r.sections ?? [])];
  r.faq = [...r.faq, ...(extra.faq ?? [])];
}

// Neighbour links ("words starting with the next letter") are built before we know which list pages exist, so drop any that do not.
const EXISTING_PATHS = new Set([...CORE_ROUTES.map((r) => r.path), '/sitemap/']);
for (const r of CORE_ROUTES) {
  if (r.related) r.related = r.related.filter((l) => EXISTING_PATHS.has(l.path));
}
export const ALL_ROUTES: RouteInfo[] = [...CORE_ROUTES, withSitemapPage(CORE_ROUTES)];
export const HOME_ROUTE: RouteInfo = ALL_ROUTES[0];

/** Word pages are created on demand (about 500 of them), so they are not part of ALL_ROUTES. */
export function buildWordRoute(word: string): RouteInfo | null {
  const entry = DEFINED_WORDS.find((w) => w.word === word.toUpperCase());
  if (!entry) return null;
  const c = describeWord(entry, startPageExists);
  return {
    path: wordPath(entry.word),
    tab: 'word',
    kind: 'word',
    filter: {},
    title: c.title,
    description: clip(c.description, 160),
    h1: c.h1,
    about: c.about,
    faq: c.faq,
    related: c.related,
    crumbs: c.crumbs,
    wordSlug: entry.word,
  };
}
export const wordRoutes = (): RouteInfo[] => DEFINED_WORDS.map((w) => buildWordRoute(w.word)!).filter(Boolean);

const ROUTE_BY_PATH = new Map(ALL_ROUTES.map((r) => [r.path, r]));

/** Match a browser pathname (including the deploy base path) to a route, or null when unknown. */
export function resolveRoute(pathname: string, base = '/'): RouteInfo | null {
  const cleanBase = base.replace(/\/$/, '');
  let p = pathname.startsWith(cleanBase) ? pathname.slice(cleanBase.length) : pathname;
  p = p.toLowerCase();
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  const known = ROUTE_BY_PATH.get(p);
  if (known) return known;
  const m = /^\/word\/([a-z]{5})\/$/.exec(p);
  return m && hasWordPage(m[1]) ? buildWordRoute(m[1]) : null;
}

export const totalWordCount = ALL_WORDS.length;
