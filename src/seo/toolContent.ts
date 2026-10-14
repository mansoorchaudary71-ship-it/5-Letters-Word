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
