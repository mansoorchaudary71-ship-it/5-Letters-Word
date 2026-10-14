# Redesign: color system + line-only SVG (changed files only)

Copy these files over the same paths in your repo, then run `npm run lint && npm run build`.

## SVG rule: no `<path>` anywhere
- `src/components/ui/Icons.tsx`        NEW. Line-only icon set, replaces every `lucide-react` icon (same names, same `className` API)
- `src/components/ui/WaveDivider.tsx`  NEW. Waves built from `<line>` elements only (vertical fill lines + crest segments)
- `src/components/ui/Blobs.tsx`        NEW. Blobs, dots, squiggle and burst, all `<line>` elements
- Every component that imported `lucide-react` now imports `./ui/Icons`. `lucide-react` can be removed from package.json.

## Palette (src/index.css)
brand #4F46E5 (hover #4338CA) | hit #10B981 | near #F59E0B | miss #64748B | ink #0F172A | page slate-50, cards white, borders slate-200
White on #10B981 / #F59E0B fails WCAG AA (2.54 / 2.15), so those tiles use dark ink text.
