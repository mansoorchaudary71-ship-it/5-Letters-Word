import React from 'react';

type WaveVariant = 'swoosh' | 'soft' | 'layered';

interface WaveDividerProps {
  /** Colour of the section BELOW the wave, as a text colour class (e.g. "text-slate-50"). */
  className?: string;
  variant?: WaveVariant;
  /** Mirror vertically, for a divider at the top of a section. */
  flip?: boolean;
}

const W = 1440;
const H = 120;
const FILL_STEP = 8; // x spacing of the filled outline
const CREST_STEP = 20; // x spacing of the crest line

interface Wave {
  base: number;
  amp: number;
  cycles: number;
  phase: number;
}

const WAVES: Record<WaveVariant, Wave[]> = {
  swoosh: [{ base: 62, amp: 30, cycles: 1.1, phase: 0.6 }],
  soft: [{ base: 70, amp: 22, cycles: 1.5, phase: 2.2 }],
  layered: [
    { base: 74, amp: 24, cycles: 1.2, phase: 1.4 }, // faint echo behind
    { base: 66, amp: 28, cycles: 1.0, phase: 3.4 }, // front wave
  ],
};

const yAt = (w: Wave, x: number) => w.base + w.amp * Math.sin((x / W) * w.cycles * Math.PI * 2 + w.phase);

const trace = (w: Wave, step: number) => {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += step) pts.push(`${x},${yAt(w, x).toFixed(1)}`);
  return pts.join(' ');
};

/** Built once at load: each wave is a filled outline (polygon) plus a crest line (polyline). */
const SHAPES: Record<WaveVariant, { fill: string; crest: string }[]> = Object.fromEntries(
  (Object.keys(WAVES) as WaveVariant[]).map((v) => [
    v,
    WAVES[v].map((w) => ({ fill: `${trace(w, FILL_STEP)} ${W},${H + 1} 0,${H + 1}`, crest: trace(w, CREST_STEP) })),
  ]),
) as Record<WaveVariant, { fill: string; crest: string }[]>;

/**
 * Full-bleed curved divider drawn with line-style shapes (no <path>): one polygon fills the area
 * below the wave and one polyline traces the crest, so each divider is 2-4 SVG elements.
 * Inline SVG, scales to any width, hidden from assistive tech.
 */
export const WaveDivider: React.FC<WaveDividerProps> = ({ className = 'text-slate-50', variant = 'swoosh', flip = false }) => {
  const shapes = SHAPES[variant];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`block w-full h-10 sm:h-14 lg:h-20 ${flip ? 'rotate-180' : ''} ${className}`}
    >
      {shapes.map((shape, wi) => {
        const isFront = wi === shapes.length - 1;
        return (
          <g key={wi}>
            <polygon points={shape.fill} fill="currentColor" opacity={isFront ? 1 : 0.5} />
            {isFront && (
              <polyline
                points={shape.crest}
                fill="none"
                className="stroke-indigo-200"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
