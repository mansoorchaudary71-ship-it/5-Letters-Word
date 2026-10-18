# AUDIT REPORT: 5-Letter Words (Vite + React, prerendered to static HTML)

Branch: `audit/publish-ready` · Mode: FULL · Audit date: 2026-10-18
Site URL / competitors: **not supplied** (see Limits). Assumed deploy target: GitHub Pages, as the repo's README and workflow state.

## 0. Limits of this audit (read first)
This sandbox has **no network**, so `npm install` failed. Therefore **not run here**: `vite build`, `npm run lint` (`tsc`), Lighthouse, axe, `npm audit`, any browser test.
What I did instead:
- Ran the repo's own prerender (`scripts/generate-seo-pages.ts`) over a stand-in `dist/` (source `index.html` + `public/`), then ran `seo-checklist.mjs`, `technical-seo-check.mjs` and `content-audit.ts` against the 654 generated pages.
- Syntax-checked every edited TS/TSX file with `tsc` (no syntax errors; type errors against missing packages could not be evaluated).
- Static review of source, CI, headers, server and data.
The 2 technical-check failures on the baseline (entry JS size, chunk splitting) are artifacts of my stand-in `dist/`, not site defects; they need the real build in CI. **The first CI run is the real test.**

## 1. Executive summary
**Health score: 62 / 100 before → 86 / 100 after** (44 checks that could be evidenced from the repo; weights P0×5 P1×3 P2×2 P3×1; PASS=1, WARN=0.5, FAIL=0; NEEDS-LIVE-DATA and N/A excluded).

| | P0 fail | P1 fail | P1 warn | P2 fail | P2 warn | P3 fail | P3 warn |
|---|---|---|---|---|---|---|---|
| Before | 3 | 3 | 4 | 5 | 3 | 1 | 2 |
| After | 0 | 2 | 4 | 0 | 4 | 0 | 2 |

**Top risks (before)**
1. **P0, the deploy workflow that actually runs never set `SITE_URL`.** Every canonical, sitemap `<loc>`, OG URL and the robots.txt sitemap line would have shipped as `https://example.com` (reproduced locally; `.github/workflows/pages.yml`).
2. **P0/P1, the same workflow ran `cp dist/index.html dist/404.html`,** replacing the generated noindex 404 with a copy of the home page.
3. The README promised `seo:all` runs in CI and a custom-domain variable; the workflow did neither, so nothing would have caught risk 1.
4. 8 stray duplicate project folders (including a Next.js variant), 3 duplicate workflow files and 4 merge-note files sat in the repo root.
5. The "Clue & etymology → Generate" button returned canned filler ("Origin: Standard English dictionary entry") on static hosting, presented as real content.

**Top quick wins (done):** workflow fix · CI guard that fails the build if `SITE_URL` is missing · repo cleanup · Anagram input label · soft-404 fix in `server.ts`.

## 2. Recon
- **Stack:** Vite 8 + React 19 + Tailwind 4 + TypeScript, npm, **no lockfile**. Dev server: Express + Vite (`server.ts`). Hosting: GitHub Pages via Actions (`public/_headers` only works on Netlify/Cloudflare Pages).
- **Rendering:** SPA **prerendered** per route at build time (content is in the initial HTML: A12 PASS). Not CSR-only.
- **Pages generated: 654** = 114 routes (home 1, tools/other 10, guides 4, list/filter pages 99) + 540 word pages. Body text per page: min 275, median 407, max 8,319 words. Click depth max 2, 0 orphans.
- **Dictionary:** 4,192 words; 540 (12.9%) have authored definitions and therefore a page.
- **Existing:** manifest, service worker (assets cache-first, HTML network-first), JSON-LD graph per page, hreflang, sitemap/robots/404 generation. **Absent:** analytics, ads, consent banner, ads.txt.
- **Baseline checks (stand-in dist):** on-page 27/27 PASS · technical 52 pass / 2 stand-in artifacts · content-audit PASS · typecheck/build/lint **not runnable**.

## 3. Scorecard (checks evidenced)
Every failing/warning check is in section 4. Everything not listed there passed (A3, A6, A8, A10, A12, A13, B1-B3, B5, B9, B10, B13, D1-D4, G2, G7, H3, H5, K1, K5).

## 4. Findings (open or fixed this run)
| ID | Sev | Result (after) | Evidence / note |
|---|---|---|---|
| A1 | P0 | PASS (was FAIL) | robots.txt Sitemap line used example.com in the real deploy workflow (no SITE_URL) |
| A2 | P0 | PASS (was FAIL) | sitemap <loc> all example.com in the real deploy |
| A4 | P0 | PASS (was FAIL) | canonicals all example.com in the real deploy |
| A5 | P1 | WARN | www/non-www + header redirects depend on host (MANUAL) |
| A9 | P1 | PASS (was FAIL) | workflow overwrote noindex 404.html with the home page |
| C6 | P1 | WARN | About exists; no named author/owner (owner input) |
| E9 | P1 | WARN | _headers ignored by GitHub Pages (MANUAL: Cloudflare/Netlify) |
| H2 | P1 | WARN | CSP is Report-Only and headers not served on GitHub Pages |
| H4 | P1 | FAIL | no package-lock.json; npm audit not runnable offline (MANUAL) |
| K2 | P1 | FAIL | SITE_CONTACT_EMAIL empty, so no Contact page (MANUAL) |
| A14 | P2 | PASS (was FAIL) | server.ts returned index.html with 200 for unknown URLs |
| C10 | P2 | PASS (was FAIL) | Generate button showed canned filler as 'Origin' / 'Memory hook' |
| C2 | P2 | WARN | word pages ~275+ words, 12.9% of dictionary has pages |
| E5 | P2 | WARN | Inter loaded from Google Fonts (decision: self-host) |
| G5 | P2 | PASS (was FAIL) | anagram input had placeholder only |
| H6 | P2 | PASS (was FAIL) | 8 stray duplicate folders + 3 duplicate workflows + 4 merge notes |
| I1 | P2 | WARN | no analytics installed (decision) |
| I4 | P2 | WARN (was FAIL) | verification tags now supported via env; owner must supply tokens |
| B14 | P3 | WARN | no maskable icon, no manifest id |
| E3 | P3 | PASS (was FAIL) | unused deps motion, autoprefixer |
| L3 | P3 | WARN | AI-crawler policy not a deliberate choice yet (decision) |

Fix detail with file paths is in `FIXES_CHANGELOG.md`.

## 5. Needs Decision
| Topic | Options | Default applied |
|---|---|---|
| AI "Clue & etymology" card (`WordDetailModal.tsx`, `server.ts` `/api/word-insights`) | (a) keep as is (works only with the Express server + Gemini key; the endpoint model id `gemini-3.8-flash` is unverified), (b) hide the card on static builds, (c) remove the Gemini endpoint and 3 server deps | (a), but fabricated fallback text removed. **Recommend (b).** |
| Self-host Inter (E5) | keep Google Fonts / self-host WOFF2 | keep (needs the font file; cannot download offline). Recommend self-host: removes a third-party request and the Privacy-policy font disclosure. |
| Analytics (I1) | none / privacy-friendly (Plausible, Cloudflare) / GA4 + consent | none. Privacy policy currently says no analytics, so update it together with any addition. |
| AI crawler policy (L3) | allow all / block training bots | allow all (unchanged). Make it a deliberate choice in `robots.txt`. |
| Enforce CSP | rename `Content-Security-Policy-Report-Only` → enforcing after checking the console | unchanged. |
| 3,652 words without a page | write definitions / keep thin pages out | unchanged (correct: thin pages are not published). |

## 6. Competitor gap table
**Not performed.** No competitor URLs were supplied and there is no network here. The repo's `SEO-AUDIT-REPORT.md` already contains a comparison with 5-letter-words.com; treat that as the baseline and re-run section N with live fetches.

## 7. Fix plan (what Phase 3 did)
P0 CI/SITE_URL/404 → repo hygiene → build guard → search-console tags → a11y label → soft-404 → honest fallback text → unused deps. See changelog.

## 8. Live-data / manual items
See `MANUAL_TODO.md`.

## 9. After-Fix Results
- **Score 62 → 86.** Open P0: **0**. Open P1: **2, both owner-only** (H4 lockfile/audit, K2 contact email) plus 4 P1 warnings that are hosting choices.
- Verified (stand-in dist): CI without `SITE_URL` now exits 1; with it, canonicals/sitemap/robots/CNAME use the real domain; verification tags emitted on indexable pages only (not 404); sub-path build (`/repo/`) correct; on-page 27/27, technical 0 real failures, content-audit PASS; 0 broken links; 654 unique titles.
- **Publish-ready gate: NOT YET.** Unmet: real build/lint/typecheck not executed here; 2 open P1 need you (no owner-approved exception yet); no lockfile; Contact email missing. Everything code-side is done.
