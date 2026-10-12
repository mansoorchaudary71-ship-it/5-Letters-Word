import type { Metadata } from 'next'
import SearchBar from '@/components/SearchBar'
import WordOfTheDay from '@/components/WordOfTheDay'

export const metadata: Metadata = {
  title: '5-Letter Word Finder',
  description: 'Search 5-letter words by known letters, required letters and excluded letters. Built for Wordle, Scrabble and word puzzles.',
  alternates: { canonical: '/word-finder/' },
}

const faq = [
  {
    q: 'How do I find a 5-letter word with missing letters?',
    a: 'Enter the letters you know and use an underscore for every missing letter, for example cr_sp.',
  },
  {
    q: 'Can I use this as a Wordle helper?',
    a: 'Yes. Put green letters in the pattern, yellow letters in "must contain" and grey letters in "must not contain".',
  },
  {
    q: 'Is the 5-letter word finder free?',
    a: 'Yes, it is completely free and runs in your browser with no sign-up.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function WordFinderPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">5-Letter Word Finder</h1>

        <SearchBar />

        <div className="mt-16">
          <WordOfTheDay />
        </div>

        <section className="mt-16 text-gray-700 dark:text-gray-300">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Frequently asked questions</h2>
          {faq.map(({ q, a }) => (
            <div key={q} className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
