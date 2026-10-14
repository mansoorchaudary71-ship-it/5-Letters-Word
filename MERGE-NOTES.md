# Redesign: color system + SVG layout (changed files only)

Copy these files over the same paths in your repo (they are the Vite + Tailwind v4 `.tsx` files, not `.jsx`).
No new dependencies. Run `npm run lint && npm run build` after merging.

## New files
- `src/components/ui/WaveDivider.tsx`  curved section divider (3 variants, inline SVG built from polygon + polyline, no <path>)
- `src/components/ui/Blobs.tsx`        `CardBlobs`: blobs (ellipses), squiggle (polyline), line burst (line) behind a tool card

## Palette (all in `src/index.css`)
| Token | Value | Use |
|---|---|---|
| `brand` / `brand-hover` | #4F46E5 / #4338CA | primary buttons, active tabs, focus rings (white text 6.29:1 / 7.9:1) |
| `hit` | #10B981 | correct letter (dark text, 7.0:1) |
| `near` | #F59E0B | present, wrong spot (dark text, 8.3:1) |
| `miss` | #64748B | absent letter (white text, 4.76:1) |
| `ink` | #0F172A | body text, dark panels |
| page / cards / borders | slate-50 / white / slate-200 | 60-30 neutrals |

White text on #10B981 (2.54:1) and #F59E0B (2.15:1) fails WCAG AA, so tiles in those two states use dark ink text.
