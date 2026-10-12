import SearchBar from '@/components/SearchBar'
import WordOfTheDay from '@/components/WordOfTheDay'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto mb-12 max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">Find 5-Letter Words Fast</h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
          The ultimate word finder for Scrabble, Wordle, and vocabulary building
        </p>
        <SearchBar />
      </div>

      <WordOfTheDay />

      <section className="mx-auto mt-16 max-w-3xl text-gray-700 dark:text-gray-300">
        <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">How to find 5-letter words</h2>
        <p>
          Type the letters you already know and use an underscore for each unknown letter. For example,
          <strong>cr_sp</strong> finds crisp, and <strong>cr_pt</strong> finds crypt. Open the advanced filters to require letters
          that must appear somewhere in the word, or to exclude letters you have already ruled out in Wordle.
        </p>
      </section>
    </div>
  )
}
