import { useNavigate, useLocation } from 'react-router-dom'
import { Home, FileText, Clock, Clipboard, BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/sbar', label: 'SBAR', Icon: FileText },
  { path: '/timeline', label: 'Timeline', Icon: Clock },
  { path: '/snapshot', label: 'Snapshot', Icon: Clipboard },
  { path: '/glossary', label: 'Reference', Icon: BookOpen },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 safe-area-bottom"
      aria-label="Main navigation"
    >
      <div className="flex">
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const active = isActive(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors ${
                active
                  ? 'text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : ''}`} />
              <span className="text-xs font-medium">{label}</span>
              {active && (
                <span className="absolute top-0 w-6 h-0.5 bg-cyan-400 rounded-b-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
