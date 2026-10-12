'use client'

import { useEffect, useState } from 'react'
import { loadWords, wordOfTheDay } from '@/lib/words'

export default function WordOfTheDay() {
  const [word, setWord] = useState<string | null>(null)

  useEffect(() => {
    loadWords()
      .then((words) => setWord(wordOfTheDay(words)))
      .catch(() => setWord(null))
  }, [])

  if (!word) return null

  return (
    <section className="mx-auto max-w-md rounded-xl border border-indigo-200 bg-white p-6 text-center shadow-sm dark:border-indigo-900 dark:bg-gray-800">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Word of the day</h2>
      <p className="font-mono text-4xl font-bold uppercase tracking-widest text-gray-900 dark:text-white">{word}</p>
    </section>
  )
}
