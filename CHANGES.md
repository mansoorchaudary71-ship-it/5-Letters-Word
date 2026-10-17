# Wordle Practice page (/wordle-practice/) - SEO update (cumulative)

Unzip over the project root (the folder containing package.json). This set also includes the earlier
Letter Frequency changes, because both pages share routes.ts / toolContent.ts / App.tsx and the H3 `subsections` support.
If you already merged the Letter Frequency zip, these files simply supersede it.

| File | Change |
|---|---|
| src/seo/routes.ts | /wordle-practice/ title, description, H1, intro; FAQ moved into toolContent; `Subsection` type |
| src/seo/toolContent.ts | Wordle practice sections (H2/H3) + 13-question FAQ; numbers computed from the word lists |
| src/components/WordleGame.tsx | H1 comes from the route (`heading` prop); subtitle text only. Game logic untouched |
| src/App.tsx | Passes `route.h1` to WordleGame and LetterStatsView |
| src/components/SeoContent.tsx, scripts/generate-seo-pages.ts | Render `subsections` as H3 (visible + prerendered) |
| src/data/letterStats.ts, src/components/LetterStatsView.tsx | Letter Frequency page (previous task) |

After merging: `npm run build && npm run seo:all`
