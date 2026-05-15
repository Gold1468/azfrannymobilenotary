import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Props {
  title: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  badge?: string | number
  className?: string
}

export function SnapshotPanel({
  title, icon, children, defaultOpen = false, badge, className = ''
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`border border-slate-800 rounded-xl overflow-hidden ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-850 transition-colors text-left min-h-[48px]"
        aria-expanded={open}
        aria-label={title}
      >
        {icon && <span className="text-cyan-400 shrink-0">{icon}</span>}
        <span className="flex-1 font-semibold text-slate-100 text-sm">{title}</span>
        {badge !== undefined && badge !== '' && badge !== 0 && (
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full shrink-0">
            {badge}
          </span>
        )}
        {open
          ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 bg-slate-950 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}
