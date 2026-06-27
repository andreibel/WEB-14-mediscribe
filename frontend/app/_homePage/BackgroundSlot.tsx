import Grainient from '@/components/background/Grainient';
import { AnimatedLogo } from '@/components/app/AnimatedLogo';

/**
 * Reserved visual bento tile. The shader (Grainient) is `h-full w-full` and sizes
 * itself from this container via a ResizeObserver, so the container MUST have a
 * resolved height. We fill the grid cell (`h-full`, stretched by the grid) with a
 * `min-h` floor so it always has height — even on mobile where there's no
 * neighbouring tile to set the row height. Avoid `aspect-square` here: inside a
 * `min-content` grid row its height can collapse to ~0 and the canvas renders blank.
 */
export function BackgroundSlot({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative h-full min-h-[300px] w-full overflow-hidden rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] ${className}`}
    >
      <Grainient
        color1="#d6bb66"
        color2="#F97316"
        color3="#06B6D4"
        timeSpeed={1.55}
        colorBalance={0}
        warpStrength={1}
        warpFrequency={5}
        warpSpeed={2}
        warpAmplitude={50}
        blendAngle={0}
        blendSoftness={0.05}
        rotationAmount={500}
        noiseScale={2}
        grainAmount={0.1}
        grainScale={2}
        grainAnimated={false}
        contrast={1.5}
        gamma={1}
        saturation={1}
        centerX={0}
        centerY={0}
        zoom={0.9}
      />

      {/* Brand lockup over the gradient. pointer-events-none so it never blocks
          the tile; white + soft shadow keeps it legible on the vivid colors. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
        <AnimatedLogo
          size={400}
          animate
          className="drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
        />

      </div>
    </div>
  );
}

export default BackgroundSlot;
