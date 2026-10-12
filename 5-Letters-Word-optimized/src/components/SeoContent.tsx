import React from 'react';
import { Link, RouteInfo, SITE_NAME } from '../seo/routes';
import { withBase } from '../seo/links';

type Navigate = (path: string) => void;

// Real <a href> links so crawlers can follow them; plain clicks are handled in-app without a reload.
const handleNav = (e: React.MouseEvent, go: () => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  go();
};

const LinkList: React.FC<{ links: Link[]; onNavigate: Navigate }> = ({ links, onNavigate }) => (
  <ul className="flex flex-wrap gap-2">
    {links.map((l) => (
      <li key={l.path + l.label}>
        <a
          href={withBase(l.path)}
          onClick={(e) => handleNav(e, () => onNavigate(l.path))}
          className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
        >
          {l.label}
        </a>
      </li>
    ))}
  </ul>
);

/** Visible breadcrumb trail (Home > parent > current). Matches the BreadcrumbList schema in the prerendered HTML. */
export const Breadcrumbs: React.FC<{ route: RouteInfo; onNavigate: Navigate }> = ({ route, onNavigate }) => {
  if (route.path === '/') return null;
  const trail: Link[] = [{ label: SITE_NAME, path: '/' }, ...(route.crumbs ?? [])];
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((c) => (
          <li key={c.path} className="flex items-center gap-1.5">
            <a href={withBase(c.path)} onClick={(e) => handleNav(e, () => onNavigate(c.path))} className="hover:text-emerald-700 hover:underline">
              {c.label}
            </a>
            <span aria-hidden="true">/</span>
          </li>
        ))}
        <li aria-current="page" className="font-semibold text-slate-700">
          {route.h1}
        </li>
      </ol>
    </nav>
  );
};

interface SeoContentProps {
  route: RouteInfo;
  onNavigate: Navigate;
  /** "article": this block is the page itself (guides, info pages); renders the H1. Default: text under a tool. */
  variant?: 'under-tool' | 'article';
}

/** Visible descriptive text, sections, FAQ and related links. Also written into the prerendered HTML by scripts/generate-seo-pages.ts. */
export const SeoContent: React.FC<SeoContentProps> = ({ route, onNavigate, variant = 'under-tool' }) => {
  const isArticle = variant === 'article';
  return (
    <section className={`${isArticle ? '' : 'mt-12'} max-w-3xl space-y-4 text-sm text-slate-600 leading-relaxed`} aria-label="About this page">
      {isArticle ? (
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{route.h1}</h1>
      ) : (
        <h2 className="text-lg font-extrabold text-slate-900">{route.tab === 'word' ? `About the word ${route.wordSlug}` : `About ${route.h1}`}</h2>
      )}
      {route.published && <p className="text-xs text-slate-400">Published {route.published}</p>}
      {route.about.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      {(route.sections ?? []).map((s) => (
        <div key={s.heading} className="space-y-2 pt-2">
          <h2 className="text-lg font-extrabold text-slate-900">{s.heading}</h2>
          {(s.body ?? []).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.links && <LinkList links={s.links} onNavigate={onNavigate} />}
        </div>
      ))}

      {route.faq.length > 0 && (
        <div className="space-y-2 pt-2">
          <h2 className="text-lg font-extrabold text-slate-900">Frequently asked questions</h2>
          {route.faq.map((f) => (
            <details key={f.q} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <summary className="font-semibold text-slate-900 cursor-pointer">{f.q}</summary>
              <p className="mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      )}

      {route.related && route.related.length > 0 && (
        <div className="space-y-2 pt-2">
          <h2 className="text-lg font-extrabold text-slate-900">Related pages</h2>
          <LinkList links={route.related} onNavigate={onNavigate} />
        </div>
      )}
    </section>
  );
};
