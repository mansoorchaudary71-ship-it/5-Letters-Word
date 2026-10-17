# SEO update: Anagram Solver page (/anagram-solver/) + earlier home page update
This zip is cumulative: it includes the earlier home-page changes, so copy all files over your repo root
(if you already merged the previous zip, these files supersede it). Then run `npm run build && npm run seo:all`.
- src/seo/routes.ts: home page content + anagram route (title, description, H1, intro, 11-question FAQ)
- src/seo/toolContent.ts: anagram page sections (H2/H3)
- src/components/SeoContent.tsx, scripts/generate-seo-pages.ts: H3 subsection support (app + prerendered HTML)
- src/components/AnagramSolver.tsx: tool H1 and intro line text only
- Hero.tsx, WordFinder.tsx, index.html: text only (home page)
