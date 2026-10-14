import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('fav_5letter_words');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fav_5letter_words', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (word: string) => {
    const upper = word.toUpperCase();
    setFavorites((prev) =>
      prev.includes(upper) ? prev.filter((w) => w !== upper) : [...prev, upper]
    );
  };

  const isFavorite = (word: string) => favorites.includes(word.toUpperCase());

  const clearFavorites = () => setFavorites([]);

  return { favorites, toggleFavorite, isFavorite, clearFavorites };
}
