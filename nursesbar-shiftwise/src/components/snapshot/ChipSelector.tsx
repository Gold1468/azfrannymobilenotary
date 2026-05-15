import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  allowCustom?: boolean
  placeholder?: string
  maxVisible?: number
  size?: 'sm' | 'md'
}

export function ChipSelector({
  options,
  selected,
  onChange,
  allowCustom = false,
  placeholder = 'Add custom…',
  maxVisible = 20,
  size = 'md',
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  const addCustom = () => {
    const val = customInput.trim()
    if (!val || selected.includes(val)) { setCustomInput(''); return }
    onChange([...selected, val])
    setCustomInput('')
  }

  const visible = expanded ? options : options.slice(0, maxVisible)
  const hasMore = options.length > maxVisible

  const chipH = size === 'sm' ? 'min-h-[32px] text-xs px-2.5 py-1' : 'min-h-[36px] text-sm px-3 py-1.5'

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {visible.map(opt => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`${chipH} rounded-full border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${
                active
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-200'
              }`}
              aria-pressed={active}
              aria-label={opt}
            >
              {opt}
            </button>
          )
        })}

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`${chipH} rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors flex items-center gap-1`}
          >
            {expanded ? <><ChevronUp className="w-3 h-3" />Less</> : <><ChevronDown className="w-3 h-3" />+{options.length - maxVisible} more</>}
          </button>
        )}
      </div>

      {selected.filter(s => !options.includes(s)).map(custom => (
        <button
          key={custom}
          onClick={() => toggle(custom)}
          className={`${chipH} rounded-full border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-medium transition-colors`}
          aria-pressed
          aria-label={`Remove ${custom}`}
        >
          {custom} ×
        </button>
      ))}

      {allowCustom && (
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
            placeholder={placeholder}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[36px]"
          />
          <button
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="w-9 h-9 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Add custom item"
          >
            <Plus className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      )}
    </div>
  )
}
