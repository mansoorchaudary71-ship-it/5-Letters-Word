# WordFinder5 – 5-Letter Word Finder

A free 5-letter word finder for Wordle, Scrabble and word games. Built with Next.js (App Router), TypeScript and Tailwind CSS, exported as a fully static site so it deploys to GitHub Pages with no server.

## Features
- Pattern search (`cr_sp`), "must contain" and "must not contain" letter filters
- Daily word of the day (changes without a rebuild)
- SEO: metadata, canonical URLs, Open Graph, JSON-LD (WebApplication + FAQPage), `sitemap.xml`, `robots.txt`
- Dark mode (follows the visitor's system setting), mobile-first layout

## Run locally
```bash
npm install
npm run words   # downloads the full 5-letter word list (optional, a starter list is included)
npm run dev     # http://localhost:3000
```

## Deploy to GitHub Pages
1. Create a GitHub repo and push this project to the `main` branch.
2. In the repo go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` installs, refreshes the word list, builds and publishes the site.

The site appears at `https://<your-user>.github.io/<repo-name>/`.

**Custom domain or `<user>.github.io` repo:** edit `.github/workflows/deploy.yml` and set `NEXT_PUBLIC_BASE_PATH` to an empty string and `NEXT_PUBLIC_SITE_URL` to your domain (for example `https://yourdomain.com`).

## Project structure
```
.github/workflows/deploy.yml   GitHub Pages deployment
scripts/build-words.mjs        builds public/words.json (5-letter words only)
public/words.json              word list (starter list; replaced by `npm run words`)
src/app/                       layout, home, /word-finder, sitemap, robots
src/components/                Header, Footer, SearchBar, WordGrid, WordOfTheDay
src/lib/words.ts               load, search and word-of-the-day logic
src/lib/site.ts                site name, description, URL
```

## Next steps for SEO
Replace the placeholder name "WordFinder5" in `src/lib/site.ts`, `Header.tsx` and `Footer.tsx`, add more content pages (Wordle helper, Scrabble words, blog), and register the sitemap in Google Search Console.
