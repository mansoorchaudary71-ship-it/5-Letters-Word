'use client'

import { useState } from 'react'
import WordGrid from './WordGrid'
import { loadWords, searchWords } from '@/lib/words'

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'

export default function SearchBar() {
  const [pattern, setPattern] = useState('')
  const [include, setInclude] = useState('')
  const [exclude, setExclude] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [results, setResults] = useState<string[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const hasInput = pattern.trim() !== '' || include.trim() !== '' || exclude.trim() !== ''

  const handleSearch = async () => {
    if (!hasInput) return
    setIsLoading(true)
    setError('')
    try {
      const words = await loadWords()
      setResults(searchWords(words, { pattern, include, exclude }))
    } catch {
      setError('Could not load the word list. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="mx-auto max-w-2xl text-left">
      <label htmlFor="pattern" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Known letters (use _ for unknown, e.g. cr_sp)
      </label>
      <div className="flex gap-2">
        <input
          id="pattern"
          type="text"
          value={pattern}
          maxLength={5}
          onChange={(e) => setPattern(e.target.value)}
          onKeyDown={onEnter}
          placeholder="cr_sp"
          autoComplete="off"
          className={inputClass}
        />
        <button
          onClick={handleSearch}
          disabled={!hasInput || isLoading}
          className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? '...' : 'Search'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-3 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        aria-expanded={showAdvanced}
      >
        {showAdvanced ? 'Hide' : 'Show'} advanced filters
      </button>

      {showAdvanced && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="include" className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
              Must contain letters
            </label>
            <input id="include" value={include} onChange={(e) => setInclude(e.target.value)} onKeyDown={onEnter} placeholder="ae" className={inputClass} />
          </div>
          <div>
            <label htmlFor="exclude" className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
              Must not contain letters
            </label>
            <input id="exclude" value={exclude} onChange={(e) => setExclude(e.target.value)} onKeyDown={onEnter} placeholder="xyz" className={inputClass} />
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {results && !error && (results.length > 0 ? <WordGrid words={results} /> : <p className="mt-8 text-center text-gray-600 dark:text-gray-300">No words match. Try fewer filters.</p>)}
    </div>
  )
}
