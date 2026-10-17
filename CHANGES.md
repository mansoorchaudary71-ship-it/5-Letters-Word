# Letter Frequency page (/letter-frequency/) - SEO update

Unzip over the project root (paths match the repo root, i.e. the folder that contains package.json).

| File | Change |
|---|---|
| src/seo/routes.ts | New title / meta description / H1 / intro for the page; `Subsection` type (H3) added to `Section` |
| src/seo/toolContent.ts | All new sections, H3 subsections and 12-question FAQ (numbers computed from the word list) |
| src/data/letterStats.ts | Added `ENGLISH_LETTER_FREQUENCY` (A-Z, Lewand) |
| src/components/LetterStatsView.tsx | New headings, intro text, and an English A-Z chart card (same classes as the existing chart) |
| src/components/SeoContent.tsx | Renders `subsections` as `<h3>` |
| scripts/generate-seo-pages.ts | Prerenders `subsections` as `<h3>` |
| src/App.tsx | One line: passes `route.h1` to `LetterStatsView` |

After merging: `npm run build && npm run seo:all`
