type LiveBar = { min: number; dur: number; delay: number; settling?: boolean };

// Hand-tuned, left to right: loud and irregular (live speech) easing into
// calmer, evenly-weighted motion (the moment it starts resolving into record).
const LIVE_BARS: LiveBar[] = [
  { min: 0.5, dur: 1.3, delay: -0.1 },
  { min: 0.42, dur: 1.1, delay: -0.6 },
  { min: 0.58, dur: 1.5, delay: -0.3 },
  { min: 0.38, dur: 1.0, delay: -0.9 },
  { min: 0.52, dur: 1.4, delay: 0 },
  { min: 0.44, dur: 1.2, delay: -0.5 },
  { min: 0.6, dur: 1.6, delay: -0.2 },
  { min: 0.4, dur: 1.05, delay: -0.8 },
  { min: 0.55, dur: 1.35, delay: -0.4 },
  { min: 0.46, dur: 1.15, delay: -0.7 },
  { min: 0.5, dur: 1.25, delay: -0.15 },
  { min: 0.65, dur: 1.5, delay: -0.3, settling: true },
  { min: 0.7, dur: 1.7, delay: -0.1, settling: true },
  { min: 0.68, dur: 1.4, delay: -0.5, settling: true },
  { min: 0.75, dur: 1.6, delay: -0.2, settling: true },
];

// Already-settled timeline blocks — fixed heights, no motion, brand color.
const SETTLED_HEIGHTS = [22, 40, 30, 52, 18, 44, 26];

/**
 * Signature hero graphic: a waveform of live speech resolving, left to
 * right, into discrete timeline blocks — the page's one-sentence thesis
 * rendered as motion instead of copy.
 */
export function WaveformTimeline({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex h-16 items-center justify-center gap-[3px]" aria-hidden="true">
        {LIVE_BARS.map((bar, i) => (
          <span
            key={`live-${i}`}
            className={`wave-bar h-12 origin-center rounded-full [animation:wave-bar_var(--wave-dur)_ease-in-out_infinite_alternate] ${
              bar.settling
                ? "w-[2.5px] bg-[#C9966F] dark:bg-[#6B4E3B]"
                : "w-[2px] bg-[#CFC3B3] dark:bg-[#3D362F]"
            }`}
            style={
              {
                "--wave-min": bar.min,
                "--wave-dur": `${bar.dur}s`,
                animationDelay: `${bar.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
        {SETTLED_HEIGHTS.map((h, i) => (
          <span
            key={`settled-${i}`}
            className="w-[3px] rounded-[2px] bg-[#C15F3C]"
            style={{ height: h }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between px-1 text-[10px] font-mono font-medium uppercase tracking-[0.12em] text-[#A89D90] dark:text-[#6E665D]">
        <span>Live audio</span>
        <span>Structured record</span>
      </div>
    </div>
  );
}

export default WaveformTimeline;
