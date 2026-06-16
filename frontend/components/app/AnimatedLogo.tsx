"use client";

import { useId } from "react";

/**
 * mediscribe brand mark — hand-drawn, organic filled "voice pyramid".
 * When `animate` is on, each wave bar breathes (scales smaller/bigger)
 * on its own stagger, like a live waveform. Respects reduced-motion.
 *
 * Uses `currentColor` for the bars, so set text color on the wrapper.
 */

const BARS: string[] = [
  "M 1.78 11.07 Q 2.60 9.43 3.42 11.07 Q 3.82 12.00 3.42 12.93 Q 2.60 14.57 1.78 12.93 Q 1.38 12.00 1.78 11.07 Z",
  "M 4.10 9.22 Q 4.95 7.53 5.80 9.22 Q 5.35 12.00 5.80 14.78 Q 4.95 16.48 4.10 14.78 Q 4.55 12.00 4.10 9.22 Z",
  "M 6.48 10.32 Q 7.30 8.68 8.12 10.32 Q 8.52 12.00 8.12 13.68 Q 7.30 15.32 6.48 13.68 Q 6.08 12.00 6.48 10.32 Z",
  "M 8.77 5.00 Q 9.65 3.25 10.53 5.00 Q 11.03 12.00 10.53 19.00 Q 9.65 20.75 8.77 19.00 Q 8.27 12.00 8.77 5.00 Z",
  "M 11.08 2.92 Q 12.00 1.08 12.92 2.92 Q 12.42 12.00 12.92 21.08 Q 12.00 22.92 11.08 21.08 Q 11.58 12.00 11.08 2.92 Z",
  "M 13.47 5.00 Q 14.35 3.25 15.23 5.00 Q 15.68 12.00 15.23 19.00 Q 14.35 20.75 13.47 19.00 Q 13.02 12.00 13.47 5.00 Z",
  "M 15.88 9.82 Q 16.70 8.18 17.52 9.82 Q 17.07 12.00 17.52 14.18 Q 16.70 15.82 15.88 14.18 Q 16.33 12.00 15.88 9.82 Z",
  "M 18.20 9.22 Q 19.05 7.53 19.90 9.22 Q 20.30 12.00 19.90 14.78 Q 19.05 16.48 18.20 14.78 Q 17.80 12.00 18.20 9.22 Z",
  "M 20.60 11.05 Q 21.40 9.45 22.20 11.05 Q 21.80 12.00 22.20 12.95 Q 21.40 14.55 20.60 12.95 Q 21.00 12.00 20.60 11.05 Z",
];

// gentle, organic per-bar timing so the pyramid "breathes" out of sync
const TIMING = [
  { dur: 1.5, delay: -0.2, min: 0.55 },
  { dur: 1.2, delay: -0.9, min: 0.45 },
  { dur: 1.7, delay: -0.4, min: 0.6 },
  { dur: 1.1, delay: -1.3, min: 0.4 },
  { dur: 1.35, delay: 0, min: 0.5 },
  { dur: 1.15, delay: -0.7, min: 0.42 },
  { dur: 1.6, delay: -1.1, min: 0.6 },
  { dur: 1.25, delay: -0.5, min: 0.46 },
  { dur: 1.45, delay: -1.0, min: 0.55 },
];

export interface AnimatedLogoProps {
  /** rendered pixel size of the square mark */
  size?: number;
  /** breathe the wave bars */
  animate?: boolean;
  className?: string;
}

export function AnimatedLogo({ size = 40, animate = false, className = "" }: AnimatedLogoProps) {
  const id = useId().replace(/[:]/g, "");

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="mediscribe" className={className}>
      <style>{`
        .bar-${id} {
          transform-box: fill-box;
          transform-origin: center;
        }
        ${
          animate
            ? `.bar-${id} { animation: wave-${id} var(--d) ease-in-out infinite alternate; }
               @keyframes wave-${id} {
                 from { transform: scaleY(var(--min)); }
                 to   { transform: scaleY(1); }
               }
               @media (prefers-reduced-motion: reduce) {
                 .bar-${id} { animation: none; }
               }`
            : ""
        }
      `}</style>
      {BARS.map((d, i) => {
        const t = TIMING[i];
        return (
          <path key={i} d={d} fill="currentColor" className={`bar-${id}`} style={
              animate
                ? ({
                    "--d": `${t.dur}s`,
                    "--min": String(t.min),
                    animationDelay: `${t.delay}s`,
                  } as React.CSSProperties)
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}

export default AnimatedLogo;
