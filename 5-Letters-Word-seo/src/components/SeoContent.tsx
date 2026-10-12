import React from 'react';
import { RouteInfo } from '../seo/routes';

/** Visible descriptive text and FAQ for the current page. Also written into the prerendered HTML by scripts/generate-seo-pages.ts. */
export const SeoContent: React.FC<{ route: RouteInfo }> = ({ route }) => {
  return (
    <section className="mt-12 max-w-3xl space-y-4 text-sm text-slate-600 leading-relaxed" aria-label="About this page">
      <h2 className="text-lg font-extrabold text-slate-900">About {route.h1}</h2>
      {route.about.map((p, i) => (
        <p key={i}>{p}</p>
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
    </section>
  );
};
