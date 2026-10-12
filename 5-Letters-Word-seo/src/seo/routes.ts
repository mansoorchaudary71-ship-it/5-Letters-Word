// Single source of truth for every URL on the site: path, tab, filter and all SEO text.
// Pure TypeScript (no DOM / Vite APIs) so the build script and the React app can both import it.

export type Tab = 'finder' | 'solver' | 'anagram' | 'browse' | 'game' | 'stats';
export interface Filter {
  startsWith?: string;
  endsWith?: string;
  tag?: string;
}
export interface Faq {
  q: string;
  a: string;
}
export interface RouteInfo {
  path: string; // always starts and ends with "/"
  tab: Tab;
  filter: Filter;
  title: string; // keep <= 60 characters
  description: string; // keep <= 160 characters
  h1: string;
  about: string[]; // visible paragraphs rendered under the tool and in the prerendered HTML
  faq: Faq[];
}

export const SITE_NAME = '5-Letter Words';
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const TAB_PATHS: Record<Tab, string> = {
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

export const tabPath = (tab: Tab): string => TAB_PATHS[tab];

/** URL for a finder filter, or null when the filter has no dedicated page. */
export function filterPath(filter: Filter): string | null {
  const keys = Object.keys(filter).filter((k) => (filter as Record<string, string | undefined>)[k]);
  if (keys.length === 0) return '/';
  if (keys.length > 1) return null;
  if (filter.startsWith && /^[a-z]$/i.test(filter.startsWith)) return `/5-letter-words-starting-with-${filter.startsWith.toLowerCase()}/`;
  if (filter.endsWith && /^[a-z]$/i.test(filter.endsWith)) return `/5-letter-words-ending-with-${filter.endsWith.toLowerCase()}/`;
  if (filter.tag && TAG_PATHS[filter.tag]) return TAG_PATHS[filter.tag];
  return null;
}

const FAQ_FINDER: Faq[] = [
  {
    q: 'How do I find a 5-letter word when I only know some letters?',
    a: 'Type the letters you know into the pattern box and use an underscore or dot for each unknown letter. For example S__RT finds words such as SHORT, SMART and SPORT. Add letters that must be included or excluded to narrow the list further.',
  },
  {
    q: 'Can I use this site to help solve Wordle?',
    a: 'Yes. Use the Wordle Solver to enter your green, yellow and grey letters after each guess and get the remaining possible answers, or use the Word Finder to browse words by starting letter, ending letter or pattern.',
  },
  {
    q: 'Are all of these words valid in Scrabble?',
    a: 'The list is built for word games and every entry shows its Scrabble and Words With Friends tile score. Official dictionaries differ between tournaments and countries, so check your own rulebook before relying on a word in competition.',
  },
];

const BASE_ROUTES: RouteInfo[] = [
  {
    path: '/',
    tab: 'finder',
    filter: {},
    title: '5-Letter Words: Word Finder, Wordle Solver & Scrabble Helper',
    description:
      'Find 5-letter words by starting letter, ending letter, pattern or included letters. Free Wordle solver, anagram unscrambler, definitions and Scrabble scores.',
    h1: '5-Letter Word Finder',
    about: [
      'This free 5-letter word finder helps you search a dictionary of five-letter English words by starting letter, ending letter, a letter pattern such as S__RT, letters that must appear, and letters to leave out. Every word comes with a short definition, its part of speech and its Scrabble and Words With Friends score.',
      'Stuck on a puzzle? Use the Wordle Solver to narrow down answers from your clues, the Anagram Solver to unscramble five letters, or browse the A-Z directory to explore words by letter.',
    ],
    faq: FAQ_FINDER,
  },
  {
    path: TAB_PATHS.solver,
    tab: 'solver',
    filter: {},
    title: 'Wordle Solver: Find Possible Answers From Your Clues',
    description:
      'Enter your green, yellow and grey Wordle letters and see every remaining 5-letter answer, ranked by how likely it is. Free Wordle solver and helper.',
    h1: 'Wordle Solver',
    about: [
      'The Wordle Solver filters the word list using the feedback from your guesses. Mark each letter green when it is in the right place, yellow when it is in the word but in a different place, and grey when it is not in the word. The remaining candidates update instantly.',
      'Tip: a good second guess uses common letters you have not tested yet, even if the word cannot be the answer. That removes the most possibilities for the next round.',
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
    filter: {},
    title: '5-Letter Anagram Solver: Unscramble Letters Into Words',
    description:
      'Unscramble any five letters into valid 5-letter words. Free anagram solver for Scrabble, Wordle and word puzzles with definitions and scores.',
    h1: '5-Letter Anagram Solver',
    about: [
      'Type up to five letters and the anagram solver lists every five-letter word that can be made from them. It is useful for Scrabble racks, jumbled-word puzzles and checking whether your Wordle guess has other possible arrangements.',
    ],
    faq: [
      {
        q: 'What is an anagram?',
        a: 'An anagram is a word made by rearranging the letters of another word, for example STONE, NOTES and ONSET all use the same five letters.',
      },
    ],
  },
  {
    path: TAB_PATHS.browse,
    tab: 'browse',
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
    filter: {},
    title: 'Wordle Practice: Play Unlimited 5-Letter Word Games',
    description:
      'Practise Wordle with unlimited random 5-letter words. Free word game with green, yellow and grey feedback and no sign-up.',
    h1: 'Wordle Practice Game',
    about: [
      'Guess the hidden five-letter word in six tries. After each guess the tiles turn green, yellow or grey to show how close you are. Play as many rounds as you like to build your Wordle strategy.',
    ],
    faq: [],
  },
  {
    path: TAB_PATHS.stats,
    tab: 'stats',
    filter: {},
    title: '5-Letter Word Letter Frequency Chart & Heatmap',
    description:
      'See which letters are most common in 5-letter words and in each position. Letter frequency heatmap to choose better Wordle guesses.',
    h1: 'Letter Frequency in 5-Letter Words',
    about: [
      'These charts show how often each letter appears in five-letter words and how often it appears in each of the five positions. Use them to pick starting words that test the most likely letters.',
    ],
    faq: [],
  },
  {
    path: TAG_PATHS['wordle-top'],
    tab: 'finder',
    filter: { tag: 'wordle-top' },
    title: 'Best Wordle Starting Words: Top 5-Letter Openers',
    description: 'The best Wordle starting words, built from the most common letters, with definitions and Scrabble scores.',
    h1: 'Best Wordle Starting Words',
    about: ['A strong opening guess tests common letters and vowels in positions where they often appear. The words below are popular starters chosen for that reason.'],
    faq: [],
  },
  {
    path: TAG_PATHS.palindrome,
    tab: 'finder',
    filter: { tag: 'palindrome' },
    title: '5-Letter Palindromes: Words That Read the Same Backwards',
    description: 'A list of 5-letter palindromes, words that read the same forwards and backwards, with definitions.',
    h1: '5-Letter Palindromes',
    about: ['A palindrome reads the same forwards and backwards, like LEVEL or RADAR. Here are the five-letter palindromes in the dictionary.'],
    faq: [],
  },
  {
    path: TAG_PATHS['no-vowels'],
    tab: 'finder',
    filter: { tag: 'no-vowels' },
    title: '5-Letter Words With No Vowels (A, E, I, O, U)',
    description: 'Five-letter words without the vowels A, E, I, O or U, useful for tricky Wordle and Scrabble situations.',
    h1: '5-Letter Words With No Vowels',
    about: ['These words contain none of the letters A, E, I, O or U. They usually rely on Y, so they are worth remembering when a Wordle board has no vowel left.'],
    faq: [],
  },
  {
    path: TAG_PATHS['double-letters'],
    tab: 'finder',
    filter: { tag: 'double-letters' },
    title: '5-Letter Words With Double Letters',
    description: 'Five-letter words that contain a repeated letter, such as SPEED or HAPPY, for Wordle and Scrabble.',
    h1: '5-Letter Words With Double Letters',
    about: ['Words with a repeated letter are easy to forget in Wordle. This list shows five-letter words in which at least one letter appears twice.'],
    faq: [],
  },
  {
    path: TAG_PATHS['high-scoring'],
    tab: 'finder',
    filter: { tag: 'high-scoring' },
    title: 'High-Scoring 5-Letter Scrabble Words',
    description: 'High-value 5-letter Scrabble words using J, Q, X, Z and K, with tile scores.',
    h1: 'High-Scoring 5-Letter Scrabble Words',
    about: ['Words that use high-value tiles such as J, Q, X, Z and K score the most. Tile scores are shown for Scrabble and Words With Friends.'],
    faq: [],
  },
  {
    path: TAG_PATHS['vowel-rich'],
    tab: 'finder',
    filter: { tag: 'vowel-rich' },
    title: '5-Letter Words With Many Vowels',
    description: 'Five-letter words containing three or more vowels, ideal for finding vowels quickly in Wordle.',
    h1: '5-Letter Words With Many Vowels',
    about: ['Vowel-heavy words such as AUDIO and ADIEU help you test several vowels in one guess.'],
    faq: [],
  },
];

function letterRoutes(): RouteInfo[] {
  const out: RouteInfo[] = [];
  for (const L of LETTERS) {
    const l = L.toLowerCase();
    out.push({
      path: `/5-letter-words-starting-with-${l}/`,
      tab: 'finder',
      filter: { startsWith: L },
      title: `5-Letter Words Starting With ${L}: Full List & Scores`,
      description: `Every 5-letter word that starts with ${L}, with definitions and Scrabble scores. Useful for Wordle, Scrabble and crosswords.`,
      h1: `5-Letter Words Starting With ${L}`,
      about: [
        `Below are five-letter words that begin with the letter ${L}. Select a word to see its definition, Scrabble score and anagrams, or use the Word Finder filters to combine this starting letter with other letters.`,
      ],
      faq: [],
    });
    out.push({
      path: `/5-letter-words-ending-with-${l}/`,
      tab: 'finder',
      filter: { endsWith: L },
      title: `5-Letter Words Ending in ${L}: Full List & Scores`,
      description: `Every 5-letter word that ends in ${L}, with definitions and Scrabble scores. Useful for Wordle, Scrabble and crosswords.`,
      h1: `5-Letter Words Ending in ${L}`,
      about: [
        `Below are five-letter words that end with the letter ${L}. Select a word to see its definition, Scrabble score and anagrams, or use the Word Finder filters to combine this ending with other letters.`,
      ],
      faq: [],
    });
  }
  return out;
}

export const ALL_ROUTES: RouteInfo[] = [...BASE_ROUTES, ...letterRoutes()];
export const HOME_ROUTE: RouteInfo = ALL_ROUTES[0];

const ROUTE_BY_PATH = new Map(ALL_ROUTES.map((r) => [r.path, r]));

/** Match a browser pathname (including the deploy base path) to a route, or null when unknown. */
export function resolveRoute(pathname: string, base = '/'): RouteInfo | null {
  const cleanBase = base.replace(/\/$/, '');
  let p = pathname.startsWith(cleanBase) ? pathname.slice(cleanBase.length) : pathname;
  p = p.toLowerCase();
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  return ROUTE_BY_PATH.get(p) ?? null;
}
