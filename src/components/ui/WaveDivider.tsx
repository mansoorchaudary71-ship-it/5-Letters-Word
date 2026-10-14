import React from 'react';

type WaveVariant = 'swoosh' | 'soft' | 'layered';

interface WaveDividerProps {
  /**
   * Colour of the section that sits BELOW the wave, set with a text colour class
   * (e.g. "text-slate-50"). The wave is filled with `currentColor`.
   */
  className?: string;
  variant?: WaveVariant;
  /** Mirror vertically, for a divider that sits at the top of a section instead of the bottom. */
  flip?: boolean;
}

// All paths share a 1440 x 120 viewBox and close along the bottom edge.
const PATHS: Record<WaveVariant, string[]> = {
  swoosh: ['M0 64C180 12 360 8 560 40s400 78 600 52c110-14 190-44 280-72V120H0Z'],
  soft: ['M0 80C240 20 480 20 720 56s480 52 720-8V120H0Z'],
  // Front wave plus a faint, offset echo behind it
  layered: [
    'M0 44C220 92 420 100 660 64s520-64 780-4V120H0Z',
    'M0 78C200 36 400 28 640 62s500 50 800-10V120H0Z',
  ],
};

/** Full-bleed curved section divider. Inline SVG, scales to any width, ignored by assistive tech. */
export const WaveDivider: React.FC<WaveDividerProps> = ({ className = 'text-slate-50', variant = 'swoosh', flip = false }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 1440 120"
    preserveAspectRatio="none"
    className={`block w-full h-10 sm:h-14 lg:h-20 ${flip ? 'rotate-180' : ''} ${className}`}
  >
    {PATHS[variant].map((d, i) => (
      <path key={i} d={d} fill="currentColor" opacity={PATHS[variant].length > 1 && i === 0 ? 0.55 : 1} />
    ))}
  </svg>
);
