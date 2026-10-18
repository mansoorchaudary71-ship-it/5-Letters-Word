# 5-Letter Words

Word finder, Wordle solver, anagram solver and dictionary for five-letter words. React + Vite + Tailwind, pre-rendered to static HTML for SEO.

## Run
```bash
npm install
npm run dev      # local development (Express + Vite)
npm run build    # vite build + SEO page generation into dist/
npm run preview  # serve dist/
```

## Deploy (GitHub Pages)
1. Push to `main`. In Settings > Pages choose "GitHub Actions" as the source.
2. Default URL: `https://<user>.github.io/<repo>/`. For a custom domain add repository variables
   `SITE_URL` (e.g. `https://yourdomain.com`) and optionally `CUSTOM_DOMAIN` (e.g. `yourdomain.com`).
3. Set `SITE_CONTACT_EMAIL` in `src/seo/site.ts` to enable the Contact page.
4. Submit `<SITE_URL>/sitemap.xml` in Google Search Console.

## Where things live
- `src/seo/site.ts` site name, contact email, content date
- `src/seo/routes.ts` every URL, title, description, FAQ
- `src/seo/pages.ts` guides, About, Privacy, Terms
- `src/seo/content.ts` text generated from the word data (list pages, word pages)
- `scripts/generate-seo-pages.ts` prerendering, schema, sitemap, robots, 404
- `src/data/words.ts` the dictionary (add definitions to `RAW_WORDS_DATA` to create new word pages)

See `SEO-AUDIT-REPORT.md` for the audit and the comparison with 5-letter-words.com.

## Design system (Mobbin-inspired refresh)

The UI follows a restrained "ink on paper" language: white canvas, near-black primary actions, hairline borders,
pill controls, generous whitespace and tight display typography (Inter). Colour is reserved for content (Wordle
tile states `hit` / `near` / `miss`).

- **Tokens**: `src/index.css` (`@theme`): ink/paper/canvas, tile colours, neutral scale, shadows, motion.
- **New components**: `Hero` (animated word marquee), `ToolsGrid`, `CommandPalette` (Ctrl/Cmd+K or `/`), `CtaBand`, `ui/WordTiles`.
- **Shared hooks/helpers**: `hooks/useDialog` (Esc, scroll lock, focus restore), `lib/clipboard` (safe copy with fallback).
- **Deploy**: `.github/workflows/pages.yml` builds with the right base path and `SITE_URL`.
  Optional repo variables: `SITE_URL`, `CUSTOM_DOMAIN`.

## Technical SEO

`npm run seo:all` (run automatically in the deploy workflow) audits the built site in `dist/`:

- `scripts/seo-checklist.mjs`: on-page checks (titles, descriptions, headings, schema, content depth, links).
- `scripts/technical-seo-check.mjs`: crawlability (robots, sitemap, link graph, click depth, orphans, broken links),
  indexability (canonicals, robots meta, hreflang, URL hygiene), structured-data validity, HTML hygiene,
  performance budgets (needs the real `vite build` output), manifest/icons/social images and security headers.

### Hosting and headers
`public/_headers` (HSTS, nosniff, frame protection, CSP in report-only mode, immutable caching for `/assets/*`) is applied
by **Netlify and Cloudflare Pages only**. **GitHub Pages ignores it** and cannot set custom response headers. If you
stay on GitHub Pages, put Cloudflare (free plan) in front of your custom domain to get these headers, a www/non-www
redirect and Brotli. Enable "Enforce HTTPS" in the repository's Pages settings either way.
The CSP is `Report-Only` on purpose: check the browser console for violations, then rename it to
`Content-Security-Policy` to enforce it.

