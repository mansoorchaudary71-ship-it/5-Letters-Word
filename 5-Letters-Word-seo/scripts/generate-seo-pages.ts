/**
 * Post-build step (runs after `vite build`): turns the single-page app into real, crawlable pages.
 *
 * For every route in src/seo/routes.ts it writes dist/<route>/index.html containing:
 *   - a unique <title>, meta description, canonical URL, Open Graph / Twitter tags and JSON-LD
 *   - visible HTML content (headings, text, FAQ, word lists) inside #root, which React replaces on load
 * It also writes sitemap.xml, robots.txt and 404.html.
 *
 * Environment:
 *   SITE_URL        full public URL of the site including the repo path, no trailing slash
 *                   e.g. https://username.github.io/5-Letters-Word
 *   VITE_BASE_PATH  the same base path that Vite used, e.g. /5-Letters-Word/  (default "/")
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ALL_WORDS } from '../src/data/words';
import { ALL_ROUTES, HOME_ROUTE, LETTERS, SITE_NAME, RouteInfo } from '../src/seo/routes';

const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
const BASE = (process.env.VITE_BASE_PATH || '/').replace(/\/$/, ''); // "" or "/repo"
const DIST = path.resolve(process.cwd(), 'dist');

if (!SITE_URL) {
  console.warn('WARNING: SITE_URL is not set. Canonical URLs and sitemap.xml will use https://example.com. Set SITE_URL before deploying.');
}
const ORIGIN = SITE_URL || 'https://example.com';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (p: string) => `${ORIGIN}${p}`;
const href = (p: string) => `${BASE}${p}`;

function wordsFor(route: RouteInfo) {
  const { startsWith, endsWith, tag } = route.filter;
  let list = ALL_WORDS;
  if (startsWith) list = list.filter((w) => w.word.startsWith(startsWith.toUpperCase()));
  else if (endsWith) list = list.filter((w) => w.word.endsWith(endsWith.toUpperCase()));
  else if (tag) list = list.filter((w) => w.tags.includes(tag));
  else return [];
  return list;
}

// Pages with fewer than MIN_WORDS results (e.g. words ending in J or Q) would be thin content, so they are not generated, linked or listed in the sitemap.
const MIN_WORDS = 10;
const isFiltered = (r: RouteInfo) => Boolean(r.filter.startsWith || r.filter.endsWith || r.filter.tag);
const PAGES: RouteInfo[] = ALL_ROUTES.filter((r) => !isFiltered(r) || wordsFor(r).length >= MIN_WORDS);
const HAS_PAGE = new Set(PAGES.map((r) => r.path));

function jsonLd(route: RouteInfo): string {
  const graph: object[] = [];
  if (route.path === '/') {
    graph.push({
      '@type': 'WebApplication',
      name: '5-Letter Words Finder & Solver',
      url: url('/'),
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All',
      description: route.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
  } else {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: url('/') },
        { '@type': 'ListItem', position: 2, name: route.h1, item: url(route.path) },
      ],
    });
  }
  if (route.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: route.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  // "<" is escaped so the JSON can never close the script tag
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

function headTags(route: RouteInfo, noindex = false): string {
  const canonical = url(route.path);
  const image = url('/og-image.png');
  return [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${jsonLd(route)}</script>`,
  ].join('\n    ');
}

function bodyHtml(route: RouteInfo): string {
  const tools = ALL_ROUTES.filter((r) => ['/', '/wordle-solver/', '/anagram-solver/', '/5-letter-words-a-z/', '/wordle-practice/', '/letter-frequency/'].includes(r.path));
  const nav = tools.map((r) => `<a href="${href(r.path)}">${esc(r.h1)}</a>`).join(' | ');

  const words = wordsFor(route);
  let list = '';
  if (words.length > 0) {
    const described = words.filter((w) => w.isCommon);
    const others = words.filter((w) => !w.isCommon);
    list += `<h2>${words.length} five-letter words</h2>`;
    if (described.length > 0) {
      list += `<ul>${described.map((w) => `<li><strong>${w.word}</strong> (${esc(w.partOfSpeech)}) - ${esc(w.definition)} Scrabble score: ${w.scrabbleScore}.</li>`).join('')}</ul>`;
    }
    if (others.length > 0) {
      list += `<p>More valid words: ${others.map((w) => w.word).join(', ')}.</p>`;
    }
  }

  const faq = route.faq.length
    ? `<h2>Frequently asked questions</h2>${route.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`
    : '';

  const letterLinks = (kind: 'starting-with' | 'ending-with', label: string) =>
    `<h2>${label}</h2><p>${LETTERS.filter((L) => HAS_PAGE.has(`/5-letter-words-${kind}-${L.toLowerCase()}/`))
      .map((L) => `<a href="${href(`/5-letter-words-${kind}-${L.toLowerCase()}/`)}">${L}</a>`)
      .join(' ')}</p>`;

  return (
    `<div id="root"><div style="max-width:960px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;color:#0f172a;line-height:1.6">` +
    `<header><p><a href="${href('/')}"><strong>${esc(SITE_NAME)}</strong></a></p><nav>${nav}</nav></header>` +
    `<main><h1>${esc(route.h1)}</h1>${route.about.map((p) => `<p>${esc(p)}</p>`).join('')}${list}${faq}` +
    `${letterLinks('starting-with', '5-letter words by starting letter')}${letterLinks('ending-with', '5-letter words by ending letter')}</main>` +
    `</div></div>`
  );
}

function render(template: string, route: RouteInfo, noindex = false): string {
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html does not contain <div id="root"></div>; cannot prerender.');
  }
  return template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace('</head>', `    ${headTags(route, noindex)}\n  </head>`)
    .replace('<div id="root"></div>', bodyHtml(route));
}

function write(file: string, content: string) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const templatePath = path.join(DIST, 'index.html');
if (!existsSync(templatePath)) throw new Error('dist/index.html not found. Run "vite build" first.');
const template = readFileSync(templatePath, 'utf8');

for (const route of PAGES) {
  const file = route.path === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.path, 'index.html');
  write(file, render(template, route));
}

// GitHub Pages serves 404.html for unknown URLs. It is not indexable, but still loads the app.
write(path.join(DIST, '404.html'), render(template, HOME_ROUTE, true));

const today = new Date().toISOString().slice(0, 10);
write(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    PAGES.map(
      (r) => `  <url><loc>${url(r.path)}</loc><lastmod>${today}</lastmod><priority>${r.path === '/' ? '1.0' : r.tab === 'finder' ? '0.6' : '0.8'}</priority></url>`,
    ).join('\n') +
    `\n</urlset>\n`,
);
write(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`);

console.log(`SEO pages generated: ${PAGES.length} of ${ALL_ROUTES.length} routes + 404.html + sitemap.xml + robots.txt (${ORIGIN})`);
