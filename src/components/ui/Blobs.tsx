import React from 'react';

/**
 * Soft organic blobs and a squiggle that frame a tool card.
 * Wrap the card in `relative isolate` and render this first: it sits behind the card (-z-10),
 * is non-interactive, and stays out of the accessibility tree.
 */
export const CardBlobs: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${className}`}>
    {/* Top-left: indigo blob */}
    <svg viewBox="0 0 200 200" className="absolute -top-10 -left-8 w-40 sm:w-56 text-indigo-200/70" fill="currentColor">
      <path d="M44.7-52.6C57.3-41.7 66.2-26.6 69.6-10c3.4 16.6 1.3 34.7-8.1 47.6C52.1 50.5 36.2 58.2 19 63.3c-17.2 5.1-35.7 7.6-49.3.8C-43.9 57.4-52.6 41.9-58.9 25.5c-6.3-16.4-10.2-33.7-3.9-47.4C-56.5-35.6-39.3-45.7-23.1-54.9c16.2-9.2 32.5-17.5 46.1-14.3 8.6 2 14.4 8.8 21.7 16.6Z" transform="translate(100 100)" />
    </svg>
    {/* Bottom-right: warm amber blob */}
    <svg viewBox="0 0 200 200" className="absolute -bottom-12 -right-10 w-44 sm:w-64 text-amber-200/60" fill="currentColor">
      <path d="M39.9-47.8C51.7-36.3 61.2-23.6 64.9-9 68.6 5.6 66.5 22.1 57.4 33.7 48.3 45.3 32.2 52 15.5 58.2-1.2 64.4-18.5 70.1-32.3 64.6-46.1 59.1-56.3 42.3-62 24.5c-5.7-17.8-6.9-36.6.3-50.4C-54.5-39.7-39.5-48.6-24.3-58.5-9.1-68.4 6.4-79.4 18.4-74.6 30.4-69.8 28.1-59.3 39.9-47.8Z" transform="translate(100 100)" />
    </svg>
    {/* Mid-right: small emerald dot cluster */}
    <svg viewBox="0 0 80 80" className="hidden sm:block absolute top-6 -right-4 w-16 text-emerald-300/60" fill="currentColor">
      <circle cx="16" cy="18" r="9" />
      <circle cx="52" cy="14" r="5" />
      <circle cx="40" cy="52" r="12" />
    </svg>
    {/* Squiggle, bottom-left */}
    <svg viewBox="0 0 120 24" className="hidden sm:block absolute bottom-6 -left-4 w-28 text-indigo-300/70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M3 14c8-14 14 12 22 0s14 12 22 0 14 12 22 0 14 12 22 0 14 12 22 0" />
    </svg>
  </div>
);
