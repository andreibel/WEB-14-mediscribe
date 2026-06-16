import {
  Stethoscope, Activity, Syringe, Pill, HeartPulse,
  Brain, Thermometer, Microscope,
} from 'lucide-react'

const BG_ICONS = [
  { Icon: Stethoscope,  top: '6%',  left: '5%',  rotate: -15, size: 48, opacity: 0.045 },
  { Icon: HeartPulse,   top: '18%', left: '82%', rotate: 8,   size: 40, opacity: 0.04  },
  { Icon: Activity,     top: '38%', left: '10%', rotate: 5,   size: 36, opacity: 0.035 },
  { Icon: Syringe,      top: '55%', left: '88%', rotate: -30, size: 44, opacity: 0.04  },
  { Icon: Pill,         top: '72%', left: '4%',  rotate: 20,  size: 32, opacity: 0.04  },
  { Icon: Brain,        top: '82%', left: '75%', rotate: -10, size: 42, opacity: 0.038 },
  { Icon: Thermometer,  top: '12%', left: '50%', rotate: 0,   size: 30, opacity: 0.03  },
  { Icon: Microscope,   top: '62%', left: '45%', rotate: 12,  size: 38, opacity: 0.035 },
] as const

export function MedicalBackground() {
  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <defs>
          <pattern id="ecg" x="0" y="0" width="200" height="80" patternUnits="userSpaceOnUse">
            <path d="M0,40 L30,40 L35,36 L40,40 L55,40 L60,10 L65,62 L70,40 L80,40 L85,32 L90,40 L200,40"
              fill="none" stroke="#c15f3c" strokeWidth="1.2" opacity="0.07" />
          </pattern>
          <pattern id="cross" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <g opacity="0.04" fill="#c15f3c">
              <rect x="34" y="26" width="12" height="28" rx="2" />
              <rect x="26" y="34" width="28" height="12" rx="2" />
            </g>
          </pattern>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.2" fill="#c15f3c" opacity="0.05" />
          </pattern>
          <radialGradient id="glow" cx="15%" cy="10%" r="40%">
            <stop offset="0%" stopColor="#c15f3c" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#c15f3c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        <rect width="100%" height="100%" fill="url(#cross)" />
        {[0, 1, 2, 3].map(i => (
          <rect key={i} y={`${i * 25}%`} width="100%" height="25%" fill="url(#ecg)" />
        ))}
        <rect width="100%" height="100%" fill="url(#glow)" />
      </svg>
      {BG_ICONS.map(({ Icon, top, left, rotate, size, opacity }, i) => (
        <div key={i} className="absolute pointer-events-none text-[#c15f3c]"
          style={{ top, left, opacity, transform: `rotate(${rotate}deg)` }} aria-hidden>
          <Icon size={size} />
        </div>
      ))}
    </>
  )
}
