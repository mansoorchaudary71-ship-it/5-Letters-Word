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
const STEP = 20;

/** Sample a sine wave into polyline points ("x,y x,y ..."). No <path> needed. */
const wavePoints = (base: number, amp: number, cycles: number, phase: number): string => {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += STEP) {
    const y = base + amp * Math.sin((x / W) * cycles * Math.PI * 2 + phase);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return pts.join(' ');
};

const WAVES: Record<WaveVariant, { base: number; amp: number; cycles: number; phase: number }[]> = {
  swoosh: [{ base: 62, amp: 30, cycles: 1.1, phase: 0.6 }],
  soft: [{ base: 70, amp: 22, cycles: 1.5, phase: 2.2 }],
  layered: [
    { base: 74, amp: 24, cycles: 1.2, phase: 1.4 }, // faint echo behind
    { base: 66, amp: 28, cycles: 1.0, phase: 3.4 }, // front wave
  ],
};

/**
 * Full-bleed curved divider built only from <polygon> (fill) and <polyline> (crest line).
 * Inline SVG, scales to any width, hidden from assistive tech.
 */
export const WaveDivider: React.FC<WaveDividerProps> = ({ className = 'text-slate-50', variant = 'swoosh', flip = false }) => {
  const waves = WAVES[variant];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`block w-full h-10 sm:h-14 lg:h-20 ${flip ? 'rotate-180' : ''} ${className}`}
    >
      {waves.map((w, i) => {
        const pts = wavePoints(w.base, w.amp, w.cycles, w.phase);
        const isFront = i === waves.length - 1;
        return (
          <g key={i}>
            <polygon points={`${pts} ${W},${H} 0,${H}`} fill="currentColor" opacity={isFront ? 1 : 0.5} />
            {/* Thin indigo crest line along the front wave */}
            {isFront && (
              <polyline
                points={pts}
                fill="none"
                className="stroke-indigo-300/70"
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
