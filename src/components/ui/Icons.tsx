import React from 'react';

/**
 * Line-only icon set. Every glyph is drawn with line / polyline elements, so the site ships no
 * SVG path elements. Connected segments are merged into a single <polyline> (a Search icon is
 * 2 elements instead of 15), which keeps pages with many icons (word grids) light on the DOM. Same names as the lucide-react icons they replace, and the same
 * className API (size with width/height classes, colour with text colour classes).
 */
type Seg = [number, number, number, number];
type Pt = [number, number];
type Dot = [number, number];

interface IconProps {
  className?: string;
}

const poly = (pts: Pt[]): Seg[] => pts.slice(1).map((p, i) => [pts[i][0], pts[i][1], p[0], p[1]]);
const ring = (cx: number, cy: number, r: number, n = 16): Seg[] =>
  poly(Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2), cy + r * Math.sin((i / n) * Math.PI * 2)] as Pt));
const arc = (cx: number, cy: number, r: number, from: number, to: number, steps = 14): Seg[] =>
  poly(
    Array.from({ length: steps + 1 }, (_, i) => {
      const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
    }),
  );

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** Join consecutive segments that share an endpoint into one polyline "points" string. */
const toChains = (segs: Seg[]): string[] => {
  const chains: Pt[][] = [];
  for (const [x1, y1, x2, y2] of segs) {
    const last = chains[chains.length - 1];
    const end = last && last[last.length - 1];
    if (end && end[0] === x1 && end[1] === y1) last.push([x2, y2]);
    else chains.push([[x1, y1], [x2, y2]]);
  }
  return chains.map((c) => c.map((p) => `${fmt(p[0])},${fmt(p[1])}`).join(' '));
};

const make = (segs: Seg[], dots: Dot[] = [], displayName = 'Icon'): React.FC<IconProps> => {
  const chains = toChains(segs);
  const Icon: React.FC<IconProps> = ({ className }) => (
    <svg
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {chains.map((points, i) => (
        <polyline key={i} points={points} />
      ))}
      {dots.map((d, i) => (
        <line key={`d${i}`} x1={d[0]} y1={d[1]} x2={d[0] + 0.01} y2={d[1]} strokeWidth="3.2" />
      ))}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
};

export const X = make([[6, 6, 18, 18], [18, 6, 6, 18]], [], 'X');
export const Check = make(poly([[4, 12.5], [9.5, 18], [20, 6.5]]), [], 'Check');
export const Copy = make(
  [...poly([[9, 9], [20, 9], [20, 20], [9, 20], [9, 9]]), ...poly([[5, 15], [5, 5], [15, 5], [15, 9]])],
  [],
  'Copy',
);
export const Search = make([...ring(11, 11, 7, 14), [16, 16, 21, 21]], [], 'Search');
export const ArrowRight = make([[4, 12, 20, 12], ...poly([[13, 5], [20, 12], [13, 19]])], [], 'ArrowRight');
export const ArrowUp = make([[12, 20, 12, 4], ...poly([[5, 11], [12, 4], [19, 11]])], [], 'ArrowUp');
export const ArrowDown = make([[12, 4, 12, 20], ...poly([[5, 13], [12, 20], [19, 13]])], [], 'ArrowDown');
export const ArrowUpRight = make([[7, 17, 17, 7], ...poly([[8, 7], [17, 7], [17, 16]])], [], 'ArrowUpRight');
export const ArrowUpDown = make(
  [[7, 4, 7, 20], ...poly([[3, 8], [7, 4], [11, 8]]), [17, 20, 17, 4], ...poly([[13, 16], [17, 20], [21, 16]])],
  [],
  'ArrowUpDown',
);
export const ChevronRight = make(poly([[9, 5], [16, 12], [9, 19]]), [], 'ChevronRight');
export const CornerDownLeft = make(
  [...poly([[20, 4], [20, 11], [17, 15], [4, 15]]), ...poly([[9, 10], [4, 15], [9, 20]])],
  [],
  'CornerDownLeft',
);
export const BarChart3 = make(
  [...poly([[3, 3], [3, 21], [21, 21]]), [8, 17, 8, 12], [13, 17, 13, 7], [18, 17, 18, 10]],
  [],
  'BarChart3',
);
export const TrendingUp = make([...poly([[3, 17], [9, 11], [13, 15], [21, 7]]), ...poly([[15, 7], [21, 7], [21, 13]])], [], 'TrendingUp');
export const BookOpen = make(
  [
    [12, 7, 12, 20],
    ...poly([[12, 7], [8, 4], [3, 4], [3, 17], [8, 17], [12, 20]]),
    ...poly([[12, 7], [16, 4], [21, 4], [21, 17], [16, 17], [12, 20]]),
  ],
  [],
  'BookOpen',
);

const BOOKMARK = poly([[6, 3], [18, 3], [18, 21], [12, 16], [6, 21], [6, 3]]);
const BOOKMARK_FILL: Seg[] = [7, 8.5, 10, 11.5, 13, 14.5, 16, 17].map((x) => [x, 4, x, 16 + (Math.abs(x - 12) * 5) / 6 - 0.8] as Seg);
const BookmarkOutline = make(BOOKMARK, [], 'Bookmark');
const BookmarkSolid = make([...BOOKMARK, ...BOOKMARK_FILL], [], 'BookmarkFilled');
/** Pass a `fill-*` class (as the lucide version did) to get the filled look, drawn with lines. */
export const Bookmark: React.FC<IconProps> = ({ className = '' }) =>
  className.includes('fill-') ? <BookmarkSolid className={className} /> : <BookmarkOutline className={className} />;

export const Download = make(
  [[12, 4, 12, 15], ...poly([[7, 10], [12, 15], [17, 10]]), ...poly([[4, 16], [4, 20], [20, 20], [20, 16]])],
  [],
  'Download',
);
export const Trash2 = make(
  [
    [3, 6, 21, 6],
    ...poly([[8, 6], [8, 3], [16, 3], [16, 6]]),
    ...poly([[5, 6], [6, 21], [18, 21], [19, 6]]),
    [10, 11, 10, 17],
    [14, 11, 14, 17],
  ],
  [],
  'Trash2',
);
export const Share2 = make([[8.6, 13.5, 15.4, 17.5], [15.4, 6.5, 8.6, 10.5]], [[18, 5], [6, 12], [18, 19]], 'Share2');
export const Shuffle = make(
  [
    ...poly([[16, 3], [21, 3], [21, 8]]),
    [4, 20, 21, 3],
    ...poly([[21, 16], [21, 21], [16, 21]]),
    [15, 15, 21, 21],
    [4, 4, 9, 9],
  ],
  [],
  'Shuffle',
);
export const Sparkles = make(
  [[12, 4, 12, 20], [4, 12, 20, 12], [7, 7, 17, 17], [17, 7, 7, 17], [19.5, 2, 19.5, 6], [17.5, 4, 21.5, 4]],
  [],
  'Sparkles',
);
export const Trophy = make(
  [
    ...poly([[7, 4], [17, 4], [17, 11], [12, 15], [7, 11], [7, 4]]),
    ...poly([[7, 6], [3, 6], [3, 8], [7, 11]]),
    ...poly([[17, 6], [21, 6], [21, 8], [17, 11]]),
    [12, 15, 12, 19],
    [8, 20, 16, 20],
  ],
  [],
  'Trophy',
);
export const Gamepad2 = make(
  [...poly([[6, 8], [18, 8], [21, 11], [21, 17], [18, 17], [16, 15], [8, 15], [6, 17], [3, 17], [3, 11], [6, 8]]), [7, 12, 11, 12], [9, 10, 9, 14]],
  [[15, 11], [17.5, 13]],
  'Gamepad2',
);
export const Hash = make([[4, 9, 20, 9], [4, 15, 20, 15], [10, 3, 8, 21], [16, 3, 14, 21]], [], 'Hash');
export const HelpCircle = make(
  [...ring(12, 12, 10), ...poly([[9.5, 9], [10.5, 7.5], [13.5, 7.5], [14.5, 9], [12, 12], [12, 13.5]])],
  [[12, 17]],
  'HelpCircle',
);
export const AlertCircle = make([...ring(12, 12, 10), [12, 7, 12, 13]], [[12, 16.5]], 'AlertCircle');
export const Type = make([...poly([[4, 7], [4, 4], [20, 4], [20, 7]]), [9, 20, 15, 20], [12, 4, 12, 20]], [], 'Type');
export const Lightbulb = make(
  [
    ...poly([[9, 18], [9, 16], [6.5, 13], [6, 10], [8, 5.5], [12, 4], [16, 5.5], [18, 10], [17.5, 13], [15, 16], [15, 18], [9, 18]]),
    [10, 21, 14, 21],
  ],
  [],
  'Lightbulb',
);
export const History = make([...ring(12, 12, 9), ...poly([[12, 7], [12, 12], [15.5, 14]])], [], 'History');
export const Volume2 = make(
  [
    ...poly([[11, 5], [6, 9], [3, 9], [3, 15], [6, 15], [11, 19], [11, 5]]),
    ...poly([[15.5, 8.5], [17, 12], [15.5, 15.5]]),
    ...poly([[18.5, 5.5], [21, 12], [18.5, 18.5]]),
  ],
  [],
  'Volume2',
);
export const RotateCcw = make([...arc(12, 12, 9, 214, -86, 18), ...poly([[3, 3], [3, 8], [8, 8]])], [], 'RotateCcw');
export const RefreshCw = make(
  [...arc(12, 12, 8, -160, -20, 9), ...poly([[20, 4], [20, 9], [15, 9]]), ...arc(12, 12, 8, 20, 160, 9), ...poly([[4, 20], [4, 15], [9, 15]])],
  [],
  'RefreshCw',
);
export const SlidersHorizontal = make(
  [[21, 4, 14, 4], [10, 4, 3, 4], [21, 12, 12, 12], [8, 12, 3, 12], [21, 20, 16, 20], [12, 20, 3, 20], [14, 2, 14, 6], [8, 10, 8, 14], [16, 18, 16, 22]],
  [],
  'SlidersHorizontal',
);
