# FIXES CHANGELOG
Branch `audit/publish-ready`, commits on top of `main` (baseline = the uploaded zip).

## CI / deploy (P0) — resolves A1, A2, A4, A9
- `.github/workflows/pages.yml` rewritten:
  - sets `SITE_URL` (repo variable, default `https://<owner>.github.io/<repo>`), `CUSTOM_DOMAIN`, `VITE_BASE_PATH` (`/` with a custom domain, else `/<repo>/`) and the optional verification tokens;
  - runs `npm run lint` and `npm run seo:all` (README already claimed this);
  - **removed `cp dist/index.html dist/404.html`** so the generated noindex 404 is kept;
  - separate build/deploy jobs, `concurrency`, PRs build and check without deploying.
- `scripts/generate-seo-pages.ts`: when `CI` is set and `SITE_URL` is empty the build now **throws** instead of warning.

## Repo hygiene — resolves H6
Removed (all recoverable from git history): `5-Letters-Word/`, `5-Letters-Word-optimized/`, `5-Letters-Word-seo/`, `five-letter-word-finder/` (Next.js variant), `home-seo-update/`, `seo-update-home-and-anagram/`, `seo-update-wordle-solver/`, root `main.yml`, `deploy.yml`, `pages.yml`, `cleanup.sh`, `MERGE-INSTRUCTIONS.md`, `MERGE-NOTES.md`, `MERGE-SEO-FINAL.md`, `CHANGES.md`. (The repo's own `cleanup.sh` and merge notes asked for exactly this.)

## Search Console readiness — I4
- `scripts/generate-seo-pages.ts`: optional `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` env vars emit `google-site-verification` / `msvalidate.01` meta tags on indexable pages only.

## Accessibility — G5
- `src/components/AnagramSolver.tsx`: main input gets `aria-label`, `autoComplete="off"`, `autoCapitalize`, `spellCheck={false}`.

## Soft-404 — A14
- `server.ts`: unknown URLs in production mode return `404.html` with status 404 (was `index.html` with 200); `x-powered-by` disabled.

## Content honesty — C10
- `src/components/WordDetailModal.tsx` and `server.ts`: fallback "insights" no longer invent a memory hook or origin note; only the letter-position hint (and Scrabble score) remain.

## Dependencies — E3
- `package.json`: removed unused `motion` and `autoprefixer` (no imports/postcss config; Tailwind 4 uses the Vite plugin). Lockfile could not be regenerated offline.

## Not changed on purpose
Calculation/word logic, routes, URLs, content, data. No redirects were needed (no URL changes).
