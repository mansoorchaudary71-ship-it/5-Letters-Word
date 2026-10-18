# MANUAL TODO (owner-only)

## Before first deploy
1. **Run the real pipeline once** (could not be run here): `npm install && npm run lint && npm run build && npm run seo:all`. Fix anything it reports; I could only verify the prerender/SEO layer.
2. **Commit a lockfile:** run `npm install` locally, commit `package-lock.json`, then switch CI to `npm ci` (H4). Run `npm audit` and patch high/critical findings.
3. **Set GitHub repo variables** (Settings → Secrets and variables → Actions → Variables): `SITE_URL` (e.g. `https://yourdomain.com`), `CUSTOM_DOMAIN` (same host, no scheme). Without a custom domain the default `https://<owner>.github.io/<repo>` is used.
4. **Set `SITE_CONTACT_EMAIL`** in `src/seo/site.ts` (K2). It enables the Contact page, footer link and Organization schema email. Required for trust and for any ad network.
5. Settings → Pages → Source = **GitHub Actions**; tick **Enforce HTTPS**.
6. Optional: add `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` variables (token value only, no `<meta>`).
7. Add a visible **named owner/author** to About (C6); I did not invent one.
8. Have Privacy/Terms reviewed (they are plain-language drafts) and have someone proofread the 523 rewritten definitions (from the earlier content audit).

## Decisions (see AUDIT_REPORT section 5)
Hide or remove the AI insights card · self-host Inter · analytics · AI-crawler policy · enforce CSP.

## Hosting headers (E9, H2, A5)
GitHub Pages ignores `public/_headers`. Put Cloudflare (free) in front, or move to Netlify/Cloudflare Pages, to get HSTS, CSP, immutable caching, Brotli and www→apex redirect.

## Live-data items (cannot be measured from code)
| Item | Tool | "Good" looks like |
|---|---|---|
| Index coverage, manual actions | Search Console → Pages | 654 submitted, ~all indexed, 0 actions |
| Rankings / CTR by query | Search Console → Performance | impressions rising for "5 letter words", "wordle solver" |
| Real-user Core Web Vitals | PageSpeed Insights / CrUX after ~28 days | LCP < 2.5 s, INP < 200 ms, CLS < 0.1 |
| Lighthouse / axe | Chrome DevTools on `/`, `/wordle-solver/`, a word page | Perf ≥ 90, A11y ≥ 95 mobile |
| Backlinks, referring-domain gap | Ahrefs / Semrush / GSC Links | growing referring domains, no toxic spikes |
| Competitor gap | fetch 3-5 competitors | content/tool parity on top queries |
| Social profiles, directories, digital PR | manual | consistent brand name; add `sameAs` to Organization schema once profiles exist |

## Post-deploy checklist
1. Submit `/sitemap.xml` in Search Console and Bing Webmaster Tools. 2. Request indexing for `/`, `/wordle-solver/`, `/anagram-solver/`, `/wordle-practice/`. 3. `curl -I` the live site; check redirects/HTTPS/headers (securityheaders.com). 4. Confirm a bad URL returns **404** with the noindex page. 5. Rich Results Test on one word page and one guide. 6. Re-audit quarterly.
