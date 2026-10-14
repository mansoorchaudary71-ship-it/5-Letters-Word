import React from 'react';

type WaveBackgroundVariant = 'flow' | 'calm' | 'dense';

interface WaveBackgroundProps {
  /**
   * Position, size, colour and fade. Colour with a text-* class (optionally with an opacity
   * modifier, e.g. "text-indigo-300/60"); soften the edges with a [mask-image:...] class.
   */
  className?: string;
  variant?: WaveBackgroundVariant;
}

const W = 1440;
const H = 320;
const STEP = 30; // length of each line segment

interface Field {
  count: number; // number of wave lines
  gap: number; // vertical distance between lines
  top: number; // y of the first line
  amp: number; // amplitude of the first line
  ampGrow: number; // extra amplitude per line, so the field fans out
  cycles: number; // full sine cycles across the width
  phase: number;
  shift: number; // phase offset per line, so the lines drift apart
}

const FIELDS: Record<WaveBackgroundVariant, Field> = {
  flow: { count: 7, gap: 22, top: 90, amp: 28, ampGrow: 3, cycles: 1.3, phase: 0.4, shift: 0.35 },
  calm: { count: 5, gap: 26, top: 100, amp: 24, ampGrow: 2, cycles: 0.9, phase: 2.1, shift: 0.5 },
  dense: { count: 10, gap: 14, top: 70, amp: 30, ampGrow: 2, cycles: 1.6, phase: 1.2, shift: 0.28 },
};

type Seg = readonly [number, number, number, number];

/** Each wave line is a chain of short <line> segments along a sine curve. */
const buildWaves = (f: Field): Seg[][] =>
  Array.from({ length: f.count }, (_, k) => {
    const amp = f.amp + k * f.ampGrow;
    const yAt = (x: number) => f.top + k * f.gap + amp * Math.sin((x / W) * f.cycles * Math.PI * 2 + f.phase + k * f.shift);
    const segs: Seg[] = [];
    for (let x = 0; x < W; x += STEP) segs.push([x, yAt(x), x + STEP, yAt(x + STEP)]);
    return segs;
  });

const WAVES: Record<WaveBackgroundVariant, Seg[][]> = {
  flow: buildWaves(FIELDS.flow),
  calm: buildWaves(FIELDS.calm),
  dense: buildWaves(FIELDS.dense),
};

/**
 * Abstract flowing-wave background drawn only with <line> elements (no <path>).
 * Decorative: hidden from assistive tech and never interactive. Stretches to fill its box,
 * and non-scaling strokes keep the lines hairline-thin at any size.
 *
 * Usage: put it inside a `relative isolate` parent, absolutely positioned with -z-10
 * (or render it before the content in a `relative overflow-hidden` block).
 */
export const WaveBackground: React.FC<WaveBackgroundProps> = ({ className = '', variant = 'flow' }) => {
  const waves = WAVES[variant];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      {waves.map((segs, k) => (
        <g key={k} opacity={0.2 + 0.8 * (1 - k / waves.length)}>
          {segs.map((s, i) => (
            <line key={i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      ))}
    </svg>
  );
};
