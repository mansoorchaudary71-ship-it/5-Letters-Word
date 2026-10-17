// Single source of truth for every URL on the site: path, tab, filter and all SEO text.
// Pure TypeScript (no DOM / Vite APIs) so the build script and the React app can both import it.

import { ALL_WORDS } from '../data/words';
import { SITE_NAME, SITE_TAGLINE } from './site';
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
export interface SubSection {
  heading: string; // rendered as an <h3> under the section's <h2>
  body: string[];
}
export interface Section {
  heading: string;
  body?: string[];
  items?: SubSection[]; // optional <h3> sub-blocks, rendered after body and before links
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
    q: 'How do I find a 5-letter word when I only know some letters?',
    a: 'Type the letters you know into the pattern boxes and leave the unknown positions empty. For example S _ _ R T finds words such as SHORT, SMART and SPORT. Add letters that must be included or excluded to narrow the list further.',
  },
  {
    q: 'Can I use this site to help solve Wordle?',
    a: 'Yes. Use the Wordle Solver to enter your green, yellow and grey letters after each guess and get the remaining possible answers, or use the Word Finder to browse words by starting letter, ending letter or pattern.',
  },
  {
    q: 'Are all of these words valid in Scrabble?',
    a: 'The list is built for word games and every entry shows its Scrabble and Words With Friends tile score. Official dictionaries differ between tournaments and countries, so check your own rulebook before relying on a word in competition.',
  },
  {
    q: 'Do the words have definitions?',
    a: 'Yes. Familiar words have a written definition, part of speech and example sentence, and each of those words has its own page. Rarer game words are listed with their scores.',
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
    title: `${SITE_NAME}: ${SITE_TAGLINE}`,
    description: `Find 5-letter words by pattern, starting or ending letters, or included letters. Free Wordle solver, anagram unscrambler, definitions and Scrabble scores.`,
    h1: '5-Letter Word Finder',
    about: [
      'This free 5-letter word finder helps you search a dictionary of five-letter English words by starting letter, ending letter, a letter pattern such as S _ _ R T, letters that must appear and letters to leave out. Every familiar word comes with a short definition, its part of speech and its Scrabble and Words With Friends score.',
      'Stuck on a puzzle? Use the Wordle Solver to narrow down answers from your clues, the Anagram Solver to unscramble five letters, or browse the A-Z directory to explore words by letter.',
    ],
    sections: [
      {
        heading: 'How to use the 5-letter word finder',
        body: [
          'Start with the letters you are sure about. Type known letters into the pattern boxes in their exact positions, then add letters that must appear somewhere (yellow tiles in Wordle) and letters that must not appear (grey tiles). The list updates as you type, so you can see how each clue narrows the answer.',
          'Use the starting and ending letter boxes for crossword clues, sort by Scrabble score when you want the best play, and open any word to read its definition and see its anagrams.',
        ],
      },
      {
        heading: 'Why five-letter words matter',
        body: [
          'Five-letter words are the format of Wordle and many of its spin-offs, and they are among the most useful lengths in Scrabble because they reach bonus squares without needing a perfect rack. They are also common in crosswords and vocabulary exercises, which is why a dedicated reference is helpful.',
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
    title: 'Wordle Solver: Free Wordle Helper & Answer Finder',
    description:
      'Free Wordle solver: enter your green, yellow and gray letters to see every possible 5-letter answer and the best next guess. No download or sign-up needed.',
    h1: 'Wordle Solver & Wordle Helper',
    about: [
      'This free Wordle solver turns your clues into a short list of possible answers. After each guess, enter the green letters (right letter, right spot), the yellow letters (in the word, wrong spot) and the gray letters (not in the word). The tool filters its dictionary of five-letter words instantly and suggests the best next guess from the words that remain.',
      'It runs in any browser on desktop or mobile, with no download, account or subscription, and the filtering happens on your own device. It is an independent helper for 5-letter Wordle, including the New York Times version, and is not affiliated with The New York Times.',
      'Tip: a good second guess uses common letters you have not tested yet, even if the word cannot be the answer. That removes the most possibilities for the next round.',
    ],
    sections: [
      {
        heading: 'Related Wordle tools and word lists',
        links: [
          { label: 'Word Finder', path: '/' },
          { label: 'Anagram Solver', path: '/anagram-solver/' },
          { label: 'Wordle practice game', path: '/wordle-practice/' },
          { label: 'Letter frequency heatmap', path: '/letter-frequency/' },
          { label: '5-letter words A-Z', path: '/5-letter-words-a-z/' },
        ],
      },
    ],
    // FAQ lives in src/seo/toolContent.ts so the page copy is edited in one place.
    faq: [],
  },
  {
    path: TAB_PATHS.anagram,
    tab: 'anagram',
    kind: 'tool',
    filter: {},
    title: '5-Letter Anagram Solver: Unscramble Letters Into Words',
    description:
      'Unscramble any five letters into valid 5-letter words. Free anagram solver for Scrabble, Wordle and word puzzles with definitions and scores.',
    h1: '5-Letter Anagram Solver & Word Unscrambler',
    about: [
      'Type up to five letters and the anagram solver lists every five-letter word that can be made from them. It is useful for Scrabble racks, jumbled-word puzzles and checking whether your Wordle guess has other possible arrangements.',
    ],
    sections: [
      {
        heading: 'Related tools',
        links: [
          { label: 'Word Finder', path: '/' },
          { label: 'Scrabble five-letter words guide', path: '/guides/scrabble-five-letter-words/' },
          { label: 'High-scoring Scrabble words', path: '/high-scoring-5-letter-scrabble-words/' },
        ],
      },
    ],
    faq: [
      {
        q: 'What is an anagram?',
        a: 'An anagram is a word made by rearranging the letters of another word, for example STONE, NOTES and ONSET all use the same five letters.',
      },
      {
        q: 'Can I unscramble fewer than five letters?',
        a: 'This solver is built for five-letter words, so it works best with exactly five letters. Use the Word Finder "contains" filter when you only know some of them.',
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
BASE_ROUTES[0].sections = [...(BASE_ROUTES[0].sections ?? []), HUB_SECTIONS[0]];
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
