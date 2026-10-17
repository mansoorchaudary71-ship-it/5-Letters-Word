# Wordle Solver page: SEO update

Target page: `/wordle-solver/` (route `TAB_PATHS.solver`, component `WordleSolver.tsx`).
Primary term: **wordle solver** (about 550K-673K searches). Everything else from the Answer the Public
exports is a subheading, section or FAQ on this same page.

## Merge (copy over the same paths in your repo root)
- src/seo/routes.ts            solver route: title, description, H1, intro, related links; new `items` (H3) support
- src/seo/toolContent.ts       solver page body sections + all 15 FAQs
- src/components/SeoContent.tsx  renders `items` as <h3>
- src/components/WordleSolver.tsx  H1 now comes from the route (`heading` prop); styling untouched
- src/App.tsx                  passes `heading={route.h1}` to WordleSolver
- scripts/generate-seo-pages.ts  prerenders `items` as <h3> (FAQPage JSON-LD already existed and is reused)

Then run `npm run build && npm run seo:all`.
