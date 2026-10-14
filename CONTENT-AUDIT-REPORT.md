# Content audit (2026-10-14)

Scope: all 4,192 dictionary entries, the 3 guides, the 6 tool pages, About / Privacy / Terms, and the 523 generated word pages.
Re-run any time with `npm run content:check` (part of `npm run seo:all`, and of the deploy workflow).

## What the audit found, and what was done

| # | Finding | Action | Result |
|---|---|---|---|
| 1 | **Definitions read like a commercial dictionary** (phrasing typical of published dictionaries, e.g. "Use something to bad effect or for a bad purpose"). Risk: duplicate content and copyright. | Rewrote all **523** authored definitions in original, plain wording, shorter and easier to read. Kept the existing example sentences. | Done |
| 2 | 13 circular definitions (the definition used the word itself) and 4 too-short ones. | Fixed; the audit now fails on circular definitions. | 0 left |
| 3 | 2 example sentences did not contain their word (DIRTY, LYNCH). | Rewrote. | 0 left |
| 4 | **SPRYLY is six letters** and sat in a five-letter dictionary. QUIZZ is not a standard word. | Removed SPRYLY. QUIZZ now says plainly that it is a non-standard spelling (kept because it exists in your list; consider removing it). | Done |
| 5 | PYGMY's human-group sense is considered offensive. | Defined as the adjective / animal sense only. LYNCH is defined neutrally and factually. | Done |
| 6 | **3,669 words (87.5%) have no definition.** All carried the identical line "Valid 5-letter English word for Wordle, Scrabble, and word games." | Replaced with an honest line ("A written definition has not been added for this entry yet."). These words correctly do not get their own page. | Roadmap, see below |
| 7 | Word pages printed raw data ("CRANE is a noun / verb"). | Natural wording ("used as a noun and a verb"). | Done |
| 8 | Word pages had no word-specific analysis beyond scores. | Each page now has a data-driven Wordle note (how many of its letters are among the 8 most common in five-letter words, and the repeated-letter effect), plus a new FAQ "Is X a good Wordle guess?". | Done |
| 9 | About page claimed "thousands" of words and "offensive and adult words are hidden", but the blocklist held 8 words. | Counts are now computed at build time; blocklist extended (HORNY, PORNO, TITTY, COCKS); copy says plainly that the filter is a short list and not exhaustive. Added "Where the definitions come from". | Done |
| 10 | **Privacy policy was out of date**: it said nothing third-party was involved, but the site loads Inter from Google Fonts (which receives visitors' IP addresses). | Added a "Fonts and hosting" section and corrected the cookie/analytics wording. | Done |
| 11 | Terms had no disclaimer, content licence or change clause. | Added "Our content", "Provided as is" and "Changes". Last-updated date refreshed. | Done |
| 12 | The three guides. | Fact-checked: Scrabble tile values, 50-point bonus, -IGHT / -OUND rhyme-trap lists, repeated-letter and Hard Mode rules are all correct. No change needed. | Verified |
| 13 | Six tool pages were thin. | Added 300-650 words each (earlier SEO pass). | Done |

Measured after the changes: word pages average ~250+ words with only 4 shared boilerplate sentences; 637 pages build with no
duplicate titles or descriptions.

## Still open (needs you)

1. **Definitions for the other 3,669 words.** The site only has a page for a word once it has an authored definition. Add entries to
   `RAW_WORDS_DATA` in `src/data/words.ts` (format: `["WORD", "definition.", "noun", "Example sentence."]`). `npm run content:check`
   enforces quality, and each new entry gets a page, a sitemap entry and schema automatically. Prioritize common words first.
2. **Have someone read the 523 new definitions.** I wrote them from my own knowledge and checked them mechanically, but I
   cannot guarantee every sense is right for every word. A quick editorial pass is worth doing before you scale up.
3. **Privacy and Terms are plain-language drafts, not legal advice.** Have them reviewed if you add ads, analytics or accounts.
4. **Contact email.** Set `SITE_CONTACT_EMAIL` in `src/seo/site.ts` to enable the Contact page.
5. Consider removing QUIZZ and other questionable entries from the extended list.
