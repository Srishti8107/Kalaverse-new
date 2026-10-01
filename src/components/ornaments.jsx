// src/components/ornaments.jsx
// Decorative SVG motifs drawn from Indian craft traditions. All are purely
// visual (aria-hidden) and colour themselves with `currentColor`, so set the
// colour with a text-* class on the element.
import { useId } from 'react';
import { cn } from '@/lib/utils';

/** Mandala rosette: rings of pointed petals, like a rangoli or temple-ceiling lotus. */
export function Rosette({ className }) {
  const ring = (count, inner, outer, width) =>
    Array.from({ length: count }, (_, i) => {
      const mid = (inner + outer) / 2;
      return (
        <path
          key={i}
          transform={`rotate(${(360 / count) * i})`}
          d={`M0 ${-inner} Q ${width} ${-mid} 0 ${-outer} Q ${-width} ${-mid} 0 ${-inner} Z`}
        />
      );
    });

  return (
    <svg
      viewBox="-100 -100 200 200"
      aria-hidden="true"
      className={cn('pointer-events-none', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <circle r="97" />
      <circle r="92" strokeDasharray="1 4" strokeLinecap="round" strokeWidth="2" />
      <g>{ring(24, 62, 88, 7)}</g>
      <circle r="60" />
      <g>{ring(12, 26, 58, 12)}</g>
      <g transform="rotate(15)">{ring(12, 30, 48, 5)}</g>
      <circle r="22" />
      <g>{ring(8, 8, 21, 5)}</g>
      <circle r="5" fill="currentColor" />
    </svg>
  );
}

/** Repeating diamond-and-dot border, after the edges of hand block-printed textiles. */
export function BlockPrintBand({ className, primary = '#B0573D', secondary = '#2F3B6B', height = 14 }) {
  const id = `bp-${useId().replace(/:/g, '')}`;
  return (
    <svg aria-hidden="true" className={cn('block w-full', className)} height={height} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="28" height={height} patternUnits="userSpaceOnUse">
          <path d={`M14 1.5 L21 ${height / 2} L14 ${height - 1.5} L7 ${height / 2} Z`} fill={primary} />
          <circle cx="14" cy={height / 2} r="1.6" fill="#FBF8F3" />
          <circle cx="0" cy={height / 2} r="2" fill={secondary} />
          <circle cx="28" cy={height / 2} r="2" fill={secondary} />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${id})`} />
    </svg>
  );
}

/** Interlocking-circle lattice, like a carved stone jaali screen. Use at low opacity. */
export function Jaali({ className }) {
  const id = `jaali-${useId().replace(/:/g, '')}`;
  return (
    <svg aria-hidden="true" className={cn('pointer-events-none', className)}>
      <defs>
        <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="0" cy="0" r="16" />
            <circle cx="32" cy="0" r="16" />
            <circle cx="0" cy="32" r="16" />
            <circle cx="32" cy="32" r="16" />
            <circle cx="16" cy="16" r="16" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Hairline rule with a centred diamond, for separating sections. */
export function OrnamentDivider({ className }) {
  return (
    <div aria-hidden="true" className={cn('flex items-center gap-3 text-gold', className)}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
      <svg viewBox="0 0 40 12" className="h-3 w-10" fill="currentColor">
        <circle cx="4" cy="6" r="1.5" />
        <path d="M20 0 L26 6 L20 12 L14 6 Z" />
        <circle cx="36" cy="6" r="1.5" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}
