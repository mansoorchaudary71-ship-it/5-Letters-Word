/**
 * Post-build step (runs after `vite build`): turns the single-page app into real, crawlable pages.
 *
 * For every route in src/seo/routes.ts (plus one page per defined word) it writes dist/<route>/index.html containing:
 *   - a unique <title>, meta description, canonical URL, Open Graph / Twitter tags and JSON-LD structured data
 *   - visible HTML content (breadcrumbs, headings, text, word lists, FAQ, related links) inside #root, which React replaces on load
 * It also writes sitemap.xml, robots.txt, 404.html, .nojekyll and (optionally) CNAME.
 *
 * Environment:
 *   SITE_URL        full public URL of the site including any repo path, no trailing slash
 *                   e.g. https://username.github.io/5-Letters-Word   or   https://yourdomain.com
 *   VITE_BASE_PATH  the same base path that Vite used, e.g. /5-Letters-Word/  (default "/")
 *   CUSTOM_DOMAIN   optional, e.g. yourdomain.com; writes dist/CNAME for GitHub Pages
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ALL_WORDS } from '../src/data/words';
import { ALL_ROUTES, HOME_ROUTE, LETTERS, Link, RouteInfo, Section, wordRoutes } from '../src/seo/routes';
import { hasWordPage, wordPath, wordsForFilter } from '../src/seo/content';
import { CONTENT_UPDATED, SITE_CONTACT_EMAIL, SITE_NAME, SITE_TAGLINE } from '../src/seo/site';

const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
const BASE = (process.env.VITE_BASE_PATH || '/').replace(/\/$/, ''); // "" or "/repo"
const DIST = path.resolve(process.cwd(), 'dist');

// ---- Chunk preloading ------------------------------------------------------------------------------
// Tool pages lazy-load their component. Without a hint the browser only discovers that chunk after the main
// bundle has run (index.html -> main.js -> tool.js, one request after another). A modulepreload link in the
// page head lets it download in parallel with the main bundle.
const TOOL_CHUNKS: Record<string, string> = {
  solver: 'src/components/WordleSolver.tsx',
  anagram: 'src/components/AnagramSolver.tsx',
  browse: 'src/components/BrowseDirectory.tsx',
  game: 'src/components/WordleGame.tsx',
  stats: 'src/components/LetterStatsView.tsx',
};
interface ManifestEntry {
  file: string;
  isEntry?: boolean;
  imports?: string[];
}
function loadManifest(): Record<string, ManifestEntry> | null {
  for (const p of [path.join(DIST, '.vite', 'manifest.json'), path.join(DIST, 'manifest.json')]) {
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'));
  }
  console.warn('WARNING: Vite manifest not found, tool pages will not get modulepreload hints.');
  return null;
}
const MANIFEST = loadManifest();

function preloadTags(route: RouteInfo): string {
  const key = TOOL_CHUNKS[route.tab];
  if (!MANIFEST || !key || !MANIFEST[key]) return '';
  const files = new Set<string>();
  const visit = (k: string) => {
    const entry = MANIFEST[k];
    if (!entry || entry.isEntry || files.has(entry.file)) return; // the main bundle is already loaded by <script>
    files.add(entry.file);
    (entry.imports ?? []).forEach(visit);
  };
  visit(key);
  return [...files].map((f) => `\n    <link rel="modulepreload" crossorigin href="${BASE}/${f}">`).join('');
}

if (!SITE_URL) {
  // In CI (e.g. the GitHub Pages deploy) a missing SITE_URL would publish canonicals, sitemap and robots.txt that all point
  // at example.com, so fail the build instead of warning.
  if (process.env.CI) {
    throw new Error('SITE_URL is not set. Set it (e.g. https://yourdomain.com) so canonicals, sitemap.xml and robots.txt use the real domain.');
  }
  console.warn('WARNING: SITE_URL is not set. Canonical URLs and sitemap.xml will use https://example.com. Set SITE_URL before deploying.');
}
const ORIGIN = SITE_URL || 'https://example.com';

// Optional Search Console / Bing Webmaster verification (meta-tag method). Set the env vars to the token values only.
const GOOGLE_VERIFICATION = (process.env.GOOGLE_SITE_VERIFICATION || '').trim();
const BING_VERIFICATION = (process.env.BING_SITE_VERIFICATION || '').trim();

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (p: string) => `${ORIGIN}${p}`;
const href = (p: string) => `${BASE}${p}`;
const slug = (s: string) => s.toLowerCase();

const WORD_ROUTES = wordRoutes();
const PAGES: RouteInfo[] = [...ALL_ROUTES, ...WORD_ROUTES];
const HAS_PAGE = new Set(PAGES.map((r) => r.path));

// ---- Quality gates: warn at build time instead of discovering problems in Search Console ----------
const problems: string[] = [];
const seenTitles = new Map<string, string>();
const seenDescriptions = new Map<string, string>();
for (const r of PAGES) {
  if (r.title.length > 60) problems.push(`title > 60 chars (${r.title.length}): ${r.path}`);
  if (r.description.length > 160) problems.push(`description > 160 chars (${r.description.length}): ${r.path}`);
  if (r.description.length < 70) problems.push(`description < 70 chars (${r.description.length}): ${r.path}`);
  if (seenTitles.has(r.title)) problems.push(`duplicate title: ${r.path} and ${seenTitles.get(r.title)}`);
  if (seenDescriptions.has(r.description)) problems.push(`duplicate description: ${r.path} and ${seenDescriptions.get(r.description)}`);
  seenTitles.set(r.title, r.path);
  seenDescriptions.set(r.description, r.path);
  for (const l of [...(r.related ?? []), ...(r.crumbs ?? []), ...(r.sections ?? []).flatMap((s) => s.links ?? [])]) {
    if (!HAS_PAGE.has(l.path)) problems.push(`broken internal link ${l.path} on ${r.path}`);
  }
}

// ---- Structured data -------------------------------------------------------------------------------
const ORG_ID = `${url('/')}#organization`;
const SITE_ID = `${url('/')}#website`;

function breadcrumb(route: RouteInfo): object {
  const trail: Link[] = [{ label: SITE_NAME, path: '/' }, ...(route.crumbs ?? []), { label: route.h1, path: route.path }];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: url(c.path) })),
  };
}

function jsonLd(route: RouteInfo): string {
  const graph: object[] = [];
  const pageUrl = url(route.path);
  const publisher = { '@id': ORG_ID };

  // Every page carries its own Organization and WebSite nodes so each page's structured data is self-contained
  // (search engines evaluate pages independently; an @id that only exists on the home page would dangle).
  graph.push({
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: url('/'),
    logo: url('/icon-512.png'),
    ...(SITE_CONTACT_EMAIL ? { email: SITE_CONTACT_EMAIL } : {}),
  });
  graph.push({
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: url('/'),
    name: SITE_NAME,
    description: HOME_ROUTE.description,
    inLanguage: 'en',
    publisher,
  });

  switch (route.kind) {
    case 'home':
    case 'tool': {
      const isApp = route.tab === 'finder' || route.tab === 'solver' || route.tab === 'anagram' || route.tab === 'game';
      graph.push(
        isApp
          ? {
              '@type': 'WebApplication',
              '@id': `${pageUrl}#app`,
              name: route.path === '/' ? `${SITE_NAME} Finder & Solver` : route.h1,
              url: pageUrl,
              description: route.description,
              applicationCategory: route.tab === 'game' ? 'GameApplication' : 'EducationalApplication',
              operatingSystem: 'All',
              browserRequirements: 'Requires JavaScript',
              inLanguage: 'en',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              publisher,
            }
          : { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: route.title, description: route.description, isPartOf: { '@id': SITE_ID }, inLanguage: 'en' },
      );
      break;
    }
    case 'list': {
      const words = wordsForFilter(route.filter);
      const top = [...words].sort((a, b) => Number(b.isCommon) - Number(a.isCommon)).slice(0, 25);
      graph.push({
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: route.h1,
        description: route.description,
        isPartOf: { '@id': SITE_ID },
        inLanguage: 'en',
        mainEntity: {
          '@type': 'ItemList',
          name: route.h1,
          numberOfItems: words.length,
          itemListElement: top.map((w, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: w.word,
            ...(hasWordPage(w.word) ? { url: url(wordPath(w.word)) } : {}),
          })),
        },
      });
      break;
    }
    case 'guide': {
      if (route.published) {
        graph.push({
          '@type': 'Article',
          '@id': `${pageUrl}#article`,
          headline: route.h1,
          description: route.description,
          datePublished: route.published,
          dateModified: CONTENT_UPDATED,
          inLanguage: 'en',
          mainEntityOfPage: pageUrl,
          image: url('/og-image.png'),
          author: publisher,
          publisher,
        });
      } else {
        // Guides hub: list the published guides so the CollectionPage describes real content
        const guides = ALL_ROUTES.filter((r) => r.kind === 'guide' && r.published);
        graph.push({
          '@type': 'CollectionPage',
          '@id': `${pageUrl}#webpage`,
          url: pageUrl,
          name: route.h1,
          description: route.description,
          isPartOf: { '@id': SITE_ID },
          inLanguage: 'en',
          mainEntity: {
            '@type': 'ItemList',
            name: route.h1,
            numberOfItems: guides.length,
            itemListElement: guides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.h1, url: url(g.path) })),
          },
        });
      }
      break;
    }
    case 'page': {
      const type = route.path === '/about/' ? 'AboutPage' : route.path === '/contact/' ? 'ContactPage' : 'WebPage';
      graph.push({ '@type': type, '@id': `${pageUrl}#webpage`, url: pageUrl, name: route.h1, description: route.description, isPartOf: { '@id': SITE_ID }, inLanguage: 'en' });
      break;
    }
    case 'word': {
      graph.push({
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: route.title,
        description: route.description,
        isPartOf: { '@id': SITE_ID },
        inLanguage: 'en',
        mainEntity: {
          '@type': 'DefinedTerm',
          name: route.wordSlug,
          description: route.about[0].replace(/^[A-Z]+ \([^)]*\): /, ''),
          inDefinedTermSet: { '@type': 'DefinedTermSet', name: `${SITE_NAME} dictionary`, url: url('/5-letter-words-a-z/') },
        },
      });
      break;
    }
  }

  if (route.path !== '/') graph.push(breadcrumb(route));
  if (route.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
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
    ...(noindex
      ? []
      : [
          `<link rel="canonical" href="${canonical}" />`,
          `<link rel="alternate" hreflang="en" href="${canonical}" />`,
          `<link rel="alternate" hreflang="x-default" href="${canonical}" />`,
          `<link rel="sitemap" type="application/xml" href="${url('/sitemap.xml')}" />`,
        ]),
    `<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}" />`,
    ...(noindex ? [] : [
      ...(GOOGLE_VERIFICATION ? [`<meta name="google-site-verification" content="${esc(GOOGLE_VERIFICATION)}" />`] : []),
      ...(BING_VERIFICATION ? [`<meta name="msvalidate.01" content="${esc(BING_VERIFICATION)}" />`] : []),
    ]),
    `<meta property="og:type" content="${route.kind === 'guide' && route.published ? 'article' : 'website'}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    ...(noindex ? [] : [`<meta property="og:url" content="${canonical}" />`]),
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(SITE_NAME)}: ${esc(SITE_TAGLINE)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${jsonLd(route)}</script>`,
  ].join('\n    ');
}

// ---- Visible HTML ----------------------------------------------------------------------------------
const NAV: Link[] = [
  { label: 'Word Finder', path: '/' },
  { label: 'Wordle Solver', path: '/wordle-solver/' },
  { label: 'Anagram Solver', path: '/anagram-solver/' },
  { label: 'A-Z Directory', path: '/5-letter-words-a-z/' },
  { label: 'Practice Game', path: '/wordle-practice/' },
  { label: 'Letter Frequency', path: '/letter-frequency/' },
  { label: 'Guides', path: '/guides/' },
];
const FOOTER_LINKS: Link[] = [
  { label: 'About', path: '/about/' },
  { label: 'Contact', path: '/contact/' },
  { label: 'Privacy Policy', path: '/privacy-policy/' },
  { label: 'Terms of Use', path: '/terms/' },
  { label: 'Sitemap', path: '/sitemap/' },
].filter((l) => HAS_PAGE.has(l.path));

const a = (l: Link) => `<a href="${href(l.path)}">${esc(l.label)}</a>`;
const ul = (links: Link[]) => `<ul style="display:flex;flex-wrap:wrap;gap:8px 16px;list-style:none;padding:0">${links.map((l) => `<li>${a(l)}</li>`).join('')}</ul>`;

function sectionHtml(s: Section): string {
  const subs = (s.subsections ?? []).map((t) => `<h3>${esc(t.heading)}</h3>${t.body.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('');
  return `<h2>${esc(s.heading)}</h2>${(s.body ?? []).map((p) => `<p>${esc(p)}</p>`).join('')}${subs}${s.links ? ul(s.links) : ''}`;
}

function wordList(route: RouteInfo): string {
  if (route.kind !== 'list') return '';
  const words = wordsForFilter(route.filter);
  const described = words.filter((w) => w.isCommon);
  const others = words.filter((w) => !w.isCommon);
  let out = `<h2>${words.length.toLocaleString('en-US')} five-letter words</h2>`;
  if (described.length > 0) {
    out += `<ul>${described
      .map((w) => `<li><a href="${href(wordPath(w.word))}"><strong>${w.word}</strong></a> (${esc(w.partOfSpeech)}): ${esc(w.definition)} Scrabble score: ${w.scrabbleScore}.</li>`)
      .join('')}</ul>`;
  }
  if (others.length > 0) {
    out += `<p>More valid words: ${others.map((w) => `${w.word} (${w.scrabbleScore})`).join(', ')}.</p>`;
  }
  return out;
}

function bodyHtml(route: RouteInfo): string {
  const crumbs: Link[] = [{ label: SITE_NAME, path: '/' }, ...(route.crumbs ?? [])];
  const breadcrumbs =
    route.path === '/'
      ? ''
      : `<nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b">${crumbs.map(a).join(' / ')} / <span>${esc(route.h1)}</span></nav>`;
  const faq = route.faq.length
    ? `<h2>Frequently asked questions</h2>${route.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`
    : '';
  const related = route.related?.length ? `<h2>Related pages</h2>${ul(route.related)}` : '';
  const startLinks = LETTERS.filter((L) => HAS_PAGE.has(`/5-letter-words-starting-with-${slug(L)}/`)).map((L) => ({
    label: L,
    path: `/5-letter-words-starting-with-${slug(L)}/`,
  }));
  const letters = route.kind === 'list' || route.kind === 'word' ? `<h2>5-letter words by starting letter</h2>${ul(startLinks)}` : '';
  const published = route.published ? `<p style="font-size:12px;color:#94a3b8">Published ${route.published}</p>` : '';

  return (
    `<div id="root"><div style="max-width:960px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;color:#0f172a;line-height:1.6">` +
    `<header><p><a href="${href('/')}"><strong>${esc(SITE_NAME)}</strong></a></p><nav aria-label="Main">${NAV.map(a).join(' | ')}</nav></header>` +
    `<main id="main-content">${breadcrumbs}<h1>${esc(route.h1)}</h1>${published}${route.about.map((p) => `<p>${esc(p)}</p>`).join('')}` +
    `${(route.sections ?? []).map(sectionHtml).join('')}${wordList(route)}${faq}${related}${letters}</main>` +
    `<footer><nav aria-label="Footer">${ul(FOOTER_LINKS)}</nav><p style="font-size:12px;color:#64748b">Wordle is a trademark of The New York Times Company. Scrabble is a trademark of Hasbro and Mattel. This site is independent and not affiliated with them.</p></footer>` +
    `</div></div>`
  );
}

function render(template: string, route: RouteInfo, noindex = false): string {
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html does not contain <div id="root"></div>; cannot prerender.');
  }
  // Function replacers: page text must never be interpreted as a "$&" replacement pattern.
  return template
    .replace(/<title>[\s\S]*?<\/title>/, () => '')
    .replace('</head>', () => `    ${headTags(route, noindex)}${preloadTags(route)}\n  </head>`)
    .replace('<div id="root"></div>', () => bodyHtml(route));
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

// 404.html: GitHub Pages serves it for unknown URLs. It must NOT be indexable, but it still loads the app.
write(path.join(DIST, '404.html'), render(template, { ...HOME_ROUTE, path: '/404.html' }, true));

const priority = (r: RouteInfo) => (r.path === '/' ? '1.0' : r.kind === 'tool' ? '0.9' : r.kind === 'guide' ? '0.8' : r.kind === 'list' ? '0.7' : r.kind === 'word' ? '0.5' : '0.3');
write(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    PAGES.map((r) => `  <url><loc>${url(r.path)}</loc><lastmod>${CONTENT_UPDATED}</lastmod><priority>${priority(r)}</priority></url>`).join('\n') +
    `\n</urlset>\n`,
);
write(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`);
write(path.join(DIST, '.nojekyll'), '');
if (process.env.CUSTOM_DOMAIN) write(path.join(DIST, 'CNAME'), `${process.env.CUSTOM_DOMAIN.trim()}\n`);

console.log(`SEO pages generated: ${PAGES.length} (${ALL_ROUTES.length} routes + ${WORD_ROUTES.length} word pages) + 404.html + sitemap.xml + robots.txt (${ORIGIN})`);
console.log(`Dictionary: ${ALL_WORDS.length} words`);
if (problems.length > 0) {
  console.warn(`\nSEO checks found ${problems.length} problem(s):\n - ${problems.slice(0, 40).join('\n - ')}`);
  if (process.env.SEO_STRICT === '1') process.exit(1);
} else {
  console.log('SEO checks: no problems (titles, descriptions, duplicates, internal links).');
}
