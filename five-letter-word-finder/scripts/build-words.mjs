// Downloads a large English word list and keeps only 5-letter words -> public/words.json
// Usage: npm run words   (the GitHub Actions workflow runs this before every build)
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SOURCE = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt'
const OUT = path.join(process.cwd(), 'public', 'words.json')

try {
  const res = await fetch(SOURCE)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  const words = [...new Set(text.split(/\r?\n/).map((w) => w.trim().toLowerCase()).filter((w) => /^[a-z]{5}$/.test(w)))].sort()
  if (words.length < 1000) throw new Error(`Only ${words.length} words found, refusing to overwrite`)
  await mkdir(path.dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(words))
  console.log(`Wrote ${words.length} five-letter words to public/words.json`)
} catch (err) {
  const existing = await readFile(OUT, 'utf8').then((t) => JSON.parse(t).length).catch(() => 0)
  console.warn(`Could not refresh word list (${err.message}). Keeping existing list of ${existing} words.`)
}
