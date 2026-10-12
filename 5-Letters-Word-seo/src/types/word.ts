export interface WordEntry {
  word: string;
  definition: string;
  partOfSpeech: string;
  example?: string;
  scrabbleScore: number;
  wwfScore: number;
  vowels: number;
  isCommon: boolean;
  isWordleAnswer: boolean;
  tags: string[];
}

export type SortOption = 'alpha-asc' | 'alpha-desc' | 'scrabble-desc' | 'scrabble-asc' | 'popularity' | 'vowels-desc';

export interface FilterState {
  search: string;
  startsWith: string;
  endsWith: string;
  contains: string;
  excludes: string;
  pattern: string; // e.g. "S__RT" or "A.P.E"
  vowelFilter: string; // 'all' | '0' | '1' | '2' | '3' | '4+'
  minScore: number;
  maxScore: number;
  tag: string; // 'all' | 'palindrome' | 'no-vowels' | 'double-letters' | 'wordle-top' | 'high-scoring'
  sortBy: SortOption;
}

export interface WordleTileState {
  letter: string;
  status: 'correct' | 'present' | 'absent' | 'empty'; // correct = green, present = yellow, absent = gray
}

export interface WordleLetterRule {
  letter: string;
  status: 'green' | 'yellow' | 'gray';
  position?: number;
}
