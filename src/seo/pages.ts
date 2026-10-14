// Editorial guides and trust pages. Written by hand so the site has real, useful prose beyond the word lists.
// Edit freely: text here is rendered in the app and written into the prerendered HTML by the build script.

import type { RouteInfo } from './routes';
import { CONTENT_UPDATED, SITE_CONTACT_EMAIL, SITE_NAME } from './site';
import { ALL_WORDS, RAW_WORDS_DATA } from '../data/words';

const WORD_TOTAL = ALL_WORDS.length.toLocaleString('en-US');
const WORD_DEFINED = RAW_WORDS_DATA.length.toLocaleString('en-US');

const base = {
  tab: 'article' as const,
  filter: {},
};

export const GUIDE_ROUTES: RouteInfo[] = [
  {
    ...base,
    kind: 'guide',
    path: '/guides/',
    title: 'Wordle & Scrabble Guides: 5-Letter Word Strategy',
    description: 'Practical guides to Wordle strategy, Scrabble five-letter words and finding a word from the letters you know.',
    h1: 'Wordle & Scrabble Guides',
    about: [
      'These guides explain how to get more out of five-letter words, whether you are protecting a Wordle streak, hunting for Scrabble points or simply trying to remember a word that is on the tip of your tongue.',
    ],
    faq: [],
    sections: [
      {
        heading: 'All guides',
        links: [
          { label: 'Wordle Strategy: How to Solve in Fewer Guesses', path: '/guides/wordle-strategy/' },
          { label: 'Scrabble Five-Letter Words: Scoring and Tactics', path: '/guides/scrabble-five-letter-words/' },
          { label: 'How to Find a 5-Letter Word From the Letters You Know', path: '/guides/find-a-word-from-letters/' },
        ],
      },
    ],
  },
  {
    ...base,
    kind: 'guide',
    path: '/guides/wordle-strategy/',
    title: 'Wordle Strategy: How to Solve in Fewer Guesses',
    description: 'A step-by-step Wordle strategy: pick an opening word, use your second guess well, avoid rhyme traps and know when to use a solver.',
    h1: 'Wordle Strategy: How to Solve in Fewer Guesses',
    published: '2026-10-12',
    crumbs: [{ label: 'Guides', path: '/guides/' }],
    about: [
      'Wordle gives you six guesses to find a hidden five-letter word. Each guess is scored with green tiles for the right letter in the right place, yellow tiles for a letter that is in the word but elsewhere, and grey tiles for letters that are not in the word. Good players treat the first two guesses as information gathering and the rest as elimination.',
    ],
    sections: [
      {
        heading: '1. Choose an opening word with common letters',
        body: [
          'A strong opener tests letters that appear in many words. Vowels such as A, E and O and consonants such as R, S, T, L and N turn up constantly, so words like CRANE, SLATE, ADIEU and AUDIO are popular starters. You do not need the "perfect" word: you need one you can use every day without thinking.',
          'Check our letter frequency charts to see which letters are most common in each of the five positions, then compare that with the list of best Wordle starting words.',
        ],
        links: [
          { label: 'Letter frequency heatmap', path: '/letter-frequency/' },
          { label: 'Best Wordle starting words', path: '/best-wordle-starting-words/' },
        ],
      },
      {
        heading: '2. Use your second guess to test new letters',
        body: [
          'If your opener leaves you with many possible answers, your second guess should usually test five fresh letters instead of repeating grey ones. A guess that cannot be the answer is still valuable if it splits the remaining candidates into small groups. Save the all-in guess for when you are down to a handful of options.',
        ],
      },
      {
        heading: '3. Watch out for rhyme traps',
        body: [
          'Some patterns have many near-identical answers. The ending -IGHT fits EIGHT, FIGHT, LIGHT, MIGHT, NIGHT, RIGHT, SIGHT and TIGHT. The ending -OUND fits BOUND, FOUND, HOUND, MOUND, POUND, ROUND, SOUND and WOUND. If you have green letters on those endings, guessing one candidate at a time can burn all your remaining tries. Instead, play a word that contains several of the missing first letters and eliminates them together.',
        ],
      },
      {
        heading: '4. Handle repeated letters carefully',
        body: [
          'A word like SPEED or HAPPY contains a letter twice. If you guess a word with two of the same letter and only one is marked, the answer contains that letter once. Our list of five-letter words with double letters is useful when a puzzle refuses to fit a normal pattern.',
        ],
        links: [{ label: '5-letter words with double letters', path: '/5-letter-words-with-double-letters/' }],
      },
      {
        heading: '5. Use a solver to learn, not just to cheat',
        body: [
          'After a puzzle, enter your clues into the Wordle Solver and compare the remaining candidates with the word you chose. Seeing how many words your guess eliminated is the fastest way to improve. If you play Hard Mode, remember that every revealed hint must be used in your next guess, which makes the opener and second guess even more important.',
        ],
        links: [
          { label: 'Wordle Solver', path: '/wordle-solver/' },
          { label: 'Wordle practice game', path: '/wordle-practice/' },
        ],
      },
    ],
    faq: [
      {
        q: 'What is the best first word in Wordle?',
        a: 'There is no single best word, but starters built from common letters, such as CRANE, SLATE, ADIEU and AUDIO, work well. Choose one you remember easily and stay consistent so you learn how it performs.',
      },
      {
        q: 'Should I always guess a possible answer?',
        a: 'Not always. When many candidates remain, a guess that cannot be the answer but tests several new letters can eliminate more words than a single likely answer.',
      },
      {
        q: 'Is using a Wordle solver cheating?',
        a: 'That depends on how you want to play. Many people use a solver after the game to review their choices, or only when they are stuck, as they would use a dictionary for a crossword.',
      },
    ],
  },
  {
    ...base,
    kind: 'guide',
    path: '/guides/scrabble-five-letter-words/',
    title: 'Scrabble Five-Letter Words: Scoring and Tactics',
    description: 'How five-letter words score in Scrabble, which tiles are worth the most, and how to use high-value letters and anagrams on your rack.',
    h1: 'Scrabble Five-Letter Words: Scoring and Tactics',
    published: '2026-10-12',
    crumbs: [{ label: 'Guides', path: '/guides/' }],
    about: [
      'Five-letter words are the workhorses of Scrabble. They are long enough to reach bonus squares and short enough to fit on a crowded board. Knowing the tile values and a handful of high-scoring words can change the outcome of a close game.',
    ],
    sections: [
      {
        heading: 'Scrabble tile values',
        body: [
          'In the standard English game, A, E, I, O, U, L, N, S, T and R are worth 1 point. D and G are worth 2. B, C, M and P are worth 3. F, H, V, W and Y are worth 4. K is worth 5, J and X are worth 8, and Q and Z are worth 10. The score shown next to every word on this site is the sum of its base tile values before any premium squares.',
        ],
      },
      {
        heading: 'Premium squares and bonuses',
        body: [
          'Double and triple letter squares multiply a single tile, while double and triple word squares multiply the whole word. Placing a Z or X on a triple letter square, or running a five-letter word across a triple word square, is where most big turns come from. Using all seven tiles from your rack in one turn earns a 50-point bonus.',
        ],
      },
      {
        heading: 'Use high-value letters well',
        body: [
          'Browse the high-scoring five-letter words list for words built around J, Q, X, Z and K. Words that use these tiles with only one or two other letters from your rack are the most practical, because you rarely draw a perfect set. When you hold a Q without a U, look for the rare words that allow it before you decide to swap tiles.',
        ],
        links: [{ label: 'High-scoring 5-letter Scrabble words', path: '/high-scoring-5-letter-scrabble-words/' }],
      },
      {
        heading: 'Unscramble your rack',
        body: [
          'If you hold five promising tiles, the Anagram Solver lists every five-letter word that can be formed from them. It is a quick way to check that you are not missing a better play, and a good way to learn new words between games.',
        ],
        links: [{ label: 'Anagram Solver', path: '/anagram-solver/' }],
      },
      {
        heading: 'Check the dictionary for your game',
        body: [
          'Different Scrabble dictionaries accept different words. North American tournament play uses one list, while the international Collins list is larger. Words With Friends uses its own tile values and its own dictionary, so the same word can score differently. Always confirm a doubtful word in the dictionary your match uses.',
        ],
      },
    ],
    faq: [
      {
        q: 'How many points is a five-letter word worth in Scrabble?',
        a: 'It depends on the letters and the squares you land on. The base value is the sum of the tile points, shown on every word page, and premium squares add to that.',
      },
      {
        q: 'Which tiles are worth the most in Scrabble?',
        a: 'Q and Z are worth 10 points each, J and X are worth 8, and K is worth 5.',
      },
    ],
  },
  {
    ...base,
    kind: 'guide',
    path: '/guides/find-a-word-from-letters/',
    title: 'Find a 5-Letter Word From the Letters You Know',
    description: 'How to search for a five-letter word when you only know some letters: patterns, included and excluded letters, and anagram tricks.',
    h1: 'How to Find a 5-Letter Word From the Letters You Know',
    published: '2026-10-12',
    crumbs: [{ label: 'Guides', path: '/guides/' }],
    about: [
      'Whether you are stuck on a crossword, a Wordle board or a word search, the fastest way forward is to describe what you know and let the dictionary do the filtering. This guide shows the four searches that solve most problems.',
    ],
    sections: [
      {
        heading: '1. Search by pattern',
        body: [
          'If you know some letters in fixed positions, type them into the pattern boxes and leave the rest blank. A pattern such as S _ _ R T matches SHORT, SMART and SPORT. Crossword clues often give you exactly this kind of partial answer.',
        ],
      },
      {
        heading: '2. Add letters that must appear',
        body: [
          'When you know a letter is in the word but not where, add it to the "contains" filter. In Wordle this is a yellow tile. Combine several letters to cut the list quickly, then exclude any letters you have ruled out.',
        ],
      },
      {
        heading: '3. Start or end with a known letter',
        body: [
          'The starting-letter and ending-letter pages list every word that begins or ends the way you need. They are also a quick way to see how common a pattern is. Common endings such as -ER, -ED and -LY each have their own page.',
        ],
        links: [
          { label: 'Words starting with S', path: '/5-letter-words-starting-with-s/' },
          { label: 'Words ending in ER', path: '/5-letter-words-ending-with-er/' },
          { label: 'A-Z directory', path: '/5-letter-words-a-z/' },
        ],
      },
      {
        heading: '4. Unscramble the letters',
        body: [
          'If you have the five letters but not the order, use the Anagram Solver. It shows every dictionary word you can make, with definitions, so you can pick the one that fits the clue.',
        ],
        links: [{ label: 'Anagram Solver', path: '/anagram-solver/' }],
      },
    ],
    faq: [
      {
        q: 'How do I search for a word with a missing letter?',
        a: 'Use the pattern boxes on the Word Finder. Fill in the letters you know in their positions and leave the unknown positions empty.',
      },
    ],
  },
];

const contactSection = SITE_CONTACT_EMAIL
  ? [{ heading: 'Email', body: [`You can reach us at ${SITE_CONTACT_EMAIL}.`] }]
  : [];

export const STATIC_ROUTES: RouteInfo[] = [
  {
    ...base,
    kind: 'page',
    path: '/about/',
    title: `About ${SITE_NAME}: Our Word List and Method`,
    description: 'How the 5-letter word list is built, how scores are calculated and why some words are hidden. An independent tool for Wordle, Scrabble and crossword fans.',
    h1: `About ${SITE_NAME}`,
    about: [
      `${SITE_NAME} is a free, independent reference for five-letter English words. It combines a searchable word list with a Wordle solver, an anagram solver, a practice game and a letter frequency study.`,
    ],
    sections: [
      {
        heading: 'How the word list works',
        body: [
          `The dictionary currently holds ${WORD_TOTAL} five-letter words. ${WORD_DEFINED} of them have a hand-written definition, a part of speech and an example sentence; the rest are accepted game words that are listed without a definition yet. Only words with a written definition get their own page, so every word page has something real to read. The number of defined words grows as entries are added.`,
          'Scrabble and Words With Friends scores are added up from each game\'s own tile values, which differ slightly between the two games. They are shown as base scores, before any bonus squares or bingo bonuses.',
        ],
      },
      {
        heading: 'Where the definitions come from',
        body: [
          'Definitions and example sentences are written in plain, original wording for this site rather than copied from a commercial dictionary. They aim to give the everyday meaning first and then any common second meaning, so they are shorter than a full dictionary entry and do not replace one.',
        ],
      },
      {
        heading: 'What is filtered out',
        body: [
          'A short blocklist hides a small number of vulgar and offensive words so they do not appear in results. The list is not exhaustive and the site is not a complete tournament dictionary, so supervise young children as you would with any website.',
        ],
      },
      {
        heading: 'Independence',
        body: [
          'Wordle is a trademark of The New York Times Company, and Scrabble is a trademark of Hasbro and Mattel. This site is not affiliated with or endorsed by them.',
        ],
      },
      {
        heading: 'Corrections and suggestions',
        body: ['If you find a wrong definition, a missing word or a bug, please tell us so we can fix it.'],
        ...(SITE_CONTACT_EMAIL ? { links: [{ label: 'Contact', path: '/contact/' }] } : {}),
      },
    ],
    faq: [],
  },
  ...(SITE_CONTACT_EMAIL
    ? [
        {
          ...base,
          kind: 'page' as const,
          path: '/contact/',
          title: `Contact ${SITE_NAME}`,
          description: 'Report a wrong definition, suggest a word or ask a question about the 5-letter word finder.',
          h1: `Contact ${SITE_NAME}`,
          about: ['Questions, corrections and suggestions are welcome. Please include the word or page address so we can find it quickly.'],
          sections: contactSection,
          faq: [],
        } satisfies RouteInfo,
      ]
    : []),
  {
    ...base,
    kind: 'page',
    path: '/privacy-policy/',
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'What data this site collects, how saved words are stored in your browser and how to contact us about privacy.',
    h1: 'Privacy Policy',
    updated: CONTENT_UPDATED,
    about: [`This policy explains what ${SITE_NAME} does with information when you use the site. Last updated ${CONTENT_UPDATED}.`],
    sections: [
      {
        heading: 'Information we collect',
        body: [
          'The site does not ask you to create an account and does not ask for your name or email address. Words you save with the bookmark button, and your practice-game statistics, are stored in your own browser using local storage and never leave your device. You can remove them at any time by clearing the site\'s data in your browser.',
        ],
      },
      {
        heading: 'Fonts and hosting',
        body: [
          'To display text in the Inter typeface, your browser requests font files from Google Fonts. Google receives your IP address and basic browser details as part of that request, as with any file loaded from another company\'s server; its handling of that data is covered by Google\'s own privacy policy. Like all websites, our hosting provider may also keep ordinary server logs (such as IP address and pages requested) for security and reliability.',
        ],
      },
      {
        heading: 'Cookies and analytics',
        body: [
          'The site itself does not set cookies and does not use analytics or advertising services. If that changes, this page will be updated first to name the service and explain how to opt out.',
        ],
      },
      {
        heading: 'Third-party links',
        body: ['Pages may link to other websites. We are not responsible for the privacy practices of other sites.'],
      },
      {
        heading: 'Changes to this policy',
        body: ['We may update this policy from time to time. The date at the top shows when it last changed.'],
      },
    ],
    faq: [],
  },
  {
    ...base,
    kind: 'page',
    path: '/terms/',
    title: `Terms of Use | ${SITE_NAME}`,
    description: `The terms for using ${SITE_NAME}: free personal use, no guarantees of word validity and our trademark notice.`,
    h1: 'Terms of Use',
    updated: CONTENT_UPDATED,
    about: [`By using ${SITE_NAME} you agree to these simple terms. Last updated ${CONTENT_UPDATED}.`],
    sections: [
      {
        heading: 'Use of the site',
        body: ['The site is free for personal and educational use. Please do not attempt to disrupt it or copy large parts of the word list for resale.'],
      },
      {
        heading: 'No guarantee of word validity',
        body: [
          'Word lists are provided for reference. Official game dictionaries differ and change over time, so we cannot guarantee that a word is accepted in any specific game or tournament.',
        ],
      },
      {
        heading: 'Our content',
        body: ['The definitions, guides and explanations on this site are original and protected by copyright. You may quote short passages with a link back to the page, but please do not republish the word list or guides in bulk.'],
      },
      {
        heading: 'Provided as is',
        body: ['The site and its word lists are provided as is, without warranties of any kind. We work to keep them accurate but are not liable for losses that result from relying on them, for example a word that is rejected in a game.'],
      },
      {
        heading: 'Trademarks',
        body: ['Wordle, Scrabble and Words With Friends are trademarks of their respective owners. This site is not affiliated with them.'],
      },
      {
        heading: 'Changes',
        body: ['We may update these terms. The date at the top shows when they last changed, and continued use of the site means you accept the current version.'],
      },
    ],
    faq: [],
  },
];
