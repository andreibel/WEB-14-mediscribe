interface IconBtnProps {
  onClick?: () => void
  label: string
  children: React.ReactNode
  className?: string
}

export function IconBtn({ onClick, label, children, className = '' }: IconBtnProps) {
  const colors = className ||
    'text-[#A8A29E] hover:text-[#1e1e1c] hover:bg-[#ece9e1] dark:text-[#6B6870] dark:hover:text-[#e8e5e0] dark:hover:bg-[#3a3835]'

  return (
    <button
      onClick={onClick ? e => { e.stopPropagation(); onClick() } : undefined}
      title={label}
      className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors duration-150 cursor-default ${colors}`}
    >
      {children}
    </button>
  )
}
