import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  autoFocus?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  debounceMs = 200,
  className = '',
  autoFocus = false,
}: Props) {
  const [local, setLocal] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocal(value)
  }, [value])

  const handleChange = (v: string) => {
    setLocal(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(v), debounceMs)
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={local}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 min-h-[44px]"
        aria-label={placeholder}
      />
      {local && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 p-0.5 rounded hover:bg-slate-700 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
    </div>
  )
}
