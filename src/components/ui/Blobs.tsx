import React from 'react';

/**
 * Decorative shapes drawn only with <line> elements (thick round-capped lines make the "blobs").
 * Colour with a text-* class and fade with an opacity-* class on the element, so overlapping
 * strokes stay one flat colour.
 */
interface ShapeProps {
  className?: string;
}

/** Organic blob: three overlapping thick, round-capped lines. */
export const Blob: React.FC<ShapeProps> = ({ className = '' }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 200 200" className={className} stroke="currentColor" strokeLinecap="round">
    <line x1="62" y1="88" x2="138" y2="112" strokeWidth="74" />
    <line x1="84" y1="56" x2="118" y2="146" strokeWidth="64" />
    <line x1="58" y1="128" x2="142" y2="78" strokeWidth="52" />
  </svg>
);

const SQ_N = 7;
const SQ_STEPS = SQ_N * 6;
const SQ_POINTS = Array.from({ length: SQ_STEPS + 1 }, (_, i) => [3 + (i / SQ_STEPS) * 114, 12 + 9 * Math.sin((i / SQ_STEPS) * SQ_N * Math.PI)] as const);

/** Squiggle: a chain of short <line> segments. */
export const Squiggle: React.FC<ShapeProps> = ({ className = '' }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 120 24" className={className} stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    {SQ_POINTS.slice(1).map((p, i) => (
      <line key={i} x1={SQ_POINTS[i][0]} y1={SQ_POINTS[i][1]} x2={p[0]} y2={p[1]} />
    ))}
  </svg>
);

/** Short strokes radiating outward, a playful sparkle accent. */
export const LineBurst: React.FC<ShapeProps> = ({ className = '' }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 60 60" className={className} stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="30" y1="4" x2="30" y2="18" />
    <line x1="8" y1="14" x2="18" y2="24" />
    <line x1="52" y1="14" x2="42" y2="24" />
    <line x1="4" y1="40" x2="18" y2="40" />
    <line x1="56" y1="40" x2="42" y2="40" />
  </svg>
);

/** Cluster of dots: zero-length round-capped lines. */
export const Dots: React.FC<ShapeProps> = ({ className = '' }) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 80 80" className={className} stroke="currentColor" strokeLinecap="round">
    <line x1="16" y1="18" x2="16.01" y2="18" strokeWidth="18" />
    <line x1="52" y1="14" x2="52.01" y2="14" strokeWidth="10" />
    <line x1="40" y1="52" x2="40.01" y2="52" strokeWidth="24" />
  </svg>
);

/**
 * Blobs, dots, lines and a squiggle that frame a tool card.
 * Wrap the card in `relative isolate` and render this first: it sits behind the card (-z-10),
 * is non-interactive, and stays out of the accessibility tree.
 */
export const CardBlobs: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${className}`}>
    <Blob className="absolute -top-10 -left-8 w-40 sm:w-56 text-indigo-200 opacity-70" />
    <Blob className="absolute -bottom-12 -right-10 w-44 sm:w-64 text-amber-200 opacity-60" />
    <Dots className="hidden sm:block absolute top-6 -right-4 w-16 text-emerald-300 opacity-60" />
    <Squiggle className="hidden sm:block absolute bottom-6 -left-4 w-28 text-indigo-300 opacity-70" />
    <LineBurst className="hidden md:block absolute -top-4 right-24 w-12 text-indigo-300 opacity-60" />
  </div>
);
