const MAX_SHOWN = 500

export default function WordGrid({ words }: { words: string[] }) {
  const shown = words.slice(0, MAX_SHOWN)

  return (
    <section aria-live="polite" className="mt-8">
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        {words.length.toLocaleString()} word{words.length === 1 ? '' : 's'} found
        {words.length > MAX_SHOWN && ` (showing the first ${MAX_SHOWN})`}
      </p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {shown.map((word) => (
          <li
            key={word}
            className="rounded-md border border-gray-200 bg-white py-2 text-center font-mono text-lg uppercase tracking-widest text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {word}
          </li>
        ))}
      </ul>
    </section>
  )
}
