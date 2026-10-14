import React from 'react';

export type TileState = 'ink' | 'soft' | 'hit' | 'near' | 'miss';

const STATE_CLASS: Record<TileState, string> = {
  ink: 'bg-ink text-white',
  soft: 'bg-slate-100 text-ink',
  hit: 'bg-hit text-white',
  near: 'bg-near text-ink',
  miss: 'bg-miss text-white',
};

const SIZE_CLASS = {
  xs: 'w-5 h-6 text-[11px] rounded-[5px]',
  card: 'w-6 h-7 sm:w-7 sm:h-8 text-xs sm:text-sm rounded-md',
  sm: 'w-7 h-8 text-sm rounded-md',
  md: 'w-10 h-11 text-lg rounded-lg',
  lg: 'w-12 h-13 sm:w-14 sm:h-15 text-2xl sm:text-3xl rounded-xl',
} as const;

interface WordTilesProps {
  word: string;
  /** One state for every tile, or one per letter (e.g. a Wordle result row). */
  state?: TileState | TileState[];
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

/** Five letter tiles. Decorative: the word is exposed once through aria-label. */
export const WordTiles: React.FC<WordTilesProps> = ({ word, state = 'soft', size = 'sm', className = '' }) => (
  <span className={`inline-flex gap-1 ${className}`} role="img" aria-label={word.split('').join(' ')}>
    {word.split('').map((ch, i) => {
      const s = Array.isArray(state) ? state[i % state.length] : state;
      return (
        <span
          key={i}
          aria-hidden="true"
          className={`flex items-center justify-center font-semibold uppercase select-none tracking-normal ${SIZE_CLASS[size]} ${STATE_CLASS[s]}`}
        >
          {ch}
        </span>
      );
    })}
  </span>
);
