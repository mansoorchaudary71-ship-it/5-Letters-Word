import React from 'react';

/** Zig-zag-free "squiggle" sampled into polyline points. */
const squigglePoints = (n = 7, w = 120, h = 24): string => {
  const pts: string[] = [];
  const steps = n * 6;
  for (let i = 0; i <= steps; i++) {
    const x = 3 + (i / steps) * (w - 6);
    const y = h / 2 + (h / 2 - 3) * Math.sin((i / steps) * n * Math.PI);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
};
const SQUIGGLE = squigglePoints();

/** Squiggle drawn with a single <polyline>. */
export const Squiggle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 120 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={SQUIGGLE} />
  </svg>
);

/** Organic blob made from layered, rotated <ellipse> elements. */
export const Blob: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 200 200" className={className} fill="currentColor">
    <ellipse cx="100" cy="100" rx="78" ry="58" transform="rotate(-20 100 100)" />
    <ellipse cx="100" cy="100" rx="62" ry="80" transform="rotate(25 100 100)" />
    <ellipse cx="100" cy="100" rx="70" ry="70" />
  </svg>
);

/** Short parallel <line> strokes, a playful "sparkle" accent. */
export const LineBurst: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 60 60" className={className} stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="30" y1="4" x2="30" y2="18" />
    <line x1="8" y1="14" x2="18" y2="24" />
    <line x1="52" y1="14" x2="42" y2="24" />
    <line x1="4" y1="40" x2="18" y2="40" />
    <line x1="56" y1="40" x2="42" y2="40" />
  </svg>
);

/**
 * Blobs, dots, lines and a squiggle that frame a tool card.
 * Wrap the card in `relative isolate` and render this first: it sits behind the card (-z-10),
 * is non-interactive, and stays out of the accessibility tree.
 */
export const CardBlobs: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${className}`}>
    <Blob className="absolute -top-10 -left-8 w-40 sm:w-56 text-indigo-200/70" />
    <Blob className="absolute -bottom-12 -right-10 w-44 sm:w-64 text-amber-200/60" />
    <svg viewBox="0 0 80 80" className="hidden sm:block absolute top-6 -right-4 w-16 text-emerald-300/60" fill="currentColor">
      <circle cx="16" cy="18" r="9" />
      <circle cx="52" cy="14" r="5" />
      <circle cx="40" cy="52" r="12" />
    </svg>
    <Squiggle className="hidden sm:block absolute bottom-6 -left-4 w-28 text-indigo-300/70" />
    <LineBurst className="hidden md:block absolute -top-4 right-24 w-12 text-indigo-300/60" />
  </div>
);
