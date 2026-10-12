export const WORD_LENGTH = 5

export interface SearchQuery {
  /** Letters in position. "_" (or "?" / ".") is any single letter, e.g. "cr_sp". Shorter input matches anywhere in the word. */
  pattern: string
  /** Letters the word must contain (any position), e.g. "ae" */
  include: string
  /** Letters the word must NOT contain, e.g. "xyz" */
  exclude: string
}

let cache: Promise<string[]> | null = null

/** Loads the word list once (public/words.json) and caches it for the session. */
export function loadWords(): Promise<string[]> {
  if (!cache) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
    cache = fetch(`${base}/words.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load word list (${res.status})`)
        return res.json() as Promise<string[]>
      })
      .catch((err) => {
        cache = null
        throw err
      })
  }
  return cache
}

const onlyLetters = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '')

export function searchWords(words: string[], query: SearchQuery): string[] {
  const pattern = query.pattern.toLowerCase().replace(/[^a-z_?.]/g, '').replace(/[?.]/g, '_')
  const include = [...new Set(onlyLetters(query.include))]
  const exclude = [...new Set(onlyLetters(query.exclude))]

  const body = pattern.replace(/_/g, '[a-z]')
  const regex = pattern ? new RegExp(pattern.length === WORD_LENGTH ? `^${body}$` : body) : null

  return words.filter(
    (word) =>
      (!regex || regex.test(word)) &&
      include.every((letter) => word.includes(letter)) &&
      !exclude.some((letter) => word.includes(letter)),
  )
}

/** Same word for everyone on a given (UTC) day; changes daily without a rebuild. */
export function wordOfTheDay(words: string[], date: Date = new Date()): string | null {
  if (words.length === 0) return null
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000)
  return words[day % words.length]
}
