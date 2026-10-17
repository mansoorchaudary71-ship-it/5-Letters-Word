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

export interface ExtraContent {
  sections?: Section[]; // placed BEFORE the page's existing link sections
  faq?: Faq[]; // appended to the page's existing FAQ
}

export const TOOL_CONTENT: Record<string, ExtraContent> = {
  '/wordle-solver/': {
    sections: [
      {
        heading: 'How to enter your Wordle clues',
        body: [
          'Work through your guesses one at a time. For every green tile, type the letter into the slot where it sits. For every yellow tile, add the letter to the "in the word" list and mark the slot where it appeared, because the answer cannot have that letter in that position. For every grey tile, add the letter to the excluded list. The candidate list shrinks after each clue, so you can see how much a guess actually told you.',
          'Words are ranked by how common they are, which puts everyday answers ahead of obscure ones. Open any candidate to read its definition and Scrabble score before you commit to it.',
        ],
      },
      {
        heading: 'Repeated letters and other tricky cases',
        body: [
          'Duplicate letters cause most solver mistakes. If you guess a word with two Es and only one tile turns yellow or green, the other E is grey, but that does not mean the answer has no E. It means the answer contains exactly one. In that case do not add E to the excluded list; keep it in the "must contain" list and use a pattern that allows only a single copy.',
          'If you are left with several similar words that differ by one letter (a "rhyme trap" such as BATCH, CATCH, HATCH, LATCH, MATCH and WATCH), do not guess one of them at random. Pick a word that contains several of the differing letters, even if it cannot be the answer, so that one guess separates them.',
        ],
      },
      {
        heading: 'Using a solver and still enjoying the puzzle',
        body: [
          'A solver is best used as a coach rather than a crutch. Try the puzzle yourself first, then check the candidate list when you are stuck on guess four or five to protect a streak, or after you finish to see whether a better guess existed. The practice game on this site lets you rehearse that routine without using up the daily puzzle.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does the solver spoil the daily answer?',
        a: 'No. It only filters a word list using the clues you type in. It does not know which word is the answer today, so it cannot reveal it before you enter your own guesses.',
      },
      {
        q: 'Why does the solver show words I have never heard of?',
        a: 'The dictionary includes valid five-letter words, not just everyday ones. Candidates are ranked so that common words come first, and each word with a definition can be opened for its meaning.',
      },
    ],
  },

  '/anagram-solver/': {
    sections: [
      {
        heading: 'How the 5-letter anagram solver works',
        body: [
          'Enter the letters you have and the solver checks them against the full list of five-letter words. A word is shown when it uses exactly the letters you typed, in any order. Because the list is limited to five letters, results appear instantly and every result is a legal word you can play.',
          'Use the question mark or asterisk as a blank tile. Each wildcard stands for any single letter, so typing four letters plus a wildcard lists every word those four letters can form with one extra letter of your choice. This mirrors a blank tile in Scrabble.',
        ],
      },
      {
        heading: 'When to use an anagram solver',
        body: [
          'Scrabble and Words With Friends players use it to find playable words from a rack, then compare scores to pick the best option. Puzzle fans use it for jumbled-word clues and cryptic crosswords. Wordle players use it to check whether the letters from their green and yellow tiles can be arranged into more than one answer, which tells them how risky a guess is.',
          'Many sets of letters have several valid arrangements. The letters of STONE, for example, also spell NOTES, ONSET and TONES. Where a set has more than one answer, compare definitions and scores, then choose the word that suits your game.',
        ],
      },
      {
        heading: 'Tips for unscrambling faster',
        body: [
          'Look for common endings first (ER, ED, ES, LY) and common starting pairs (ST, CH, TR, BL). Group vowels and consonants separately, then try each vowel in the middle. If nothing fits, try a wildcard: it shows which single extra letter would unlock a word.',
        ],
      },
    ],
    faq: [
      {
        q: 'How do I use a blank tile or wildcard?',
        a: 'Type a question mark or an asterisk in place of the missing letter. Each one can stand for any single letter, so four letters plus one wildcard returns every five-letter word containing those four letters.',
      },
      {
        q: 'Is every result a valid Scrabble word?',
        a: 'The list contains standard five-letter English words, but official Scrabble dictionaries differ between countries and editions. Check your own game rules or dictionary if a play is challenged.',
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
        a: 'Words that combine common letters, such as CRANE, SLATE and ADIEU, are popular. Open the Best Wordle Starting Words list for more and for how they compare.',
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
