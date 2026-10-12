# SEO audit: 5-Letters-Word

Scope: code review of the repository (no live URL was crawled, no Lighthouse or Search Console data was available).

## Findings and fixes

| # | Area | Problem found | Fix in this version |
|---|------|---------------|---------------------|
| 1 | Technical | The whole site was one URL (`/`). Tabs were React state, so Wordle Solver, Anagram Solver, etc. could never rank on their own. | Every tool and filter has its own URL (`src/seo/routes.ts`), with back/forward support in `App.tsx`. |
| 2 | Technical | Navigation used `<button>` and `<div onClick>`. Crawlers follow `<a href>` only, so no internal links existed. | Header and Footer now use real `<a href>` links (in-app click handling is kept). |
| 3 | Technical | `index.html` was an empty `<div id="root">`. Without JavaScript there was no content. | After `vite build`, `scripts/generate-seo-pages.ts` writes a real HTML page per route with headings, text, FAQ and word lists. |
| 4 | On-page | One title, description and JSON-LD for the entire site. | Unique title (<= 60 chars), description (<= 160), canonical, Open Graph, Twitter tags, and BreadcrumbList/FAQPage/WebApplication schema per page. Tags also update on in-app navigation. |
| 5 | Technical | No `sitemap.xml`, `robots.txt`, `404.html`, canonical or `og:image`. | All generated at build. `og-image.png` added in `public/`. |
| 6 | Content | Thin pages: words without a hand-written definition all show the same generic sentence. | Static pages list only words with real definitions in full, the rest as a plain word list. Add real definitions over time (see below). |
| 7 | Content | Only the tool UI, almost no descriptive text. | Unique intro text and FAQ per page, visible in the app (`SeoContent.tsx`) and in the prerendered HTML so the structured data matches visible content. |
| 8 | Content / brand safety | Offensive words (slurs, sexual terms) were in the list. | `BLOCKED_WORDS` in `src/data/words.ts` hides them. Empty the set to restore a full Scrabble list. |
| 9 | Technical | Pages for letters with almost no words (ending in J, Q, V...) would be empty. | Routes with fewer than 10 words are not generated, linked or added to the sitemap. |
| 10 | Technical | A script in `index.html` that overrides `window.fetch` (AI Studio leftover). | Removed. |
| 11 | Accessibility | Logo was a clickable `<div>`; current page not announced. | Logo is a link with `aria-label`; active nav item has `aria-current="page"`. |

## Still to do (cannot be done in code)
- **Submit the sitemap** in Google Search Console after deploying and request indexing for the home page.
- **Custom domain:** `robots.txt` is only read at the root of a host. On `user.github.io/<repo>/` Google ignores it; use a custom domain (or a `<user>.github.io` repo) for full control. Then set `VITE_BASE_PATH` to `/` and `SITE_URL` to your domain in `.github/workflows/deploy.yml`.
- **Write real definitions** for the words that still show the generic sentence, starting with the most-searched ones. This is the biggest content gap against competitors.
- **Backlinks and brand:** the site has no About, Privacy or Contact page. Add them before applying for ads.
- **Measure:** run Lighthouse / PageSpeed on the deployed URL and check Core Web Vitals. The word data is bundled in the JavaScript (about 120 KB source), which is fine now but should be watched if the list grows.
- **AI hints:** `/api/word-insights` needs the Express server and does not exist on GitHub Pages; the app falls back to simple hints there.

## How it works
`npm run build` = `vite build` + `tsx scripts/generate-seo-pages.ts`. Route text lives in `src/seo/routes.ts`; edit titles, descriptions, intro text and FAQs there.
