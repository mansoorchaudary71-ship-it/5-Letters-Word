# Cumulative SEO update (replaces home-seo-update, seo-update-home-and-anagram, seo-update-wordle-solver)

1. Copy every file in this zip over the same path in your repo root (10 files, no other files are touched).
2. Run `sh cleanup.sh` to delete the stray folders, then `npm run lint && npm run build && npm run seo:all`.
Do NOT copy anything from the older update folders: they would overwrite Practice and Letter Frequency work.

## What changed
- Home (/): primary term "5 letter word finder". New title/H1/meta, 11 H2 / 18 H3, 16 FAQs. Wordle and anagram terms removed from title and meta (cannibalization).
- /wordle-solver/: new title/meta/H1, 7 H2 / 18 H3, 14 FAQs. Copy corrected: results are alphabetical (up to 96), only the top-8 suggestions are ranked.
- /anagram-solver/: new title/meta, H1 now comes from the route, 5 H2 / 11 H3, 11 FAQs (blank tiles, longer racks, multi-word/names limits).
- /best-wordle-starting-words/: replaced thin templated intro and FAQ with a computed hub (13 H3, 8 FAQs); other pages now point to it instead of repeating answers.
- /wordle-practice/: explicit "unlimited practice game" section and FAQ; shortened duplicate starter-word FAQ.
- 17 new word definitions (USURY, COPSE, THETA, ELEGY, USURP, ELECT, RITES, STREW, SURGE, SURLY, ADIEU, AROSE, ORATE, ROAST, SLATE, STARE, TRACE) = 17 new /word/ pages. They also join the Practice answer pool.
- Practice and Letter Frequency copy and H1 wiring are unchanged.
