export const SCRABBLE_VALUES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1,
  J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1,
  S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

export const WWF_VALUES: Record<string, number> = {
  A: 1, B: 4, C: 4, D: 2, E: 1, F: 4, G: 3, H: 3, I: 1,
  J: 10, K: 5, L: 2, M: 4, N: 2, O: 1, P: 4, Q: 10, R: 1,
  S: 1, T: 1, U: 2, V: 5, W: 4, X: 8, Y: 3, Z: 10
};

export function calculateScrabbleScore(word: string): number {
  return word.toUpperCase().split('').reduce((acc, char) => acc + (SCRABBLE_VALUES[char] || 0), 0);
}

export function calculateWwfScore(word: string): number {
  return word.toUpperCase().split('').reduce((acc, char) => acc + (WWF_VALUES[char] || 0), 0);
}

export function countVowels(word: string): number {
  return (word.toUpperCase().match(/[AEIOU]/g) || []).length;
}

export function hasDoubleLetters(word: string): boolean {
  const upper = word.toUpperCase();
  for (let i = 0; i < upper.length - 1; i++) {
    if (upper[i] === upper[i + 1]) return true;
  }
  return false;
}

export function isPalindrome(word: string): boolean {
  const upper = word.toUpperCase();
  return upper === upper.split('').reverse().join('');
}
