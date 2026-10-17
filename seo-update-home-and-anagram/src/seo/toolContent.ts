// Extra, page-specific copy for the tool pages. It is merged into the route definitions in routes.ts and is
// rendered both in the prerendered HTML (for crawlers) and under the tool in the app (for visitors).
// Keep it factual and specific to the tool: thin or templated copy is what search engines discount.
import type { Faq, Section } from './routes';

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
        heading: 'How to use the anagram solver',
        body: [
          'Type your letters into the box and the results update as you type. Every match is a real five-letter word with its definition and Scrabble score, listed from the highest-scoring word to the lowest.',
        ],
        subsections: [
          {
            heading: 'Unscramble exactly five letters',
            body: [
              'With five letters and no blanks, the solver returns exact anagrams: words that use every letter once. EARTH gives EARTH, HATER and HEART, and STONE gives NOTES, ONSET, STENO, STONE and TONES. When a set has several answers, compare definitions and scores and pick the one that suits your game.',
            ],
          },
          {
            heading: 'Use blanks, wildcards and missing letters',
            body: [
              'Use a question mark or asterisk for any letter you do not know. Each one stands for a single letter, just like a blank tile in Scrabble. Four letters plus one blank list every word that contains those four letters, which is also the quickest way to unscramble when one letter is missing or unknown.',
            ],
          },
          {
            heading: 'Use a longer rack to find partial matches',
            body: [
              'A Scrabble rack has seven tiles, so the solver accepts more than five letters and returns every five-letter word that can be built from them. LISTEN, for instance, returns INLET, ISLET, LIENS, LINES and TILES. Ticking "Include partial letter matches" gives the same behaviour for exactly five letters.',
            ],
          },
          {
            heading: 'Repeated letters',
            body: [
              'Every letter you type is used once, so a word with a double letter needs that letter twice in your rack. If you think a word repeats a letter you only have one of, add a blank in its place. SPED plus a blank finds SPEED, for example.',
            ],
          },
        ],
      },
      {
        heading: 'Anagram solver for Scrabble, Words With Friends, Wordle and crosswords',
        body: [
          'Different puzzles want different things from the same letters, so it helps to know which settings to use.',
        ],
        subsections: [
          {
            heading: 'Scrabble and Words With Friends',
            body: [
              'Enter your rack and read down the list: results are ordered by tile score, so the best play is first. Five-letter words are especially useful because they reach bonus squares without needing a perfect rack. Official dictionaries differ, so check your own game before relying on a word in a challenge.',
            ],
          },
          {
            heading: 'Wordle and similar word games',
            body: [
              'After a few guesses, type your green and yellow letters to see whether they can form more than one word. If they can, you know the guess is risky and you can choose a word that separates the options. The Wordle Solver does the full job of filtering by green, yellow and grey tiles.',
            ],
          },
          {
            heading: 'Crosswords, cryptic clues and jumbled-word puzzles',
            body: [
              'In cryptic crosswords an anagram clue pairs fodder letters with an indicator word such as "mixed", "broken" or "wild". If the answer has five letters, type the fodder into the solver and match the results against the definition part of the clue. The same method works for jumbled-word puzzles in apps, games and social media challenges.',
            ],
          },
        ],
      },
      {
        heading: 'Multi-word anagrams, names and phrases',
        body: [
          'Many people search for a solver that handles whole phrases. This tool is deliberately limited to single five-letter words, so it is worth knowing where it helps and where it does not.',
        ],
        subsections: [
          {
            heading: 'Two-word and multi-word anagrams',
            body: [
              'The solver does not split letters into several words for you. To work on a phrase by hand, pick five of its letters, solve them here, remove the letters you used and repeat with what is left. Five-letter words are a useful building block for longer phrases.',
            ],
          },
          {
            heading: 'Names, celebrities and proper nouns',
            body: [
              'The dictionary contains common English words, not people, places or titles, so a name anagram will not return the name itself. You can still unscramble five letters of a name to find the common words hidden in it.',
            ],
          },
          {
            heading: 'Longer words and other languages',
            body: [
              'Results are always English five-letter words. A longer rack is useful for finding five-letter words inside it, but it will not return the longer anagram itself.',
            ],
          },
        ],
      },
      {
        heading: 'How an anagram solver works',
        body: [
          'Two words are anagrams when they contain exactly the same letters in the same quantities. The solver counts how many times each of the 26 letters appears in your input and compares those counts with every word in the dictionary. A word matches when it needs no more of any letter than you supplied, plus one extra letter for each blank.',
        ],
        subsections: [
          {
            heading: 'Where the word list comes from',
            body: [
              'Online anagram generators usually build their results from a fixed dictionary rather than inventing words. This one uses the same five-letter dictionary as the Word Finder and Wordle Solver, so a word that appears here also has a definition entry or Scrabble score on the rest of the site.',
            ],
          },
          {
            heading: 'No app, download or account needed',
            body: [
              'The solver runs entirely in your browser, so there is nothing to install and no extension to add. It works the same on a phone, tablet or computer, and the matching happens on your device.',
            ],
          },
        ],
      },
      {
        heading: 'Anagram solver, word finder or Wordle solver?',
        body: [
          'Use the anagram solver when you hold the letters but not their order. Use the Word Finder when you know where some letters go, when you know how a word starts or ends, or when you want to exclude letters. Use the Wordle Solver when you have tile colours from several guesses.',
        ],
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
        heading: 'How the practice game works',
        body: [
          'A random five-letter word is chosen for each round. Type a valid word and press Enter: letters in the right place turn green, letters that are in the word but in another place turn yellow, and letters that are not in the word turn grey. You have six guesses to find the answer, and the on-screen keyboard keeps track of which letters you have already tested.',
          'When a round ends, you can open the answer to read its definition and see its anagrams, so every game also adds to your vocabulary. Your streak and win statistics are stored in your own browser; nothing is sent to a server.',
        ],
      },
      {
        heading: 'What to practise',
        body: [
          'Pick one opening word and use it for a week. Notice which letters it tests and how often it leaves you with too many candidates. Then practise your second guess: try to use five new letters instead of repeating grey ones. Finally, practise rhyme traps, where several words differ by only one letter, by choosing a word that separates them rather than guessing one at random.',
          'Because rounds are unlimited, you can repeat a difficult pattern until the strategy feels automatic, something the single daily puzzle does not allow.',
        ],
      },
      {
        heading: 'Share and compare',
        body: [
          'After a round you can copy a result grid made of coloured squares to share with friends without revealing the answer. It is a quick way to compare how many guesses each of you needed on the same word.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are practice words repeated?',
        a: 'Words are picked at random, so a repeat is possible but rare in a short session. Statistics only count completed games.',
      },
      {
        q: 'Do I need an account or an app?',
        a: 'No. The game runs in your browser, is free, and keeps your streak on your own device.',
      },
    ],
  },

  '/letter-frequency/': {
    sections: [
      {
        heading: 'How to read the frequency charts',
        body: [
          'The first chart counts how many five-letter words contain each letter at least once. Tall bars mean a letter is a safe test: if a letter appears in a large share of words, guessing it will usually turn a tile green or yellow and remove many candidates. Short bars mean a letter is a poor early guess but may be a decisive late one.',
          'The position heatmap goes one step further. It shows how often each letter appears as the first, second, third, fourth or fifth letter. Some letters are common overall but concentrated in one place, for example S at the start and E at the end, which is why a letter can be a good guess in one slot and a wasted guess in another.',
        ],
      },
      {
        heading: 'Choosing a starting word from the data',
        body: [
          'A strong opener combines letters that score highly overall with letters that score highly in the slot where you place them, and avoids repeating a letter so that all five tiles give new information. Compare the heatmap with the list of best Wordle starting words to see why words such as CRANE and SLATE are so popular.',
          'Vowel counts matter as well. Most five-letter words have between one and three vowels, so an opener with two vowels is a reasonable balance between finding them and leaving room for consonants.',
        ],
      },
      {
        heading: 'Using frequency in Scrabble and crosswords',
        body: [
          'Frequency also helps outside Wordle. Knowing that E, A, R and S are common helps you judge which letters to keep on your rack, and knowing which letters are rare helps you spot high-value plays with letters such as Q, X and Z.',
        ],
      },
    ],
    faq: [
      {
        q: 'What is the most common letter in five-letter words?',
        a: 'In this dictionary the vowels A and E and the consonants S, R and O are among the most frequent. Open the chart above for the exact ranking and counts.',
      },
      {
        q: 'Are the statistics based on Wordle answers only?',
        a: 'No. They are calculated from the full five-letter dictionary on this site, which is larger than the list of past Wordle answers.',
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
