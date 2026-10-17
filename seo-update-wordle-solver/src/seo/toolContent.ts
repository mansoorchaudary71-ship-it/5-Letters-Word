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
        heading: 'How to use the Wordle solver, step by step',
        body: [
          'Play your guess in Wordle, then copy the colors into the solver. Repeat after every guess and the list of possible answers shrinks each time.',
        ],
        items: [
          { heading: 'Step 1: Enter your green letters', body: ['Type each green letter into the box for its position. Green means the letter is correct and in the right spot, so only words with that letter in that exact place stay on the list.'] },
          { heading: 'Step 2: Add your yellow letters', body: ['Yellow letters are in the word but not where you played them. In the yellow row, put the letter in the box for the spot where it turned yellow, which rules that position out for it. The "All known yellow letters" field then makes sure every remaining word contains the letter somewhere else.'] },
          { heading: 'Step 3: List your gray letters', body: ['Type every letter that came back gray into the ruled-out box. Any word containing those letters is removed. Click a letter chip to take it back out if you made a mistake.'] },
          { heading: 'Step 4: Read the candidates and choose your next guess', body: ['The counter shows how many valid words remain. When more than one is left, the recommended next guesses panel suggests the words most likely to narrow the list fastest. Select any word to see its definition and Scrabble score, or copy it straight into Wordle.'] },
        ],
      },
      {
        heading: 'How the Wordle solver algorithm picks the best next guess',
        body: [
          'The solver is a transparent, rule-based algorithm rather than a chatbot or a language model, so the same clues always produce the same suggestions.',
        ],
        items: [
          { heading: 'Step 1: It filters the word list', body: ['Every word in the dictionary is tested against your clues. A word stays only if it has each green letter in its exact position, contains every yellow letter, does not repeat a yellow letter in a spot where it was already ruled out, and does not contain a gray letter. A gray letter you have also entered as green or yellow is not used to exclude words.'] },
          { heading: 'Step 2: It scores the words that remain', body: ['The solver counts how many of the remaining candidates contain each letter, counting each letter once per word. A candidate scores higher when its distinct letters appear in many of the other candidates, because guessing it confirms or eliminates those letters for the most words. Repeated letters are penalized, since they test fewer new letters.'] },
          { heading: 'What the ranking can and cannot do', body: ['The top eight scores are shown as recommended next guesses, and each one is a word that could still be the answer. This is a letter-frequency method rather than an exhaustive search of every possible guess sequence, so treat it as a strong guide, not a guarantee. When several remaining words differ by only one letter, a guess that cannot be the answer can sometimes split them better, and the strategy guide explains how.'] },
          { heading: 'Why common starting words work', body: ['Opening words such as CRANE, SLATE and ADIEU are popular because they combine letters that appear in many five-letter words, like A, E, R, S, T, O and L, in positions where they often fall. The letter frequency page shows the counts behind those choices.'] },
        ],
      },
      {
        heading: 'Wordle solver for today\'s puzzle',
        body: [
          'The solver works for any day\'s Wordle, including today\'s, because it only uses the clues from your own guesses. Open the game, play a first word, then enter the colors here to see which five-letter words could still be the answer.',
          'This site does not publish daily answers, so the puzzle is not spoiled before you have played. If you want to confirm an answer after you finish, the official game is the reliable source.',
        ],
      },
      {
        heading: 'Free online Wordle solver: no app, download or subscription',
        body: [
          'This Wordle solver tool is a normal web page, so there is nothing to install and nothing to pay for.',
        ],
        items: [
          { heading: 'Wordle solver app: why you do not need one', body: ['Open the page in any modern browser on a phone, tablet or computer and it works the same way. On most phones you can use your browser menu to add the page to your home screen, which gives you an app-style shortcut without visiting an app store.'] },
          { heading: 'Bookmarks and browser extensions', body: ['Because the solver is a web page, a bookmark is enough to keep it one click away. No browser extension is required.'] },
          { heading: 'Using the solver offline', body: ['After you have opened the solver once, your browser keeps a copy of its files, so a page you have already visited can often load again on a weak connection or none. It is not a downloadable program, and your first visit needs an internet connection.'] },
          { heading: 'Free, with no sign-up', body: ['The solver is free to use, with no subscription or account required.'] },
        ],
      },
      {
        heading: 'What to look for in a good Wordle helper',
        body: [
          'Whether you compare Wordle solver websites, apps or browser tools, the useful ones share a few traits: they apply green, yellow and gray feedback correctly, handle repeated letters sensibly, rank the next guess with logic you can understand, respond instantly and do not ask for payment before they help.',
          'This solver covers those points. It filters on all three clue types, suggests next guesses using the method described above, updates as you type, and shows a definition and Scrabble score for familiar words so you can judge a candidate before you play it.',
        ],
      },
      {
        heading: '5-letter Wordle solver: what about 6-letter or 7-letter words?',
        body: [
          'This is a 5-letter Wordle solver. Its dictionary holds five-letter English words only, which matches the official Wordle format and most Wordle-style spin-offs.',
          'Variants with 4, 6, 7 or more letters use the same green, yellow and gray logic, but they need a dictionary of that word length, so this tool would not return correct answers for them. For other kinds of word puzzles, the Word Finder filters by pattern and the Anagram Solver unscrambles five letters.',
        ],
      },
      {
        heading: 'Repeated letters and other tricky cases',
        body: [
          'Duplicate letters cause most solver mistakes. If you guess a word with two Es and only one E turns green or yellow, the second E is gray, but that means the answer contains exactly one E, not zero. This solver does not exclude a gray letter that you have also entered as green or yellow, so entering both will not wipe out your results. It does not limit the answer to a single copy, though, so scan the remaining words for double letters you can rule out yourself.',
          'If you are left with several similar words that differ by one letter (a "rhyme trap" such as BATCH, CATCH, HATCH, LATCH, MATCH and WATCH), do not guess one of them at random. Pick a word that contains several of the differing letters, even if it cannot be the answer, so that one guess separates them.',
        ],
      },
      {
        heading: 'Using a Wordle solver and still enjoying the puzzle',
        body: [
          'A solver is best used as a coach rather than a crutch. Try the puzzle yourself first, then check the candidate list when you are stuck on guess four or five to protect a streak, or after you finish to see whether a better guess existed. The practice game on this site lets you rehearse that routine without using up the daily puzzle.',
        ],
      },
      {
        heading: 'Wordle strategy and starting words',
        body: [
          'A solver works best when you arrive with a plan: a consistent opening word, a second guess that tests new letters, and a clear idea of when to stop guessing possible answers and start probing. The starting words list and the strategy guide cover those decisions in depth.',
        ],
        links: [
          { label: 'Best Wordle starting words', path: '/best-wordle-starting-words/' },
          { label: 'Wordle strategy guide', path: '/guides/wordle-strategy/' },
        ],
      },
    ],
    faq: [
      {
        q: 'What is a Wordle solver?',
        a: 'A Wordle solver is a tool that narrows down the possible answers to a Wordle puzzle using the feedback from your guesses. You enter the green, yellow and gray letters, and it shows every five-letter word that still fits, along with a suggestion for the best next guess.',
      },
      {
        q: 'How does the Wordle solver work?',
        a: 'It removes every word that conflicts with your clues: green letters must match their position, yellow letters must appear elsewhere in the word, and gray letters must not appear. It then scores the remaining words by how many other candidates share their letters and recommends the top scorers as your next guess.',
      },
      {
        q: 'How do I use the Wordle solver?',
        a: 'Play a guess in Wordle, then enter the green letters in their positions, the yellow letters in the spots where they appeared, and the gray letters in the ruled-out box. The list of possible answers updates instantly. Pick a recommended word, play it, and repeat with the new colors.',
      },
      {
        q: 'What is the best Wordle solver?',
        a: 'The best Wordle solver applies green, yellow and gray clues correctly, ranks the next guess with logic you can understand, works instantly on any device and does not make you pay or install anything. This free solver is built around those points.',
      },
      {
        q: 'What is the best opening word for Wordle?',
        a: 'There is no single best word, but CRANE, SLATE, ADIEU and AUDIO are popular because they test common letters and vowels. Pick one and use it consistently. The Best Wordle Starting Words list shows more, and the letter frequency page explains the numbers behind them.',
      },
      {
        q: 'What is the 3-word Wordle trick?',
        a: 'It usually refers to opening with three guesses that use 15 different letters between them, so you test as many common letters as possible before narrowing down. It gives up the chance of an early win in exchange for information. Enter each result in the solver to see how far the list shrinks.',
      },
      {
        q: 'What is the Wordle word today?',
        a: 'This site does not publish daily answers. The solver works for any day\'s puzzle, including today\'s: play a guess in the game, enter the green, yellow and gray letters here, and the remaining possible answers appear. That gives you help without a spoiler up front.',
      },
      {
        q: 'Does the solver work for the New York Times Wordle?',
        a: 'Yes. It follows the standard Wordle rules of six guesses, five letters and green, yellow and gray feedback, so it works with the NYT version and Wordle clones. This is an independent tool and is not affiliated with The New York Times.',
      },
      {
        q: 'Is the Wordle solver free, and do I need to download an app?',
        a: 'It is free, with no account, subscription or download. It runs in your browser on phones, tablets and computers, and you can bookmark it or add it to your home screen for quick access.',
      },
      {
        q: 'Is there a 6-letter or 7-letter Wordle solver here?',
        a: 'No. This tool is built for 5-letter Wordle and its dictionary contains five-letter words only. Longer variants use the same color rules but need a longer-word dictionary, so results here would not be correct for them.',
      },
      {
        q: 'Why does the solver show words I have never heard of?',
        a: 'The dictionary includes valid five-letter words, not just everyday ones. Familiar words show a short definition on their card, which helps you spot likely answers, and every word can be opened for its Scrabble score. The grid itself is listed alphabetically.',
      },
      {
        q: 'Is Wordle randomly generated?',
        a: 'No. Wordle draws its answers from a curated list of five-letter words and gives every player the same word each day. The list was curated for the original game, and the New York Times now manages it editorially.',
      },
      {
        q: 'Has Wordle ever repeated a word?',
        a: 'The original answer list was built so that each word appears once, but the list is now managed by the New York Times and sources disagree about whether older answers can return. Do not rule out a word just because it has been an answer before; this solver does not exclude past answers.',
      },
      {
        q: 'What is the best way to win Wordle?',
        a: 'Use a consistent opening word with common letters, make your second guess test new letters, keep track of which positions each letter has been ruled out of, and watch for rhyme traps such as _ATCH. Use the solver when you are stuck to see how many words are left. The strategy guide covers each step.',
      },
      {
        q: 'Does Wordle help your brain?',
        a: 'Wordle exercises vocabulary, pattern recognition and logical deduction, which makes it a good mental workout. Research has not established that it improves general intelligence or prevents cognitive decline, so enjoy it as a game rather than a treatment.',
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
