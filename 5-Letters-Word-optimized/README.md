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
