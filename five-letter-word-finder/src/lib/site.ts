// Set NEXT_PUBLIC_SITE_URL to your real domain (no trailing slash) for correct canonical URLs and sitemap.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '')
export const SITE_NAME = 'WordFinder5'
export const SITE_DESCRIPTION = 'Find 5-letter words for Wordle, Scrabble and vocabulary building. Free word finder with letter patterns, include and exclude filters.'
