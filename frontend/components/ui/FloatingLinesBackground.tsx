"use client";

import FloatingLines from "./FloatingLines";

export default function FloatingLinesBackground() {
  return (
    <FloatingLines
      enabledWaves={["top", "middle", "bottom"]}
      lineCount={[8, 8, 8]}
      lineDistance={[8, 8, 8]}
      topWavePosition={{ x: 10.0, y: 0.5, rotate: -0.4 }}
      middleWavePosition={{ x: 0.0, y: 0.0, rotate: 0.0 }}
      bendRadius={8}
      bendStrength={-2}
      interactive={false}
      parallax={true}
      animationSpeed={1}
      linesGradient={["#C15F3C", "#E8895C", "#8A5A3C"]}
      mixBlendMode="screen"
    />
  );
}
