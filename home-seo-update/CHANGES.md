# Home page SEO update (primary term: "5 letter words")
Copy these files over the same paths in your repo root, then run `npm run build && npm run seo:all`.
- src/seo/routes.ts: home title, meta description, H1, intro, 8 keyword-grouped sections (H2 with H3 subsections), 12-question FAQ (feeds FAQPage JSON-LD), hub links
- src/components/SeoContent.tsx: renders optional H3 subsections; home "About" heading
- scripts/generate-seo-pages.ts: writes the same H3 subsections into the prerendered HTML
- src/components/WordFinder.tsx, Hero.tsx, index.html: text only (tool H2, hero paragraph, fallback title)
