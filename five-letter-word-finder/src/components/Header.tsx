import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          WordFinder5
        </Link>
        <nav aria-label="Main" className="flex gap-6 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <Link href="/word-finder/" className="hover:text-indigo-600">Word Finder</Link>
        </nav>
      </div>
    </header>
  )
}
