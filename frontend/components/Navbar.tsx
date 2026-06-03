import { Sun, Moon } from 'lucide-react'

interface NavbarProps {
  dark: boolean
  onToggle: () => void
}

export function Navbar({ dark, onToggle }: NavbarProps) {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b bg-[#FAF7F2] border-[#E8E2D9] dark:bg-[#1C1917] dark:border-[#2E2A27]">

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#C15F3C] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold leading-none">A</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-[#1A1A18] dark:text-[#E8E2D9]">
          App<span className="text-[#C15F3C]">Name</span>
        </span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={onToggle}
        title={dark ? 'Switch to light' : 'Switch to dark'}
        className="w-7 h-7 flex items-center justify-center rounded-md transition-colors text-[#8A7E72] hover:text-[#1A1A18] hover:bg-[#EDE8E1] dark:text-[#6B6560] dark:hover:text-[#E8E2D9] dark:hover:bg-[#2E2A27]"
      >
        {dark ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
      </button>
    </header>
  )
}
