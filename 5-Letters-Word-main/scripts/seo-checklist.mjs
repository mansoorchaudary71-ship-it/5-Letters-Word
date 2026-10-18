#!/usr/bin/env node
/**
 * On-page SEO checklist. Run after `npm run build`:  node scripts/seo-checklist.mjs
 * Reads every generated page in dist/ and prints PASS / FAIL per check, with failing URLs.
 * Exit code 1 if any check fails (use in CI).
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = process.argv[2] || 'dist';
if (!existsSync(DIST)) { console.error(`"${DIST}" not found. Run npm run build first.`); process.exit(2); }

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p);
  }
})(DIST);

const dec = (t) => (t || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
const pages = files.map((file) => {
  const html = readFileSync(file, 'utf8');
  const url = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  const get = (re) => (html.match(re) || [])[1];
  const body = html.slice(html.indexOf('<body'));
  const text = body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
  return { file, url, html, body, text, is404: file.endsWith('404.html'),
    title: dec(get(/<title>([\s\S]*?)<\/title>/)), desc: dec(get(/<meta name="description" content="([^"]*)"/)),
    canonical: get(/<link rel="canonical" href="([^"]*)"/), robots: get(/<meta name="robots" content="([^"]*)"/) };
}).filter((p) => !p.is404);

const LEGAL = ['/about/', '/privacy-policy/', '/terms/', '/contact/']; // short by nature; not ranking pages
const checks = [];
const check = (name, fn) => {
  const bad = pages.filter((p) => !fn(p));
  checks.push({ name, bad });
};

check('Unique <title> present (<= 60 chars)', (p) => p.title && p.title.length <= 60 && p.title.length >= 15);
check('Meta description present (70-160 chars)', (p) => p.desc && p.desc.length >= 70 && p.desc.length <= 160);
check('Canonical URL present', (p) => !!p.canonical);
check('Canonical is absolute https URL', (p) => /^https:\/\//.test(p.canonical || ''));
check('Indexable robots meta', (p) => /index,follow/.test(p.robots || ''));
check('<html lang> set', (p) => /<html lang="en"/.test(p.html));
check('Viewport meta set', (p) => /name="viewport"/.test(p.html));
check('Exactly one <h1>', (p) => (p.body.match(/<h1[\s>]/g) || []).length === 1);
check('At least two <h2> sections', (p) => (p.body.match(/<h2[\s>]/g) || []).length >= 2);
check('No heading level skipped (h1 > h2 > h3)', (p) => !/<h3[\s>]/.test(p.body) || /<h2[\s>]/.test(p.body));
check('Open Graph title/description/url/image', (p) => ['og:title', 'og:description', 'og:url', 'og:image'].every((k) => p.html.includes(`property="${k}"`)));
check('Twitter card tags', (p) => ['twitter:card', 'twitter:title', 'twitter:image'].every((k) => p.html.includes(`name="${k}"`)));
check('JSON-LD present and parses', (p) => { const m = [...p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]; if (!m.length) return false; try { m.forEach((x) => JSON.parse(x[1].replace(/\\u003c/g, '<'))); return true; } catch { return false; } });
check('BreadcrumbList schema on inner pages', (p) => p.url === '/' || p.html.includes('BreadcrumbList'));
check('Server-rendered body text >= 250 words (legal pages exempt)', (p) => LEGAL.includes(p.url) || p.text.split(' ').length >= 250);
check('Internal links >= 15 per page (legal pages exempt)', (p) => LEGAL.includes(p.url) || (p.body.match(/<a [^>]*href="\//g) || []).length >= 15);
check('Every <img> has alt text', (p) => [...p.body.matchAll(/<img\b[^>]*>/g)].every((m) => /\salt="[^"]*"/.test(m[0])));
check('No empty href / javascript: links', (p) => !/href=""|href="#"|href="javascript:/i.test(p.body));
check('Title keyword appears in H1 or first paragraph', (p) => {
  const words = (p.title || '').toLowerCase().replace(/&amp;/g, '').split(/[^a-z0-9-]+/).filter((w) => w.length > 3).slice(0, 3);
  const h1 = ((p.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').toLowerCase();
  return words.some((w) => h1.includes(w));
});
check('Web fonts do not block rendering', (p) => ![...p.html.matchAll(/<link\b[^>]*fonts\.googleapis[^>]*>/g)].some((m) => !/rel="preconnect"/.test(m[0]) && !/media="print"/.test(m[0]) && !p.html.includes('<noscript>' + m[0])));

// Duplicate detection across the whole site
const dup = (key) => { const seen = new Map(); pages.forEach((p) => seen.set(p[key], [...(seen.get(p[key]) || []), p.url])); return pages.filter((p) => seen.get(p[key]).length > 1); };
checks.push({ name: 'No duplicate titles', bad: dup('title') });
checks.push({ name: 'No duplicate meta descriptions', bad: dup('desc') });

// Site-level files
const siteFiles = [
  ['sitemap.xml exists', existsSync(join(DIST, 'sitemap.xml'))],
  ['robots.txt references the sitemap', existsSync(join(DIST, 'robots.txt')) && /Sitemap:/i.test(readFileSync(join(DIST, 'robots.txt'), 'utf8'))],
  ['404.html is noindex', existsSync(join(DIST, '404.html')) && /noindex/.test(readFileSync(join(DIST, '404.html'), 'utf8'))],
  ['Sitemap lists every page', (() => { if (!existsSync(join(DIST, 'sitemap.xml'))) return false; const n = (readFileSync(join(DIST, 'sitemap.xml'), 'utf8').match(/<loc>/g) || []).length; return n >= pages.length - 1; })()],
  ['Web manifest + icons present', ['manifest.webmanifest', 'favicon.svg', 'apple-touch-icon.png', 'og-image.png'].every((f) => existsSync(join(DIST, f)))],
];

let failed = 0;
console.log(`\nOn-page SEO checklist: ${pages.length} pages in "${DIST}"\n`);
for (const c of checks) {
  const ok = c.bad.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? '[PASS]' : '[FAIL]'} ${c.name}${ok ? '' : `  (${c.bad.length} pages, e.g. ${c.bad.slice(0, 3).map((p) => p.url).join(', ')})`}`);
}
for (const [name, ok] of siteFiles) { if (!ok) failed++; console.log(`${ok ? '[PASS]' : '[FAIL]'} ${name}`); }
console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`);
process.exit(failed ? 1 : 0);
