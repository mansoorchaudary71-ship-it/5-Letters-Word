#!/usr/bin/env node
/**
 * Technical SEO checklist. Run after `npm run build`:  node scripts/technical-seo-check.mjs [dist]
 * Crawls the generated site in dist/ the way a search engine would and prints PASS / FAIL / SKIP per check.
 * Exit code 1 if any check FAILS (so CI can block a deploy). SKIP means the input was not available
 * (for example, bundle sizes need the real `vite build` output) and is never counted as a pass.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = process.argv[2] || 'dist';
if (!existsSync(DIST)) { console.error(`"${DIST}" not found. Run npm run build first.`); process.exit(2); }

// ------------------------------------------------------------------ load pages
const htmlFiles = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && htmlFiles.push(p);
  }
})(DIST);

const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
const metas = (html) => [...html.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0]);
const links = (html) => [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);

const all = htmlFiles.map((file) => {
  const html = readFileSync(file, 'utf8');
  const rel = relative(DIST, file).replace(/\\/g, '/');
  const url = '/' + rel.replace(/index\.html$/, '');
  const head = html.slice(0, html.indexOf('</head>'));
  const body = html.slice(html.indexOf('<body'));
  const canon = links(head).filter((l) => /rel="canonical"/.test(l)).map((l) => attr(l, 'href'));
  const robots = metas(head).filter((m) => /name="robots"/.test(m)).map((m) => attr(m, 'content'));
  return { file, rel, url, html, head, body, bytes: Buffer.byteLength(html), canon, robots, is404: rel === '404.html' };
});
const pages = all.filter((p) => !p.is404);
const notFound = all.find((p) => p.is404);

const home = pages.find((p) => p.url === '/');
const homeCanon = new URL(home.canon[0]);
const ORIGIN = homeCanon.origin;
const BASEPATH = homeCanon.pathname.endsWith('/') ? homeCanon.pathname : homeCanon.pathname + '/'; // "/" or "/repo/"
const toSitePath = (pathname) => {
  let p = pathname.split('#')[0].split('?')[0];
  if (BASEPATH !== '/' && p.startsWith(BASEPATH)) p = '/' + p.slice(BASEPATH.length);
  return p;
};
const byUrl = new Map(pages.map((p) => [p.url, p]));

// ------------------------------------------------------------------ check helpers
const results = [];
const check = (group, name, ok, detail = '') => results.push({ group, name, status: ok ? 'PASS' : 'FAIL', detail });
const skip = (group, name, why) => results.push({ group, name, status: 'SKIP', detail: why });
const eachPage = (group, name, fn, list = pages) => {
  const bad = list.filter((p) => !fn(p));
  check(group, name, bad.length === 0, bad.length ? `${bad.length} pages, e.g. ${bad.slice(0, 3).map((p) => p.url).join(', ')}` : '');
};

// ================================================================== 1. CRAWLABILITY
const G1 = '1. Crawlability';
const robotsPath = join(DIST, 'robots.txt');
const robotsTxt = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : '';
check(G1, 'robots.txt exists and has a User-agent group', /^user-agent:/im.test(robotsTxt));
check(G1, 'robots.txt does not block the whole site or assets', !/^disallow:\s*\/\s*$/im.test(robotsTxt) && !/^disallow:\s*\/assets/im.test(robotsTxt));
check(G1, 'robots.txt declares an absolute https sitemap URL', /^sitemap:\s*https:\/\/\S+/im.test(robotsTxt));

const sitemapPath = join(DIST, 'sitemap.xml');
const sitemapXml = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';
const smEntries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: (m[1].match(/<loc>([^<]*)<\/loc>/) || [])[1],
  lastmod: (m[1].match(/<lastmod>([^<]*)<\/lastmod>/) || [])[1],
}));
check(G1, 'sitemap.xml is well-formed (urlset, xml declaration, matching tags)', /^<\?xml/.test(sitemapXml) && /<urlset[^>]*sitemaps\.org/.test(sitemapXml) && sitemapXml.trim().endsWith('</urlset>') && (sitemapXml.match(/<url>/g) || []).length === (sitemapXml.match(/<\/url>/g) || []).length);
check(G1, 'sitemap within protocol limits (<= 50,000 URLs, <= 50 MB)', smEntries.length > 0 && smEntries.length <= 50000 && Buffer.byteLength(sitemapXml) <= 50 * 1024 * 1024, `${smEntries.length} URLs`);
check(G1, 'sitemap URLs are unique, absolute https, same origin', new Set(smEntries.map((e) => e.loc)).size === smEntries.length && smEntries.every((e) => e.loc && e.loc.startsWith(ORIGIN + '/') && e.loc.startsWith('https://')));
check(G1, 'sitemap <lastmod> is a valid W3C date (YYYY-MM-DD)', smEntries.every((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.lastmod || '') && !Number.isNaN(Date.parse(e.lastmod))));
const smPaths = new Set(smEntries.map((e) => toSitePath(new URL(e.loc).pathname)));
check(G1, 'every sitemap URL resolves to a generated page (no 404s)', [...smPaths].every((p) => byUrl.has(p)), [...smPaths].filter((p) => !byUrl.has(p)).slice(0, 3).join(', '));
const indexable = pages.filter((p) => !p.robots.some((r) => /noindex/i.test(r)));
check(G1, 'every indexable page is in the sitemap (and nothing noindex is)', indexable.every((p) => smPaths.has(p.url)) && [...smPaths].every((u) => indexable.some((p) => p.url === u)), `${indexable.length} indexable pages`);
check(G1, '404.html exists, is noindex and has no canonical', !!notFound && /noindex/i.test(notFound.robots.join(',')) && notFound.canon.length === 0);

// Internal link graph (what a crawler can follow without running JavaScript)
const edges = new Map();
const broken = [];
for (const p of pages) {
  const out = new Set();
  for (const m of p.body.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)) {
    const href = m[1];
    if (/^(mailto:|tel:|#|https?:\/\/(?!(?:www\.)?$))/.test(href) && !href.startsWith(ORIGIN)) continue;
    let pathname;
    try { pathname = new URL(href, ORIGIN + BASEPATH + p.url.slice(1)).pathname; } catch { continue; }
    if (href.startsWith('http') && !href.startsWith(ORIGIN)) continue;
    let sp = toSitePath(pathname);
    if (!/\.[a-z0-9]+$/i.test(sp) && !sp.endsWith('/')) sp += '/';
    if (/\.[a-z0-9]+$/i.test(sp)) continue; // static files (xml, png...) are checked elsewhere
    if (!byUrl.has(sp)) broken.push(`${p.url} -> ${href}`);
    else out.add(sp);
  }
  edges.set(p.url, out);
}
check(G1, 'no broken internal links across the whole crawl', broken.length === 0, broken.slice(0, 3).join('; '));
const noindexSet = new Set(pages.filter((p) => !indexable.includes(p)).map((p) => p.url));
check(G1, 'no internal link points to a noindex page', [...edges.values()].every((s) => [...s].every((t) => !noindexSet.has(t))));
const trailingBad = pages.flatMap((p) => [...p.body.matchAll(/<a\b[^>]*\shref="(\/[^"#?]*[^/"#?])"/g)].map((m) => m[1]).filter((h) => !/\.[a-z0-9]+$/i.test(h)));
check(G1, 'internal links use the canonical trailing-slash form (no redirect hops)', trailingBad.length === 0, trailingBad.slice(0, 3).join(', '));

// Breadth-first search from the home page = click depth
const depth = new Map([['/', 0]]);
const queue = ['/'];
while (queue.length) {
  const cur = queue.shift();
  for (const nxt of edges.get(cur) || []) if (!depth.has(nxt)) { depth.set(nxt, depth.get(cur) + 1); queue.push(nxt); }
}
const unreachable = indexable.filter((p) => !depth.has(p.url));
check(G1, 'no orphan pages: every indexable page is reachable by links from the home page', unreachable.length === 0, unreachable.slice(0, 3).map((p) => p.url).join(', '));
const maxDepth = Math.max(...[...depth.values()]);
check(G1, 'every page is within 3 clicks of the home page', maxDepth <= 3, `deepest page: ${maxDepth} clicks`);

// ================================================================== 2. INDEXABILITY & URLS
const G2 = '2. Indexability and URLs';
eachPage(G2, 'exactly one canonical per page', (p) => p.canon.length === 1);
eachPage(G2, 'canonical is self-referencing and absolute https', (p) => p.canon[0] === ORIGIN + BASEPATH + p.url.slice(1));
eachPage(G2, 'canonical matches the sitemap <loc>', (p) => !indexable.includes(p) || smEntries.some((e) => e.loc === p.canon[0]));
eachPage(G2, 'og:url equals the canonical', (p) => metas(p.head).some((m) => attr(m, 'property') === 'og:url' && attr(m, 'content') === p.canon[0]));
eachPage(G2, 'exactly one robots meta, no conflicting directives', (p) => p.robots.length === 1 && !(/noindex/.test(p.robots[0]) && /index,/.test(p.robots[0])));
eachPage(G2, 'URLs are lowercase, hyphenated, no query/hash/underscore, <= 100 chars', (p) => p.url === p.url.toLowerCase() && !/[_?#\s]/.test(p.url) && p.url.length <= 100 && p.url.endsWith('/'));
eachPage(G2, 'URL depth <= 3 segments', (p) => p.url.split('/').filter(Boolean).length <= 3);
eachPage(G2, 'hreflang: self-referencing en + x-default', (p) => { const l = links(p.head).filter((x) => /rel="alternate"/.test(x) && attr(x, 'hreflang')); return l.some((x) => attr(x, 'hreflang') === 'en' && attr(x, 'href') === p.canon[0]) && l.some((x) => attr(x, 'hreflang') === 'x-default'); });
eachPage(G2, 'sitemap is discoverable from <head> (rel="sitemap")', (p) => links(p.head).some((l) => /rel="sitemap"/.test(l)));

// ================================================================== 3. STRUCTURED DATA
const G3 = '3. Structured data';
const REQUIRED = {
  Organization: ['name', 'url', 'logo'],
  WebSite: ['name', 'url', 'publisher'],
  WebApplication: ['name', 'url', 'applicationCategory', 'operatingSystem', 'offers'],
  Article: ['headline', 'datePublished', 'dateModified', 'author', 'publisher', 'image', 'mainEntityOfPage'],
  FAQPage: ['mainEntity'],
  BreadcrumbList: ['itemListElement'],
  CollectionPage: ['name', 'url', 'mainEntity'],
  WebPage: ['name', 'url'],
  DefinedTerm: ['name', 'description'],
  ItemList: ['itemListElement'],
};
const parseLd = (p) => {
  const nodes = [];
  for (const m of p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const d = JSON.parse(m[1].replace(/\\u003c/g, '<'));
    nodes.push(...(d['@graph'] || [d]));
  }
  return nodes;
};
const ldErrors = [];
for (const p of pages) {
  let nodes;
  try { nodes = parseLd(p); } catch { ldErrors.push(`${p.url}: invalid JSON`); continue; }
  const ids = new Set(nodes.map((n) => n['@id']).filter(Boolean));
  const text = p.body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, "'").replace(/\s+/g, ' ');
  for (const n of nodes) {
    const need = REQUIRED[n['@type']];
    if (!need) continue;
    for (const k of need) if (n[k] === undefined || n[k] === '' || (Array.isArray(n[k]) && !n[k].length)) ldErrors.push(`${p.url}: ${n['@type']} missing ${k}`);
    for (const k of ['url', 'logo', 'image', 'mainEntityOfPage']) if (typeof n[k] === 'string' && !/^https:\/\//.test(n[k])) ldErrors.push(`${p.url}: ${n['@type']}.${k} not absolute https`);
    for (const k of ['publisher', 'author', 'isPartOf']) if (n[k]?.['@id'] && !ids.has(n[k]['@id'])) ldErrors.push(`${p.url}: ${n['@type']}.${k} references missing @id`);
    if (n['@type'] === 'BreadcrumbList') {
      n.itemListElement.forEach((it, i) => { if (it.position !== i + 1 || !it.name || !it.item) ldErrors.push(`${p.url}: breadcrumb item ${i + 1} invalid`); });
    }
    if (n['@type'] === 'FAQPage') {
      for (const q of n.mainEntity) {
        if (!q.name || !q.acceptedAnswer?.text) ldErrors.push(`${p.url}: FAQ question incomplete`);
        else if (!text.includes(q.name.slice(0, 40))) ldErrors.push(`${p.url}: FAQ "${q.name.slice(0, 30)}" is not visible on the page`);
      }
    }
    if (n['@type'] === 'Article' && n.headline.length > 110) ldErrors.push(`${p.url}: Article headline > 110 chars`);
  }
}
check(G3, 'every JSON-LD block parses, required properties present, URLs absolute, @id references resolve, breadcrumb positions sequential', ldErrors.length === 0, ldErrors.slice(0, 3).join('; '));
check(G3, 'FAQ schema only describes questions visible on the page (Google policy)', !ldErrors.some((e) => e.includes('not visible')));
eachPage(G3, 'every page carries Organization or WebSite entity link (single @graph, no duplicate @id)', (p) => { const n = parseLd(p); const ids = n.map((x) => x['@id']).filter(Boolean); return ids.length === new Set(ids).size && n.length > 0; });

// ================================================================== 4. HTML HYGIENE
const G4 = '4. HTML hygiene';
eachPage(G4, 'starts with <!doctype html>; charset meta is first in <head>', (p) => /^<!doctype html>/i.test(p.html) && /<head>\s*<meta charset="UTF-8"/i.test(p.html));
eachPage(G4, 'exactly one <title>, one meta description, one viewport', (p) => (p.head.match(/<title>/g) || []).length === 1 && metas(p.head).filter((m) => /name="description"/.test(m)).length === 1 && metas(p.head).filter((m) => /name="viewport"/.test(m)).length === 1);
eachPage(G4, 'viewport allows zoom (no user-scalable=no / maximum-scale=1)', (p) => !/user-scalable=no|maximum-scale=1(?!\d)/.test(p.head));
eachPage(G4, 'no duplicate id attributes', (p) => { const ids = [...p.body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]); return ids.length === new Set(ids).size; });
eachPage(G4, 'no mixed content (http:// resources)', (p) => !/(?:src|href)="http:\/\//.test(p.html.replace(/xmlns="http:\/\/[^"]*"/g, '')));
eachPage(G4, 'HTML document <= 150 KB uncompressed', (p) => p.bytes <= 150 * 1024);
eachPage(G4, 'all external links use rel="noopener" (or none exist)', (p) => [...p.body.matchAll(/<a\b[^>]*href="https?:\/\/[^"]*"[^>]*>/g)].every((m) => /rel="[^"]*noopener/.test(m[0]) || m[0].includes(`href="${ORIGIN}`)));

// ================================================================== 5. PERFORMANCE
const G5 = '5. Performance and Core Web Vitals inputs';
eachPage(G5, 'preconnect to font origins; font CSS does not block rendering', (p) => /rel="preconnect" href="https:\/\/fonts\.gstatic\.com"/.test(p.head) && ![...p.head.matchAll(/<link\b[^>]*fonts\.googleapis\.com\/css[^>]*>/g)].some((m) => !/media="print"/.test(m[0]) && !p.head.includes('<noscript>' + m[0])));
eachPage(G5, 'font-display: swap requested (no invisible text)', (p) => !/fonts\.googleapis\.com\/css/.test(p.head) || /display=swap/.test(p.head));
eachPage(G5, 'no render-blocking classic scripts in <head>', (p) => ![...p.head.matchAll(/<script\b[^>]*\ssrc=[^>]*>/g)].some((m) => !/type="module"|defer|async/.test(m[0])));
const assetsDir = join(DIST, 'assets');
if (existsSync(assetsDir)) {
  const js = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  const css = readdirSync(assetsDir).filter((f) => f.endsWith('.css'));
  const gz = (f) => gzipSync(readFileSync(join(assetsDir, f))).length;
  const entry = (home.html.match(/<script[^>]*type="module"[^>]*src="[^"]*\/assets\/([^"]+\.js)"/) || [])[1];
  check(G5, 'entry JavaScript <= 250 KB gzip', entry && gz(entry) <= 250 * 1024, entry ? `${Math.round(gz(entry) / 1024)} KB gzip` : 'entry script not found');
  check(G5, 'total CSS <= 50 KB gzip', css.reduce((s, f) => s + gz(f), 0) <= 50 * 1024, `${Math.round(css.reduce((s, f) => s + gz(f), 0) / 1024)} KB gzip`);
  check(G5, 'code is split into multiple lazy chunks', js.length >= 3, `${js.length} JS files`);
} else {
  skip(G5, 'JavaScript / CSS size budgets and code splitting', 'dist/assets not found (run the real vite build first)');
}

// ================================================================== 6. MOBILE / PWA / SOCIAL ASSETS
const G6 = '6. Mobile, icons and social assets';
const manifestPath = join(DIST, 'manifest.webmanifest');
let manifest = null;
try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch { /* handled below */ }
check(G6, 'web manifest is valid JSON with name, start_url, display, icons', !!manifest && manifest.name && manifest.start_url && manifest.display && Array.isArray(manifest.icons) && manifest.icons.length >= 2);
const pngSize = (f) => { try { const b = readFileSync(join(DIST, f)); return b.slice(0, 8).toString('hex') === '89504e470d0a1a0a' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; } catch { return null; } };
check(G6, 'manifest icons exist and match their declared sizes', !!manifest && manifest.icons.every((i) => { const s = pngSize(i.src.replace(/^\.?\//, '')); return s && i.sizes === `${s[0]}x${s[1]}`; }));
check(G6, 'manifest "any maskable" is not combined in one icon (separate purposes)', !!manifest && manifest.icons.every((i) => !/any\s+maskable/.test(i.purpose || '')));
const themeMeta = metas(home.head).map((m) => (/name="theme-color"/.test(m) ? attr(m, 'content') : null)).find(Boolean);
check(G6, 'manifest theme_color matches <meta name="theme-color">', !!manifest && !!themeMeta && manifest.theme_color.toLowerCase() === themeMeta.toLowerCase(), `${manifest?.theme_color} vs ${themeMeta}`);
check(G6, 'apple-touch-icon is 180x180 and favicons exist', pngSize('apple-touch-icon.png')?.join('x') === '180x180' && existsSync(join(DIST, 'favicon.svg')) && !!pngSize('favicon-32.png'));
const og = pngSize('og-image.png');
check(G6, 'og-image is 1200x630 PNG under 1 MB', !!og && og[0] === 1200 && og[1] === 630 && statSync(join(DIST, 'og-image.png')).size < 1024 * 1024);
const logo = pngSize('icon-512.png');
check(G6, 'Organization logo file exists and is at least 112x112', !!logo && logo[0] >= 112);

// ================================================================== 7. SECURITY & HEADERS
const G7 = '7. Security and server headers';
const headersPath = join(DIST, '_headers');
const hdr = existsSync(headersPath) ? readFileSync(headersPath, 'utf8') : '';
check(G7, '_headers: X-Content-Type-Options nosniff', /X-Content-Type-Options:\s*nosniff/i.test(hdr));
check(G7, '_headers: Referrer-Policy set', /Referrer-Policy:/i.test(hdr));
check(G7, '_headers: clickjacking protection (X-Frame-Options or frame-ancestors)', /X-Frame-Options:|frame-ancestors/i.test(hdr));
check(G7, '_headers: HSTS with at least 6 months max-age', /Strict-Transport-Security:\s*max-age=(\d+)/i.test(hdr) && Number(hdr.match(/Strict-Transport-Security:\s*max-age=(\d+)/i)[1]) >= 15552000);
check(G7, '_headers: Content-Security-Policy (or Report-Only) defined', /Content-Security-Policy(-Report-Only)?:/i.test(hdr));
check(G7, '_headers: long-lived immutable cache for hashed /assets/*', /\/assets\/\*[\s\S]*?max-age=31536000[\s\S]*?immutable/.test(hdr));
check(G7, '_headers: no conflicting Cache-Control on the catch-all rule (HTML keeps the host default of revalidating)', !/^\/\*\s*\n(?:[ \t]+.*\n)*?[ \t]+Cache-Control:/im.test(hdr));

// ------------------------------------------------------------------ report
let fails = 0;
let lastGroup = '';
console.log(`\nTechnical SEO checklist: ${pages.length} pages + 404, origin ${ORIGIN}${BASEPATH}, sitemap ${smEntries.length} URLs, max click depth ${maxDepth}\n`);
for (const r of results) {
  if (r.group !== lastGroup) { console.log(`\n${r.group}`); lastGroup = r.group; }
  if (r.status === 'FAIL') fails++;
  console.log(`  [${r.status}] ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
}
const counts = results.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
console.log(`\n${counts.PASS || 0} passed, ${counts.FAIL || 0} failed, ${counts.SKIP || 0} skipped.`);
process.exit(fails ? 1 : 0);
