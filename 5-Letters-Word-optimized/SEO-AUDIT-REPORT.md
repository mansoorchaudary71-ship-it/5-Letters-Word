# SEO audit and comparison: your site vs 5-letter-words.com

Date: 2026-10-12. Scope: on-page SEO, technical SEO and content, based on your repository and on the competitor's
home page, a letter page, `sitemap.xml` and `robots.txt`.

**What this audit is not.** No Lighthouse, PageSpeed, Search Console, traffic or backlink data was available, and the
competitor was read through page fetches (not raw HTML), so details such as exact schema output should be re-checked
with Google's Rich Results Test. Nobody can promise a ranking position. The changes below remove the technical and
content gaps and add depth the competitor lacks, but the competitor's domain age (copyright line 2022-2026) and
backlinks are advantages that code cannot change.

## 1. Side-by-side comparison

| Area | 5-letter-words.com (competitor) | Your repo BEFORE | Your repo AFTER (this zip) |
|---|---|---|---|
| Indexable URLs | 140 (home, 3/4/6/7-letter hubs, A-Z pages for 3-7 letters, 5 info pages) | 1 in the root app; about 58 in the `-seo` variant | 637 (114 routes + 523 word pages), all in the sitemap |
| Pre-rendered HTML | Yes | Root app: empty `<div id="root">` | Real HTML per page (headings, text, lists, FAQ, links) |
| Title tags | Generic on home; letter pages have no brand | One title for the whole site (root app) | Unique, 60 characters or fewer, checked at build |
| Meta descriptions | About 140 characters, templated | One for the whole site | Unique, 160 characters or fewer, include real word counts |
| Open Graph / Twitter | Generic site text on every page (not page-specific) | One set for the site | Page-specific, with `og:image`, `og:locale` and `og:image:alt` |
| Canonical | Yes | None | Yes, on every page |
| Structured data | None seen | One `WebApplication` block | WebSite, Organization, WebApplication, CollectionPage + ItemList, Article, DefinedTerm, BreadcrumbList, FAQPage |
| Breadcrumbs | None | None | Visible and in schema |
| Content per word | Words plus Scrabble score only, no definitions | Definitions in the app only | 523 pages with definition, example, score, anagrams, FAQ |
| Letter-page copy | Same roughly 250-300 word template on every page | Same template on every page | Copy computed from the data per page (counts, common next letters, top-scoring words) |
| Tools | Finder, A-Z lists, Subway Rush game links | Finder, Wordle solver, anagram solver, practice game, letter stats | Same, each on its own URL, plus guides |
| Word lengths | 3, 4, 5, 6 and 7 letters | 5 only | 5 only (see "Not done") |
| Trust pages | Contact, Privacy, Cookie, Sitemap, Change log | None | About, Privacy, Terms, Sitemap; Contact once you set an email |
| Internal links | About 180 per page, mostly directory lists | Buttons and divs, which crawlers do not follow | Real `<a href>` links, hub pages, related links, word-to-list links |
| Known flaws seen | Empty link targets, generic OG tags, missing-space heading text | `404.html` was a copy of the home page without `noindex`; fetch-override script in `index.html` | Fixed (see below) |

## 2. Findings and what was changed

### On-page SEO
1. Single title and description for the whole root app -> unique title and description per URL, with length, duplicate-title and duplicate-description checks that run on every build.
2. The in-app H1 differed from the prerendered H1 on several pages -> one H1 per page, identical before and after hydration (verified in a headless browser).
3. Social tags were generic -> page-specific Open Graph and Twitter tags.
4. No breadcrumbs -> visible breadcrumbs plus `BreadcrumbList` schema.
5. Generic sentence ("Valid 5-letter English word...") repeated on hundreds of word cards -> hidden for words without a definition.

### Technical SEO
1. SPA with one URL -> every tool, list and word has its own URL (`src/seo/routes.ts`), with back/forward support.
2. Empty HTML shell -> `scripts/generate-seo-pages.ts` writes real HTML into `dist/` after `vite build`.
3. No `sitemap.xml`, `robots.txt` or canonical -> generated at build; `lastmod` is the `CONTENT_UPDATED` constant, so it only changes when you change content.
4. Deploy workflow copied `index.html` over `404.html` (indexable duplicate of the home page) -> the build writes a dedicated `noindex` 404 page and the workflow no longer overwrites it.
5. Three app copies and several duplicate workflow files in the repo -> one project, one workflow (`.github/workflows/deploy.yml`) that sets `SITE_URL` and the base path itself.
6. Data-URI favicon and no icons -> `favicon.svg`, 32/48 px PNGs, `apple-touch-icon`, `manifest.webmanifest`.
7. Secondary tools were in the main JavaScript bundle -> lazy-loaded chunks, so the home page loads less JavaScript.
8. Accessibility and crawl basics: skip link, `<main id>`, `aria-current` on navigation, real links in header/footer/content.
9. Leftover `window.fetch` override script removed from `index.html`.
10. `public/_headers` (security and cache headers) for Netlify or Cloudflare Pages. GitHub Pages ignores it.
11. Internal-link check at build: every internal link must point to a page that exists. This caught 22 broken links in the new page set during development.

### Content
1. 523 word pages (only words that have a real definition get one, so no thin pages).
2. 100 list pages: A-Z starting, ending and containing a letter, plus common letter pairs (ST, CH, SH...) and endings (ER, ED, LY...). Pages with fewer than 10 words are never created.
3. Three guides (Wordle strategy, Scrabble five-letter words, finding a word from known letters) and an About page, plus Privacy and Terms.
4. A longer home page (about 370 words of prose plus link hubs) with a how-to-use section and FAQ.
5. A visible sitemap page that links to every page.

## 3. Still to do (cannot be done in code)
1. **Set the real domain.** Add a repository variable `SITE_URL` (for example `https://yourdomain.com`) and optionally `CUSTOM_DOMAIN`. Without a custom domain the workflow uses `https://<user>.github.io/<repo>/`. Canonical URLs and the sitemap depend on this.
2. **Set `SITE_CONTACT_EMAIL`** in `src/seo/site.ts`. This enables the Contact page and the footer link. A visible, reachable contact is a trust signal and is needed for ad networks. I did not publish your email address because you did not ask me to.
3. **Submit `sitemap.xml`** in Google Search Console and request indexing of the home page and the main tools.
4. **Write more real definitions.** Only 523 of about 4,200 words have one; each new definition adds a word page. Add entries to `RAW_WORDS_DATA` in `src/data/words.ts`.
5. **Backlinks and brand.** This is the competitor's biggest lead. Outreach, word-game communities and useful guides help here.
6. **Measure.** Run Lighthouse or PageSpeed on the deployed URL and watch Core Web Vitals. I could not run these here.
7. **Review the Privacy Policy and Terms** with someone qualified before adding analytics or ads. They are plain templates and not legal advice.

## 4. Not done, and why
- **3, 4, 6 and 7-letter word pages.** The competitor's 130 A-Z pages come from these. It needs a licensed word list for each length and a decision to widen the brand beyond five-letter words, so I did not do it unasked. It is the largest remaining coverage gap.
- **FAQ rich results.** FAQ schema is included, but Google now shows FAQ rich results only for a small set of sites, so do not expect extra search real estate from it.
- **Search box schema (`SearchAction`).** Needs a URL-based search page, which the app does not have.

## 5. How the build works
`npm run build` = `vite build` + `tsx scripts/generate-seo-pages.ts`. Edit page text in `src/seo/` (`routes.ts`, `pages.ts`, `content.ts`, `site.ts`).
Set `SEO_STRICT=1` to make the build fail on any title, description, duplicate or broken-link problem (the workflow does this).

## 6. Verification performed
- The generator ran against all 637 pages: no title, description, duplicate or broken-link problems.
- The SEO modules type-check under `tsc --strict`.
- The React app was bundled with esbuild (all imports resolve, lazy chunks split) and run in headless Chromium with the icon library stubbed. Checked: one H1 per page matching the prerendered HTML, title and canonical updating on in-app navigation, back button, lazy tool pages, filters on list pages, noindex 404 fallback and no horizontal scroll at 390 px width.
- **Not run:** the real `npm install` and `vite build`, because the npm registry was blocked in this workspace. Run `npm install && npm run build` once locally or let the GitHub workflow do it. If anything fails there, the log will name the file.
