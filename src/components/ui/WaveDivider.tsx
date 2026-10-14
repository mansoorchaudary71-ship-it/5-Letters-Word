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
const FILL_STEP = 8; // width of each vertical fill line
const CREST_STEP = 20; // length of each crest line segment

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

/**
 * Full-bleed curved divider drawn only with <line> elements:
 * a row of vertical lines forms the filled area and a chain of short lines traces the crest.
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
      {waves.map((w, wi) => {
        const isFront = wi === waves.length - 1;
        const fills: React.ReactNode[] = [];
        for (let x = FILL_STEP / 2; x < W + FILL_STEP; x += FILL_STEP) {
          fills.push(<line key={x} x1={x} y1={yAt(w, x)} x2={x} y2={H + 1} />);
        }
        const crest: React.ReactNode[] = [];
        if (isFront) {
          for (let x = 0; x < W; x += CREST_STEP) {
            crest.push(<line key={x} x1={x} y1={yAt(w, x)} x2={x + CREST_STEP} y2={yAt(w, x + CREST_STEP)} />);
          }
        }
        return (
          <g key={wi}>
            <g stroke="currentColor" strokeWidth={FILL_STEP + 0.8} strokeLinecap="butt" opacity={isFront ? 1 : 0.5}>
              {fills}
            </g>
            {isFront && (
              <g className="stroke-indigo-200" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke">
                {crest}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
